"""Request/response schemas for the AI service."""
from typing import Optional, List
from pydantic import BaseModel, Field


class PromptRequest(BaseModel):
    """User's natural-language product query."""
    prompt: str = Field(..., min_length=1, max_length=500,
                        description="Natural language product search query")


class FilterResponse(BaseModel):
    """Structured filters extracted from the user prompt."""
    brand: Optional[str] = None
    category: Optional[str] = None
    color: Optional[str] = None
    gender: Optional[str] = None
    size: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    keywords: Optional[List[str]] = None
    raw_response: Optional[str] = None  # for debugging


class HealthResponse(BaseModel):
    status: str
    model: str
    ollama_reachable: bool
