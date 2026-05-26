import firebase_admin

from firebase_admin import (
    credentials,
    firestore
)


# ==========================================
# PREVENT MULTIPLE INITIALIZATIONS
# ==========================================

if not firebase_admin._apps:

    cred = credentials.Certificate(
        "serviceAccountKey.json"
    )

    firebase_admin.initialize_app(cred)


db = firestore.client()


# ==========================================
# SAVE USER ATTEMPT
# ==========================================

def save_attempt(data):

    db.collection(
        "attempts"
    ).add(data)


# ==========================================
# SAVE ANALYTICS
# ==========================================

def save_analytics(data):

    return True


# ==========================================
# GET USER ATTEMPTS
# ==========================================

def get_user_attempts(user_email):

    docs = db.collection(
        "attempts"
    ).where(
        "email",
        "==",
        user_email
    ).stream()

    attempts = []

    for doc in docs:

        attempts.append(
            doc.to_dict()
        )

    return attempts


# ==========================================
# GET USER ANALYTICS
# ==========================================

def get_user_analytics(user_email):

    docs = db.collection(
        "attempts"
    ).where(
        "email",
        "==",
        user_email
    ).stream()

    attempts = []

    for doc in docs:

        attempts.append(
            doc.to_dict()
        )

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