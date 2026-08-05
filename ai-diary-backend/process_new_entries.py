from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Entry, EmotionScore
from app.emotion import analyze_emotion

db: Session = SessionLocal()

entries = db.query(Entry).filter(
    Entry.entry_id.notin_(
        db.query(EmotionScore.entry_id)
    )
).all()

for entry in entries:

    emotion_scores, dominant, confidence = analyze_emotion(entry.entry_text)

    emotion = EmotionScore(
        entry_id=entry.entry_id,
        anger=emotion_scores.get("anger", 0),
        joy=emotion_scores.get("joy", 0),
        sadness=emotion_scores.get("sadness", 0),
        fear=emotion_scores.get("fear", 0),
        surprise=emotion_scores.get("surprise", 0),
        dominant_emotion=dominant,
        confidence=confidence
    )

    db.add(emotion)

db.commit()
db.close()

print("Emotion scores updated successfully.")