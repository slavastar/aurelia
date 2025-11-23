# ✦ AURELIA
**Women's Health Intelligence & Longevity Strategist**

Aurelia is an AI-powered platform that analyzes blood test results and health data to provide personalized, evidence-based longevity insights tailored to female physiology.

## ✨ Features
- **Smart Analysis**: Upload blood test PDFs or images to extract biomarkers automatically using AI.
- **AI Health Coach**: Get personalized recommendations based on your unique biology and goals.
- **Bioage Estimation**: Optional selfie analysis to estimate biological skin age.
- **Privacy First**: Your health data is processed securely and never stored without consent.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+

### Installation

1. **Clone & Install**
   ```bash
   git clone https://github.com/slavastar/aurelia.git
   cd aurelia
   npm install
   ```

2. **Environment Setup**
   Create a `.env.local` file in the root directory with your API keys:
   ```env
   MISTRAL_API_KEY=your_mistral_key
   PIXTRAL_API_KEY=your_pixtral_key
   # Optional: For blob storage
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   ```

3. **Run the App**
   You need two terminals to run the full stack:

   **Terminal 1: Start Backend (AI Agent)**
   ```bash
   chmod +x run_backend.sh
   ./run_backend.sh
   ```

   **Terminal 2: Start Frontend**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to start your analysis.

## 🛠️ Tech Stack
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion
- **Backend**: Python FastAPI
- **AI Models**:
  - **Mistral Large**: Complex medical analysis and recommendations.
  - **Pixtral**: OCR and document extraction.
  - **Vision Transformer**: Biological age estimation.

---
*Built for the future of women's health.*
4.  **AI Agent** analyzes biomarkers, estimates bioage (from photo), and researches specific issues.
5.  **Agent** returns a comprehensive JSON report with citations.
6.  **Frontend** renders the report, visualizations, and action plan.

---

## ⚠️ Disclaimer

This tool is for educational and research purposes. Always consult healthcare professionals before making medical decisions or starting new health protocols.

---

Made with 💜 by the AURELIA Team
