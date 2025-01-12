import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import jwt
from functools import wraps
import bcrypt

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB connection (using Compass connection string)
MONGODB_URI = os.getenv('MONGODB_URI')
if not MONGODB_URI:
    raise ValueError("MONGODB_URI not found in .env file")

try:
    # Create a MongoDB client
    client = MongoClient(MONGODB_URI)
    # Access your database
    db = client.get_database('study_assistant')  # Replace 'study_assistant' with your database name
    print("MongoDB connection successful!")
except Exception as e:
    print(f"MongoDB connection failed: {str(e)}")
    raise

# JWT configuration
JWT_SECRET = os.getenv('JWT_SECRET', 'your_jwt_secret_key')

# JWT Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            token_parts = token.split()
            if len(token_parts) != 2 or token_parts[0].lower() != 'bearer':
                raise ValueError('Invalid token format')
            
            data = jwt.decode(token_parts[1], JWT_SECRET, algorithms=["HS256"])
            current_user = db.users.find_one({'_id': ObjectId(data['user_id'])})
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except (jwt.InvalidTokenError, ValueError) as e:
            return jsonify({'message': f'Invalid token: {str(e)}'}), 401
        except Exception as e:
            return jsonify({'message': 'Server error processing token'}), 500
            
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['email', 'password']
        if not all(field in data for field in required_fields):
            return jsonify({'message': 'Missing required fields'}), 400
            
        # Check email format
        if '@' not in data['email']:
            return jsonify({'message': 'Invalid email format'}), 400
            
        # Check if email already exists
        if db.users.find_one({'email': data['email'].lower()}):
            return jsonify({'message': 'Email already exists'}), 400
        
        # Hash password
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        
        user = {
            'email': data['email'].lower(),
            'password': hashed_password,
            'study_topics': [],
            'knowledge_level': {},
            'streak': 0,
            'last_study_date': datetime.utcnow(),
            'created_at': datetime.utcnow()
        }
        
        user_id = db.users.insert_one(user).inserted_id
        token = jwt.encode(
            {
                'user_id': str(user_id),
                'exp': datetime.utcnow() + timedelta(days=1)
            },
            JWT_SECRET
        )
        
        return jsonify({'token': token})
        
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({'message': 'Registration failed'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        
        if not all(k in data for k in ['email', 'password']):
            return jsonify({'message': 'Missing email or password'}), 400
            
        user = db.users.find_one({'email': data['email'].lower()})
        if not user:
            return jsonify({'message': 'Invalid credentials'}), 401
            
        if not bcrypt.checkpw(data['password'].encode('utf-8'), user['password']):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        token = jwt.encode(
            {
                'user_id': str(user['_id']),
                'exp': datetime.utcnow() + timedelta(days=1)
            },
            JWT_SECRET
        )
        return jsonify({'token': token})
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'message': 'Login failed'}), 500

@app.route('/api/topics', methods=['GET'])
@token_required
def get_topics(current_user):
    try:
        return jsonify({'topics': current_user['study_topics']})
    except Exception as e:
        print(f"Error fetching topics: {str(e)}")
        return jsonify({'message': 'Failed to fetch topics'}), 500

@app.route('/api/topics', methods=['POST'])
@token_required
def add_topic(current_user):
    try:
        data = request.json
        if 'topic' not in data:
            return jsonify({'message': 'Topic is required'}), 400
            
        db.users.update_one(
            {'_id': current_user['_id']},
            {'$push': {'study_topics': data['topic']}}
        )
        return jsonify({'message': 'Topic added successfully'})
    except Exception as e:
        print(f"Error adding topic: {str(e)}")
        return jsonify({'message': 'Failed to add topic'}), 500

@app.route('/api/progress', methods=['POST'])
@token_required
def update_progress(current_user):
    try:
        data = request.json
        if not all(k in data for k in ['topic', 'progress']):
            return jsonify({'message': 'Topic and progress are required'}), 400
            
        topic = data['topic']
        progress = data['progress']
        
        if not isinstance(progress, (int, float)) or not 0 <= progress <= 100:
            return jsonify({'message': 'Progress must be a number between 0 and 100'}), 400
        
        current_time = datetime.utcnow()
        
        db.users.update_one(
            {'_id': current_user['_id']},
            {
                '$set': {
                    f'knowledge_level.{topic}': progress,
                    'last_study_date': current_time
                }
            }
        )
        
        today = current_time.date()
        last_study = current_user.get('last_study_date', current_time).date()
        
        if today - last_study == timedelta(days=1):
            db.users.update_one(
                {'_id': current_user['_id']},
                {'$inc': {'streak': 1}}
            )
        elif today - last_study > timedelta(days=1):
            db.users.update_one(
                {'_id': current_user['_id']},
                {'$set': {'streak': 1}}
            )
        
        return jsonify({'message': 'Progress updated successfully'})
        
    except Exception as e:
        print(f"Error updating progress: {str(e)}")
        return jsonify({'message': 'Failed to update progress'}), 500

@app.route('/api/stats', methods=['GET'])
@token_required
def get_stats(current_user):
    try:
        return jsonify({
            'streak': current_user['streak'],
            'knowledge_level': current_user['knowledge_level']
        })
    except Exception as e:
        print(f"Error fetching stats: {str(e)}")
        return jsonify({'message': 'Failed to fetch stats'}), 500

if __name__ == '__main__':
    app.run(debug=True)