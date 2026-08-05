from fastapi import FastAPI, HTTPException
from .database import engine
from . import models
from fastapi import Depends
from sqlalchemy.orm import Session
from .dependencies import get_db
from .schemas import EntryCreate
from .models import Entry
from .emotion import analyze_emotion
from .models import EmotionScore
from .embeddings import get_embedding
from .vector_db import collection
from .llm import generate_response
from .llm import generate_rag_response
from .models import Suggestion,User
from datetime import datetime, timedelta
from sqlalchemy import func
from .models import WeeklyReport, EmotionScore
from collections import Counter
import re


from .security import hash_password, verify_password
from .models import User
from .schemas import UserCreate, UserLogin

from fastapi.middleware.cors import CORSMiddleware



models.Base.metadata.create_all(bind=engine)


app=FastAPI(title="AI Diary Backend")

# -------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change later for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
def root():
    return {"message": "AI Diary backend is running"}




@app.post("/entries/")
def create_entry(entry: EntryCreate, db: Session = Depends(get_db)):
    new_entry = Entry(
        user_id=entry.user_id,
        entry_text=entry.entry_text,
        entry_type=entry.entry_type,
        created_at=entry.created_at if entry.created_at else datetime.utcnow()
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    scores, dominant, confidence = analyze_emotion(entry.entry_text)

    emotion_row = EmotionScore(
        entry_id=new_entry.entry_id,
        anger=scores.get("anger", 0),
        joy=scores.get("joy", 0),
        sadness=scores.get("sadness", 0),
        fear=scores.get("fear", 0),
        surprise=scores.get("surprise", 0),
        dominant_emotion=dominant,
        confidence=confidence
    )
    db.add(emotion_row)
    db.commit()

    embedding = get_embedding(entry.entry_text)
    collection.add(
        documents=[entry.entry_text],
        embeddings=[embedding],
        ids=[str(new_entry.entry_id)]
        # ids=[f"entry_{new_entry.entry_id}"]

    )
    # client.persist() 
    
    return {
        "message": "Diary entry saved with emotion analysis + embeddings",
        "entry_id": new_entry.entry_id,
        "dominant_emotion": dominant
    }


# @app.get("/search/")
# def search_similar(q: str):
#     query_embedding = get_embedding(q)

#     results = collection.query(
#         query_embeddings=[query_embedding],
#         n_results=2
#     )
#     print("VECTOR COUNT:", collection.count())

#     return results
@app.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "user_id": user.user_id,
        "name": user.name,
        "email": user.email
    }

# @app.get("/entries/user/{user_id}")
# def get_user_entries(user_id: int, db: Session = Depends(get_db)):
#     entries = (
#         db.query(Entry)
#         .filter(Entry.user_id == user_id)
#         .order_by(Entry.created_at.desc())
#         .all()
#     )

#     return [
#         {
#             "id": e.entry_id,
#             "date": e.created_at,
#             "text": e.entry_text
#         }
#         for e in entries
#     ]
@app.get("/entries/user/{user_id}")
def get_user_entries(user_id: int, db: Session = Depends(get_db)):
    entries = (
        db.query(Entry)
        .filter(Entry.user_id == user_id)
        .order_by(Entry.created_at.desc())
        .all()
    )

    result = []

    for e in entries:
        emotion = (
            db.query(EmotionScore)
            .filter(EmotionScore.entry_id == e.entry_id)
            .first()
        )

        result.append({
            "id": e.entry_id,
            "date": e.created_at,
            "text": e.entry_text,
            "dominant_emotion": emotion.dominant_emotion if emotion else "neutral"
        })

    return result



@app.get("/search/")
def search_similar(q: str):
    query_embedding = get_embedding(q)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=5
    )
    print("hello")
    print("VECTOR COUNT:", collection.count())

    return [
        {
            "entry_id": results["ids"][0][i],
            "text": results["documents"][0][i],
            "distance": results["distances"][0][i]
        }
        for i in range(len(results["ids"][0]))
    ]


