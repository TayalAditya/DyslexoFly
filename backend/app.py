from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import time
from services import tts_service  # Make sure this import exists
import threading
from datetime import datetime, timedelta
from pathlib import Path

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure upload folder
UPLOAD_FOLDER = os.path.abspath('C:\\Users\\pogak\\OneDrive\\Desktop\\DyslexoFly\\DyslexoFly\\backend\\uploads')
print(f"UPLOAD FOLDER PATH: {UPLOAD_FOLDER}")

# Ensure directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

AUDIO_OUTPUTS_DIR = os.path.abspath('audio_outputs')
os.makedirs(AUDIO_OUTPUTS_DIR, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['AUDIO_OUTPUTS_DIR'] = AUDIO_OUTPUTS_DIR
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

DEFAULT_LANGUAGE = 'en-us'
DEFAULT_GENDER = 'female'

# Track uploaded files with their timestamps
file_tracking = {}

# Cleanup configuration
CLEANUP_INTERVAL = 3600  # 1 hour in seconds
MAX_FILE_AGE = 24  # Maximum age in hours before deletion

# Periodic cleanup function
def cleanup_old_files():
    while True:
        try:
            print("Running cleanup check...")
            # Get the current time
            now = datetime.now()
            cutoff_time = now - timedelta(hours=MAX_FILE_AGE)
            cutoff_time_shorter = now - timedelta(hours=1)  # More aggressive cleanup for uploads folder
            
            # First clean up the uploads folder directly
            try:
                for filename in os.listdir(app.config['UPLOAD_FOLDER']):
                    # Skip the tracking file
                    if filename == '_file_tracking.txt':
                        continue
                        
                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    # Check file age based on file system timestamp
                    file_mtime = os.path.getmtime(file_path)
                    file_age = time.time() - file_mtime
                    
                    # If file is old enough (1 hour), delete it
                    if file_age > (1 * 3600):
                        try:
                            os.remove(file_path)
                            print(f"Deleted old upload file: {file_path}")
                        except Exception as e:
                            print(f"Error deleting file {file_path}: {e}")
            except Exception as e:
                print(f"Error cleaning uploads folder: {e}")
            
            # Check each tracked file with the new dictionary format
            for file_id, data in list(file_tracking.items()):
                try:
                    # Handle the new dictionary format
                    if isinstance(data, dict) and 'upload_time' in data:
                        upload_time = data['upload_time']
                        file_path = data['file_path']
                        
                        # If the file is older than the max age, delete it
                        if upload_time < cutoff_time:
                            print(f"File {file_id} is older than {MAX_FILE_AGE} hours, deleting...")
                            
                            # Delete the uploaded file
                            if os.path.exists(file_path):
                                os.remove(file_path)
                                print(f"Deleted old file: {file_path}")
                            
                            # Delete associated audio files
                            for audio_path in data.get('audio_paths', []):
                                if os.path.exists(audio_path):
                                    os.remove(audio_path)
                                    print(f"Deleted audio file: {audio_path}")
                            
                            # Also check for any other audio files matching this file_id
                            audio_pattern = file_id.replace('.', '_')
                            audio_files = [f for f in os.listdir(app.config['AUDIO_OUTPUTS_DIR']) 
                                           if f.startswith(audio_pattern)]
                                           
                            for audio_file in audio_files:
                                audio_path = os.path.join(app.config['AUDIO_OUTPUTS_DIR'], audio_file)
                                if os.path.exists(audio_path):
                                    os.remove(audio_path)
                                    print(f"Deleted additional audio file: {audio_path}")
                            
                            # Remove from tracking
                            del file_tracking[file_id]
                            print(f"Removed {file_id} from tracking")
                    
                    # Handle the old format (timestamp as a number)
                    elif isinstance(data, (int, float)):
                        # Calculate file age in seconds
                        file_age_seconds = time.time() - data
                        # Convert to hours
                        file_age_hours = file_age_seconds / 3600
                        
                        # If the file is older than the max age, delete it
                        if file_age_hours > MAX_FILE_AGE:
                            file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_id)
                            if os.path.exists(file_path):
                                os.remove(file_path)
                                print(f"Deleted old file (legacy format): {file_path}")
                            
                            # Delete associated audio files
                            audio_pattern = file_id.replace('.', '_')
                            audio_files = [f for f in os.listdir(app.config['AUDIO_OUTPUTS_DIR']) 
                                           if f.startswith(audio_pattern)]
                                           
                            for audio_file in audio_files:
                                audio_path = os.path.join(app.config['AUDIO_OUTPUTS_DIR'], audio_file)
                                if os.path.exists(audio_path):
                                    os.remove(audio_path)
                                    print(f"Deleted associated audio file: {audio_path}")
                            
                            # Remove from tracking
                            del file_tracking[file_id]
                
                except Exception as e:
                    print(f"Error processing file {file_id} during cleanup: {e}")
            
            # Check for orphaned files in upload folder that aren't in tracking
            try:
                for filename in os.listdir(app.config['UPLOAD_FOLDER']):
                    # Skip the tracking file
                    if filename == '_file_tracking.txt':
                        continue
                        
                    # Check if this file is tracked
                    if filename not in file_tracking:
                        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                        # Check file age based on file system timestamp
                        file_mtime = os.path.getmtime(file_path)
                        file_age = time.time() - file_mtime
                        
                        # If file is old enough, delete it
                        if file_age > (MAX_FILE_AGE * 3600):
                            try:
                                os.remove(file_path)
                                print(f"Deleted orphaned file: {file_path}")
                            except Exception as e:
                                print(f"Error deleting orphaned file {file_path}: {e}")
            except Exception as e:
                print(f"Error checking for orphaned files: {e}")
            
            # Also check for orphaned audio files
            try:
                for filename in os.listdir(app.config['AUDIO_OUTPUTS_DIR']):
                    file_path = os.path.join(app.config['AUDIO_OUTPUTS_DIR'], filename)
                    # Check file age based on file system timestamp
                    file_mtime = os.path.getmtime(file_path)
                    file_age = time.time() - file_mtime
                    
                    # If file is old enough, delete it
                    if file_age > (MAX_FILE_AGE * 3600):
                        try:
                            os.remove(file_path)
                            print(f"Deleted orphaned audio file: {file_path}")
                        except Exception as e:
                            print(f"Error deleting orphaned audio file {file_path}: {e}")
            except Exception as e:
                print(f"Error checking for orphaned audio files: {e}")
                
            # Sleep for the cleanup interval
            print(f"Cleanup finished, next run in {CLEANUP_INTERVAL/3600} hours")
            time.sleep(CLEANUP_INTERVAL)
        
        except Exception as e:
            print(f"Error in cleanup thread: {e}")
            time.sleep(60)  # Wait before retrying in case of error

