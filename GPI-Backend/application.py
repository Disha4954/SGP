from flask import Flask, request, jsonify
from flask_cors import CORS
import yaml
from bson import json_util
from haversine import haversine, Unit
from pymongo import MongoClient
from dotenv import load_dotenv
import uuid
import os
import face_recognition  # Import face recognition module
from PIL import Image

# Load environment variables from .env
load_dotenv()

# Create Flask app instance
application = Flask(__name__)
application.config['YAML_AS_TEXT'] = True
application.debug = True  # Enable Debug mode for easier development

# Enable CORS for local frontend access
CORS(application, origins=["http://localhost:3000"])  # If React app runs on port 3000

# Configure file upload folders
UPLOAD_FOLDER = "uploads"
ORIGINAL_FOLDER = "original_images"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(ORIGINAL_FOLDER, exist_ok=True)
application.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Get MongoDB URI and Database Name from environment variables
MONGO_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# Connect to MongoDB
try:
    mongo_client = MongoClient(MONGO_URI)
    db = mongo_client[DATABASE_NAME]
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    exit(1)

# Basic route to check server status
@application.route('/')
def home():
    return "Secure, You are in GPI Backend running on localhost!!"

# Generate unique link for student form
@application.route('/generate-link/<string:admin_id>', methods=['GET'])
def generate_link(admin_id):
    unique_id = str(uuid.uuid4())
    unique_link = f"http://localhost:3000/student-form/{admin_id}/{unique_id}"

    class_data = db.class_data
    class_data.update_one(
        {"admin_id": admin_id},
        {"$set": {"unique_id": unique_id}},
        upsert=True
    )

    return {'link': unique_link}

# Add or get class data
@application.route('/class-data', methods=['POST'])
def classdata():
    try:
        yaml_data = request.data.decode("utf-8")
        data = yaml.safe_load(yaml_data)

        # Ensure admin details are stored
        admin_data = {
            "name": data["name"],
            "email": data["email"],
            "admin_id": data["admin_id"],
            "course": data["course"],
            "section": data["section"],
            "subject": data["subject"],
            "subjectCode": data["subjectCode"],
            "radius": data["radius"],
            "latitude": data["latitude"],
            "longitude": data["longitude"]
        }

        class_data = db.class_data
        class_data.insert_one(admin_data)

        return jsonify({"Output": "Admin details stored successfully!"})

    except Exception as e:
        return jsonify({"Error": f"Failed to process request: {str(e)}"}), 400
# Helper function to compare faces
def compare_faces(uploaded_image_path, stored_image_path):
    try:
        # Load the uploaded image
        uploaded_image = face_recognition.load_image_file(uploaded_image_path)
        uploaded_encodings = face_recognition.face_encodings(uploaded_image)

        if not uploaded_encodings:
            print("No face found in the uploaded image.")
            return False  # No face detected in the uploaded image

        # Load the stored (original) image
        stored_image = face_recognition.load_image_file(stored_image_path)
        stored_encodings = face_recognition.face_encodings(stored_image)

        if not stored_encodings:
            print("No face found in the stored image.")
            return False  # No face detected in the stored image

        # Compare faces
        result = face_recognition.compare_faces([stored_encodings[0]], uploaded_encodings[0])
        return result[0]
    except Exception as e:
        print(f"Error in face comparison: {e}")
        return False

# Submit student data with image upload and face verification
@application.route('/student-data/<string:admin_id>/<string:provided_id>', methods=['POST'])
def studentdata(admin_id, provided_id):
    class_data = db.class_data
    class_info = class_data.find_one({"admin_id": admin_id})

    if class_info and class_info.get('unique_id') == provided_id:
        if 'file' not in request.files:
            return {'Error': 'No file part'}, 400
        
        file = request.files['file']
        if file.filename == '':
            return {'Error': 'No selected file'}, 400

        yaml_data = request.form.get("data")
        if not yaml_data:
            return {'Error': 'No student data provided'}, 400

        student_info = yaml.safe_load(yaml_data)

        # Validate location
        radius = float(class_info['radius'])
        admin_coord = (class_info['latitude'], class_info['longitude'])
        user_coord = (student_info['latitude'], student_info['longitude'])
        distance = float(haversine(admin_coord, user_coord, unit=Unit.METERS))
        student_info['present'] = distance < radius
        student_info['admin_id'] = admin_id

        # Define file paths
        filename = f"{student_info['studentid']}.jpg"
        file_path = os.path.join(application.config['UPLOAD_FOLDER'], filename)
        original_image_path = os.path.join(ORIGINAL_FOLDER, filename)

        # Save the uploaded image temporarily
        file.save(file_path)

        # Check if student record already exists
        student_data = db.student_data
        existing_student = student_data.find_one({"studentid": student_info['studentid']})

        # If student exists, compare with original image
        if existing_student and os.path.exists(original_image_path):
            match = compare_faces(file_path, original_image_path)
            if not match:
                return {'Error': 'Face verification failed. Attendance denied!'}, 400
        else:
            # If no previous record, save the original image
            if not os.path.exists(original_image_path):
                file.save(original_image_path)

        # Store student data in MongoDB
        student_info['image_path'] = file_path  # Save image path for reference
        student_data.insert_one(student_info)

        return {'Output': 'Data inserted successfully and verified'}
    else:
        return {'Error': 'Invalid or expired link'}, 400

# Get class data
@application.route('/getClassData', methods=['GET'])
def GetClassData():
    class_data = db.class_data
    class_info = class_data.find_one()

    if class_info:
        class_info['_id'] = str(class_info['_id'])
        return jsonify(class_info)
    else:
        return jsonify({})

# Get student data
@application.route('/getStudentData', methods=['GET'])
def GetStudentData():
    student_data = db.student_data
    student_info = student_data.find()

    if student_info:
        data = [item for item in student_info]

        for item in data:
            item['_id'] = str(item['_id'])

        return jsonify(data)
    else:
        return jsonify([])

# Run Flask app on localhost
if __name__ == "__main__":
    application.run(host="127.0.0.1", port=5000, debug=True)