@app.post("/llm-test/")
def test_llm(text: str):
    reply = generate_response(text)
    return {"llm_response": reply}


# @app.post("/rag/")
# def rag_response(entry_id: int):
#     # Get entry text from Chroma
#     results = collection.get(ids=[str(entry_id)])
    
#     if not results["documents"]:
#         return {"error": "Entry not found in vector DB"}

#     current_text = results["documents"][0]

#     # Retrieve similar entries
#     query_embedding = get_embedding(current_text)

#     search_results = collection.query(
#         query_embeddings=[query_embedding],
#         n_results=3
#     )

#     retrieved_docs = search_results["documents"][0]

#     # Remove the current entry itself from context
#     retrieved_docs = [doc for doc in retrieved_docs if doc != current_text]

#     rag_reply = generate_rag_response(current_text, retrieved_docs)

#     return {
#         "entry_id": entry_id,
#         "reflection": rag_reply
#     }




@app.post("/rag/")
def rag_response(entry_id: int,db: Session = Depends(get_db)):
    # First retrieve from PostgreSQL (source of truth)
    entry = db.query(Entry).filter(Entry.entry_id == entry_id).first()

    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")


    current_text = entry.entry_text

    query_embedding = get_embedding(current_text)

    search_results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3
    )

    retrieved_docs = search_results["documents"][0]

    rag_reply = generate_rag_response(current_text, retrieved_docs)


    new_suggestion = Suggestion(
    entry_id=entry_id,
    suggestion_text=rag_reply
    )
    db.add(new_suggestion)
    db.commit()


    return {
        "entry_id": entry_id,
        "reflection": rag_reply,
        "saved":True
    }


@app.post("/generate-weekly-report/")
def generate_weekly_report(user_id: int, db: Session = Depends(get_db)):

    week_end = datetime.utcnow()
    # week_start = week_end - timedelta(days=7)
    week_start = week_end - timedelta(days=7)


    # Get emotion scores for last 7 days
    emotions = (
        db.query(EmotionScore)
        .join(Entry)
        .filter(
            Entry.user_id == user_id,
            EmotionScore.created_at >= week_start
        )
        .all()
    )

    if not emotions:
        raise HTTPException(status_code=404, detail="No entries in the past week")

    # Count dominant emotions
    emotion_counts = {}
    for e in emotions:
        emotion_counts[e.dominant_emotion] = emotion_counts.get(e.dominant_emotion, 0) + 1

    dominant_emotion_week = max(emotion_counts, key=emotion_counts.get)

    # Simple mood trend detection
    mood_pattern = "stable"
    if dominant_emotion_week in ["joy"]:
        mood_pattern = "improving"
    elif dominant_emotion_week in ["sadness", "fear", "anger"]:
        mood_pattern = "declining"

    # Generate summary using LLM
    summary_prompt = f"""
User weekly emotional summary:
Dominant emotion: {dominant_emotion_week}
Mood pattern: {mood_pattern}

Generate a short weekly reflection (3-4 sentences).
Keep it supportive.
"""

    summary_text = generate_response(summary_prompt)

    # Store report
    new_report = WeeklyReport(
        user_id=user_id,
        week_start=week_start,
        week_end=week_end,
        summary_text=summary_text,
        dominant_emotion_week=dominant_emotion_week,
        mood_pattern=mood_pattern
    )

    db.add(new_report)
    db.commit()

    return {
        "dominant_emotion_week": dominant_emotion_week,
        "mood_pattern": mood_pattern,
        "summary": summary_text
    }

