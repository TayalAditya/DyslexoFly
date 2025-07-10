#!/bin/bash

# Update pip
pip install --upgrade pip

# Install PyTorch CPU version (lighter for deployment)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install other requirements
pip install -r requirements.txt

# Download NLTK data
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

echo "Build completed successfully!"