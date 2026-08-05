import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Entry, EmotionScore

# Track unique entries globally
used_entries = set()

events = [
    "worked on my database assignment",
    "prepared for my programming exam",
    "met my friends after class",
    "spent time debugging my project",
    "worked on my mini project",
    "attended several lectures today",
    "worked on my presentation slides",
    "studied for my algorithms exam",
    "had a discussion with classmates",
    "revised my notes for tomorrow"
]

feelings = [
    "I felt really motivated",
    "I felt a bit overwhelmed",
    "I felt proud of my progress",
    "I felt quite tired afterwards",
    "I felt frustrated at first",
    "I felt relieved after finishing",
    "I felt anxious about deadlines",
    "I felt happy spending time with friends",
    "I felt calm after completing everything",
    "I felt stressed about the workload"
]

reflections = [
    "It reminded me that I should manage my time better.",
    "It made the day feel productive.",
    "I realized how important practice is.",
    "I learned something useful today.",
    "I hope tomorrow will be more productive.",
    "It made me think about my goals.",
    "It felt like a small achievement.",
    "I should probably take breaks more often.",
    "It helped me understand the topic better.",
    "It was a meaningful experience."
]


def random_date():
    return datetime.utcnow() - timedelta(days=random.randint(0, 365))


def generate_unique_entry():
    while True:
        text = (
            f"Today I {random.choice(events)}. "
            f"{random.choice(feelings)}. "
            f"{random.choice(reflections)}"
        )

        if text not in used_entries:
            used_entries.add(text)
            return text


def generate_emotion_scores():

    anger = random.uniform(0, 1)
    joy = random.uniform(0, 1)
    sadness = random.uniform(0, 1)
    fear = random.uniform(0, 1)
    surprise = random.uniform(0, 1)

    emotions = {
        "anger": anger,
        "joy": joy,
        "sadness": sadness,
        "fear": fear,
        "surprise": surprise
    }

    dominant_emotion = max(emotions, key=emotions.get)
    confidence = emotions[dominant_emotion]

    return anger, joy, sadness, fear, surprise, dominant_emotion, confidence


def seed_user_entries(user_id, count=80):

    db: Session = SessionLocal()

    for _ in range(count):

        entry_text = generate_unique_entry()
        created_at = random_date()

        entry = Entry(
            user_id=user_id,
            entry_text=entry_text,
            entry_type="text",
            created_at=created_at
        )

        db.add(entry)
        db.flush()  # get entry_id

        anger, joy, sadness, fear, surprise, dominant_emotion, confidence = generate_emotion_scores()

        emotion_score = EmotionScore(
            entry_id=entry.entry_id,
            anger=anger,
            joy=joy,
            sadness=sadness,
            fear=fear,
            surprise=surprise,
            dominant_emotion=dominant_emotion,
            confidence=confidence,
            created_at=created_at
        )

        db.add(emotion_score)

    db.commit()
    db.close()


if __name__ == "__main__":

    seed_user_entries(3)
    seed_user_entries(4)
    seed_user_entries(5)

    print("Unique entries and emotion scores generated successfully!")