@app.get("/weekly-report/{user_id}")
def get_latest_weekly_report(user_id: int, db: Session = Depends(get_db)):

    report = (
        db.query(WeeklyReport)
        .filter(WeeklyReport.user_id == user_id)
        .order_by(WeeklyReport.week_end.desc())
        .first()
    )

    if not report:
        raise HTTPException(status_code=404, detail="No report found")

    return {
        "dominant_emotion_week": report.dominant_emotion_week,
        "mood_pattern": report.mood_pattern,
        "summary": report.summary_text
    }



# @app.post("/chat/")
# def chat_with_diary(question: str, user_id: int, db: Session = Depends(get_db)):

#     # Get user
#     user = db.query(User).filter(User.user_id == user_id).first()
#     user_name = user.name if user else "User"

#     # -------- Detect if RAG should be used --------
#     reflection_keywords = [
#         "why",
#         "before",
#         "happened before",
#         "remember",
#         "past",
#         "earlier",
#         "pattern",
#         "when did",
#         "which day"
#     ]

#     use_rag = any(word in question.lower() for word in reflection_keywords)

#     context_block = ""

#     # -------- Retrieve past entries ONLY if needed --------
#     if use_rag:

#         query_embedding = get_embedding(question)

#         results = collection.query(
#             query_embeddings=[query_embedding],
#             n_results=2
#         )

#         retrieved_ids = results["ids"][0]

#         if retrieved_ids:
#             entries = (
#                 db.query(Entry)
#                 .filter(
#                     Entry.entry_id.in_([int(i) for i in retrieved_ids]),
#                     Entry.user_id == user_id
#                 )
#                 .all()
#             )

#             for e in entries:
#                 context_block += f"Date: {e.created_at}\nEntry: {e.entry_text}\n\n"

#     # -------- Prompt --------
#     prompt = f"""
# You are a compassionate emotional companion and supportive mentor.

# The user's name is {user_name}.

# User message:
# {question}

# {context_block}

# Behavior rules:

# 1. Speak like a caring and supportive friend.
# 2. Acknowledge the user's feelings only if they are clearly expressed.
# 3. Ask gentle reflective questions when appropriate.
# 4. Offer supportive guidance only when helpful.
# 5. Do NOT analyze past diary entries unless they are provided above.
# 6. Do NOT explain past incidents unless the user asks about them.
# 7. If the message is short or unclear, respond simply and naturally without over-interpreting.
# 8. Do NOT assume major life events unless the user clearly states them. 
# 9. Keep the tone warm, natural, and encouraging.
# 10. If the user asks about a past event, answer directly using the diary entries without mentioning them.
# Write 2–4 sentences.
# """

#     # Generate AI response
#     answer = generate_response(prompt)

#     return {
#         "question": question,
#         "answer": answer
#     }



# --------------------------------------------------------------------------------------------------
# @app.post("/chat/")
# def chat_with_diary(question: str, user_id: int, db: Session = Depends(get_db)):

#     # -------- Get user --------
#     user = db.query(User).filter(User.user_id == user_id).first()
#     user_name = user.name if user else "User"

#     # -------- Intent Detection (Improved) --------
#     q = question.lower()

#     use_rag = (
#         "before" in q or
#         "earlier" in q or
#         "past" in q or
#         "remember" in q or
#         "when did" in q or
#         "have i" in q or
#         "did this happen" in q or
#         "pattern" in q or
#         "similar" in q or
#         "again" in q
#     )

#     context_block = ""

#     # -------- Retrieve past entries ONLY if needed --------
#     if use_rag:

#         query_embedding = get_embedding(question)

#         results = collection.query(
#             query_embeddings=[query_embedding],
#             n_results=2
#         )

#         retrieved_ids = results.get("ids", [[]])[0]

#         if retrieved_ids:
#             entries = (
#                 db.query(Entry)
#                 .filter(
#                     Entry.entry_id.in_([int(i) for i in retrieved_ids]),
#                     Entry.user_id == user_id
#                 )
#                 .all()
#             )

#             for e in entries:
#                 context_block += f"Date: {e.created_at}\nEntry: {e.entry_text}\n\n"

