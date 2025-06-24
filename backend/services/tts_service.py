import os
import asyncio
import edge_tts
import pyttsx3
import time
import pdfplumber  # Add this import
import unicodedata
import re

# Voice options mapping - Added child voice
VOICE_MAP = {
    ("en-us", "female"): "en-US-JennyNeural",
    ("en-us", "male"): "en-US-GuyNeural",
    ("hi-in", "female"): "hi-IN-SwaraNeural", 
    ("hi-in", "male"): "hi-IN-MadhurNeural",
    ("en-gb", "female"): "en-GB-LibbyNeural",
    ("en-gb", "male"): "en-GB-RyanNeural",
    ("en-us", "child"): "en-US-AnaNeural"  # New child voice added
}

# Default voice settings
DEFAULT_LANGUAGE = "en-us"
DEFAULT_GENDER = "female"

# Fixed audio output directory - use absolute path
AUDIO_OUTPUT_DIR = r"C:\Users\AdityaTayal\Desktop\Projects\TKK\audio_outputs"
os.makedirs(AUDIO_OUTPUT_DIR, exist_ok=True)

# Function to extract text from PDF
def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file"""
    try:
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return None

async def _edge_tts_convert(text, voice_name, output_path):
    """Internal async function to handle Edge TTS conversion"""
    try:
        print(f"Converting text with voice {voice_name}, saving to {output_path}")
        communicate = edge_tts.Communicate(text, voice_name)
        await communicate.save(output_path)
        print(f"Audio saved successfully to {output_path}")
        return output_path
    except Exception as e:
        print(f"Error in edge TTS conversion: {e}")
        return None

# Add this function to normalize and pre-process Hindi text
def prepare_hindi_text(text):
    """
    Prepare Hindi text for TTS processing by normalizing and cleaning.
    
    Args:
        text (str): Original Hindi text that may have encoding issues
        
    Returns:
        str: Normalized text ready for TTS processing
    """
    # Normalize Unicode to NFC form (canonical composition)
    normalized = unicodedata.normalize('NFC', text)
    
    # Remove zero-width joiners and non-joiners that might cause issues
    normalized = re.sub(r'[\u200c\u200d]', '', normalized)
    
    # Ensure proper spacing around special characters
    normalized = re.sub(r'([।,?!])', r' \1 ', normalized)
    normalized = re.sub(r'\s+', ' ', normalized).strip()
    
    return normalized

# Update the text_to_speech function to handle Hindi text better
def text_to_speech(text, output_file_path, language=DEFAULT_LANGUAGE, gender=DEFAULT_GENDER, use_edge_tts=True):
    """
    Convert text to speech and save as audio file
    
    Args:
        text (str): Text to convert to speech
        output_file_path (str): Path to save the audio file
        language (str): Language code (e.g., "en-us", "hi-in")
        gender (str): Voice gender ("male", "female", or "child")
        use_edge_tts (bool): Whether to use Edge TTS (True) or pyttsx3 (False)
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Make sure the directory exists
        os.makedirs(os.path.dirname(output_file_path), exist_ok=True)
        
        # Pre-process Hindi text if needed
        if language.lower() == "hi-in":
            text = prepare_hindi_text(text)
        
        # Log the text length being processed
        text_preview = text[:100] + "..." if len(text) > 100 else text
        print(f"Processing text ({len(text)} chars): {text_preview}")
        
        # Use Edge TTS for better quality and language support
        if use_edge_tts:
            voice_name = VOICE_MAP.get((language.lower(), gender.lower()))
            if not voice_name:
                print(f"Unsupported language or gender combination: {language}, {gender}")
                # Fallback to default voice
                voice_name = VOICE_MAP.get((DEFAULT_LANGUAGE, DEFAULT_GENDER))
            
            print(f"Selected voice: {voice_name} for language: {language}, gender: {gender}")
            
            # Run the async function in the event loop
            asyncio.run(_edge_tts_convert(text, voice_name, output_file_path))
            return True
        
        # Fallback to pyttsx3 (original implementation)
        else:
            engine = pyttsx3.init()
            engine.setProperty('rate', 150)  # Speed of speech
            engine.save_to_file(text, output_file_path)
            engine.runAndWait()
            return True
            
    except Exception as e:
        print(f"Error in text-to-speech conversion: {e}")
        return False

def get_available_languages():
    """
    Returns a list of available language and gender combinations
    
    Returns:
        list: List of tuples containing (language_code, gender)
    """
    return list(VOICE_MAP.keys())

def generate_audio_filename(text_source, language, gender):
    """
    Generate a unique filename for TTS output based on options
    
    Args:
        text_source (str): Identifier for the source text (e.g., document name)
        language (str): Language code
        gender (str): Gender of voice
        
    Returns:
        str: Full path to the audio file
    """
    # Clean the text source to make it filename-safe
    safe_source = "".join(c if c.isalnum() else "_" for c in text_source)[:30]
    
    # Create a timestamp for uniqueness
    timestamp = int(time.time())
    
    # Generate filename with all parameters
    filename = f"{safe_source}_{language}_{gender}_{timestamp}.mp3"
    
    # Return the full path using the fixed audio output directory
    return os.path.join(AUDIO_OUTPUT_DIR, filename)