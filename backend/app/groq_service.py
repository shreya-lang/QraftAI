from groq import Groq
import os
from dotenv import load_dotenv
import time
import hashlib
import logging

load_dotenv()

logger = logging.getLogger(__name__)

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)
GROQ_MODEL = "openai/gpt-oss-120b"
# Simple in-memory cache to reduce repeated slow model calls
# Keyed by prompt hash, stores (timestamp, response_text)
_CACHE = {}
_CACHE_TTL = 60 * 10  # 10 minutes


# ==========================================
# GENERATE 5 QUESTIONS
# ==========================================

def generate_assessment(
    topic,
    difficulty,
    occasion
):

    prompt = f"""
    Generate 5 high quality questions for:

    Topic: {topic}
    Difficulty: {difficulty}
    Occasion: {occasion}

    Rules:
    - Questions must be conceptual and practical
    - Avoid repeated patterns
    - Include hints
    - Include answers
    - Questions should feel like real exams/interviews/quizzes

    Return ONLY valid JSON in this format:

    {{
      "questions": [
        {{
          "question": "question text",
          "hint": "hint text",
          "answer": "correct answer"
        }}
      ]
    }}
    """

    # Use a cache to speed up repeated requests for the same prompt
    prompt_key = hashlib.sha256(prompt.encode("utf-8")).hexdigest()

    cached = _CACHE.get(prompt_key)

    if cached:
        ts, text = cached
        if time.time() - ts < _CACHE_TTL:
            return text
        else:
            # expired
            _CACHE.pop(prompt_key, None)

    try:
        response = client.chat.completions.create(

            model=GROQ_MODEL,

            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            temperature=0.8
        )

        content = response.choices[0].message.content

        # store in cache
        _CACHE[prompt_key] = (time.time(), content)

        return content

    except Exception as e:
        logger.exception("Error calling Groq generate_assessment: %s", e)
        # Fail gracefully with an informative JSON string so caller can handle
        fallback = '{"questions": []}'
        return fallback


# ==========================================
# EVALUATE ANSWER
# ==========================================

def evaluate_answer(
    question,
    correct_answer,
    user_answer
):

    prompt = f"""
    Evaluate the student's answer.

    Question:
    {question}

    Correct Answer:
    {correct_answer}

    Student Answer:
    {user_answer}

    Return ONLY valid JSON:

    {{
      "score": 0-10,
      "feedback": "detailed feedback",
      "understanding": "Poor/Average/Good/Excellent",
      "improvement": "how student can improve"
    }}
    """

    response = client.chat.completions.create(

        model=GROQ_MODEL,

        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],

        temperature=0.3
    )

    return response.choices[0].message.content


# ==========================================
# AI GENERATED ANSWER DETECTION
# ==========================================

def detect_ai_generated(answer):

    prompt = f"""
    Analyze the following student answer.

    Detect whether it appears AI-generated or genuinely written by a student.

    Consider:
    - grammar perfection
    - robotic phrasing
    - overly generic explanation
    - unnatural coherence
    - lack of personal reasoning

    Return ONLY valid JSON:

    {{
      "ai_probability": "0-100%",
      "verdict": "Human Written / Possibly AI Assisted / Likely AI Generated",
      "reason": "short explanation"
    }}

    Answer:
    {answer}
    """

    response = client.chat.completions.create(

        model=GROQ_MODEL,

        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],

        temperature=0.2
    )

    return response.choices[0].message.content


# ==========================================
# PERFORMANCE RECOMMENDATION
# ==========================================

def generate_recommendation(
    weak_area,
    score
):

    prompt = f"""
    A student is weak in:

    {weak_area}

    Current score:
    {score}/10

    Generate:
    - personalized recommendation
    - study strategy
    - practice strategy
    - motivational guidance

    Return ONLY valid JSON:

    {{
      "recommendation": "text",
      "study_plan": "text",
      "practice_tip": "text",
      "motivation": "text"
    }}
    """

    response = client.chat.completions.create(

        model=GROQ_MODEL,

        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],

        temperature=0.5
    )

    return response.choices[0].message.content