#     # -------- Prompt --------
#     prompt = f"""
# You are a compassionate emotional companion and supportive mentor.

# The user's name is {user_name}.

# User message:
# {question}

# {context_block}

# Behavior rules:

# 1. Speak like a caring and supportive friend.
# 2. Acknowledge feelings only if clearly expressed.
# 3. Ask gentle reflective questions when appropriate.
# 4. Offer guidance only when helpful.
# 5. Do NOT use past diary entries unless they are provided above.
# 6. Only refer to past entries if the user is asking about past experiences.
# 7. If the message is simple, respond naturally without overthinking.
# 8. Do NOT assume major life events.
# 9. Keep the tone warm and encouraging.
# 10. If past entries are provided AND the user asks about past, use them naturally without explicitly saying "based on your diary".
# Write 2–4 sentences.
# """

#     # -------- Generate response --------
#     answer = generate_response(prompt)

#     return {
#         "question": question,
#         "answer": answer
#     }


# @app.post("/chat/")
# def chat_with_diary(question: str, user_id: int, db: Session = Depends(get_db)):

#     # -------- Get user --------
#     user = db.query(User).filter(User.user_id == user_id).first()
#     user_name = user.name if user else "User"

#     # -------- Intent Detection (Improved) --------
#     q = question.lower()

#     use_rag = (
#     "before" in q or
#     "earlier" in q or
#     "past" in q or
#     "remember" in q or
#     "when did" in q or
#     "have i" in q or
#     "did this happen" in q or
#     "pattern" in q or
#     "similar" in q or
#     "again" in q or
#     "yesterday" in q or
#     "last" in q or
#     "entry" in q or
#     "note" in q or
#     "diary" in q or
#     "day" in q
# )


#     context_block = ""

#     # -------- Retrieve past entries ONLY if needed --------
#     if use_rag:

#         query_embedding = get_embedding(question)

#         results = collection.query(
#             query_embeddings=[query_embedding],
#             n_results=5
#         )

#         retrieved_ids = results.get("ids", [[]])[0]

#         if retrieved_ids:
#             entries = (
#                 db.query(Entry)
#                 .filter(
#                     Entry.entry_id.in_([int(i) for i in retrieved_ids]),
#                     Entry.user_id == user_id
#                 )
#                 .all()
#             )

#             for e in entries:
#                 context_block += f"Date: {e.created_at}\nEntry: {e.entry_text}\n\n"
#         if not retrieved_ids:
#             context_block = "No past entries found for this query."



#     # -------- Prompt --------
#     prompt = f"""
# You are a compassionate emotional companion and supportive mentor.

# The user's name is {user_name}.

# User message:
# {question}

# {context_block}

# Behavior rules:

# 1. Speak like a caring and supportive friend.
# 2. Acknowledge feelings only once per turn — don't repeat if already expressed.
# 3. If the user asks about past events, recall diary entries from context_block and respond naturally.
# 4. If no past entry is found, gently say you couldn't find it but invite the user to share more.
# 5. After acknowledging emotions, move forward with reflection prompts (e.g., “What made you feel this way?”).
# 6. Avoid looping back to “How are you feeling?” unless the user hasnt shared their mood yet.
# 7. Keep responses concise (2-4 sentences), warm, and encouraging.
# 8. If context_block says no entries found, respond gently: “I couldn't find a past entry about that, but I'd love to hear more from you.
# 9. If past entries are provided, ONLY use those. Do not invent or guess dates.
# 10. If no relevant past entry is found, say kindly: “I couldn't find a diary entry about that.”

# """

#     # -------- Generate response --------
#     answer = generate_response(prompt)

#     return {
#         "question": question,
#         "answer": answer
#     }


from sqlalchemy import or_

