import os
from transformers import pipeline
from dotenv import load_dotenv
import re
import torch
from langdetect import detect

# Load environment variables (if needed for future)
load_dotenv()

# Use GPU if available
device = 0 if torch.cuda.is_available() else -1

# Load Hugging Face summarization pipelines
summarizer_en = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6", device=device)
summarizer_hi = pipeline(
    "summarization",
    model="csebuetnlp/mT5_multilingual_XLSum",
    tokenizer="csebuetnlp/mT5_multilingual_XLSum",
    device=device
)

def generate_summary_by_type(text, summary_type):
    """
    Generate a summary of the given text using local transformer.
    Supports summary_type: 'tldr', 'brief', 'detailed'
    Supports Hindi and English.
    """
    # Define thresholds
    max_char_limit = 7500  # To avoid long processing times
    truncated = False

    if len(text) > max_char_limit:
        text = text[:max_char_limit]
        truncated = True

    # Clean text
    text = _clean_text(text)

    # Get min/max length per chunk based on type
    min_len, max_len = _get_dynamic_params(text, summary_type)

    # Detect language
    try:
        language = detect(text)
    except Exception:
        language = "en"

    # Choose summarizer and chunk by tokens only
    if language == "hi":
        summarizer = summarizer_hi
        tokenizer = summarizer_hi.tokenizer
        chunks = _chunk_text_tokenizer(text, tokenizer, max_tokens=900)
        chunks = ["summarize: " + chunk for chunk in chunks]
    else:
        summarizer = summarizer_en
        tokenizer = summarizer_en.tokenizer
        chunks = _chunk_text_tokenizer(text, tokenizer, max_tokens=900)

    # Run summarizer on each chunk
    all_summaries = []
    for i, chunk in enumerate(chunks):
        print(f"Summarizing chunk {i+1}/{len(chunks)}...")
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

# def _chunk_text(text, max_chunk_chars=2000):
#     """Split long text into roughly sentence-based chunks"""
#     sentences = re.split(r'(?<=[.!?]) +', text)
#     chunks = []
#     current_chunk = ""

#     for sentence in sentences:
#         if len(current_chunk) + len(sentence) <= max_chunk_chars:
#             current_chunk += sentence + " "
#         else:
#             chunks.append(current_chunk.strip())
#             current_chunk = sentence + " "
#     if current_chunk:
#         chunks.append(current_chunk.strip())

#     return chunks

def _clean_text(text):
    """Basic cleaning of the text"""
    text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
    return text.strip()

def _chunk_text_tokenizer(text, tokenizer, max_tokens=900):
    """Chunk text so that each chunk is <= max_tokens tokens for the model."""
    sentences = re.split(r'(?<=[.!?]) +', text)
    chunks = []
    current_chunk = ""
    for sentence in sentences:
        test_chunk = (current_chunk + " " + sentence).strip()
        num_tokens = len(tokenizer.encode(test_chunk))
        if num_tokens <= max_tokens:
            current_chunk = test_chunk
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence
    if current_chunk:
        chunks.append(current_chunk.strip())
    return chunks