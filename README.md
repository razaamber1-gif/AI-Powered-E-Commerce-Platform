# 🛍️ ChatBot Search Product

> A Myntra-style e-commerce platform with an AI-powered shopping assistant.
> Type a query in plain English; the AI extracts filters and searches the database.

**Stack:** React + Node.js + MongoDB + Python (FastAPI) + Llama 3.2 (via Ollama)

---

## ✨ What this project does

1. Real e-commerce site — signup, login, browse, cart, profile
2. Floating "Search with AI Agent" chatbot powered by an open-source LLM
3. Two-stage AI pipeline:
   - **Stage 1**: LLM converts your prompt → structured JSON filters
   - **Stage 2**: MongoDB query uses those filters → matching products
4. Runs entirely on your laptop (no paid APIs, no GPU required)

---

## 🚀 Quick Start (5 Steps)

### Prerequisites
- **Node.js v18+** — https://nodejs.org
- **Python 3.10+** — https://python.org
- **MongoDB v6+** — https://mongodb.com (or use [MongoDB Atlas](https://cloud.mongodb.com) free tier)
- **Ollama** — https://ollama.com
- **8 GB RAM minimum** (16 GB recommended)

### Step 1 — Pull the AI model
```bash
ollama pull llama3.2:3b
# Or, on slower machines:
# ollama pull phi3:mini
```
After install, Ollama runs automatically as a background service on port 11434.

### Step 2 — Place your dataset
Put your Myntra product CSV at:
```
chatbot-search-product/dataset/myntra_products.csv
```
Required columns: `name, sku, mpn, price, in_stock, currency, brand, description, images, gender`

### Step 3 — Start the AI Service
Open a terminal:
```bash
cd ai-service
python -m venv venv
source venv/bin/activate                # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```
You should see: `Application startup complete.` Visit http://localhost:8000/docs to test.

### Step 4 — Start the Backend (and seed the database)
Open a new terminal:
```bash
cd backend
npm install
cp .env.example .env

# One-time: ingest your CSV into MongoDB
npm run seed -- --clear

# Start the API server
npm run dev
```

The seed script will:
- Read your CSV row by row
- **Derive `category`** from each product's name (e.g. "DKNY ... Trolley Bag" → category `"Trolley Bag"`)
- **Derive `color`** from each product's name (e.g. "Black & Grey" → color `"Black"`)
- Split the multi-URL `images` column into a clean array
- Bulk-insert in batches of 1000

You'll see something like:
```
✅ Done!
   Inserted: 12453
   Skipped:  47

📊 Top categories:
   T-shirt              3245
   Jeans                1820
   Trolley Bag          412
   ...
```

### Step 5 — Start the Frontend
Open a third terminal:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Browser opens at http://localhost:3000 automatically.

---

## 🎯 Try the AI ChatBot

1. Click the floating "🤖 Search with AI Agent" button at bottom-right
2. Try queries like:
   - `"DKNY trolley bag for unisex under 15000"`
   - `"Show me Jockey black t-shirts under 1200"`
   - `"Red running shoes for men between 3000 and 5000"`
   - `"Women cotton kurti pink"`
   - `"Watches under 5k"`

⏱️ **First search takes 10–30 seconds** while the LLM warms up on CPU. After that, every query takes 2–5 seconds.

---

## 📁 Project Structure