@app.post("/chat/")
def chat_with_diary(question: str, user_id: int, db: Session = Depends(get_db)):

    # -------- Get user --------
    user = db.query(User).filter(User.user_id == user_id).first()
    user_name = user.name if user else "User"

    # -------- Intent Detection --------
    q = question.lower()

    use_rag = (
        "before" in q or
        "earlier" in q or
        "past" in q or
        "remember" in q or
        "when did" in q or
        "have i" in q or
        "did this happen" in q or
        "pattern" in q or
        "similar" in q or
        "again" in q or
        "yesterday" in q or
        "last" in q or
        "entry" in q or
        "note" in q or
        "diary" in q or
        "day" in q
    )

    context_block = ""
    entries = []

    # -------- Retrieve past entries ONLY if needed --------
    if use_rag:

        words = [
    w for w in q.split()
    if w not in ["when", "did", "i", "what", "date", "the", "a", "an", "today"]
    and len(w) > 3
]

        # 🔹 STEP 1: Keyword search (IMPORTANT FIX)
        keyword_entries = db.query(Entry).filter(
    Entry.user_id == user_id,
    *[Entry.entry_text.ilike(f"%{word}%") for word in words]
).all()

        keyword_entries = sorted(
    keyword_entries,
    key=lambda e: sum(word in e.entry_text.lower() for word in words),
    reverse=True
)

        if keyword_entries:
            entries = keyword_entries

        else:
            # 🔹 STEP 2: Embedding fallback
            query_embedding = get_embedding(question)

            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=5   # increased from 2
            )

            retrieved_ids = results.get("ids", [[]])[0]

            if retrieved_ids:
                entries = (
                    db.query(Entry)
                    .filter(
                        Entry.entry_id.in_([int(i) for i in retrieved_ids]),
                        Entry.user_id == user_id
                    )
                    .all()
                )

    # 🔹 Reduce noise for time queries
    if any(word in q for word in ["when", "which day", "what date"]):
        entries = entries[:3]

    # 🔹 Build context block
    if entries:
        for e in entries:
            context_block += f"Date: {e.created_at.strftime('%B %d, %Y')}\nEntry: {e.entry_text}\n\n"
    else:
        context_block = "No past entries found for this query."



    is_time_query = any(word in q for word in ["when", "what date", "which day"])
    if is_time_query:
        prompt = f"""
You are a precise assistant answering questions from a user's diary.

Instructions:
- Answer ONLY using the provided entries.
- - If a date is present, answer in this format:
  "You [action from the question] on [date]."
- Do NOT add disclaimers like "I don't have information".
- Do NOT ask follow-up questions.
- Keep the answer short and direct.

User message:
{question}

{context_block}
"""
    else:
        prompt = f"""
You are a compassionate emotional companion and supportive mentor.

The user's name is {user_name}.

User message:
{question}

{context_block}

Behavior rules:

1. Speak like a caring and supportive friend.
2. Acknowledge feelings only once per turn — don't repeat if already expressed.
3. If the user asks about past events, recall diary entries from context_block and respond naturally.
4. If no past entry is found, gently say you couldn't find it but invite the user to share more.
5. After acknowledging emotions, move forward with reflection prompts (e.g., “What made you feel this way?”).
6. Avoid looping back to “How are you feeling?” unless the user hasnt shared their mood yet.
7. Keep responses concise (2-4 sentences), warm, and encouraging.
8. If context_block says no entries found, respond gently: “I couldn't find a past entry about that, but I'd love to hear more from you.
9. If past entries are provided, ONLY use those. Do not invent or guess dates.
10. If no relevant past entry is found, say kindly: “I couldn't find a diary entry about that.”
11. If the user asks a time-related question (when, what date), directly answer with the exact date from the context before anything else.

"""

    # -------- Generate response --------
    answer = generate_response(prompt)

    return {
        "question": question,
        "answer": answer
    }

# -----------------------------------------------------------------------------
@app.post("/register/")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")


    hashed_pw = hash_password(user.password)

    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_pw
    )

    db.add(new_user)
    db.commit()

    return {"message": "User registered successfully"}