# Start the cleanup thread
cleanup_thread = threading.Thread(target=cleanup_old_files, daemon=True)
cleanup_thread.start()

@app.route('/')
def index():
    return "EdTech Accessibility Hub API is running!"

# Update the upload route to handle all file types
@app.route('/api/upload', methods=['POST'])
def upload_file():
    try:
        if 'file' not in request.files:
            print("ERROR: No file part in request")
            return jsonify({"success": False, "error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            print("ERROR: Empty filename submitted")
            return jsonify({"success": False, "error": "No file selected"}), 400
        
        # Log the original filename
        print(f"Original filename: {file.filename}")
        
        filename = secure_filename(file.filename)
        print(f"Secured filename: {filename}")
        
        # Create absolute path
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        print(f"Saving file to: {file_path}")
        
        # Ensure directory exists again right before saving
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Save the file
        file.save(file_path)
        
        # Verify file was saved
        if os.path.exists(file_path):
            print(f"✓ File successfully saved at {file_path}")
            file_size = os.path.getsize(file_path)
            print(f"File size: {file_size} bytes")
        else:
            print(f"✗ CRITICAL ERROR: File not saved at {file_path}")

        # Track the file with the current timestamp
        # file_tracking[filename] = time.time()
        
        # And update the tracking with correct format
        file_tracking[filename] = {
            'upload_time': datetime.now(),
            'file_path': file_path,
            'audio_paths': []  # Will be populated when audio is generated
        }

        # Add persistence to disk for tracking data
        with open(os.path.join(app.config['UPLOAD_FOLDER'], '_file_tracking.txt'), 'a') as f:
            f.write(f"{filename}|{file_path}|{datetime.now()}\n")
        
        # Extract text based on file type
        from services.text_processing import extract_text
        text_content = extract_text(file_path)
        
        if not text_content:
            return jsonify({
                "success": False, 
                "error": f"Could not extract text from {filename}. Please check if the file contains readable text."
            }), 400
        
        print(f"Extracted text from {filename}: {len(text_content)} characters")
        
        # DO NOT generate audio here!
        return jsonify({
            "success": True,
            "filename": filename,
            "text_content": text_content,
            "message": f"Successfully processed {filename}"
        })
    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({
            "success": False,
            "error": f"Server error: {str(e)}"
        }), 500

@app.route('/api/generate-audio', methods=['POST'])
def generate_audio():
    data = request.json
    text = data.get('text')
    text_source = data.get('source', 'document')
    language = data.get('language', DEFAULT_LANGUAGE)
    gender = data.get('gender', DEFAULT_GENDER)
    
    # Generate a unique filename
    from services.tts_service import generate_audio_filename, text_to_speech
    output_path = generate_audio_filename(text_source, language, gender)
    
    # Generate the audio file
    success = text_to_speech(text, output_path, language, gender)
    
    if success:
        # Extract file_id from text_source if it's a document
        file_id = text_source if text_source != 'document' else None
        
        # After successful audio generation:
        if file_id and file_id in file_tracking:
            file_tracking[file_id]['audio_paths'].append(output_path)
        
        # Return the relative path to be used in frontend
        relative_path = os.path.relpath(output_path, start=app.static_folder)
        return jsonify({
            'success': True, 
            'filename': os.path.basename(output_path),
            'path': f"/static/{relative_path.replace(os.sep, '/')}"
        })
    else:
        return jsonify({'success': False, 'error': 'Failed to generate audio'})

@app.route('/api/regenerate-audio', methods=['POST'])
def regenerate_audio():
    try:
        data = request.get_json()
        file_id = data.get('fileId')
        language = data.get('language', 'en-us')
        gender = data.get('gender', 'female')
        
        # For debugging
        print(f"Regenerating audio for file: {file_id}, language: {language}, gender: {gender}")
        
        # Try to find the actual document file
        document_text = None
        
        # Check if it's a known fileId with PDF extension
        potential_paths = [
            os.path.join(app.config['UPLOAD_FOLDER'], f"{file_id}"),
            os.path.join(app.config['UPLOAD_FOLDER'], f"{file_id}.pdf"),
            os.path.join(app.config['UPLOAD_FOLDER'], f"{file_id}.docx"),
            os.path.join(app.config['UPLOAD_FOLDER'], f"{file_id}.txt")
        ]
        
        # Import the text extraction function
        from services.tts_service import extract_text_from_pdf
        
        # Try to find and extract text from the document
        for doc_path in potential_paths:
            if os.path.exists(doc_path):
                print(f"Found document at: {doc_path}")
                if doc_path.endswith('.pdf'):
                    document_text = extract_text_from_pdf(doc_path)
                    break
                # Add handlers for other file types if needed
        
        # If we couldn't find or extract the document, use fallback text
        if not document_text:
            print(f"Document not found or couldn't extract text. Using sample text.")
            document_text = "This is a fallback text because the original document could not be found or processed. Please upload the document again or check the file format."
            
        # Generate unique filename
        from services.tts_service import generate_audio_filename, text_to_speech
        output_path = generate_audio_filename(file_id, language, gender)
        
        # Generate audio
        success = text_to_speech(document_text, output_path, language, gender)
        
        if success:
            print(f"Audio successfully generated at {output_path}")
            # Return full URL with host
            filename = os.path.basename(output_path)
            return jsonify({
                "success": True, 
                "audioPath": f"http://127.0.0.1:5000/api/audio/{filename}"
            })
        else:
            return jsonify({"success": False, "error": "Failed to generate audio"})
            
    except Exception as e:
        import traceback
        print(f"Error in regenerate_audio: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/audio/<filename>')
def serve_audio(filename):
    """Serve audio files"""
    # Add debugging to see what's happening
    full_path = os.path.join(app.config['AUDIO_OUTPUTS_DIR'], filename)
    if os.path.exists(full_path):
        print(f"Serving audio file: {full_path}")
        response = send_from_directory(app.config['AUDIO_OUTPUTS_DIR'], filename)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    else:
        print(f"ERROR: Audio file not found: {full_path}")
        print(f"Current working directory: {os.getcwd()}")
        print(f"Looking in directory: {app.config['AUDIO_OUTPUTS_DIR']}")
        print(f"Files available: {os.listdir(app.config['AUDIO_OUTPUTS_DIR']) if os.path.exists(app.config['AUDIO_OUTPUTS_DIR']) else 'Directory not found'}")
        return "Audio file not found", 404

@app.route('/api/documents/<file_id>', methods=['GET'])
def get_document(file_id):
    """Get document metadata and text content"""
    try:
        # Debug the incoming request
        print(f"GET /api/documents/{file_id} - Looking for file")
        
        # Find the upload file path - try multiple possibilities
        possible_paths = [
            os.path.join(app.config['UPLOAD_FOLDER'], file_id),
            os.path.join(app.config['UPLOAD_FOLDER'], os.path.basename(file_id))
        ]
        
        # Print files in upload folder for debugging
        print(f"Files in upload folder: {os.listdir(app.config['UPLOAD_FOLDER'])}")
        
        # Check each possible path
        upload_file_path = None
        for path in possible_paths:
            print(f"Checking if file exists: {path}")
            if os.path.exists(path):
                upload_file_path = path
                print(f"Found file at: {path}")
                break
        
        # If we found the file, extract its text
        if upload_file_path:
            # Extract text from the document
            extracted_text = tts_service.extract_text_from_pdf(upload_file_path)
            
            # Get the most recent audio file generated for this document
            audio_files = [f for f in os.listdir(app.config['AUDIO_OUTPUTS_DIR']) 
                          if f.startswith(file_id.replace('.', '_'))]
            
            # Sort by creation time (most recent first)
            audio_files.sort(key=lambda x: os.path.getctime(
                os.path.join(app.config['AUDIO_OUTPUTS_DIR'], x)), reverse=True)
            
            audio_path = None
            if audio_files:
                # Change this line to use absolute URL
                audio_path = f"http://127.0.0.1:5000/api/audio/{audio_files[0]}"
            
            return jsonify({
                "success": True,
                "filename": file_id,
                "text_content": extracted_text,
                "audioPath": audio_path,
                "audioAvailable": audio_path is not None,
                "summaries": {
                    "tldr": "Brief summary not available.",
                    "standard": "Standard summary not available.",
                    "detailed": "Detailed summary not available."
                }
            })
        else:
            print(f"ERROR: File not found. Checked paths: {possible_paths}")
            return jsonify({
                "success": False,
                "error": f"Document '{file_id}' not found"
            }), 404
            
    except Exception as e:
        print(f"Error getting document: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/documents/<file_id>/extracted-text', methods=['GET'])
def get_document_text(file_id):
    """Get just the extracted text for a document"""
    try:
        # Find the upload file path
        upload_file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_id)
        
        # If the file exists, extract its text
        if os.path.exists(upload_file_path):
            # Extract text from the document
            extracted_text = tts_service.extract_text_from_pdf(upload_file_path)
            
            return jsonify({
                "success": True,
                "text_content": extracted_text
            })
        else:
            return jsonify({
                "success": False,
                "error": "Document not found"
            }), 404
            
    except Exception as e:
        print(f"Error getting document text: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Add this new endpoint

@app.route('/api/documents/<file_id>/status', methods=['GET'])
def get_document_status(file_id):
    """Check the processing status of a document"""
    try:
        # Find the upload file path
        upload_file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_id)
        
        if not os.path.exists(upload_file_path):
            return jsonify({
                "success": False,
                "status": "not_found",
                "error": "Document not found"
            }), 404
        
        # Check if audio has been generated
        audio_files = [f for f in os.listdir(app.config['AUDIO_OUTPUTS_DIR']) 
                       if f.startswith(file_id.replace('.', '_'))]
        
        if audio_files:
            return jsonify({
                "success": True,
                "status": "complete",
                "audioAvailable": True
            })
        else:
            return jsonify({
                "success": True,
                "status": "processing",
                "audioAvailable": False
            })
            
    except Exception as e:
        print(f"Error checking document status: {e}")
        return jsonify({
            "success": False,
            "status": "error",
            "error": str(e)
        }), 500

# Add this to handle server shutdown:

@app.teardown_appcontext
def cleanup_on_shutdown(exception):
    """Clean up temporary files when server shuts down"""
    print("Context teardown triggered")
    # In development mode, don't delete files during auto-reload
    if not app.debug:
        print("Production shutdown detected, cleaning up all files...")
        
        for file_id, data in list(file_tracking.items()):
            # Delete uploaded file
            if isinstance(data, dict) and 'file_path' in data and os.path.exists(data['file_path']):
                try:
                    os.remove(data['file_path'])
                    print(f"Deleted uploaded file: {data['file_path']}")
                except Exception as e:
                    print(f"Error deleting file {data['file_path']}: {e}")
            
            # Handle old format of file tracking
            elif isinstance(data, (int, float)) and os.path.exists(os.path.join(UPLOAD_FOLDER, file_id)):
                try:
                    os.remove(os.path.join(UPLOAD_FOLDER, file_id))
                    print(f"Deleted old-format file: {file_id}")
                except Exception as e:
                    print(f"Error deleting old-format file {file_id}: {e}")
        
        # Clear tracking dictionary
        file_tracking.clear()
        print("Cleanup on shutdown complete")

# Debugging endpoints
print(f"Current working directory: {os.getcwd()}")
print(f"Files in upload folder at startup: {os.listdir(UPLOAD_FOLDER) if os.path.exists(UPLOAD_FOLDER) else []}")

@app.route('/api/debug/files')
def debug_files():
    """Debug endpoint to list all files and tracking"""
    return jsonify({
        'working_directory': os.getcwd(),
        'upload_folder': UPLOAD_FOLDER,
        'files_in_folder': os.listdir(UPLOAD_FOLDER) if os.path.exists(UPLOAD_FOLDER) else [],
        'tracking_data': str(file_tracking)
    })

@app.route('/api/audio/cleanup', methods=['POST'])
def cleanup_audio():
    """Delete audio file when tab becomes inactive or audio is no longer needed"""
    try:
        data = request.get_json()
        audio_path = data.get('audioPath')
        
        if not audio_path:
            return jsonify({"success": False, "error": "No audio path provided"}), 400
        
        # Extract filename from the path
        if '/' in audio_path:
            filename = audio_path.split('/')[-1]
        else:
            filename = audio_path
        
        # Construct full path
        full_path = os.path.join(app.config['AUDIO_OUTPUTS_DIR'], filename)
        
        print(f"Request to delete audio file: {full_path}")
        
        if os.path.exists(full_path):
            os.remove(full_path)
            print(f"Successfully deleted audio file: {full_path}")
            
            # Remove from tracking if present
            for file_id, data in list(file_tracking.items()):
                if isinstance(data, dict) and 'audio_paths' in data:
                    if full_path in data['audio_paths']:
                        data['audio_paths'].remove(full_path)
                        print(f"Removed {full_path} from tracking for {file_id}")
            
            return jsonify({"success": True, "message": "Audio file deleted"})
        else:
            print(f"Audio file not found: {full_path}")
            return jsonify({"success": False, "error": "Audio file not found"}), 404
    
    except Exception as e:
        print(f"Error in cleanup_audio: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)