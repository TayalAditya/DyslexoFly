import pyttsx3
import os

def text_to_speech(text, output_file_path):
    """
    Convert text to speech and save as audio file
    
    Args:
        text (str): Text to convert to speech
        output_file_path (str): Path to save the audio file
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Make sure the directory exists
        os.makedirs(os.path.dirname(output_file_path), exist_ok=True)
        
        # Initialize the TTS engine
        engine = pyttsx3.init()
        
        # Set properties (optional)
        engine.setProperty('rate', 150)  # Speed of speech
        
        # Save to file
        engine.save_to_file(text, output_file_path)
        engine.runAndWait()
        
        return True
    except Exception as e:
        print(f"Error in text-to-speech conversion: {e}")
        return False