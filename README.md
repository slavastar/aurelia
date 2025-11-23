# AURELIA - Women's Health Intelligence Platform & AI Coach

> A sophisticated longevity strategist and women's health intelligence agent powered by AI. Combines advanced biomarker analysis, biological age estimation, and agentic research to provide personalized, evidence-based health insights.

![Version](https://img.shields.io/badge/version-1.0.0-purple)
![Status](https://img.shields.io/badge/status-production--ready-green)
![License](https://img.shields.io/badge/license-MIT-blue)
[![Python](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)

---

## 🌟 Overview

AURELIA is a comprehensive health analysis platform that bridges the gap between medical data and actionable longevity strategies. It consists of two core components:

1.  **Frontend Platform (Next.js)**: A user-friendly interface for data upload, visualization, and tracking.
2.  **AI Health Coach (Python/FastAPI)**: An autonomous agent that performs deep research, estimates biological age from photos, and generates detailed protocols.

---

## ✨ Key Features

### 🖥️ Frontend Platform
- **📄 PDF Upload & Extraction**: Drag-and-drop blood test PDF upload with Pixtral Vision extraction.
- **📝 Comprehensive Questionnaire**: Symptom assessment, menstrual cycle tracking, and lifestyle evaluation.
- **📊 Interactive Dashboard**: Track health scores, biomarker trends, and risk factors over time.
- **📈 Data Visualization**: Beautiful charts and gauges for health metrics.
- **💡 Personalized Recommendations**: Evidence-based action plans tailored to female physiology.

### 🧠 AI Health Coach (Backend)
- **🔍 Agentic Research**: Automatically searches medical literature (PubMed, etc.) for specific conditions.
- **🔄 Biological Age Tracking**: Analyzes age acceleration and reversal strategies.
- **📸 Skin Age Estimation**: Vision Transformer (ViT) analysis of face photos to estimate biological skin age.
- **📚 Source Citations**: Every recommendation is backed by credible, cited research.
- **💾 Structured Output**: JSON reports with health assessment, interventions, and monitoring plans.

---

## 🔧 Technology Stack

### Frontend (Web App)
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui
- **AI Integration**: Mistral AI / Google Gemini
- **Vision**: Pixtral Vision API

### Backend (AI Agent)
- **Runtime**: Python 3.10+
- **Framework**: FastAPI
- **AI Model**: NetMind AI (Kimi-K2-Instruct), OpenAI
- **Computer Vision**: Vision Transformer (ViT) for age estimation
- **Search**: DuckDuckGo (medical research)
- **Package Manager**: uv

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ and uv
- API Keys: Mistral, Pixtral, NetMind, OpenAI (optional)

### 1. Frontend Setup

```bash
# Install dependencies
npm install

# Set up environment variables (.env.local)
# MISTRAL_API_KEY=...
# PIXTRAL_API_KEY=...

# Run development server
npm run dev
# Access at http://localhost:3000
```

### 2. Backend Setup (AI Agent)

```bash
# Install dependencies with uv
uv sync

# Set up environment variables (.env)
# NET_MIND_API_KEY=...

# Start FastAPI server
python api.py
# Access at http://localhost:8000
```

---

## 📊 Data Flow

1.  **User** uploads blood test PDF & completes questionnaire on Frontend.
2.  **Pixtral Vision** extracts biomarkers.
3.  **Frontend** sends data + optional selfie to **Backend API**.
4.  **AI Agent** analyzes biomarkers, estimates bioage (from photo), and researches specific issues.
5.  **Agent** returns a comprehensive JSON report with citations.
6.  **Frontend** renders the report, visualizations, and action plan.

---

## ⚠️ Disclaimer

This tool is for educational and research purposes. Always consult healthcare professionals before making medical decisions or starting new health protocols.

---

Made with 💜 by the AURELIA Team
