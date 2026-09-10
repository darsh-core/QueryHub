from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User, QuizAttempt, Module, Quiz, DBMSSubmission

router = APIRouter(prefix="/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = ""
    name: Optional[str] = ""

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    email = request.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required.")
        
    # Strict Credentials Routing
    if email == "christy@skct.edu.in":
        pwd = (request.password or "").strip()
        if pwd != "queryhub@123":
            raise HTTPException(
                status_code=401, 
                detail="Invalid trainer credentials. Password must be queryhub@123 for christy@skct.edu.in."
            )
        role = "TRAINER"
        name = "Prof. Christy (SKCT)"
    else:
        role = "STUDENT"
        name = request.name if request.name else email.split("@")[0].replace(".", " ").title()
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            name=name,
            role=role,
            avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={email}"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.role = role
        db.commit()
        
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role,
            "avatar_url": user.avatar_url
        },
        "token": f"queryhub-jwt-token-{user.id}"
    }

@router.get("/analytics")
@router.get("/analytics")
def get_trainer_analytics(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.id.asc()).all()
    modules = db.query(Module).order_by(Module.order.asc()).all()
    quizzes_count = db.query(Quiz).count()
    quiz_attempts = db.query(QuizAttempt).all()
    dbms_submissions = db.query(DBMSSubmission).all()

    total_attempts_count = len(quiz_attempts) + len(dbms_submissions)

    # Real visitor / student activity log directly from database
    visitor_log = []
    for u in users:
        # Find latest quiz attempt or DBMS submission for user
        user_attempts = [a for a in quiz_attempts if getattr(a, 'student_id', None) == u.id]
        user_submissions = [s for s in dbms_submissions if s.student_id == u.id]
        
        last_score = "N/A"
        if user_submissions:
            latest_sub = max(user_submissions, key=lambda x: x.submitted_at)
            last_score = f"{int(latest_sub.score)}%"
        elif user_attempts:
            latest_att = max(user_attempts, key=lambda x: x.submitted_at)
            last_score = f"{int(latest_att.percentage)}%"

        time_str = u.created_at.strftime("%b %d, %I:%M %p") if u.created_at else "Recently"
        status_str = "Active Session" if u.role in ["TRAINER", "PROFESSOR"] else "Registered Student"

        completed_count = len(user_submissions) + len(user_attempts)
        modules_str = f"{completed_count} Tasks Completed" if u.role == "STUDENT" else "Trainer / Admin"

        visitor_log.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "login_time": time_str,
            "status": status_str,
            "completed_modules": modules_str,
            "last_quiz_score": last_score
        })

    # Real Score Distribution
    all_scores = [a.percentage for a in quiz_attempts] + [s.score for s in dbms_submissions]
    b_90_100 = sum(1 for s in all_scores if s >= 90)
    b_80_89 = sum(1 for s in all_scores if 80 <= s < 90)
    b_70_79 = sum(1 for s in all_scores if 70 <= s < 80)
    b_60_69 = sum(1 for s in all_scores if 60 <= s < 70)
    b_under_60 = sum(1 for s in all_scores if s < 60)

    score_distribution = [
        {"range": "90-100%", "count": b_90_100},
        {"range": "80-89%", "count": b_80_89},
        {"range": "70-79%", "count": b_70_79},
        {"range": "60-69%", "count": b_60_69},
        {"range": "< 60%", "count": b_under_60}
    ]

    # Real Module Participation
    module_participation = []
    for mod in modules:
        mod_quizzes = [q for q in mod.quizzes] if mod.quizzes else []
        quiz_ids = [q.id for q in mod_quizzes]
        mod_attempts = [a for a in quiz_attempts if a.quiz_id in quiz_ids]
        avg = round(sum(a.percentage for a in mod_attempts) / len(mod_attempts), 1) if mod_attempts else 0.0

        module_participation.append({
            "module": mod.code,
            "attempts": len(mod_attempts),
            "avg_score": avg
        })

    return {
        "total_visitors": len(users),
        "active_students_online": sum(1 for u in users if u.role == "STUDENT"),
        "total_modules": len(modules),
        "total_quizzes": quizzes_count,
        "total_attempts": total_attempts_count,
        "logged_in_users": visitor_log,
        "score_distribution": score_distribution,
        "module_participation": module_participation
    }
