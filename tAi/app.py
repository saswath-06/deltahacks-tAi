from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask.cli import with_appcontext
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import cohere
import click
from werkzeug.security import generate_password_hash, check_password_hash
import json
from db import db

from models import (
    init_db,
    User, UserProgress, StudySession, 
    ConversationHistory
)

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "your-secret-key")
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL", "sqlite:///tAi.db")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
init_db(app)

# Initialize Cohere client
client = cohere.Client(os.getenv("COHERE_API_KEY"))

# CLI Commands
@click.command('init-db')
@with_appcontext
def init_db_command():
    """Clear existing data and create new tables."""
    init_db(app)
    click.echo('Initialized the database.')

# Register the command with Flask
app.cli.add_command(init_db_command)

# Routes for authentication
@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data["email"]).first()
    
    if user and check_password_hash(user.password, data["password"]):
        session['user_id'] = user.id
        return jsonify({
            "id": user.id,
            "email": user.email,
            "name": user.name
        })
    return jsonify({"error": "Invalid credentials"}), 401

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json
    
    # Check if user exists
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 400
    
    # Create new user
    user = User(
        email=data["email"],
        password=generate_password_hash(data["password"]),
        name=data["name"]
    )
    db.session.add(user)
    
    # Create initial progress record
    progress = UserProgress(user=user)
    db.session.add(progress)
    
    try:
        db.session.commit()
        session['user_id'] = user.id
        return jsonify({"id": user.id, "email": user.email})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/api/auth/logout", methods=["POST"])
def logout():
    session.pop('user_id', None)
    return jsonify({"message": "Logged out successfully"})

# Routes for AI Tutor
@app.route("/api/tutor/chat", methods=["POST"])
def chat():
    if 'user_id' not in session:
        return jsonify({"error": "Not authenticated"}), 401
        
    data = request.json
    try:
        # Get user's learning progress
        progress = UserProgress.query.filter_by(user_id=session['user_id']).first()
        
        # Create context-aware prompt
        context = f"""You are an AI tutor. The student's current level is {progress.current_level}.
        Topics they've mastered: {', '.join(progress.get_mastered_topics())}.
        Current learning goals: {', '.join(progress.get_learning_goals())}.
        
        Provide guidance and help them learn, but don't give direct answers.
        Use the Socratic method to guide them to understanding.
        """
        
        # Generate response using Cohere
        response = client.chat(
            message=data["message"],
            preamble=context,
            model='command',
            temperature=0.7,
            max_tokens=1024
        )
        
        # Store conversation
        conversation = ConversationHistory(
            user_id=session['user_id'],
            message=data["message"],
            response=response.text,
            timestamp=datetime.utcnow()
        )
        db.session.add(conversation)
        db.session.commit()
        
        return jsonify({
            "id": conversation.id,
            "role": "assistant",
            "content": response.text,
            "timestamp": conversation.timestamp.isoformat()
        })
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in chat: {str(e)}")
        return jsonify({"error": "Failed to generate response"}), 500

@app.route("/api/tutor/progress", methods=["GET"])
def get_progress():
    if 'user_id' not in session:
        return jsonify({"error": "Not authenticated"}), 401
        
    progress = UserProgress.query.filter_by(user_id=session['user_id']).first()
    if progress:
        return jsonify({
            "current_level": progress.current_level,
            "mastered_topics": progress.get_mastered_topics(),
            "learning_goals": progress.get_learning_goals()
        })
    return jsonify({"error": "Progress not found"}), 404

@app.route("/api/tutor/start-pomodoro", methods=["POST"])
def start_pomodoro():
    if 'user_id' not in session:
        return jsonify({"error": "Not authenticated"}), 401
        
    data = request.json
    duration = data.get("duration", 25)  # Default 25 minutes
    
    study_session = StudySession(
        user_id=session['user_id'],
        start_time=datetime.utcnow(),
        planned_duration=duration,
        status="active"
    )
    db.session.add(study_session)
    
    try:
        db.session.commit()
        return jsonify({"session_id": study_session.id})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route("/api/tutor/end-pomodoro", methods=["POST"])
def end_pomodoro():
    if 'user_id' not in session:
        return jsonify({"error": "Not authenticated"}), 401
        
    data = request.json
    session_id = data.get("session_id")
    
    try:
        # Update session status
        study_session = StudySession.query.get(session_id)
        if not study_session or study_session.user_id != session['user_id']:
            return jsonify({"error": "Session not found"}), 404
            
        study_session.end_time = datetime.utcnow()
        study_session.status = "completed"
        study_session.actual_duration = int((study_session.end_time - study_session.start_time).total_seconds() / 60)
        
        # Update user streak
        user = User.query.get(session['user_id'])
        if user.last_study_session:
            time_diff = datetime.utcnow() - user.last_study_session
            if time_diff <= timedelta(days=1):
                user.study_streak += 1
                if user.study_streak > user.longest_streak:
                    user.longest_streak = user.study_streak
            else:
                user.study_streak = 1
        else:
            user.study_streak = 1
            
        user.last_study_session = datetime.utcnow()
        user.total_study_time = (user.total_study_time or 0) + study_session.actual_duration
        
        db.session.commit()
        return jsonify({"success": True})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)