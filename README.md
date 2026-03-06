# 🧬 MediLens AI

[![Achievement: Top 20 @ HackwithAi](https://img.shields.io/badge/Achievement-Top%2020%20%40%20HackwithAi-blueviolet?style=for-the-badge&logo=rocket)](https://www.linkedin.com/search/results/all/?keywords=HackwithAi%20KLH%20University)
[![Hackathon: 24h Offline](https://img.shields.io/badge/Hackathon-24h%20Offline%20Marathon-orange?style=for-the-badge)](https://www.linkedin.com/search/results/all/?keywords=HackwithAi%20KLH%20University)

**MediLens** is a premium, AI-driven medical command center that transforms complex laboratory reports into clear, actionable health intelligence. It was built during a high-intensity **24-hour offline marathon** at the **HackwithAi** hackathon (Feb 27-28, 2026) at KLH University, Hyderabad, where it secured a spot in the **Top 20 teams out of 657+ squads (4,000+ participants)**.

---

## 🌟 Vision
Medical jargon shouldn't be a barrier to health. MediLens acts as a "personal health translator," using cutting-edge Generative AI to empower patients and families with precision intelligence.

## ✨ Key Features

- 🤖 **RAG-Powered AI Assistant**: An intelligent medical companion that uses **Retrieval-Augmented Generation** to provide answers grounded strictly in your personal clinical data, avoiding generic AI hallucinations.
- 🌍 **Multilingual Summary Analysis**: Automatically generates summary PDFs in native languages, ensuring that patients and their families can understand critical health data in their own tongue.
- 📊 **Precision Health Dashboard**: Visualizes longitudinal trends and instantly flags abnormal markers with clinical accuracy.
- 📁 **Digital Medical Archive**: A secure, centralized hub for maintaining a lifetime of laboratory reports and family health history.
- 👨‍👩‍👧‍👦 **Family Hub**: Unified management for multiple family members, making health tracking a collaborative experience.

## 🛠️ Technical Architecture

### 🧠 The AI Engine (RAG Flow)
1. **Extraction**: `pdfplumber` extracts raw text and data markers from uploaded lab reports.
2. **Contextualization**: The data is fed into a Vector Store (or handled via context-injection) to create a knowledge base for the AI.
3. **Reasoning**: Google Gemini Pro (or OpenAI) processes queries by referencing the extracted clinical context.
4. **Localization**: Summaries are translated and formatted into standardized PDFs for accessibility.

### 💻 Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4 (Modern Aesthetics), Framer Motion, Spline (3D Elements).
- **Backend**: FastAPI (Python), SQLAlchemy, uvicorn.
- **Tools**: `pdfplumber` (PDF parsing), `reportlab` (PDF generation), `gTTS` (Voice synthesis).

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup
```bash
cd Backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

---

## 🏆 Hackathon Recognition
- **Event**: HackwithAi 
- **Venue**: KLH University, Hyderabad
- **Dates**: Feb 27-28, 2026 (24-Hour Offline Sprint)
- **Result**: Ranked Top 20 out of 657 teams.

---

## 📝 Disclaimer
*MediLens is a proof-of-concept developed for educational and hackathon purposes. It is not intended for official medical diagnosis or treatment. Always consult with a qualified healthcare professional.*

---
*Built with ❤️ by the Team ClusterX*
