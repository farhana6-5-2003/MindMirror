from sqlalchemy import Column, Integer, String, DateTime,Float
from datetime import datetime,timezone
from .database import Base
from sqlalchemy import ForeignKey, Text


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Entry(Base):
    __tablename__ = "entries"

    entry_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    entry_text = Column(Text, nullable=False)
    entry_type = Column(String, nullable=False)  # text / voice
    created_at = Column(DateTime, default=datetime.utcnow)



class EmotionScore(Base):
    __tablename__ = "emotion_scores"

    score_id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("entries.entry_id"))
    anger = Column(Float)
    joy = Column(Float)
    sadness = Column(Float)
    fear = Column(Float)
    surprise = Column(Float)
    dominant_emotion = Column(String)
    confidence = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)



class Suggestion(Base):
    __tablename__ = "suggestions"

    suggestion_id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("entries.entry_id"))
    suggestion_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class WeeklyReport(Base):
    __tablename__ = "weekly_reports"

    report_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    week_start = Column(DateTime)
    week_end = Column(DateTime)
    summary_text = Column(Text)
    dominant_emotion_week = Column(String)
    mood_pattern = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
