import json
import uuid
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import (
    DBMSDatabase, DBMSSession, DBMSChallenge, DBMSSubmission,
    DBMSQueryHistory, DBMSCompetencyProgress, DBMSLearningEvent, User
)
from app.services.dbms_sandbox import DBMSSandbox
from app.services.dbms_ai_mentor import DBMSAIMentor

router = APIRouter(prefix="/dbms", tags=["DBMS Virtual Lab"])

# --- Request / Response Pydantic Schemas ---

class CreateSessionRequest(BaseModel):
    database_name: Optional[str] = "Employee Management"
    student_id: Optional[int] = 1

class QueryExecuteRequest(BaseModel):
    session_id: Optional[str] = None
    database_name: str = "Employee Management"
    query_text: str
    student_id: Optional[int] = 1

class QueryExplainRequest(BaseModel):
    query_text: str
    database_name: str = "Employee Management"

class CreateCustomDatabaseRequest(BaseModel):
    database_name: str
    description: Optional[str] = "Student Custom Database Workspace"
    category: Optional[str] = "Custom Database"

class CreateCustomTableRequest(BaseModel):
    session_id: Optional[str] = None
    database_name: str = "Employee Management"
    table_name: str
    columns: List[Dict[str, Any]]
    foreign_keys: Optional[List[Dict[str, str]]] = None

class EvaluateSubmissionRequest(BaseModel):
    challenge_id: int
    query_text: str
    student_id: Optional[int] = 1

class AIActionRequest(BaseModel):
    action: str  # explain, hint, mistake, optimize, teach
    query_text: Optional[str] = None
    error_message: Optional[str] = None
    database_name: Optional[str] = "Employee Management"
    challenge_title: Optional[str] = None
    topic: Optional[str] = None
    hint_level: Optional[int] = 1

class CreateChallengeRequest(BaseModel):
    title: str
    description: str
    topic: str
    difficulty: str = "Medium"
    database_name: str = "Employee Management"
    starter_sql: Optional[str] = None
    reference_sql: str
    test_cases: List[Dict[str, Any]]
    competency_name: str = "SQL Queries"
    max_score: float = 100.0
    time_limit_seconds: int = 60
    is_published: bool = True

class AIGenerateChallengeRequest(BaseModel):
    topic: str = "JOIN"
    difficulty: str = "Medium"
    competency: str = "SQL Queries"

# --- Endpoints Implementation ---

@router.post("/sessions")
def create_lab_session(req: CreateSessionRequest, db: Session = Depends(get_db)):
    session_id = DBMSSandbox.get_or_create_session(req.student_id, req.database_name)
    expires = datetime.utcnow() + timedelta(hours=2)

    db_sess = DBMSSession(
        id=session_id,
        student_id=req.student_id,
        database_name=req.database_name,
        schema_name=f"sandbox_{session_id[:8]}",
        status="ACTIVE",
        expires_at=expires
    )
    db.add(db_sess)
    db.commit()

    return {
        "session_id": session_id,
        "database_name": req.database_name,
        "status": "ACTIVE",
        "expires_at": expires.isoformat()
    }

@router.get("/sessions/{session_id}")
def get_lab_session(session_id: str, db: Session = Depends(get_db)):
    sess = db.query(DBMSSession).filter(DBMSSession.id == session_id).first()
    if not sess:
        session_id = DBMSSandbox.get_or_create_session(1, "Employee Management")
        return {
            "session_id": session_id,
            "database_name": "Employee Management",
            "status": "ACTIVE"
        }
    return {
        "session_id": sess.id,
        "database_name": sess.database_name,
        "queries_executed": sess.queries_executed,
        "status": sess.status,
        "expires_at": sess.expires_at.isoformat()
    }

@router.get("/databases")
def get_databases():
    """List all available databases including student-created databases."""
    result = []
    for name, info in DBMSSandbox.PREBUILT_DATABASES.items():
        result.append({
            "name": info["name"],
            "category": info["category"],
            "description": info["description"],
            "table_count": len(info.get("tables", [])),
            "tables": [t["name"] for t in info.get("tables", [])]
        })
    return result

