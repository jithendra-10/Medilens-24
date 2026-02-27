"""
grok_client.py
--------------
LLM API client for the Medical Report Intelligence System.

Currently configured for Groq (groq.com) — free tier, OpenAI-compatible.
To switch to xAI Grok: change _BASE_URL and set GROK_API_KEY (xai-...) from console.x.ai.

Key Configuration:
  - Provider   : Groq (https://api.groq.com/openai/v1)
  - Model      : llama-3.3-70b-versatile (free, high quality)
  - Temperature: 0.2 (near-deterministic for medical safety)
  - Max Tokens : 1500 (controlled output length)

The client is intentionally minimal to keep it testable and swappable.
"""

import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# ── Configuration ────────────────────────────────────────────────────────────
# Reads GROQ_API_KEY (Groq) or falls back to GROK_API_KEY (xAI Grok)
_GROK_API_KEY  = os.getenv("GROQ_API_KEY") or os.getenv("GROK_API_KEY", "")
_GROK_BASE_URL = "https://api.groq.com/openai/v1"
_DEFAULT_MODEL = os.getenv("GROK_MODEL", "llama-3.1-8b-instant")
_TEMPERATURE   = float(os.getenv("GROK_TEMPERATURE", "0.2"))
_MAX_TOKENS    = int(os.getenv("GROK_MAX_TOKENS", "1500"))

# Groq is fully OpenAI-compatible — same SDK, different base URL
_client = OpenAI(api_key=_GROK_API_KEY, base_url=_GROK_BASE_URL)


def call_grok(prompt: str) -> str:
    """
    Send a prompt to the LLM API and return the text response.

    Parameters
    ----------
    prompt : str
        The fully constructed prompt from prompt_template.build_prompt().

    Returns
    -------
    str
        The model's response text.

    Raises
    ------
    RuntimeError
        If the API key is missing or the API call fails.
    """
    if not _GROK_API_KEY:
        raise RuntimeError(
            "No API key found. Set GROQ_API_KEY in your .env file (free at groq.com)."
        )

    response = _client.chat.completions.create(
        model=_DEFAULT_MODEL,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a safe, grounded medical report explanation assistant. "
                    "You strictly follow the rules provided in the user prompt. "
                    "You never diagnose, never prescribe, and never invent medical facts."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=_TEMPERATURE,
        max_tokens=_MAX_TOKENS,
    )

    return response.choices[0].message.content.strip()
