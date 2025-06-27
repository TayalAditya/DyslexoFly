import os
import requests
import openai
import cohere
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure API keys for all providers
openai_api_key = os.getenv("OPENAI_API_KEY")
groq_api_key = os.getenv("GROQ_API_KEY") 
cohere_api_key = os.getenv("COHERE_API_KEY")

# Initialize clients only if keys are available
openai.api_key = openai_api_key
groq_client = Groq(api_key=groq_api_key) if groq_api_key else None
cohere_client = cohere.Client(api_key=cohere_api_key) if cohere_api_key else None

def generate_summary_by_type(text, summary_type):
    """
    Generate a summary of the given text based on the specified type.
    Automatically tries multiple providers in sequence.
    """
    # Truncate very long texts to avoid token limits
    max_tokens = 4000  # Adjust based on model limits
    if len(text) > max_tokens * 4:  # Rough estimate for token/char ratio
        text = text[:max_tokens * 4]
        truncated = True
    else:
        truncated = False
    
    # Create prompt based on summary type
    if summary_type == 'tldr':
        prompt = f"Provide a very concise TL;DR summary of the following text in 1-2 sentences:\n\n{text}"
        max_tokens_output = max(len(text)/10,100)
    elif summary_type == 'brief':
        prompt = f"Provide a brief summary of the following text in 1-2 paragraphs:\n\n{text}"
        max_tokens_output = max(len(text)/5,200)
    else:  # detailed
        prompt = f"Provide a comprehensive and detailed summary of the following text, covering all key points:\n\n{text}"
        max_tokens_output = max(len(text)/2,1000)
    
    # Add note if text was truncated
    if truncated:
        prompt += "\n\nNote: The original text was truncated due to length constraints."
    
    # Try each provider in sequence
    summary = None
    
    # 1. Try OpenAI first
    if openai_api_key:
        try:
            summary = generate_with_openai(prompt, max_tokens_output)
            print("Successfully generated summary with OpenAI")
        except Exception as e:
            print(f"OpenAI error: {e}")
    
    # 2. Try Groq if OpenAI failed
    if summary is None and groq_api_key:
        try:
            summary = generate_with_groq(prompt, max_tokens_output)
            print("Successfully generated summary with Groq")
        except Exception as e:
            print(f"Groq error: {e}")
            
    # 3. Try Cohere if both OpenAI and Groq failed
    if summary is None and cohere_api_key:
        try:
            summary = generate_with_cohere(prompt, max_tokens_output)
            print("Successfully generated summary with Cohere")
        except Exception as e:
            print(f"Cohere error: {e}")
    
    # 4. Use fallback if all APIs failed
    if summary is None:
        summary = generate_fallback_summary(text, summary_type)
        print("Used fallback summary generator")
    
    # Add note about truncation if applicable
    if truncated and summary:
        summary += "\n\n(Note: This summary is based on a portion of the original text due to length constraints.)"
        
    return summary

def generate_with_openai(prompt, max_tokens_output):
    """Generate summary using OpenAI"""
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",  # You can also use "gpt-4" if available
        messages=[
            {"role": "system", "content": "You are an expert summarizer that creates concise, accurate summaries."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=max_tokens_output,
        temperature=0.3
    )
    
    return response.choices[0].message.content.strip()

def generate_with_groq(prompt, max_tokens_output):
    """Generate summary using Groq"""
    response = groq_client.chat.completions.create(
        model="llama3-8b-8192",  # or another Groq model
        messages=[
            {"role": "system", "content": "You are an expert summarizer that creates concise, accurate summaries."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=max_tokens_output,
        temperature=0.3
    )
    
    return response.choices[0].message.content.strip()

def generate_with_cohere(prompt, max_tokens_output):
    """Generate summary using Cohere"""
    response = cohere_client.generate(
        model="command",  # or another Cohere model
        prompt=f"You are an expert summarizer. {prompt}",
        max_tokens=max_tokens_output,
        temperature=0.3
    )
    
    return response.generations[0].text.strip()

def generate_fallback_summary(text, summary_type):
    """Generate a summary without using external APIs"""
    print("Using fallback summary generator")
    
    # Truncate long text
    if len(text) > 8000:
        text = text[:8000] + "..."
    
    # Extract sample segments
    intro = text[:300]
    word_count = len(text.split())
    paragraph_count = len([p for p in text.split("\n\n") if p.strip()])
    
    if summary_type == 'tldr':
        return f"TL;DR: This document contains {word_count} words across {paragraph_count} paragraphs. It discusses topics related to {intro[:50]}..."
    
    elif summary_type == 'brief':
        paragraphs = text.split('\n\n')
        first_para = paragraphs[0] if paragraphs else text[:300]
        return (f"Brief Summary: This document ({word_count} words) explores several concepts. "
                f"It begins by discussing {first_para[:150]}... "
                f"The text contains {paragraph_count} main sections or paragraphs.")
    
    else:  # detailed
        paragraphs = text.split('\n\n')
        sections = []
        
        # Take samples from beginning, middle, and end
        if paragraphs:
            if len(paragraphs) >= 1:
                sections.append(f"Introduction: {paragraphs[0][:200]}...")
            if len(paragraphs) >= 3:
                middle_idx = len(paragraphs) // 2
                sections.append(f"Middle section: {paragraphs[middle_idx][:200]}...")
            if len(paragraphs) >= 2:
                sections.append(f"Conclusion: {paragraphs[-1][:200]}...")
        else:
            sections = [f"Content sample: {text[:600]}..."]
            
        return (f"Detailed Summary: This document contains {word_count} words across {paragraph_count} paragraphs.\n\n" + 
                "\n\n".join(sections))