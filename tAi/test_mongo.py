from pymongo import MongoClient

uri = "mongodb+srv://saswath_06:Suspense%2101@tai.srn9l.mongodb.net/study_assistant?retryWrites=true&w=majority"

try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    print("Attempting to connect to MongoDB...")
    db = client.get_database('study_assistant')  # Replace with your database name
    print("Connected to MongoDB! Collections:", db.list_collection_names())
except Exception as e:
    print(f"Error: {e}")
