import os
from transformers import pipeline
from dotenv import load_dotenv
import re
import torch

# Load environment variables (if needed for future)
load_dotenv()

# Use GPU if available
device = 0 if torch.cuda.is_available() else -1

# Load Hugging Face summarization pipeline once
summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6", device=device)

def generate_summary_by_type(text, summary_type):
    """
    Generate a summary of the given text using local transformer.
    Supports summary_type: 'tldr', 'brief', 'detailed'
    """
    # Define thresholds
    max_char_limit = 200000  # To avoid long processing times
    truncated = False

    if len(text) > max_char_limit:
        text = text[:max_char_limit]
        truncated = True

    # Clean and chunk text
    text = _clean_text(text)
    chunks = _chunk_text(text)

    # Get min/max length per chunk based on type
    min_len, max_len = _get_dynamic_params(text, summary_type)

    # Run summarizer on each chunk
    all_summaries = []
    for chunk in chunks:
        try:
            summary = summarizer(chunk, min_length=min_len, max_length=max_len, do_sample=False)[0]['summary_text']
            all_summaries.append(summary.strip())
        except Exception as e:
            print(f"Summarization error on chunk: {e}")
            continue

    final_summary = "\n\n".join(all_summaries)

    # Append truncation note if needed
    if truncated:
        final_summary += "\n\n(Note: Original text was truncated for performance.)"

    return final_summary

def _get_dynamic_params(text, summary_type):
    """Return dynamic min/max lengths based on type and input length"""
    word_count = len(text.split())

    # Estimate summary length based on type
    if summary_type == 'tldr':
        ratio = 0.15  # 15%
    elif summary_type == 'brief':
        ratio = 0.45  # 45%
    else:  # 'detailed'
        ratio = 0.70  # 70%

    # Huggingface models use tokens, but for rough estimate, use words
    # Clamp max_len to not exceed input length or 512
    max_len = int(word_count * ratio)
    max_len = max(30, min(max_len, word_count, 512))  # At least 30, at most input length or 512

    # For very short texts, don't let min_len exceed max_len-5
    min_len = int(max_len * 0.5)
    min_len = max(10, min(min_len, max_len - 5))

    # Extra safety: if input is very short, ensure max_len is not more than input
    if max_len > word_count:
        max_len = word_count

    return min_len, max_len

def _chunk_text(text, max_chunk_chars=2000):
    """Split long text into roughly sentence-based chunks"""
    sentences = re.split(r'(?<=[.!?]) +', text)
    chunks = []
    current_chunk = ""

    for sentence in sentences:
        if len(current_chunk) + len(sentence) <= max_chunk_chars:
            current_chunk += sentence + " "
        else:
            chunks.append(current_chunk.strip())
            current_chunk = sentence + " "
    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks

def _clean_text(text):
    """Basic cleaning of the text"""
    text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
    return text.strip()