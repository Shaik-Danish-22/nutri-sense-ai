# NutriWise AI 🥗

> **A Context-Aware Food Decision Engine powered by Google Gemini**

NutriWise AI is not a food tracker. It is a **decision engine** that answers one critical question every time you eat:

> _"What is the BEST choice for me — right now?"_

---

## 🧠 The Problem

People know *what* is healthy. They fail at *making the right choice in the moment*, because generic advice ignores:

- Their specific health goals
- Their medical conditions  
- Their habitual patterns (e.g., overeating at night)
- The time of day they're eating

---

## 💡 The Solution

NutriWise AI combines your **personal profile** + **real-time context** with **Google Gemini's reasoning** to give you a practical, personalized food decision — not a nutrition label.

---

## 🏗️ Architecture

```
Browser (React + Vite)
        │
        │  POST /analyze
        ▼
FastAPI Backend (Python)
        │
        │  Google Gemini API (gemini-1.5-flash)
        ▼
  Structured JSON Decision
```

### Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React (Vite, plain JS), plain CSS, Framer Motion |
| Backend   | Python FastAPI                      |
| AI        | Google Gemini API (direct calls)    |
| Deploy    | Google Cloud Run                    |

---

## ⚙️ How It Works

1. **User provides**: goal, health condition, eating habit, food name
2. **Backend detects**: current time of day (morning / afternoon / evening)
3. **Behavior engine**: applies contextual rules before calling Gemini:
   - Evening + overeats at night → portion/lighter alternative emphasis
   - Diabetes → low-sugar prioritization
   - Weight loss → calorie-reduction lens
4. **Gemini returns** a strict JSON decision with 7 fields
5. **Frontend renders** the decision with score ring, badge, and suggestions

---

## 🚀 Running Locally

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Set your Gemini API key
copy .env.example .env
# Edit .env and add: GEMINI_API_KEY=your_key_here

# Start server
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
API docs: http://localhost:8000/docs

---

### 2. Frontend

```bash
cd frontend

# Install
npm install

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:5173

---

## 📡 API Reference

### `POST /analyze`

**Request Body:**

```json
{
  "food": "2 slices of pepperoni pizza",
  "goal": "weight loss",
  "health_condition": "none",
  "habit": "I overeat at night"
}
```

**Response:**

```json
{
  "food_analysis": "Pepperoni pizza is high in refined carbohydrates, saturated fat, and sodium...",
  "health_score": 3,
  "decision": "replace",
  "better_alternative": "Cauliflower crust pizza with vegetables and minimal cheese",
  "habit_suggestion": "Serve yourself one slice max before sitting down — avoid eating from the box",
  "reasoning": "It is evening and you tend to overeat at night. Pizza's caloric density makes it a high-risk choice for your weight loss goal right now.",
  "confidence": "high",
  "time_of_day": "evening"
}
```

**Valid values:**
- `goal`: `weight loss` | `muscle gain` | `maintenance`
- `health_condition`: `none` | `diabetes`
- `decision` (output): `eat` | `reduce` | `replace`
- `confidence` (output): `low` | `medium` | `high`
- `health_score` (output): 1–10

---

## 🧪 Test Examples

### Test 1: Weight Loss + Pizza (Evening)

```json
{
  "food": "2 slices of pepperoni pizza",
  "goal": "weight loss",
  "health_condition": "none",
  "habit": "I overeat at night"
}
```
**Expected**: `decision: reduce` or `replace`, score ≤ 4, habit suggestion about portion control.

---

### Test 2: Diabetic + Dessert

```json
{
  "food": "a large slice of chocolate cake with frosting",
  "goal": "maintenance",
  "health_condition": "diabetes",
  "habit": "I eat sweets after dinner"
}
```
**Expected**: `decision: replace`, score ≤ 3, alternative is a low-sugar option, reasoning flags glucose spike risk.

---

## ☁️ Google Cloud Run Deployment

### Prerequisites
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed
- Project with billing enabled
- Cloud Run API enabled

### Deploy Backend

```bash
cd backend

# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Build & push container
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/nutriwise-backend

# Deploy to Cloud Run
gcloud run deploy nutriwise-backend \
  --image gcr.io/YOUR_PROJECT_ID/nutriwise-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key_here
```

### Deploy Frontend (Firebase Hosting)

```bash
cd frontend
npm run build

npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

Update `VITE_API_URL` in `.env` to your Cloud Run service URL before building.

---

## 🔐 Security Notes

- **Never commit `.env`** — it is already in `.gitignore`
- API key is loaded via `python-dotenv` on the backend
- Input validation is enforced via Pydantic validators
- CORS is open for local dev — restrict `allow_origins` in production

---

## 📐 Assumptions

1. Food input is free-text (user describes what they're about to eat)
2. Time of day is auto-detected from server time — no timezone adjustment needed for MVP
3. Only two health conditions for MVP; extensible via validator
4. Gemini model used: `gemini-1.5-flash` (fast, cost-efficient)

---

## 🔭 Future Improvements

| Feature | Description |
|---------|-------------|
| Image input | Send food photo to Gemini Vision for recognition |
| Meal history | Track past decisions and show trends |
| Timezone-aware context | Use client timezone for accurate time-of-day |
| Nutrient breakdown | Add macronutrient breakdown table |
| Progressive profile | Learn from repeated choices to refine suggestions |
| Voice input | Speak your food for hands-free analysis |
| More health conditions | Hypertension, PCOS, kidney disease, etc. |

---

## 📁 Project Structure

```
nutriwise-ai/
├── backend/
│   ├── main.py            # FastAPI app + Gemini AI engine
│   ├── requirements.txt   # Python dependencies
│   ├── Dockerfile         # Cloud Run container
│   └── .env.example       # Environment template
│
└── frontend/
    ├── src/
    │   ├── App.jsx            # Main app + form logic
    │   ├── api.js             # Axios API client
    │   ├── utils.js           # Helpers (time, score, emoji)
    │   ├── index.css          # Full design system
    │   ├── main.jsx           # React entry point
    │   └── components/
    │       ├── ResultCard.jsx     # Decision result display
    │       └── AnalyzeButton.jsx  # Animated submit button
    ├── index.html
    └── .env                   # VITE_API_URL config
```

---

## 📄 License

MIT — built for Google Hackathon 2026.
