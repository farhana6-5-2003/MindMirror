from transformers import pipeline

emotion_classifier = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None
)

def analyze_emotion(text: str):
    results = emotion_classifier(text)[0]

    scores = {item["label"].lower(): item["score"] for item in results}
    dominant_emotion = max(scores, key=scores.get)
    confidence = scores[dominant_emotion]

    return scores, dominant_emotion, confidence
