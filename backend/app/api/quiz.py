import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Quiz, QuizAttempt, AIQuestion, Module, Material, DocumentChunk
from app.services.llama_service import LlamaEvaluationService

router = APIRouter(prefix="/quiz", tags=["Quiz Assessment"])

class GenerateAIQuizRequest(BaseModel):
    module_id: int
    num_questions: int = 5
    difficulty: str = "medium"
    style: str = "Conceptual"

class QuestionEditSchema(BaseModel):
    question_text: str
    options: List[str]
    correct_answer: str
    explanation: str
    difficulty: str

class PublishQuizRequest(BaseModel):
    module_id: int
    title: str
    description: str
    duration_minutes: int = 15
    question_ids: List[int]

class PublicQuizSubmitSchema(BaseModel):
    quiz_id: int
    student_name: Optional[str] = "Student Guest"
    answers: Dict[str, str]  # question_id -> chosen option string
    time_taken_seconds: int = 120

def sync_approved_questions_to_quiz(db: Session, module_id: int):
    """Automatically synchronizes all APPROVED/PUBLISHED AIQuestions into the live Student Portal Quiz for a module."""
    approved_questions = db.query(AIQuestion).filter(
        AIQuestion.module_id == module_id,
        AIQuestion.status.in_(["APPROVED", "PUBLISHED"])
    ).all()

    if not approved_questions:
        return

    formatted_questions = []
    for idx, q in enumerate(approved_questions):
        try:
            opts = json.loads(q.options_json) if isinstance(q.options_json, str) else q.options_json
        except Exception:
            opts = ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"]

        formatted_questions.append({
            "question_id": str(idx + 1),
            "type": "Multiple Choice",
            "question": q.question_text,
            "options": opts,
            "correct_answer": q.correct_answer,
            "explanation": q.explanation,
            "difficulty": q.difficulty,
            "rubric": f"Option {q.correct_answer[0]} is correct.",
            "max_score": 20.0,
            "ideal_answer": q.correct_answer,
            "source_document": q.source_document,
            "source_page": q.source_page
        })

    module = db.query(Module).filter(Module.id == module_id).first()
    mod_code = module.code if module else f"MOD-{module_id}"
    mod_title = module.title if module else "DBMS Module"

    existing_quiz = db.query(Quiz).filter(Quiz.module_id == module_id, Quiz.is_published == True).first()
    if existing_quiz:
        existing_quiz.questions_json = json.dumps(formatted_questions)
        existing_quiz.max_score = len(formatted_questions) * 20.0
        existing_quiz.description = f"Qwen 2.5 RAG Assessed Multiple Choice Examination ({len(formatted_questions)} Questions)"
    else:
        new_quiz = Quiz(
            module_id=module_id,
            title=f"{mod_code} Qwen 2.5 RAG Assessment",
            description=f"Qwen 2.5 RAG Assessed Multiple Choice Examination ({len(formatted_questions)} Questions)",
            duration_minutes=15,
            passing_score_pct=50.0,
            is_published=True,
            questions_json=json.dumps(formatted_questions),
            max_score=len(formatted_questions) * 20.0
        )
        db.add(new_quiz)

    db.commit()

@router.get("/all")
def get_all_quizzes(db: Session = Depends(get_db)):
    quizzes = db.query(Quiz).filter(Quiz.is_published == True).all()
    result = []
    for q in quizzes:
        mod = db.query(Module).filter(Module.id == q.module_id).first()
        questions = json.loads(q.questions_json)
        result.append({
            "id": q.id,
            "module_id": q.module_id,
            "module_code": mod.code if mod else "MOD",
            "module_title": mod.title if mod else "General DBMS",
            "title": q.title,
            "description": q.description,
            "duration_minutes": q.duration_minutes,
            "passing_score_pct": q.passing_score_pct,
            "questions_count": len(questions),
            "max_score": q.max_score,
            "questions": questions
        })
    return result

@router.get("/module/{module_id}")
def get_quizzes_by_module(module_id: int, db: Session = Depends(get_db)):
    quizzes = db.query(Quiz).filter(Quiz.module_id == module_id, Quiz.is_published == True).all()
    result = []
    for q in quizzes:
        questions = json.loads(q.questions_json)
        result.append({
            "id": q.id,
            "module_id": q.module_id,
            "title": q.title,
            "description": q.description,
            "duration_minutes": q.duration_minutes,
            "questions": questions,
            "max_score": q.max_score
        })
    return result

