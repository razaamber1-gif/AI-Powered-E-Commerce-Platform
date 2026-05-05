"""Handles communication with the Ollama LLM runtime.

Strategy: send a few-shot prompt to Ollama, ask for JSON output, parse robustly.
Includes regex fallback if the model returns slightly malformed JSON.
"""
import json
import re
import logging
from typing import Dict, Any

import requests

from app.config import OLLAMA_HOST, MODEL_NAME, LLM_TIMEOUT
from app.prompt_templates import build_extraction_prompt

logger = logging.getLogger(__name__)


def _call_ollama(prompt: str) -> str:
    """Call Ollama's /api/generate endpoint and return raw text response."""
    url = f"{OLLAMA_HOST}/api/generate"
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "format": "json",          # force JSON mode (Ollama feature)
        "options": {
            "temperature": 0.1,    # low temp = deterministic, good for extraction
            "num_predict": 200,    # JSON should be short
        },
    }
    response = requests.post(url, json=payload, timeout=LLM_TIMEOUT)
    response.raise_for_status()
    data = response.json()
    return data.get("response", "")


def _parse_json_response(text: str) -> Dict[str, Any]:
    """Robustly parse JSON from LLM output. Falls back to regex extraction."""
    text = text.strip()
    # Try direct parse first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # Fallback: find first {...} block in the text
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            logger.warning("Failed to parse extracted JSON block: %s", match.group())
    logger.warning("Could not extract JSON from LLM output: %s", text)
    return {}


def _normalize_filters(raw: Dict[str, Any]) -> Dict[str, Any]:
    """Clean up filters: ensure correct types, strip whitespace, drop empty values."""
    def _clean_str(v):
        if v is None:
            return None
        s = str(v).strip()
        return s if s and s.lower() not in ("null", "none", "n/a") else None

    def _clean_num(v):
        if v is None:
            return None
        try:
            return float(v)
        except (TypeError, ValueError):
            return None

    def _clean_list(v):
        if not isinstance(v, list):
            return None
        cleaned = [str(x).strip() for x in v if x and str(x).strip()]
        return cleaned or None

    return {
        "brand": _clean_str(raw.get("brand")),
        "category": _clean_str(raw.get("category")),
        "color": _clean_str(raw.get("color")),
        "gender": _clean_str(raw.get("gender")),
        "size": _clean_str(raw.get("size")),
        "min_price": _clean_num(raw.get("min_price")),
        "max_price": _clean_num(raw.get("max_price")),
        "keywords": _clean_list(raw.get("keywords")),
    }


def extract_filters(user_prompt: str) -> Dict[str, Any]:
    """Main entry point: take user prompt, return structured filters."""
    full_prompt = build_extraction_prompt(user_prompt)
    try:
        raw_text = _call_ollama(full_prompt)
    except requests.exceptions.RequestException as e:
        logger.error("Ollama call failed: %s", e)
        raise RuntimeError(f"AI model unavailable: {e}") from e

    parsed = _parse_json_response(raw_text)
    normalized = _normalize_filters(parsed)
    normalized["raw_response"] = raw_text
    return normalized


def check_ollama_health() -> bool:
    """Return True if Ollama is reachable."""
    try:
        r = requests.get(f"{OLLAMA_HOST}/api/tags", timeout=5)
        return r.status_code == 200
    except requests.exceptions.RequestException:
        return False
