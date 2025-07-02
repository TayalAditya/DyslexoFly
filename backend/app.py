from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import time
from services import text_processing
from services.text_processing import estimate_processing_time, get_text_statistics
import threading
from datetime import datetime, timedelta
from pathlib import Path
from services.summary_service import generate_summary_by_type
from flask import g

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
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

recent_check_requests = {}
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
        
        # Get text statistics and time estimation
        stats = get_text_statistics(text_content)
        estimated_time = estimate_processing_time(text_content)
        
        # DO NOT generate audio here!
        return jsonify({
            "success": True,
            "filename": filename,
            "text_content": text_content,
            "statistics": stats,
            "estimated_processing_time": estimated_time,
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
        
        # Check if it's a known fileId with supported extensions
        potential_paths = [
            os.path.join(app.config['UPLOAD_FOLDER'], f"{file_id}"),
            os.path.join(app.config['UPLOAD_FOLDER'], f"{file_id}.pdf"),
            os.path.join(app.config['UPLOAD_FOLDER'], f"{file_id}.docx"),
            os.path.join(app.config['UPLOAD_FOLDER'], f"{file_id}.txt"),
            os.path.join(app.config['UPLOAD_FOLDER'], f"{file_id}.png"),
            os.path.join(app.config['UPLOAD_FOLDER'], f"{file_id}.jpg"),
            os.path.join(app.config['UPLOAD_FOLDER'], f"{file_id}.jpeg")
        ]
        
        # Import the text extraction function from the correct module
        from services.text_processing import extract_text
        
        # Try to find and extract text from the document
        for doc_path in potential_paths:
            if os.path.exists(doc_path):
                print(f"Found document at: {doc_path}")
                document_text = extract_text(doc_path)
                if document_text:
                    print(f"Successfully extracted text: {len(document_text)} characters")
                    break
        
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
    """Serve audio files with proper path handling and error handling"""
    try:
        # Get absolute path to audio file and normalize it
        filepath = os.path.abspath(os.path.join(app.config['AUDIO_OUTPUTS_DIR'], filename))
        
        # Debug path information
        print(f"Serving audio file: {filepath}")
        print(f"File exists: {os.path.exists(filepath)}")
        
        if os.path.exists(filepath):
            # Use directory and basename instead of the full path
            directory = os.path.dirname(filepath)
            basename = os.path.basename(filepath)
            
            # Set CORS headers explicitly
            response = send_from_directory(directory, basename)
            response.headers.add('Access-Control-Allow-Origin', '*')
            response.headers.add('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            return response
        else:
            print(f"ERROR: Audio file not found: {filepath}")
            print(f"Files available in {app.config['AUDIO_OUTPUTS_DIR']}: {os.listdir(app.config['AUDIO_OUTPUTS_DIR'])}")
            return "Audio file not found", 404
    except Exception as e:
        print(f"Error serving audio file: {str(e)}")
        return str(e), 500

@app.route('/api/documents/<file_id>', methods=['GET'])
def get_document(file_id):
    """Get document metadata and text content"""
    try:
        # Find the upload file path
        upload_file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_id)
        
        # Print files for debugging
        print(f"Files in upload folder: {os.listdir(app.config['UPLOAD_FOLDER'])}")
        print(f"Checking if file exists: {upload_file_path}")
        
        if os.path.exists(upload_file_path):
            print(f"Found file at: {upload_file_path}")
            
            # Use the new text_processing module
            extracted_text = text_processing.extract_text(upload_file_path)
            
            # Validate extracted text
            if not extracted_text or len(extracted_text.strip()) < 50:
                print(f"Warning: Low text extraction yield ({len(extracted_text)} chars)")
                
            # Get audio files
            audio_files = [f for f in os.listdir(app.config['AUDIO_OUTPUTS_DIR']) 
                          if f.startswith(os.path.splitext(file_id)[0])]
            audio_files.sort(key=lambda x: os.path.getctime(
                os.path.join(app.config['AUDIO_OUTPUTS_DIR'], x)), reverse=True)
            
            audio_path = f"http://127.0.0.1:5000/api/audio/{audio_files[0]}" if audio_files else None
            
            return jsonify({
                "success": True,
                "filename": file_id,
                "text_content": extracted_text,
                "audioPath": audio_path,
                "audioAvailable": bool(audio_path),
                "summaries": {
                    "tldr": "Brief summary not available.",
                    "standard": "Standard summary not available.",
                    "detailed": "Detailed summary not available."
                },
                "text_length": len(extracted_text)  # For debugging
            })
        else:
            print(f"ERROR: File not found: {upload_file_path}")
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
        upload_file_path = os.path.join(app.config['UPLOAD_FOLDER'], file_id)
        
        if os.path.exists(upload_file_path):
            # Use the new text_processing module
            extracted_text = text_processing.extract_text(upload_file_path)
            
            return jsonify({
                "success": True,
                "text_content": extracted_text,
                "text_length": len(extracted_text)  # For debugging
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
    """Log cleanup requests but don't actually delete audio files"""
    try:
        data = request.get_json()
        audio_path = data.get('audioPath')
        playback_completed = data.get('playbackCompleted', False)
        
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
        print(f"Deletion prevented - keeping file for playback")
        
        # DISABLED: Don't actually delete the file
        # if os.path.exists(full_path):
        #     os.remove(full_path)
        
        # Still return success to keep client happy
        return jsonify({"success": True, "message": "Audio file cleanup handled"})
    
    except Exception as e:
        print(f"Error in cleanup_audio: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/check-file', methods=['POST'])
def check_file_exists():

    global recent_check_requests
    data = request.json
    file_id = data.get('fileId')
    
    if not file_id:
        return jsonify({"exists": False})
    
    # Deduplication check - if same request was made within last 2 seconds
    request_key = f"{file_id}_{request.remote_addr}"
    current_time = time.time()
    
    if request_key in recent_check_requests:
        last_request = recent_check_requests[request_key]
        if current_time - last_request['timestamp'] < 2:  # Within 2 seconds
            print(f"DEDUPLICATED REQUEST: {file_id} - Using cached result")
            return last_request['response']
    
    print(f"Checking file existence for: {file_id}")
    
    # Try exact match first
    file_path = os.path.join(UPLOAD_FOLDER, file_id)
    exists = os.path.exists(file_path)
    
    # If not found, try with various extensions
    if not exists:
        # Remove any existing extension to avoid double extensions
        base_file_id = file_id
        if '.' in file_id:
            base_file_id = file_id.rsplit('.', 1)[0]
        
        for ext in ['.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg']:
            potential_path = os.path.join(UPLOAD_FOLDER, f"{base_file_id}{ext}")
            print(f"Trying path: {potential_path}")
            if os.path.exists(potential_path):
                exists = True
                file_path = potential_path
                break
    
    print(f"Checking file existence: {file_id} - {'Found' if exists else 'Not found'}")
    if exists:
        print(f"Found at: {file_path}")
    
    # Store the response for future duplicate requests
    result = {"exists": exists, "filePath": file_path if exists else None}
    response = jsonify(result)
    recent_check_requests[request_key] = {
        'timestamp': current_time,
        'response': response
    }
    
    return response

@app.route('/api/generate-summary', methods=['POST'])
def generate_summary():
    try:
        data = request.get_json()
        file_id = data.get('fileId')
        summaryType = data.get('summaryType', 'brief')  # default to brief
        
        print(f"SUMMARY GENERATION REQUEST: file_id={file_id}, summary_type={summaryType}")

        # Check if file exists - exact match first
        file_path = os.path.join(UPLOAD_FOLDER, file_id)
        
        if not os.path.exists(file_path):
            # If not found with exact match, try with various extensions
            base_file_id = file_id
            if '.' in file_id:
                base_file_id = file_id.rsplit('.', 1)[0]
            
            for ext in ['.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg']:
                potential_path = os.path.join(UPLOAD_FOLDER, f"{base_file_id}{ext}")
                print(f"Trying path: {potential_path}")
                if os.path.exists(potential_path):
                    file_path = potential_path
                    break
        
        if not os.path.exists(file_path):
            print(f"File not found: {file_id}")
            return jsonify({"success": False, "error": "File not found"})
            
        print(f"Found file at: {file_path}")
            
        # Extract text from the document
        from services.text_processing import extract_text
        document_text = extract_text(file_path)
        
        if not document_text:
            return jsonify({"success": False, "error": "Could not extract text from document"})
            
        summary = generate_summary_by_type(document_text, summaryType)
        
        return jsonify({"success": True, "summary": summary})
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)})
    
@app.route('/api/cleanup-document', methods=['POST'])
def cleanup_document():
    """Clean up a specific document and its associated files"""
    try:
        data = request.get_json()
        file_id = data.get('fileId')
        
        if not file_id:
            return jsonify({"success": False, "error": "No file ID provided"}), 400
        
        print(f"CLEANUP REQUEST: {file_id}")
        
        # Find and delete the uploaded file
        file_path = os.path.join(UPLOAD_FOLDER, file_id)
        deleted_files = []
        
        if os.path.exists(file_path):
            os.remove(file_path)
            deleted_files.append(file_path)
            print(f"Deleted uploaded file: {file_path}")
        
        # Try with different extensions if exact match not found
        if not deleted_files:
            base_file_id = file_id.rsplit('.', 1)[0] if '.' in file_id else file_id
            for ext in ['.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg']:
                potential_path = os.path.join(UPLOAD_FOLDER, f"{base_file_id}{ext}")
                if os.path.exists(potential_path):
                    os.remove(potential_path)
                    deleted_files.append(potential_path)
                    print(f"Deleted file with extension: {potential_path}")
                    break
        
        # Delete associated audio files
        audio_pattern = file_id.replace('.', '_')
        audio_files = [f for f in os.listdir(app.config['AUDIO_OUTPUTS_DIR']) 
                       if f.startswith(audio_pattern)]
        
        for audio_file in audio_files:
            audio_path = os.path.join(app.config['AUDIO_OUTPUTS_DIR'], audio_file)
            if os.path.exists(audio_path):
                os.remove(audio_path)
                deleted_files.append(audio_path)
                print(f"Deleted audio file: {audio_path}")
        
        # Remove from tracking
        if file_id in file_tracking:
            del file_tracking[file_id]
            print(f"Removed {file_id} from tracking")
        
        return jsonify({
            "success": True, 
            "message": f"Cleaned up {len(deleted_files)} files",
            "deleted_files": deleted_files
        })
        
    except Exception as e:
        print(f"Error in cleanup_document: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/debug-summary', methods=['POST'])
def debug_summary():
    """Debug endpoint to test summary generation with minimal requirements"""
    data = request.get_json()
    file_id = data.get('fileId')
    summary_type = data.get('summaryType', 'brief')
    
    print(f"DEBUG SUMMARY REQUEST: file_id={file_id}, summary_type={summary_type}")
    print(f"Request JSON: {data}")
    
    # Send back a simple response for debugging
    return jsonify({
        "success": True,
        "summary": f"Debug summary for {file_id} with type {summary_type}. Generated at {datetime.now()}",
        "request_received": True
    })

@app.route('/api/file-stats', methods=['POST'])
def get_file_stats():
    """Get file statistics and processing time estimation"""
    try:
        data = request.json
        file_id = data.get('fileId')
        
        if not file_id:
            return jsonify({"success": False, "error": "No file ID provided"}), 400
        
        # Check if file exists in tracking
        if file_id not in file_tracking:
            return jsonify({"success": False, "error": "File not found"}), 404
        
        file_path = file_tracking[file_id]['file_path']
        
        # Extract text and get statistics
        text_content = text_processing.extract_text(file_path)
        if not text_content:
            return jsonify({"success": False, "error": "Could not extract text"}), 400
        
        stats = get_text_statistics(text_content)
        estimated_time = estimate_processing_time(text_content)
        
        return jsonify({
            "success": True,
            "statistics": stats,
            "estimated_processing_time": estimated_time,
            "file_info": {
                "upload_time": file_tracking[file_id]['upload_time'].isoformat(),
                "file_size": os.path.getsize(file_path),
                "file_path": file_path
            }
        })
    
    except Exception as e:
        print(f"File stats error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    
if __name__ == "__main__":
    print("Starting Flask server...")
    app.run(debug=True, host='0.0.0.0', port=5000)