@app.post("/login/")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")


    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {"message": "Login successful", "user_id": db_user.user_id}







@app.get("/mind-tree/{user_id}")
def get_mind_tree(user_id: int, db: Session = Depends(get_db)):

    one_week_ago = datetime.utcnow() - timedelta(days=7)

    entries = (
        db.query(Entry)
        .filter(
            Entry.user_id == user_id,
            Entry.created_at >= one_week_ago
        )
        .all()
    )

    if not entries:
        return {"dominant_emotion": None, "branches": []}

    entry_ids = [e.entry_id for e in entries]

    scores = (
        db.query(EmotionScore)
        .filter(EmotionScore.entry_id.in_(entry_ids))
        .all()
    )

    emotion_map = {}

    for entry, score in zip(entries, scores):

        emotion = score.dominant_emotion

        if emotion not in emotion_map:
            emotion_map[emotion] = {
                "texts": [],
                "count": 0
            }

        emotion_map[emotion]["texts"].append(entry.entry_text)
        emotion_map[emotion]["count"] += 1


    # keyword extraction
    
    stopwords = {
    # existing
    "the","is","a","and","to","of","in","it","i","was","today",
    "with","for","that","this","have","had","been","very",
    "really","after","before","from","because","about",

    # diary filler
    "felt","feel","feeling","spent","time","went","made",

    # verbs/adjectives
    "worked","work","doing","did","trying","try",
    "debugging","debug","fixed","fix","coding","code",
    "happy","frustrated","tired"
}
    def extract_keywords(texts):

        words = []

        for text in texts:
            tokens = re.findall(r"\b[a-zA-Z]+\b", text.lower())

            for word in tokens:
                if word not in stopwords and len(word) > 3:
                    words.append(word)

        common = Counter(words).most_common(3)

        return [w for w, c in common]


    branches = []

    for emotion, data in emotion_map.items():

        keywords = extract_keywords(data["texts"])

        branches.append({
            "emotion": emotion,
            "count": data["count"],
            "keywords": keywords
        })


    dominant = max(branches, key=lambda x: x["count"])["emotion"]

    return {
        "dominant_emotion": dominant,
        "branches": branches
    }

@app.get("/emotion-stability/{user_id}")
def emotion_stability(user_id: int, db: Session = Depends(get_db)):

    from datetime import datetime, timedelta

    one_week_ago = datetime.utcnow() - timedelta(days=7)

    entries = (
        db.query(Entry, EmotionScore)
        .join(EmotionScore, Entry.entry_id == EmotionScore.entry_id)
        .filter(
            Entry.user_id == user_id,
            Entry.created_at >= one_week_ago
        )
        .order_by(Entry.created_at)
        .all()
    )

    if len(entries) < 2:
        return {"stability_score": 100, "message": "Not enough data"}

    emotions = [e[1].dominant_emotion for e in entries]

    changes = 0

    for i in range(1, len(emotions)):
        if emotions[i] != emotions[i-1]:
            changes += 1

    stability = 1 - (changes / len(emotions))
    stability_percent = round(stability * 100)

    if stability_percent > 70:
        message = "Your emotions were quite stable this week."
    elif stability_percent > 40:
        message = "Your emotions fluctuated moderately this week."
    else:
        message = "Your emotions changed frequently this week."

    return {
        "stability_score": stability_percent,
        "message": message
    }


@app.get("/stats/{user_id}")
def get_stats(user_id: int, db: Session = Depends(get_db)):

    total_entries = db.query(Entry).filter(Entry.user_id == user_id).count()

    # Get entry dates
    entries = (
        db.query(Entry.created_at)
        .filter(Entry.user_id == user_id)
        .order_by(Entry.created_at.desc())
        .all()
    )

    streak = 0
    last_date = None

    for e in entries:
        day = e.created_at.date()

        if last_date is None:
            last_date = day
            streak += 1
        elif (last_date - day).days == 1:
            streak += 1
            last_date = day
        else:
            break

    return {
        "entries": total_entries,
        "streak": streak
    }

