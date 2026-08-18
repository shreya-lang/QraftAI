import logging
import os

import firebase_admin

from firebase_admin import (
    credentials,
    firestore
)


logger = logging.getLogger(__name__)


def normalize_email(email):
    return (email or "").strip().lower()


def _merge_user_attempts(docs):
    attempts = []
    seen_ids = set()

    for doc in docs:
        attempt = doc.to_dict()
        attempt_id = getattr(doc, "id", None)

        if attempt_id is not None and attempt_id in seen_ids:
            continue

        if attempt_id is not None:
            seen_ids.add(attempt_id)

        user_email = attempt.get("email") or attempt.get("user_email")
        normalized_user_email = normalize_email(user_email)
        if normalized_user_email:
            attempt["email"] = normalized_user_email
            attempt["user_email"] = normalized_user_email

        attempts.append(attempt)

    attempts.sort(
        key=lambda item: item.get("created_at") or item.get("timestamp") or 0
    )

    return attempts


# ==========================================
# PREVENT MULTIPLE INITIALIZATIONS
# ==========================================

CREDENTIAL_PATH = os.environ.get(
    "FIREBASE_CREDENTIAL_PATH",
    "serviceAccountKey.json"
)


db = None

if not firebase_admin._apps:

    if os.path.exists(CREDENTIAL_PATH):

        cred = credentials.Certificate(
            CREDENTIAL_PATH
        )

        firebase_admin.initialize_app(cred)

        db = firestore.client()

    else:

        logger.warning(
            "Firebase credentials not found at %s; Firebase features will be disabled.",
            CREDENTIAL_PATH
        )


# ==========================================
# SAVE USER ATTEMPT
# ==========================================


def save_attempt(data):

    if db is None:

        return None

    email_value = data.get("email") or data.get("user_email")

    if email_value:
        normalized = normalize_email(email_value)
        data["email"] = normalized
        data["user_email"] = normalized

    data.setdefault("created_at", __import__("datetime").datetime.utcnow().isoformat())

    db.collection(
        "attempts"
    ).add(data)


# ==========================================
# SAVE ANALYTICS
# ==========================================


def save_analytics(data):

    if db is None:

        return None

    if "email" in data:
        data["email"] = normalize_email(data["email"])

    db.collection(
        "analytics"
    ).add(data)

    return True


# ==========================================
# GET USER ATTEMPTS
# ==========================================


def get_user_attempts(user_email):

    normalized_email = normalize_email(user_email)

    if db is None:

        return []

    matched_attempts = []

    for field_name in ("email", "user_email"):
        docs = db.collection(
            "attempts"
        ).where(
            field_name,
            "==",
            normalized_email
        ).stream()
        matched_attempts.extend(docs)

    attempts = _merge_user_attempts(matched_attempts)

    return attempts


# ==========================================
# GET USER ANALYTICS
# ==========================================


def get_user_analytics(user_email):

    normalized_email = normalize_email(user_email)

    if db is None:

        return {

            "total_attempts": 0,

            "average_score": 0,

            "highest_score": 0,

            "latest_difficulty": "Easy"
        }

    matched_attempts = []

    for field_name in ("email", "user_email"):
        docs = db.collection(
            "attempts"
        ).where(
            field_name,
            "==",
            normalized_email
        ).stream()
        matched_attempts.extend(docs)

    attempts = _merge_user_attempts(matched_attempts)

    if len(attempts) == 0:

        return {

            "total_attempts": 0,

            "average_score": 0,

            "highest_score": 0,

            "latest_difficulty": "Easy"
        }

    scores = [

        item.get("score", 0)

        for item in attempts
    ]

    latest = attempts[-1]

    return {

        "total_attempts":
            len(attempts),

        "average_score":
            round(
                sum(scores) / len(scores),
                2
            ),

        "highest_score":
            max(scores),

        "latest_difficulty":
            latest.get(
                "next_difficulty",
                "Easy"
            )
    }