@router.post("/submit")
def submit_student_quiz(data: PublicQuizSubmitSchema, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == data.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
        
    questions = json.loads(quiz.questions_json)
    total_questions = len(questions)
    correct_count = 0
    detailed_feedback = []

    for q in questions:
        q_id = str(q.get("question_id", ""))
        user_answer = data.answers.get(q_id, "")
        correct_ans = q.get("correct_answer", "")
        
        # Check if user answer matches
        is_correct = (user_answer.strip().lower() == correct_ans.strip().lower()) or (user_answer and user_answer[0] == correct_ans[0])
        if is_correct:
            correct_count += 1
            
        detailed_feedback.append({
            "question_id": q_id,
            "question": q.get("question", ""),
            "user_answer": user_answer if user_answer else "Not Answered",
            "correct_answer": correct_ans,
            "is_correct": is_correct,
            "explanation": q.get("explanation", ""),
            "source_document": q.get("source_document", "DBMS_Module.pdf"),
            "source_page": q.get("source_page", 1)
        })

    score_pct = (correct_count / total_questions * 100.0) if total_questions > 0 else 0.0
    score_obtained = (score_pct / 100.0) * quiz.max_score

    attempt = QuizAttempt(
        quiz_id=data.quiz_id,
        score_obtained=score_obtained,
        max_score=quiz.max_score,
        percentage=round(score_pct, 1),
        time_taken_seconds=data.time_taken_seconds,
        answers_json=json.dumps(data.answers)
    )
    db.add(attempt)
    db.commit()

    return {
        "attempt_id": attempt.id,
        "score_obtained": score_obtained,
        "max_score": quiz.max_score,
        "percentage": round(score_pct, 1),
        "passed": score_pct >= quiz.passing_score_pct,
        "correct_count": correct_count,
        "total_questions": total_questions,
        "feedback": detailed_feedback
    }

# --- TRAINER RAG AI QUESTION REVIEW & PUBLISHING ENDPOINTS ---

@router.post("/ai/generate")
async def generate_ai_questions(req: GenerateAIQuizRequest, db: Session = Depends(get_db)):
    module = db.query(Module).filter(Module.id == req.module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
        
    materials = db.query(Material).filter(Material.module_id == req.module_id).all()
    chunks_list = []
    
    for mat in materials:
        db_chunks = db.query(DocumentChunk).filter(DocumentChunk.material_id == mat.id).all()
        for c in db_chunks:
            chunks_list.append({
                "text": c.chunk_text,
                "document": mat.title,
                "page": c.page_number
            })
            
    if not chunks_list:
        chunks_list.append({
            "text": f"Lecture material for {module.title}. Covers relational concepts, indexing, transactions, and SQL.",
            "document": f"{module.code}_Syllabus.pdf",
            "page": 1
        })

    generated = await LlamaEvaluationService.generate_mcqs_from_rag(
        module_title=module.title,
        retrieved_chunks=chunks_list,
        num_questions=req.num_questions,
        difficulty=req.difficulty,
        style=req.style
    )

    created_questions = []
    for q in generated:
        source_info = q.get("source", {})
        doc_name = source_info.get("document", materials[0].title if materials else f"{module.code}_Lecture.pdf")
        page_num = source_info.get("page", 1)

        ai_q = AIQuestion(
            module_id=req.module_id,
            material_id=materials[0].id if materials else None,
            question_text=q.get("question", ""),
            options_json=json.dumps(q.get("options", [])),
            correct_answer=q.get("correct_answer", ""),
            explanation=q.get("explanation", ""),
            difficulty=q.get("difficulty", req.difficulty),
            source_document=doc_name,
            source_page=page_num,
            status="DRAFT"
        )
        db.add(ai_q)
        created_questions.append(ai_q)

    db.commit()

    return {
        "message": f"Successfully generated {len(created_questions)} AI draft questions for Module '{module.code}'",
        "questions_count": len(created_questions)
    }

@router.get("/ai/review-queue")
def get_question_review_queue(db: Session = Depends(get_db)):
    questions = db.query(AIQuestion).order_by(AIQuestion.created_at.desc()).all()
    result = []
    for q in questions:
        mod = db.query(Module).filter(Module.id == q.module_id).first()
        result.append({
            "id": q.id,
            "module_id": q.module_id,
            "module_code": mod.code if mod else "MOD",
            "module_title": mod.title if mod else "Module",
            "question_text": q.question_text,
            "options": json.loads(q.options_json) if isinstance(q.options_json, str) else q.options_json,
            "correct_answer": q.correct_answer,
            "explanation": q.explanation,
            "difficulty": q.difficulty,
            "source_document": q.source_document,
            "source_page": q.source_page,
            "status": q.status,
            "created_at": q.created_at.isoformat() if q.created_at else ""
        })
    return result

@router.post("/ai/approve/{question_id}")
def approve_ai_question(question_id: int, db: Session = Depends(get_db)):
    q = db.query(AIQuestion).filter(AIQuestion.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    q.status = "APPROVED"
    db.commit()

    # Immediately sync approved question to live Student Portal Quiz
    sync_approved_questions_to_quiz(db, q.module_id)

    return {
        "message": "Question approved successfully and synced to Student Portal in real-time!", 
        "question_id": question_id
    }

@router.post("/ai/approve-all/{module_id}")
def approve_all_module_questions(module_id: int, db: Session = Depends(get_db)):
    questions = db.query(AIQuestion).filter(AIQuestion.module_id == module_id).all()
    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for module")
    
    for q in questions:
        q.status = "APPROVED"
    db.commit()

    sync_approved_questions_to_quiz(db, module_id)

    return {
        "message": f"Approved all {len(questions)} questions for Module {module_id} and published to Student Portal!",
        "count": len(questions)
    }

@router.put("/ai/edit/{question_id}")
def edit_ai_question(question_id: int, data: QuestionEditSchema, db: Session = Depends(get_db)):
    q = db.query(AIQuestion).filter(AIQuestion.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    q.question_text = data.question_text
    q.options_json = json.dumps(data.options)
    q.correct_answer = data.correct_answer
    q.explanation = data.explanation
    q.difficulty = data.difficulty
    db.commit()

    if q.status in ["APPROVED", "PUBLISHED"]:
        sync_approved_questions_to_quiz(db, q.module_id)

    return {"message": "Question updated successfully", "question_id": question_id}

@router.delete("/ai/reject/{question_id}")
def reject_ai_question(question_id: int, db: Session = Depends(get_db)):
    q = db.query(AIQuestion).filter(AIQuestion.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    mod_id = q.module_id
    db.delete(q)
    db.commit()

    sync_approved_questions_to_quiz(db, mod_id)

    return {"message": "Question deleted from review queue", "question_id": question_id}

@router.post("/publish-quiz")
def publish_quiz_from_approved_questions(data: PublishQuizRequest, db: Session = Depends(get_db)):
    questions = db.query(AIQuestion).filter(AIQuestion.id.in_(data.question_ids)).all()
    if not questions:
        raise HTTPException(status_code=400, detail="No valid questions selected")

    formatted_quiz_questions = []
    for idx, q in enumerate(questions):
        q.status = "PUBLISHED"
        opts = json.loads(q.options_json) if isinstance(q.options_json, str) else q.options_json
        formatted_quiz_questions.append({
            "question_id": str(idx + 1),
            "type": "Multiple Choice",
            "question": q.question_text,
            "options": opts,
            "correct_answer": q.correct_answer,
            "explanation": q.explanation,
            "rubric": f"Option {q.correct_answer[0]} is correct.",
            "max_score": 25.0,
            "ideal_answer": q.correct_answer,
            "source_document": q.source_document,
            "source_page": q.source_page
        })

    quiz = Quiz(
        module_id=data.module_id,
        title=data.title,
        description=data.description,
        duration_minutes=data.duration_minutes,
        passing_score_pct=50.0,
        is_published=True,
        questions_json=json.dumps(formatted_quiz_questions),
        max_score=len(formatted_quiz_questions) * 25.0
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    return {
        "message": f"Quiz '{quiz.title}' published successfully to Student LMS!",
        "quiz_id": quiz.id
    }
