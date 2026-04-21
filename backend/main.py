import os
import json
import re
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY environment variable is not set.")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")

app = FastAPI(
    title="NutriWise AI",
    description="Context-Aware Food Decision Assistant",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_GOALS = {"weight loss", "muscle gain", "maintenance"}
VALID_CONDITIONS = {"none", "diabetes"}


def get_time_of_day() -> str:
    hour = datetime.now().hour
    if 5 <= hour < 12:
        return "morning"
    elif 12 <= hour < 17:
        return "afternoon"
    else:
        return "evening"


class AnalyzeRequest(BaseModel):
    food: str
    goal: str
    health_condition: str
    habit: str

    @validator("food")
    def food_not_empty(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Food field cannot be empty.")
        if len(v) > 300:
            raise ValueError("Food description too long (max 300 chars).")
        return v

    @validator("goal")
    def goal_valid(cls, v):
        v = v.strip().lower()
        if v not in VALID_GOALS:
            raise ValueError(f"Goal must be one of: {', '.join(VALID_GOALS)}")
        return v

    @validator("health_condition")
    def condition_valid(cls, v):
        v = v.strip().lower()
        if v not in VALID_CONDITIONS:
            raise ValueError(f"Health condition must be one of: {', '.join(VALID_CONDITIONS)}")
        return v

    @validator("habit")
    def habit_not_empty(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Habit field cannot be empty.")
        if len(v) > 200:
            raise ValueError("Habit description too long (max 200 chars).")
        return v


def build_behavior_hints(goal: str, health_condition: str, habit: str, time_of_day: str) -> str:
    hints = []
    if "overeats at night" in habit.lower() and time_of_day == "evening":
        hints.append(
            "CRITICAL: The user overeats at night and it is currently evening. "
            "You MUST suggest portion reduction or a lighter alternative. "
            "Make this a central part of your recommendation."
        )
    if health_condition == "diabetes":
        hints.append(
            "CRITICAL: The user is diabetic. Strictly prioritize low-sugar, "
            "low-glycemic-index recommendations. Flag any high-sugar content clearly."
        )
    if goal == "weight loss":
        hints.append(
            "IMPORTANT: The user's goal is weight loss. Encourage calorie-reduction "
            "strategies and favor nutrient-dense, lower-calorie options."
        )
    if goal == "muscle gain":
        hints.append(
            "IMPORTANT: The user's goal is muscle gain. Encourage protein-rich foods "
            "and adequate caloric intake to support muscle building."
        )
    return "\n".join(hints)


def build_prompt(food: str, goal: str, health_condition: str, habit: str, time_of_day: str) -> str:
    behavior_hints = build_behavior_hints(goal, health_condition, habit, time_of_day)

    return f"""You are NutriWise AI, an expert nutritionist and behavioral health coach.

User goal: {goal}
Health condition: {health_condition}
Habit: {habit}
Food: {food}
Time of day: {time_of_day}

{behavior_hints}

Analyze the food decision for this user RIGHT NOW and provide a practical, realistic, context-aware recommendation.

Return ONLY a valid JSON object with exactly these fields:
{{
  "food_analysis": "Brief nutritional summary of the food (2-3 sentences)",
  "health_score": <integer 1-10>,
  "decision": "<one of: eat, reduce, replace>",
  "better_alternative": "A specific, realistic food alternative if needed, or 'None needed' if eat",
  "habit_suggestion": "One specific, actionable habit improvement tip",
  "reasoning": "2-3 sentence explanation of why this decision was made for this user",
  "confidence": "<one of: low, medium, high>"
}}

Rules:
- health_score 1-3 = avoid, 4-6 = caution, 7-10 = good
- decision must be exactly: eat, reduce, or replace
- confidence must be exactly: low, medium, or high
- Do NOT include any text outside the JSON object
- Do NOT use markdown code fences
"""


@app.get("/")
async def root():
    return {"message": "NutriWise AI is running", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    time_of_day = get_time_of_day()

    prompt = build_prompt(
        food=request.food,
        goal=request.goal,
        health_condition=request.health_condition,
        habit=request.habit,
        time_of_day=time_of_day,
    )

    try:
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        # Strip markdown code fences if model adds them anyway
        raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
        raw_text = re.sub(r"\s*```$", "", raw_text)

        result = json.loads(raw_text)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=502,
            detail=f"AI returned invalid JSON: {str(e)}. Raw: {raw_text[:300]}",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI call failed: {str(e)}")

    # Validate required fields
    required = ["food_analysis", "health_score", "decision", "better_alternative",
                "habit_suggestion", "reasoning", "confidence"]
    for field in required:
        if field not in result:
            raise HTTPException(status_code=502, detail=f"AI response missing field: {field}")

    # Coerce types
    try:
        result["health_score"] = int(result["health_score"])
        result["health_score"] = max(1, min(10, result["health_score"]))
    except (ValueError, TypeError):
        result["health_score"] = 5

    if result["decision"] not in ("eat", "reduce", "replace"):
        result["decision"] = "reduce"

    if result["confidence"] not in ("low", "medium", "high"):
        result["confidence"] = "medium"

    result["time_of_day"] = time_of_day

    return result
