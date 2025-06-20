from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import os
from services.text_processing import extract_text
from services.tts_service import text_to_speech

app = Flask(__name__)
# Enable CORS
CORS(app)

# Create necessary folders if they don't exist
os.makedirs('uploads', exist_ok=True)
os.makedirs('audio_outputs', exist_ok=True)

@app.route('/')
def home():
    return "EdTech Accessibility Hub API"

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    # Save file temporarily
    filename = file.filename
    file_path = os.path.join('uploads', filename)
    file.save(file_path)
    
    # Extract text
    text_content = extract_text(file_path)
    
    # Generate audio version
    audio_filename = f"{os.path.splitext(filename)[0]}.mp3"
    audio_path = os.path.join('audio_outputs', audio_filename)
    tts_success = text_to_speech(text_content, audio_path)
    
    response = {
        "success": True,
        "filename": filename,
        "text_content": text_content[:1000] + "..." if len(text_content) > 1000 else text_content,
        "audio_available": tts_success,
        "audio_path": f"/api/audio/{audio_filename}" if tts_success else None
    }
    
    return jsonify(response)

@app.route('/api/audio/<filename>')
def get_audio(filename):
    audio_path = os.path.join('audio_outputs', filename)
    if os.path.exists(audio_path):
        return send_file(audio_path)
    else:
        return jsonify({"error": "Audio file not found"}), 404

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@app.route('/test')
def test_page():
    return send_from_directory('static', 'test.html')

if __name__ == '__main__':
    app.run(debug=True)