# AI Service — Filter Extraction with Ollama

A small FastAPI microservice that converts natural-language product queries into structured JSON filters.

## Setup

### 1. Install Ollama
- macOS / Linux: https://ollama.com/download
- Windows: https://ollama.com/download/windows

### 2. Pull a model
```bash
ollama pull llama3.2:3b      # ~2 GB, recommended
# OR for slower machines:
ollama pull phi3:mini        # ~2.3 GB, smaller and faster
```

### 3. Install Python dependencies
```bash
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Configure environment
```bash
cp .env.example .env
# edit .env if needed (defaults are fine for local dev)
```

### 5. Run the service
```bash
uvicorn app.main:app --reload --port 8000
```

Visit http://localhost:8000/docs for interactive API documentation (Swagger UI).

## Test it manually

```bash
curl -X POST http://localhost:8000/extract-filters \
  -H "Content-Type: application/json" \
  -d '{"prompt": "I want a Jockey black t-shirt under 1200"}'
```

Expected output:
```json
{
  "brand": "Jockey",
  "category": "T-shirt",
  "color": "black",
  "size": null,
  "min_price": null,
  "max_price": 1200,
  "keywords": null
}
```