```
chatbot-search-product/
├── README.md                    ← you are here
├── docker-compose.yml           ← optional one-command startup
├── .gitignore
│
├── dataset/                     ← put myntra_products.csv here
│   └── README.md
│
├── ai-service/                  ← Python + FastAPI + Ollama
│   ├── app/
│   │   ├── main.py              ← FastAPI app, /extract-filters endpoint
│   │   ├── llm_handler.py       ← Calls Ollama, parses JSON
│   │   ├── prompt_templates.py  ← Few-shot prompt for the LLM
│   │   ├── schemas.py           ← Pydantic models
│   │   └── config.py
│   ├── requirements.txt
│   └── .env.example
│
├── backend/                     ← Node.js + Express + MongoDB
│   ├── config/db.js
│   ├── models/                  ← User, Product, Cart Mongoose schemas
│   ├── controllers/             ← business logic
│   │   ├── auth.controller.js
│   │   ├── user.controller.js   ← profile (name immutable)
│   │   ├── product.controller.js
│   │   ├── cart.controller.js
│   │   └── chatbot.controller.js  ← 🌟 the two-stage AI pipeline
│   ├── routes/                  ← URL → controller mapping
│   ├── middleware/              ← JWT auth, error handler
│   ├── utils/
│   │   ├── jwt.js
│   │   └── categoryExtractor.js ← 🆕 derives category/color from product names
│   ├── seed/
│   │   ├── seedFromCSV.js       ← 🆕 ingests your Myntra dataset
│   │   └── README.md
│   ├── server.js
│   └── package.json
│
└── frontend/                    ← React + Vite + Tailwind
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── ProductCard.jsx
    │   │   ├── ChatBot.jsx      ← 🌟 the floating AI shopping assistant
    │   │   ├── ProtectedRoute.jsx
    │   │   └── Loader.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── ProductDetails.jsx
    │   │   ├── Cart.jsx
    │   │   └── Profile.jsx
    │   ├── context/             ← AuthContext, CartContext
    │   ├── services/            ← Axios API wrappers
    │   ├── utils/helpers.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 🔌 Service Ports

| Service           | Port  | URL                              |
|-------------------|-------|----------------------------------|
| Frontend (React)  | 3000  | http://localhost:3000            |
| Backend (Express) | 5000  | http://localhost:5000            |
| AI Service        | 8000  | http://localhost:8000/docs       |
| Ollama            | 11434 | http://localhost:11434           |
| MongoDB           | 27017 | mongodb://localhost:27017        |

---

## 🐛 Troubleshooting

**"AI service is not available" in the chatbot**
→ Make sure the Python service is running (`uvicorn app.main:app --port 8000`) AND Ollama is running (try `ollama list` to confirm). You can also visit http://localhost:8000/health to verify.

**"No products found" on the homepage**
→ You haven't seeded the database. Run `npm run seed -- --clear` from the backend folder.

**MongoDB connection error**
→ Check `MONGO_URI` in `backend/.env`. For local MongoDB, the default is `mongodb://localhost:27017/chatbot_search_product`. For Atlas, paste the connection string from your Atlas dashboard.

**LLM extracts wrong filters**
→ Edit `ai-service/app/prompt_templates.py` and add more few-shot examples for the queries you care about. This is the single biggest quality lever.

**"Mobile must be a valid 10-digit number" error**
→ The signup validates Indian mobile numbers (must start with 6/7/8/9 and be 10 digits). Adjust the regex in `backend/models/User.js` and `backend/routes/auth.routes.js` if you need a different format.

**First chatbot query takes 30+ seconds**
→ This is normal. CPU inference is slow on the first call (the model has to load into RAM). Subsequent calls are 2–5 seconds. If it's consistently too slow, try the smaller `phi3:mini` model.

---

## 📊 What to Showcase in Your Project Viva

1. **Architecture** — Three services, each in the language best suited to its job
2. **AI pipeline** — Open the network tab and walk through the two stages live:
   - User prompt → Python service → Ollama → JSON filters
   - JSON filters → MongoDB query → product results
3. **Data engineering** — Show the seed script transforming raw CSV into structured DB records (category extraction, image splitting)
4. **Local LLM** — No paid APIs, runs offline on CPU, fully reproducible
5. **Security** — JWT auth, bcrypt password hashing, name immutability enforced server-side
6. **Live demo** — Type a complex prompt in the chatbot, watch real products appear in seconds

---

## 📝 License

Academic project. Use freely for learning.
