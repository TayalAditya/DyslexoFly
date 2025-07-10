---
title: DyslexoFly Backend
emoji: 🚀
colorFrom: blue
colorTo: purple
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
pinned: false
---

# DyslexoFly Backend API

This is the backend API for DyslexoFly - an accessibility-focused educational platform.

## Features
- Document text extraction (PDF, DOCX)
- AI-powered summarization
- Text-to-speech conversion
- Multi-language support

## API Endpoints
- `POST /api/upload` - Upload documents
- `POST /api/generate-summary` - Generate summaries
- `POST /api/generate-audio` - Text-to-speech
- `GET /api/health` - Health check