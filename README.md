# 📘 DyslexoFly

DyslexoFly is an inclusive EdTech platform built to support dyslexic students by transforming textbooks into more accessible formats. It integrates AI, accessibility principles, and modern web technologies to enhance learning for students with dyslexia.

---

## 🧠 Project Overview

Dyslexia affects over 70 million individuals in India alone. DyslexoFly aims to bridge the educational accessibility gap by enabling students to:

-  Convert text to **OpenDyslexic font**
-  Listen to the content via **Text-to-Speech**
-  Understand faster with **AI-powered summarization**
-  Store and retrieve converted material on the cloud

---

## 🔍 About Dyslexia

Dyslexia is a neurological learning disability that impairs a person's ability to read, write, and spell, despite normal intelligence. This project aims to support dyslexic learners by offering alternative content formats aligned with their strengths — auditory and visual learning.

---

## 📁 Directory Structure

```text
DyslexoFly/
├── .gitignore
├── backend/
│   ├── audio_outputs/              # Stores TTS-generated audio files
│   ├── services/                   # Backend service modules
│   │   ├── __pycache__/            # Python cache files
│   │   ├── __init__.py             # Init file for service package
│   │   ├── text_processing.py      # Text extraction & preprocessing logic
│   │   └── tts_service.py          # Text-to-speech logic
│   ├── static/
│   │   └── test.html               # Static HTML content
│   ├── uploads/                    # Uploaded files
│   │   ├── _file_tracking.txt      # File tracking or metadata
│   ├── app.py                      # Main Flask/FastAPI application
│   └── requirements.txt            # Python dependencies
├── frontend/
│   ├── .gitignore
│   ├── .next/                      # Next.js build output
│   ├── node_modules/               # Node.js dependencies
│   ├── public/                     # Public static assets
│   ├── src/                        # React source code
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── README.md
│   └── tsconfig.json
├── uploads/                        # [Optional] root-level uploads (can be removed)
├── venv/                           # Python virtual environment
└── README.md                       # Project documentation
```

---
## 👥 Team Details

**Team Name**: The Kamand Crew

**Project Name**: DyslexoFly


**Team Members**:

| Name               | Role                        
|--------------------|-------------------------------|
| Aditya Tayal       | Full Stack and AI integration | 
| Siddhi Pogakwar    | TTS and Text Anayser          |
   
---

## 🖼️ Project Snapshot

Below is a visual preview of the **DyslexoFly** platform in action:

![Project Snapshot](./assets/snapshot.png)

> This image demonstrates the UI/UX of the application, including upload, conversion, and accessibility features.