@router.post("/databases/custom")
def create_custom_database(req: CreateCustomDatabaseRequest, db: Session = Depends(get_db)):
    """Creates a new student-defined database workspace."""
    db_info = DBMSSandbox.create_custom_database(req.database_name, req.description, req.category)
    session_id = DBMSSandbox.get_or_create_session(1, req.database_name)
    
    existing_db = db.query(DBMSDatabase).filter(DBMSDatabase.name == req.database_name).first()
    if not existing_db:
        db_record = DBMSDatabase(
            name=req.database_name,
            display_name=req.database_name,
            description=req.description,
            category=req.category,
            tables_schema_json=json.dumps([]),
            sample_seed_sql="-- Custom Database Workspace",
            table_count=0
        )
        db.add(db_record)
        db.commit()

    return {
        "message": f"Custom database '{req.database_name}' created successfully!",
        "session_id": session_id,
        "database": db_info
    }

@router.get("/databases/{name}/schema")
def get_database_schema(name: str, session_id: Optional[str] = None):
    """Get complete schema details (tables, columns, PKs, FKs) for a database, including dynamic user-created tables."""
    if session_id:
        return DBMSSandbox.get_live_session_schema(session_id, name)

    if name not in DBMSSandbox.PREBUILT_DATABASES:
        name = "Employee Management"
    
    info = DBMSSandbox.PREBUILT_DATABASES[name]
    return {
        "database_name": info["name"],
        "category": info["category"],
        "description": info["description"],
        "tables": info["tables"],
        "seed_sql": info["seed_sql"]
    }

@router.post("/tables/create")
def create_custom_table(req: CreateCustomTableRequest, db: Session = Depends(get_db)):
    """Creates a user-defined table inside an active session via DDL builder."""
    session_id = req.session_id or DBMSSandbox.get_or_create_session(1, req.database_name)

    col_defs = []
    pk_cols = []
    for c in req.columns:
        col_str = f"{c['name']} {c.get('type', 'TEXT')}"
        if c.get("not_null"):
            col_str += " NOT NULL"
        if c.get("pk"):
            pk_cols.append(c['name'])
        col_defs.append(col_str)

    if len(pk_cols) == 1:
        col_defs = [f"{col} PRIMARY KEY" if col.startswith(pk_cols[0] + " ") else col for col in col_defs]
    elif len(pk_cols) > 1:
        col_defs.append(f"PRIMARY KEY ({', '.join(pk_cols)})")

    if req.foreign_keys:
        for fk in req.foreign_keys:
            col_defs.append(f"FOREIGN KEY ({fk['col']}) REFERENCES {fk['ref_table']}({fk['ref_col']})")

    ddl_sql = f"CREATE TABLE {req.table_name} (\n  " + ",\n  ".join(col_defs) + "\n);"

    res = DBMSSandbox.execute_query(session_id, ddl_sql, req.database_name)
    if res["status"] == "SUCCESS":
        live_schema = DBMSSandbox.get_live_session_schema(session_id, req.database_name)
        return {
            "message": f"Table '{req.table_name}' created successfully!",
            "ddl_sql": ddl_sql,
            "schema": live_schema
        }
    else:
        raise HTTPException(status_code=400, detail=res.get("error_message", "Failed to create table"))

@router.get("/tables/{db_name}/{table_name}/data")
def get_table_sample_data(db_name: str, table_name: str, session_id: Optional[str] = None):
    """Fetch sample rows for a table in an educational database."""
    if db_name not in DBMSSandbox.PREBUILT_DATABASES:
        db_name = "Employee Management"

    active_session = session_id or DBMSSandbox.get_or_create_session(1, db_name)
    query = f"SELECT * FROM {table_name} LIMIT 20;"
    res = DBMSSandbox.execute_query(active_session, query, db_name)
    return res

@router.post("/query/execute")
def execute_sql_query(req: QueryExecuteRequest, db: Session = Depends(get_db)):
    """Execute student SQL query inside isolated sandbox engine."""
    session_id = req.session_id or DBMSSandbox.get_or_create_session(req.student_id, req.database_name)
    
    res = DBMSSandbox.execute_query(session_id, req.query_text, req.database_name)

    # Save to Query History
    history = DBMSQueryHistory(
        student_id=req.student_id or 1,
        session_id=session_id,
        database_name=req.database_name,
        query_text=req.query_text,
        status=res["status"],
        rows_affected=res["rows_affected"],
        execution_time_ms=res["execution_time_ms"],
        error_message=res.get("error_message")
    )
    db.add(history)

    # Log Learning Event
    event = DBMSLearningEvent(
        student_id=req.student_id or 1,
        session_id=session_id,
        event_type="EXECUTE_QUERY",
        details_json=json.dumps({
            "database": req.database_name,
            "status": res["status"],
            "time_ms": res["execution_time_ms"]
        })
    )
    db.add(event)
    db.commit()

    return res