@app.get("/emotion-calendar/{user_id}")
def emotion_calendar(user_id: int, db: Session = Depends(get_db)):

    results = (
        db.query(Entry.created_at, EmotionScore.dominant_emotion)
        .join(EmotionScore, Entry.entry_id == EmotionScore.entry_id)
        .filter(Entry.user_id == user_id)
        .all()
    )

    data = []

    for date, emotion in results:
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "emotion": emotion
        })

    return data

# -------------------emotion trend graph---------------------------------

# @app.get("/emotion-trend/{user_id}")
# def emotion_trend(user_id: int, db: Session = Depends(get_db)):

#     from datetime import datetime, timedelta

#     one_week_ago = datetime.utcnow() - timedelta(days=7)

#     results = (
#         db.query(Entry.created_at, EmotionScore)
#         .join(EmotionScore, Entry.entry_id == EmotionScore.entry_id)
#         .filter(
#             Entry.user_id == user_id,
#             Entry.created_at >= one_week_ago
#         )
#         .order_by(Entry.created_at)
#         .all()
#     )

#     data = []

#     for date, score in results:
#         data.append({
#             "date": date.strftime("%Y-%m-%d"),
#             "joy": round(score.joy * 100, 1),
#             "anger": round(score.anger * 100, 1),
#             "sadness": round(score.sadness * 100, 1),
#             "fear": round(score.fear * 100, 1),
#             "surprise": round(score.surprise * 100, 1)
#         })

#     return data

@app.get("/emotion-trend/{user_id}")
def emotion_trend(user_id: int, db: Session = Depends(get_db)):

    from datetime import datetime, timedelta

    one_week_ago = datetime.utcnow() - timedelta(days=7)

    results = (
        db.query(Entry.created_at, EmotionScore)
        .join(EmotionScore, Entry.entry_id == EmotionScore.entry_id)
        .filter(
            Entry.user_id == user_id,
            Entry.created_at >= one_week_ago
        )
        .order_by(Entry.created_at)
        .all()
    )

    daily_data = {}

    for date, score in results:

        day = date.strftime("%Y-%m-%d")

        if day not in daily_data:
            daily_data[day] = {
                "date": day,
                "joy": 0,
                "anger": 0,
                "sadness": 0,
                "fear": 0,
                "surprise": 0,
                "count": 0
            }

        daily_data[day]["joy"] += score.joy
        daily_data[day]["anger"] += score.anger
        daily_data[day]["sadness"] += score.sadness
        daily_data[day]["fear"] += score.fear
        daily_data[day]["surprise"] += score.surprise
        daily_data[day]["count"] += 1

    data = []

    for day in daily_data.values():
        count = day["count"]

        data.append({
            "date": day["date"],
            "joy": round((day["joy"] / count) * 100, 1),
            "anger": round((day["anger"] / count) * 100, 1),
            "sadness": round((day["sadness"] / count) * 100, 1),
            "fear": round((day["fear"] / count) * 100, 1),
            "surprise": round((day["surprise"] / count) * 100, 1)
        })

    return data


@app.get("/profile/{user_id}")
def get_profile(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.user_id == user_id).first()

    entry_count = db.query(Entry).filter(Entry.user_id == user_id).count()

    return {
        "name": user.name,
        "email": user.email,
        "entries": entry_count,
        "created_at": user.created_at
    }

from pydantic import BaseModel

class UpdateProfile(BaseModel):
    name: str


@app.put("/update-profile/{user_id}")
def update_profile(user_id: int, data: UpdateProfile, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.user_id == user_id).first()

    user.name = data.name

    db.commit()

    return {"message": "Profile updated"}


