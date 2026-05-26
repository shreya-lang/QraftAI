from fastapi import (
    FastAPI,
    UploadFile,
    File
)

from fastapi.middleware.cors import CORSMiddleware

from app.groq_service import (
    generate_assessment,
    evaluate_answer,
    detect_ai_generated,
    generate_recommendation
)

from app.adaptive_engine import (
    next_difficulty
)

from app.firebase_service import (
    save_attempt,
    save_analytics,
    get_user_attempts,
    get_user_analytics
)

from app.ocr_service import (
    extract_text
)

import json
import shutil
import os


app = FastAPI()


# ==========================================
# CORS
# ==========================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# ==========================================
# ROOT
# ==========================================

@app.get("/")
def root():

    return {
        "message": "Adaptive AI Learning API Running"
    }


# ==========================================
# GENERATE 5 QUESTIONS
# ==========================================

@app.post("/generate-assessment")
def generate(data: dict):

    topic = data["topic"]

    difficulty = data["difficulty"]

    occasion = data["occasion"]

    result = generate_assessment(
        topic,
        difficulty,
        occasion
    )

    cleaned = result.strip()

    if cleaned.startswith("```json"):

        cleaned = cleaned.replace(
            "```json",
            ""
        ).replace(
            "```",
            ""
        ).strip()

    elif cleaned.startswith("```"):

        cleaned = cleaned.replace(
            "```",
            ""
        ).strip()

    return json.loads(cleaned)


# ==========================================
# EVALUATE ANSWER
# ==========================================

@app.post("/evaluate")
def evaluate(data: dict):

    question = data["question"]

    correct_answer = data["correct_answer"]

    user_answer = data["user_answer"]

    current_difficulty = data["difficulty"]

    email = data["email"]


    # ------------------------------
    # EVALUATE ANSWER
    # ------------------------------

    result = evaluate_answer(
        question,
        correct_answer,
        user_answer
    )

    cleaned = result.strip()

    if cleaned.startswith("```json"):

        cleaned = cleaned.replace(
            "```json",
            ""
        ).replace(
            "```",
            ""
        ).strip()

    elif cleaned.startswith("```"):

        cleaned = cleaned.replace(
            "```",
            ""
        ).strip()

    evaluation = json.loads(cleaned)


    # ------------------------------
    # AI DETECTION
    # ------------------------------

    ai_check = detect_ai_generated(
        user_answer
    )

    cleaned_ai = ai_check.strip()

    if cleaned_ai.startswith("```json"):

        cleaned_ai = cleaned_ai.replace(
            "```json",
            ""
        ).replace(
            "```",
            ""
        ).strip()

    elif cleaned_ai.startswith("```"):

        cleaned_ai = cleaned_ai.replace(
            "```",
            ""
        ).strip()

    ai_result = json.loads(cleaned_ai)

    evaluation["ai_detection"] = ai_result


    # ------------------------------
    # NEXT DIFFICULTY
    # ------------------------------

    next_level = next_difficulty(
        evaluation["score"],
        current_difficulty
    )

    evaluation["next_difficulty"] = next_level


    # ------------------------------
    # RECOMMENDATION
    # ------------------------------

    recommendation = generate_recommendation(

        evaluation["understanding"],

        evaluation["score"]
    )

    cleaned_rec = recommendation.strip()

    if cleaned_rec.startswith("```json"):

        cleaned_rec = cleaned_rec.replace(
            "```json",
            ""
        ).replace(
            "```",
            ""
        ).strip()

    elif cleaned_rec.startswith("```"):

        cleaned_rec = cleaned_rec.replace(
            "```",
            ""
        ).strip()

    recommendation_data = json.loads(
        cleaned_rec
    )

    evaluation["recommendation"] = (
        recommendation_data
    )


    # ------------------------------
    # SAVE TO FIREBASE
    # ------------------------------

    save_attempt({

        "email": email,

        "question": question,

        "correct_answer": correct_answer,

        "user_answer": user_answer,

        "score": evaluation["score"],

        "difficulty": current_difficulty,

        "next_difficulty": next_level,

        "understanding":
            evaluation["understanding"],

        "ai_probability":
            ai_result["ai_probability"],

        "ai_verdict":
            ai_result["verdict"]
    })


    save_analytics({

        "email": email,

        "score": evaluation["score"],

        "difficulty": current_difficulty
    })


    return evaluation


# ==========================================
# OCR IMAGE ANSWER
# ==========================================

@app.post("/upload-answer-image")
async def upload_answer_image(

    file: UploadFile = File(...)
):

    os.makedirs(
        "uploads",
        exist_ok=True
    )

    path = f"uploads/{file.filename}"

    with open(path, "wb") as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    text = extract_text(path)

    return {
        "extracted_text": text
    }


# ==========================================
# USER ATTEMPTS
# ==========================================

@app.get("/attempts/{email}")
def attempts(email: str):

    return get_user_attempts(email)


# ==========================================
# ANALYTICS
# ==========================================

@app.get("/analytics/{email}")
def analytics(email: str):

    return get_user_analytics(email)