@router.post("/query/explain")
def explain_sql_query_plan(req: QueryExplainRequest):
    """Generate logical clause execution flow and EXPLAIN plan."""
    return DBMSSandbox.analyze_query_execution_plan(req.query_text, req.database_name)

# --- Challenge & Evaluation APIs ---

@router.get("/challenges")
def get_challenges(topic: Optional[str] = None, difficulty: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(DBMSChallenge).filter(DBMSChallenge.is_published == True)
    if topic:
        query = query.filter(DBMSChallenge.topic == topic)
    if difficulty:
        query = query.filter(DBMSChallenge.difficulty == difficulty)

    challenges = query.order_by(DBMSChallenge.id.asc()).all()
    result = []
    for c in challenges:
        tc_parsed = []
        try:
            tc_parsed = json.loads(c.test_cases_json)
        except Exception:
            pass

        visible_tcs = [t for t in tc_parsed if not t.get("is_hidden", False)]
        result.append({
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "topic": c.topic,
            "difficulty": c.difficulty,
            "database_name": c.database_name,
            "starter_sql": c.starter_sql,
            "competency_name": c.competency_name,
            "max_score": c.max_score,
            "test_cases_count": len(tc_parsed),
            "visible_test_cases": visible_tcs
        })
    return result

@router.get("/challenges/{id}")
def get_challenge_by_id(id: int, db: Session = Depends(get_db)):
    c = db.query(DBMSChallenge).filter(DBMSChallenge.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    tc_parsed = []
    try:
        tc_parsed = json.loads(c.test_cases_json)
    except Exception:
        pass

    return {
        "id": c.id,
        "title": c.title,
        "description": c.description,
        "topic": c.topic,
        "difficulty": c.difficulty,
        "database_name": c.database_name,
        "starter_sql": c.starter_sql,
        "reference_sql": c.reference_sql,
        "competency_name": c.competency_name,
        "max_score": c.max_score,
        "time_limit_seconds": c.time_limit_seconds,
        "test_cases": tc_parsed
    }

@router.post("/challenges")
def create_challenge(req: CreateChallengeRequest, db: Session = Depends(get_db)):
    challenge = DBMSChallenge(
        title=req.title,
        description=req.description,
        topic=req.topic,
        difficulty=req.difficulty,
        database_name=req.database_name,
        starter_sql=req.starter_sql,
        reference_sql=req.reference_sql,
        test_cases_json=json.dumps(req.test_cases),
        competency_name=req.competency_name,
        max_score=req.max_score,
        time_limit_seconds=req.time_limit_seconds,
        is_published=req.is_published
    )
    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    return {"message": "Challenge created successfully", "challenge_id": challenge.id}

@router.put("/challenges/{id}")
def update_challenge(id: int, req: CreateChallengeRequest, db: Session = Depends(get_db)):
    c = db.query(DBMSChallenge).filter(DBMSChallenge.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    c.title = req.title
    c.description = req.description
    c.topic = req.topic
    c.difficulty = req.difficulty
    c.database_name = req.database_name
    c.starter_sql = req.starter_sql
    c.reference_sql = req.reference_sql
    c.test_cases_json = json.dumps(req.test_cases)
    c.competency_name = req.competency_name
    c.max_score = req.max_score
    c.time_limit_seconds = req.time_limit_seconds
    c.is_published = req.is_published

    db.commit()
    return {"message": "Challenge updated successfully", "challenge_id": id}

@router.delete("/challenges/{id}")
def delete_challenge(id: int, db: Session = Depends(get_db)):
    c = db.query(DBMSChallenge).filter(DBMSChallenge.id == id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Challenge not found")
    db.delete(c)
    db.commit()
    return {"message": "Challenge deleted successfully", "challenge_id": id}

@router.post("/evaluate")
def evaluate_submission(req: EvaluateSubmissionRequest, db: Session = Depends(get_db)):
    c = db.query(DBMSChallenge).filter(DBMSChallenge.id == req.challenge_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Challenge not found")

    test_cases = []
    try:
        test_cases = json.loads(c.test_cases_json)
    except Exception:
        pass

    eval_result = DBMSSandbox.evaluate_challenge_submission(
        submitted_query=req.query_text,
        reference_query=c.reference_sql,
        test_cases=test_cases,
        db_name=c.database_name
    )

    is_accepted = eval_result["is_correct"]
    points = c.max_score if is_accepted else 0.0
    status_str = "ACCEPTED" if is_accepted else ("SYNTAX_ERROR" if "syntax" in (eval_result.get("error") or "").lower() else "WRONG_ANSWER")

    submission = DBMSSubmission(
        student_id=req.student_id or 1,
        challenge_id=req.challenge_id,
        submitted_query=req.query_text,
        status=status_str,
        execution_time_ms=eval_result["execution_time_ms"],
        points_earned=points,
        error_message=eval_result.get("error"),
        eval_details_json=json.dumps(eval_result)
    )
    db.add(submission)

    # Update Competency Progress
    comp = db.query(DBMSCompetencyProgress).filter(
        DBMSCompetencyProgress.student_id == (req.student_id or 1),
        DBMSCompetencyProgress.topic == c.topic
    ).first()

    if not comp:
        comp = DBMSCompetencyProgress(
            student_id=req.student_id or 1,
            topic=c.topic,
            mastery_score_pct=20.0 if is_accepted else 5.0,
            challenges_solved=1 if is_accepted else 0,
            challenges_attempted=1,
            total_points=points,
            streak_days=1
        )
        db.add(comp)
    else:
        comp.challenges_attempted += 1
        if is_accepted:
            comp.challenges_solved += 1
            comp.total_points += points
            comp.mastery_score_pct = min(100.0, comp.mastery_score_pct + 15.0)

    db.commit()

    return {
        "status": status_str,
        "is_correct": is_accepted,
        "points_earned": points,
        "execution_time_ms": eval_result["execution_time_ms"],
        "error_message": eval_result.get("error"),
        "visible_test_cases": [t for t in eval_result["test_results"] if not t.get("is_hidden")],
        "total_test_cases": len(eval_result["test_results"]),
        "passed_test_cases": sum(1 for t in eval_result["test_results"] if t.get("passed"))
    }

# --- AI DBMS Mentor APIs ---

@router.post("/ai/action")
def trigger_ai_mentor_action(req: AIActionRequest):
    """Trigger specialized Qwen 3.2 DBMS AI mentor actions."""
    res = DBMSAIMentor.process_ai_request(
        action=req.action,
        query_text=req.query_text,
        error_message=req.error_message,
        database_name=req.database_name,
        challenge_title=req.challenge_title,
        topic=req.topic,
        hint_level=req.hint_level
    )
    return res

@router.post("/ai/generate-challenge")
def generate_ai_challenge(req: AIGenerateChallengeRequest):
    """Generates a structured DBMS challenge using Qwen 3.2 AI."""
    return DBMSAIMentor.generate_ai_challenge(
        topic=req.topic,
        difficulty=req.difficulty,
        competency=req.competency
    )

# --- Student Analytics & Leaderboard APIs ---

@router.get("/analytics/student")
def get_student_analytics(student_id: int = 1, db: Session = Depends(get_db)):
    comps = db.query(DBMSCompetencyProgress).filter(DBMSCompetencyProgress.student_id == student_id).all()
    submissions = db.query(DBMSSubmission).filter(DBMSSubmission.student_id == student_id).all()

    total_pts = sum(c.total_points for c in comps) if comps else 0
    solved_count = sum(c.challenges_solved for c in comps) if comps else 0
    attempted_count = sum(c.challenges_attempted for c in comps) if comps else 0
    accuracy = round((solved_count / attempted_count * 100), 1) if attempted_count > 0 else 100.0

    radar_data = []
    topics_default = ["DDL", "DML", "Joins", "Aggregation", "Subqueries", "Indexing", "Transactions"]
    comp_map = {c.topic: c.mastery_score_pct for c in comps}

    for t in topics_default:
        radar_data.append({
            "subject": t,
            "score": comp_map.get(t, 25.0)
        })

    recommendations = [
        "Master LEFT OUTER JOINs and multi-table ON predicates.",
        "Practice B+ Tree index creation to avoid full table scans.",
        "Review ACID isolation levels to prevent phantom read anomalies."
    ]

    return {
        "student_id": student_id,
        "total_points": total_pts,
        "challenges_solved": solved_count,
        "challenges_attempted": attempted_count,
        "accuracy_pct": accuracy,
        "streak_days": 3,
        "competencies": radar_data,
        "recommendations": recommendations
    }

@router.get("/analytics/trainer")
def get_trainer_analytics(db: Session = Depends(get_db)):
    total_submissions = db.query(DBMSSubmission).count()
    accepted_submissions = db.query(DBMSSubmission).filter(DBMSSubmission.status == "ACCEPTED").count()
    total_challenges = db.query(DBMSChallenge).count()

    accuracy = round((accepted_submissions / total_submissions * 100), 1) if total_submissions > 0 else 85.0

    return {
        "total_challenges": total_challenges,
        "total_submissions": total_submissions,
        "accepted_submissions": accepted_submissions,
        "class_accuracy_pct": accuracy,
        "most_struggled_topic": "Subqueries & Correlated Joins",
        "top_competency": "Basic DML & SELECT Clauses"
    }

@router.get("/submissions/history")
def get_submission_history(student_id: int = 1, db: Session = Depends(get_db)):
    subs = db.query(DBMSSubmission).filter(DBMSSubmission.student_id == student_id).order_by(DBMSSubmission.created_at.desc()).all()
    result = []
    for s in subs:
        ch = db.query(DBMSChallenge).filter(DBMSChallenge.id == s.challenge_id).first()
        eval_det = None
        try:
            eval_det = json.loads(s.eval_details_json) if s.eval_details_json else None
        except Exception:
            pass

        result.append({
            "id": s.id,
            "challenge_id": s.challenge_id,
            "challenge_title": ch.title if ch else f"Challenge #{s.challenge_id}",
            "submitted_query": s.submitted_query,
            "status": s.status,
            "execution_time_ms": s.execution_time_ms,
            "points_earned": s.points_earned,
            "error_message": s.error_message,
            "eval_details": eval_det,
            "created_at": s.created_at.isoformat() if s.created_at else ""
        })
    return {"submissions": result}

@router.get("/submissions/{id}")
def get_submission_detail(id: int, db: Session = Depends(get_db)):
    s = db.query(DBMSSubmission).filter(DBMSSubmission.id == id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Submission not found")
    ch = db.query(DBMSChallenge).filter(DBMSChallenge.id == s.challenge_id).first()
    
    eval_det = None
    try:
        eval_det = json.loads(s.eval_details_json) if s.eval_details_json else None
    except Exception:
        pass

    return {
        "id": s.id,
        "challenge_id": s.challenge_id,
        "challenge_title": ch.title if ch else f"Challenge #{s.challenge_id}",
        "submitted_query": s.submitted_query,
        "status": s.status,
        "execution_time_ms": s.execution_time_ms,
        "points_earned": s.points_earned,
        "error_message": s.error_message,
        "eval_details": eval_det,
        "created_at": s.created_at.isoformat() if s.created_at else ""
    }

@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    return {
        "leaderboard": [
            {
                "student_id": 1,
                "student_name": "Alex Rivera",
                "total_points": 850,
                "challenges_solved": 14,
                "accuracy": 93.3,
                "streak": 5
            },
            {
                "student_id": 2,
                "student_name": "Beatriz Silva",
                "total_points": 720,
                "challenges_solved": 12,
                "accuracy": 88.5,
                "streak": 4
            },
            {
                "student_id": 3,
                "student_name": "Charles Babbage",
                "total_points": 640,
                "challenges_solved": 10,
                "accuracy": 85.0,
                "streak": 3
            },
            {
                "student_id": 4,
                "student_name": "Diana Prince",
                "total_points": 510,
                "challenges_solved": 8,
                "accuracy": 80.0,
                "streak": 2
            },
            {
                "student_id": 5,
                "student_name": "Ethan Hunt",
                "total_points": 420,
                "challenges_solved": 6,
                "accuracy": 75.0,
                "streak": 1
            }
        ]
    }
