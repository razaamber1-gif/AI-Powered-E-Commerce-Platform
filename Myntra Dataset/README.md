# 🛍️ ChatBot Search Product — AI-Powered E-Commerce Platform

> A Myntra-style e-commerce website with an integrated AI shopping assistant ("Search with AI Agent") that understands natural-language product queries and returns matching products from the database.

**Final Year Major Project** | Full-Stack + AI/ML Integration

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Why This Project Stands Out](#2-why-this-project-stands-out)
3. [Features](#3-features)
4. [Tech Stack](#4-tech-stack)
5. [System Architecture](#5-system-architecture)
6. [End-to-End Workflow](#6-end-to-end-workflow)
7. [How the AI ChatBot Works](#7-how-the-ai-chatbot-works-the-most-important-part)
8. [Project Directory Structure](#8-project-directory-structure)
9. [Folder-by-Folder Explanation](#9-folder-by-folder-explanation)
10. [Database Schema](#10-database-schema)
11. [API Endpoints](#11-api-endpoints)
12. [Setup & Installation](#12-setup--installation)
13. [Development Roadmap](#13-development-roadmap-suggested-build-order)
14. [Future Enhancements](#14-future-enhancements-bonus-marks-ideas)
15. [What to Show in Project Viva](#15-what-to-show-in-project-viva)

---

## 1. Project Overview

**ChatBot Search Product** is a full-stack e-commerce web application that lets users browse, search, and shop products like on Myntra — but with one big difference: an **AI-powered chatbot** that lets users search products using plain English (or Hindi/Hinglish) instead of clicking through filters.

**Example user prompt:**
> "I want to buy a Jockey T-shirt, color should be black, and price less than ₹1200"

The AI chatbot understands this prompt, extracts the filters automatically (brand: Jockey, category: T-shirt, color: black, max_price: 1200), queries the database, and returns matching products instantly.

This combines three skill areas:
- **Full-stack web development** (React + Node.js + MongoDB)
- **AI/ML engineering** (open-source LLM running locally)
- **Microservices architecture** (separate AI service)

---

## 2. Why This Project Stands Out

Most final-year e-commerce projects are basic CRUD apps. This one is different because:

1. **Real AI, not fake AI** — Uses an actual open-source LLM (Llama 3.2 / Phi-3) running locally on CPU. No paid API keys, no cloud dependency.
2. **Industry-grade architecture** — Two backend services (Node.js + Python FastAPI) that talk to each other, mimicking real-world microservices.
3. **Practical AI use-case** — Doesn't try to make the LLM "do everything." Uses the LLM for what it's good at (understanding language) and the database for what it's good at (fast structured search).
4. **Complete user lifecycle** — Signup → Login → Browse → Search with AI → Add to Cart → View Cart → Update Profile → Logout.

---

## 3. Features

### 👤 User Features
- ✅ Sign up with Name, Email, Mobile, Gender, Password
- ✅ Login / Logout (JWT-based authentication)
- ✅ Browse products in a Myntra-style grid (image, name, price)
- ✅ Click any product to view full details on a separate page
- ✅ Add products to cart
- ✅ View cart with all selected products and total price
- ✅ Edit profile (change email, mobile, password — but **NOT** name, as per requirement)
- ✅ AI chatbot floating button — "Search with AI Agent"

### 🤖 AI ChatBot Features
- ✅ Natural language product search
- ✅ Understands brand, category, color, price filters
- ✅ Runs locally on CPU (no internet required after setup)
- ✅ Uses open-source LLM (Llama 3.2 3B / Phi-3 Mini via Ollama)
- ✅ Returns clickable product cards inside the chat

### 🔒 Security & Backend Features
- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens for session management
- ✅ Protected routes (only logged-in users can access cart, profile)
- ✅ Input validation and error handling
- ✅ MongoDB with proper schema design

---

## 4. Tech Stack

| Layer | Technology | Why This Choice |
|---|---|---|
| **Frontend** | React.js + Vite | Fastest modern frontend setup |
| **Styling** | Tailwind CSS | Easiest way to make a Myntra-like UI |
| **State Management** | React Context API | Sufficient for this project; no Redux complexity needed |
| **Routing** | React Router v6 | Standard for multi-page React apps |
| **Backend (Main)** | Node.js + Express.js | Industry standard for REST APIs |
| **AI Microservice** | Python + FastAPI | Python is mandatory for LLM; FastAPI is fast and clean |
| **Database** | MongoDB (with Mongoose) | Flexible schema, great for product catalogs |
| **Authentication** | JWT + bcrypt | Standard secure auth |
| **AI Model Runtime** | Ollama | Easiest way to run open-source LLMs locally |
| **LLM Model** | Llama 3.2 3B (or Phi-3 Mini) | Small enough for CPU, smart enough for filter extraction |
| **Inter-service comm** | HTTP (REST) | Simple and reliable |

### 💻 Hardware Requirements
- **Minimum:** 8 GB RAM, any modern CPU (i5 or Ryzen 5+), 10 GB free disk
- **Recommended:** 16 GB RAM (LLM responses will be faster)
- **No GPU required** — that's the whole point of using a small open-source model

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                           │
│                    (React Frontend on :3000)                     │
│                                                                  │
│   [Home] [Login] [Products] [Cart] [Profile] [💬 AI ChatBot]    │
└──────────────┬──────────────────────────────────┬───────────────┘
               │                                  │
               │ Regular API calls                │ AI search prompts
               │ (login, products, cart)          │ (chat messages)
               │                                  │
               ▼                                  ▼
┌──────────────────────────┐         ┌────────────────────────────┐
│   Node.js + Express      │         │   Python + FastAPI         │
│   Main Backend (:5000)   │◄───────►│   AI Microservice (:8000)  │
│                          │  HTTP   │                            │
│  • Auth (signup/login)   │         │  • Receives user prompt    │
│  • Product CRUD          │         │  • Calls Ollama LLM        │
│  • Cart management       │         │  • Extracts JSON filters   │
│  • User profile          │         │  • Sends filters back      │
└────────┬─────────────────┘         └──────────┬─────────────────┘
         │                                      │
         │                                      │ Local LLM call
         ▼                                      ▼
┌──────────────────────────┐         ┌────────────────────────────┐
│      MongoDB             │         │    Ollama Runtime          │
│      Database            │         │    (running locally)       │
│                          │         │                            │
│  • users collection      │         │  Model: llama3.2:3b        │
│  • products collection   │         │  or phi3:mini              │
│  • carts collection      │         │                            │
└──────────────────────────┘         └────────────────────────────┘
```

**Key Idea:** The frontend never talks to the LLM directly. All AI requests go through the Python service, which talks to Ollama. The Node.js service handles everything else and queries MongoDB directly.

---

## 6. End-to-End Workflow

Let me walk through what happens when a user does each action:

### 🔐 Workflow 1: User Signup
1. User fills signup form on React frontend (`Signup.jsx`)
2. Frontend sends `POST /api/auth/signup` to Node.js backend with name, email, mobile, gender, password
3. Backend validates input, hashes password with bcrypt, generates a unique user ID
4. Backend saves user document in MongoDB `users` collection
5. Backend returns success + JWT token
6. Frontend stores JWT in localStorage and redirects to home page

### 🛒 Workflow 2: Browsing Products
1. User opens home page → `Home.jsx` mounts
2. React makes `GET /api/products` call
3. Node.js fetches all products from MongoDB
4. Returns list with image URL, name, price for each
5. Frontend displays them in a grid (Myntra-style cards)
6. User clicks a product → routes to `/product/:id`
7. `ProductDetails.jsx` fetches `GET /api/products/:id` for full info

### ➕ Workflow 3: Add to Cart
1. User clicks "Add to Cart" on product page
2. Frontend sends `POST /api/cart/add` with `{userId, productId, quantity}` and JWT in header
3. Backend verifies JWT (auth middleware)
4. Backend updates the user's cart document in MongoDB
5. Returns updated cart
6. Cart icon in navbar shows updated count

### 🤖 Workflow 4: AI ChatBot Search (THE COOL PART)
This is the showpiece. Here's the full flow:

```
User types in chat:
"I want a jockey t-shirt black under 1200"
                │
                ▼
React ChatBot component sends:
POST http://localhost:5000/api/chatbot/search
Body: { "prompt": "I want a jockey t-shirt black under 1200" }
                │
                ▼
Node.js backend forwards to Python service:
POST http://localhost:8000/extract-filters
Body: { "prompt": "I want a jockey t-shirt black under 1200" }
                │
                ▼
Python FastAPI calls Ollama LLM with system prompt:
"Extract product filters from this user query as JSON.
 Return only JSON with keys: brand, category, color, max_price, min_price.
 User query: <prompt>"
                │
                ▼
LLM returns:
{
  "brand": "Jockey",
  "category": "T-shirt",
  "color": "black",
  "max_price": 1200,
  "min_price": null
}
                │
                ▼
Python service returns this JSON to Node.js
                │
                ▼
Node.js builds MongoDB query:
{
  brand: /jockey/i,
  category: /t-shirt/i,
  color: /black/i,
  price: { $lte: 1200 }
}
                │
                ▼
MongoDB returns matching products
                │
                ▼
Node.js sends product list back to React
                │
                ▼
ChatBot displays products as clickable cards inside chat:
"I found 5 Jockey black t-shirts under ₹1200 for you 👇"
[Product Card] [Product Card] [Product Card]...
```

### 👥 Workflow 5: Update Profile
1. User goes to profile page
2. Sees fields — Name (read-only/grayed out), Email, Mobile, Password (editable)
3. User changes email, hits Save
4. Frontend sends `PUT /api/users/profile` with new data + JWT
5. Backend validates, updates MongoDB, **explicitly ignores any name change attempt**
6. Returns updated profile

---

## 7. How the AI ChatBot Works (The Most Important Part)

This is what your project examiner will ask about. Understand this deeply.

### The Two-Stage Pipeline

**❌ Wrong approach (what beginners try):**
> Send the entire product database to the LLM and ask it to pick matching products.
> *Problems:* Very slow, hallucinates products that don't exist, doesn't scale.

**✅ Right approach (what we're building):**
> Use the LLM ONLY to convert messy human language into clean structured filters.
> Then use a normal database query to find matching products.

### Stage 1: Filter Extraction (the AI part)

We give the LLM a carefully designed system prompt:

```
You are a shopping assistant. Extract structured filters from the user's
product query. Always respond with ONLY valid JSON, no other text.

The JSON must have these keys (use null if not mentioned):
- brand: string or null
- category: string or null  (e.g. "T-shirt", "Jeans", "Shoes")
- color: string or null
- min_price: number or null
- max_price: number or null
- size: string or null

User query: "I want a jockey t-shirt black under 1200"
```

The LLM returns clean JSON. This is reliable because LLMs are excellent at structured output, especially when given clear examples.

### Stage 2: Database Search (the engineering part)

The Python service sends the JSON back to Node.js. Node.js builds a MongoDB query like this:

```javascript
const query = {};
if (filters.brand) query.brand = new RegExp(filters.brand, 'i');
if (filters.category) query.category = new RegExp(filters.category, 'i');
if (filters.color) query.color = new RegExp(filters.color, 'i');
if (filters.max_price) query.price = { ...query.price, $lte: filters.max_price };
if (filters.min_price) query.price = { ...query.price, $gte: filters.min_price };

const products = await Product.find(query).limit(10);
```

Done. Fast, accurate, and works perfectly on CPU.

### Why Llama 3.2 3B / Phi-3 Mini?

These models are **small enough to run on CPU** (3-4 GB RAM each) but **smart enough to extract structured filters reliably**. They're free, open-source, and have no API costs. You install them via Ollama with one command.

---

## 8. Project Directory Structure

```
chatbot-search-product/
│
├── README.md                       # This file
├── .gitignore
├── docker-compose.yml              # (Optional) run all services together
│
├── frontend/                       # React + Vite + Tailwind
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/
│   │   │   └── images/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── ChatBot.jsx         # Floating chat widget
│   │   │   ├── ChatMessage.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Loader.jsx
│   │   ├── pages/                  # Full pages
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Cart.jsx
│   │   │   └── Profile.jsx
│   │   ├── context/                # Global state
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── services/               # API calls
│   │   │   ├── api.js              # Axios instance
│   │   │   ├── authService.js
│   │   │   ├── productService.js
│   │   │   ├── cartService.js
│   │   │   └── chatbotService.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css               # Tailwind imports
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── .env                        # VITE_API_URL=http://localhost:5000
│
├── backend/                        # Node.js + Express (main API)
│   ├── config/
│   │   ├── db.js                   # MongoDB connection
│   │   └── env.js                  # Loads env variables
│   ├── models/                     # Mongoose schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Cart.js
│   ├── controllers/                # Business logic
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── cart.controller.js
│   │   ├── user.controller.js
│   │   └── chatbot.controller.js   # Talks to Python AI service
│   ├── routes/                     # API endpoints
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── cart.routes.js
│   │   ├── user.routes.js
│   │   └── chatbot.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js      # JWT verification
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── validators.js
│   ├── seed/
│   │   ├── products.json           # 50-100 sample products
│   │   └── seedDB.js               # Script to load sample data
│   ├── server.js                   # Entry point
│   ├── package.json
│   └── .env                        # MONGO_URI, JWT_SECRET, AI_SERVICE_URL
│
├── ai-service/                     # Python + FastAPI (AI microservice)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app entry
│   │   ├── llm_handler.py          # Ollama integration
│   │   ├── prompt_templates.py     # System prompts for LLM
│   │   ├── schemas.py              # Pydantic models
│   │   └── config.py
│   ├── tests/
│   │   └── test_extraction.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env                        # OLLAMA_HOST, MODEL_NAME
│
└── docs/                           # Documentation for viva
    ├── architecture-diagram.png
    ├── database-schema.md
    ├── api-endpoints.md
    └── setup-guide.md
```

---

## 9. Folder-by-Folder Explanation

### `frontend/`
The React app users see in their browser. Vite is the build tool (faster than Create React App). Tailwind CSS lets you build a Myntra-like UI in hours, not weeks.

- **`components/`** — Small reusable pieces (Navbar, ProductCard, ChatBot widget). Each component does one thing.
- **`pages/`** — Full-screen views that get routed to (Home, Login, Cart, etc.).
- **`context/`** — Stores user login state and cart state globally so any component can access them.
- **`services/`** — All HTTP calls to the backend live here. Components don't make API calls directly; they call functions in services. This keeps code clean.

### `backend/` (Node.js)
The "brain" of the e-commerce side. Handles everything except AI.

- **`models/`** — Mongoose schemas that define what data looks like in MongoDB.
- **`routes/`** — Defines URLs (e.g., `/api/auth/signup`) and which controller handles them.
- **`controllers/`** — Actual logic that runs when an endpoint is hit. Routes are dumb; controllers are smart.
- **`middleware/`** — Functions that run BEFORE controllers. The auth middleware checks if the user has a valid JWT before letting them access protected routes like `/cart`.
- **`seed/`** — Script + sample data to populate your database with fake products so your site isn't empty.

### `ai-service/` (Python)
A small dedicated service that ONLY does one thing: take a user prompt and return structured filter JSON.

- **`main.py`** — FastAPI app with one endpoint: `POST /extract-filters`.
- **`llm_handler.py`** — Code that calls Ollama and parses the response.
- **`prompt_templates.py`** — The carefully crafted system prompts you give the LLM. Tweaking these = better results.
- **`schemas.py`** — Pydantic models for input/output validation.

### Why a separate Python service?
You could put the AI in Node.js using `ollama-js`, but separating it has big advantages:
- Python has the best AI/ML libraries — use them when needed
- You can swap the LLM later without touching Node.js code
- Demonstrates microservice architecture knowledge in your viva
- Each service can be scaled/restarted independently

---

## 10. Database Schema

### `users` collection
```json
{
  "_id": "ObjectId (auto-generated unique ID)",
  "name": "Rahul Sharma",
  "email": "rahul@gmail.com",
  "mobile": "9876543210",
  "gender": "Male",
  "password": "$2b$10$... (bcrypt hashed)",
  "createdAt": "2026-04-26T10:00:00Z",
  "updatedAt": "2026-04-26T10:00:00Z"
}
```

### `products` collection
```json
{
  "_id": "ObjectId",
  "name": "Jockey Cotton Black T-Shirt",
  "brand": "Jockey",
  "category": "T-shirt",
  "color": "Black",
  "size": ["S", "M", "L", "XL"],
  "price": 999,
  "originalPrice": 1499,
  "discount": 33,
  "image": "https://example.com/img/jockey-black.jpg",
  "description": "100% cotton, regular fit...",
  "stock": 50,
  "rating": 4.3
}
```

### `carts` collection
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (references users._id)",
  "items": [
    {
      "productId": "ObjectId (references products._id)",
      "quantity": 2,
      "addedAt": "2026-04-26T10:30:00Z"
    }
  ],
  "updatedAt": "2026-04-26T10:30:00Z"
}
```

---

## 11. API Endpoints

### Auth Routes (Node.js — port 5000)
| Method | Endpoint | Purpose | Auth Required |
|---|---|---|---|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/login` | Login, returns JWT | No |
| POST | `/api/auth/logout` | Logout (client clears token) | Yes |

### User Routes
| Method | Endpoint | Purpose | Auth Required |
|---|---|---|---|
| GET | `/api/users/profile` | Get current user info | Yes |
| PUT | `/api/users/profile` | Update email/mobile/password (NOT name) | Yes |

### Product Routes
| Method | Endpoint | Purpose | Auth Required |
|---|---|---|---|
| GET | `/api/products` | List all products | No |
| GET | `/api/products/:id` | Get single product details | No |

### Cart Routes
| Method | Endpoint | Purpose | Auth Required |
|---|---|---|---|
| GET | `/api/cart` | Get current user's cart | Yes |
| POST | `/api/cart/add` | Add product to cart | Yes |
| DELETE | `/api/cart/remove/:productId` | Remove item from cart | Yes |
| PUT | `/api/cart/update` | Update item quantity | Yes |

### ChatBot Routes
| Method | Endpoint | Purpose | Auth Required |
|---|---|---|---|
| POST | `/api/chatbot/search` | Send prompt, get matching products | Optional |

### AI Service (Python — port 8000)
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/extract-filters` | Take prompt, return JSON filters |
| GET | `/health` | Service health check |

---

## 12. Setup & Installation

### Prerequisites
- Node.js v18+ ([nodejs.org](https://nodejs.org))
- Python 3.10+ ([python.org](https://python.org))
- MongoDB v6+ ([mongodb.com](https://mongodb.com)) — or use MongoDB Atlas (free cloud tier)
- Ollama ([ollama.com](https://ollama.com))

### Step 1: Install Ollama and download the model
```bash
# After installing Ollama, pull the model
ollama pull llama3.2:3b
# OR a smaller alternative
ollama pull phi3:mini
```

### Step 2: Setup the AI Service (Python)
```bash
cd ai-service
python -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Step 3: Setup the Backend (Node.js)
```bash
cd backend
npm install
# Create .env file with MONGO_URI, JWT_SECRET, AI_SERVICE_URL
npm run seed         # Load sample products
npm run dev          # Starts on port 5000
```

### Step 4: Setup the Frontend (React)
```bash
cd frontend
npm install
npm run dev          # Starts on port 3000
```

### Step 5: Open browser
Go to `http://localhost:3000` and start shopping!

---

## 13. Development Roadmap (Suggested Build Order)

Build in this order. Don't skip steps. Each one builds on the previous.

**Week 1-2: Backend Foundation**
1. Setup MongoDB and connect Node.js
2. Build User model + signup/login + JWT
3. Build Product model + seed sample products
4. Build product list/detail endpoints

**Week 3: Frontend Foundation**
5. Setup React + Tailwind + routing
6. Build Login/Signup pages connected to backend
7. Build Home page with product grid
8. Build Product detail page

**Week 4: Cart Feature**
9. Build Cart model + endpoints
10. Build Cart page on frontend
11. Add "Add to Cart" buttons everywhere

**Week 5: Profile**
12. Build profile page with edit functionality
13. Make sure name field is read-only

**Week 6-7: AI ChatBot (the hard part)**
14. Install Ollama, pull model, test it manually
15. Build Python FastAPI service with `/extract-filters`
16. Test extraction with various prompts using Postman
17. Build chatbot endpoint in Node.js that calls Python service
18. Build ChatBot React component (floating widget)
19. Connect everything end-to-end

**Week 8: Polish & Documentation**
20. UI polish, error handling, loading states
21. Write final report, prepare slides
22. Record demo video

---

## 14. Future Enhancements (Bonus Marks Ideas)

If you finish early or want to impress more, add ANY of these:

- 🖼️ **Image-based search** — Upload an image, find similar products (CLIP embeddings)
- 🎤 **Voice search** — Web Speech API → ChatBot
- 💳 **Order placement** — Mock checkout flow
- 📊 **Admin dashboard** — Add/edit products, view orders
- 🌟 **Product reviews & ratings**
- 🎯 **Personalized recommendations** — based on cart history
- 🌐 **Multilingual support** — Chat in Hindi/Hinglish
- 📦 **Order tracking simulator**
- 🔔 **Real-time notifications** (WebSockets)

---

## 15. What to Show in Project Viva

When defending this project, focus on these talking points:

1. **"I used a microservices architecture"** — explain why Python for AI, Node for the rest
2. **"I run the LLM locally on CPU"** — no paid APIs, fully offline-capable
3. **"My AI uses a two-stage pipeline"** — LLM extracts filters, database does the search
4. **"I chose Llama 3.2 3B because..."** — small enough for CPU, smart enough for JSON extraction
5. **Live demo** — type a messy prompt and watch products appear in seconds
6. **Show the network tab** — examiner sees the actual API calls happening
7. **Show MongoDB Compass** — examiner sees real data being stored

**Common questions to prepare for:**
- "Why didn't you use ChatGPT API?" → Cost, dependency, no learning happens
- "What if user prompt is unclear?" → LLM returns null filters, we ask for clarification
- "How does it scale?" → Each service can be scaled independently; LLM can be moved to GPU
- "Why MongoDB and not MySQL?" → Product catalogs have varying attributes; flexible schema fits
- "What happens if AI service is down?" → Frontend gracefully falls back to traditional search

---

## 📝 License

This is an academic project. Free to use and learn from.

## 👨‍💻 Author

Built as a final-year major project — combining full-stack development, microservices, and applied AI.

---

**Now go build it. 🚀**
