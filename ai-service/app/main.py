"""FastAPI application for the AI filter-extraction microservice.

Endpoints:
- POST /extract-filters  → takes a user prompt, returns structured product filters
- GET  /health           → health check (also reports Ollama reachability)
"""
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import MODEL_NAME, PORT
from app.schemas import PromptRequest, FilterResponse, HealthResponse
from app.llm_handler import extract_filters, check_ollama_health

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ChatBot Search Product — AI Service",
    description="Extracts structured product filters from natural language queries.",
    version="1.0.0",
)

# CORS: allow the Node backend (and dev tools) to call this service.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health():
    """Health check that also verifies Ollama is up."""
    return HealthResponse(
        status="ok",
        model=MODEL_NAME,
        ollama_reachable=check_ollama_health(),
    )


@app.post("/extract-filters", response_model=FilterResponse)
def extract_filters_endpoint(req: PromptRequest):
    """Extract structured filters from a natural language product query."""
    logger.info("Extracting filters for prompt: %s", req.prompt)
    try:
        filters = extract_filters(req.prompt)
        logger.info("Extracted filters: %s", filters)
        return FilterResponse(**filters)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.exception("Unexpected error during extraction")
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")


@app.get("/")
def root():
    return {
        "service": "ChatBot Search Product AI Service",
        "endpoints": ["/extract-filters", "/health"],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
