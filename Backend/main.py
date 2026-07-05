"""
main.py — MediLens AI Backend Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

load_dotenv()

from app.api import upload, analyze, tts, pdf_export, chat, highlight, report, auth, dashboard, profiles
from app.db.database import engine
from app.db import models

app = FastAPI(
    title="MediLens AI API",
    description="Grounded Medical Report Intelligence — PDF parsing, RAG analysis, TTS, PDF export, Interactive Q&A.",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,       prefix="/api/auth", tags=["Auth"])
app.include_router(profiles.router,   prefix="/api", tags=["Profiles"])
app.include_router(upload.router,     prefix="/api", tags=["Upload"])
app.include_router(analyze.router,    prefix="/api", tags=["Analyze"])
app.include_router(tts.router,        prefix="/api", tags=["TTS"])
app.include_router(pdf_export.router, prefix="/api", tags=["PDF Export"])
app.include_router(chat.router,       prefix="/api", tags=["Chat Q&A"])
app.include_router(highlight.router,  prefix="/api", tags=["Highlight"])
app.include_router(report.router,     prefix="/api", tags=["Report Analysis"])
app.include_router(dashboard.router,  prefix="/api/dashboard", tags=["Dashboard"])

@app.on_event("startup")
def on_startup():
    # Create database tables on startup if they don't exist
    models.Base.metadata.create_all(bind=engine)

@app.get("/health")
async def health():
    return {"status": "ok", "system": "MediLens AI v1.0"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
