from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=True)
    role = Column(String, nullable=False, default="STUDENT")  # TRAINER, PROFESSOR, or STUDENT
    avatar_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    lessons = relationship("Lesson", back_populates="module", cascade="all, delete-orphan")
    materials = relationship("Material", back_populates="module", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="module", cascade="all, delete-orphan")

class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    title = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # PDF, PPT, DOCX, VIDEO
    file_path = Column(String, nullable=False)
    content_text = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    pages_count = Column(Integer, default=1)
    slides_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    module = relationship("Module", back_populates="materials")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("materials.id"), nullable=False)
    chunk_text = Column(Text, nullable=False)
    page_number = Column(Integer, default=1)
    vector_embedding_json = Column(Text, nullable=True)

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    content_type = Column(String, default="VIDEO")  # VIDEO, NOTES, PDF, PPT
    video_url = Column(String, nullable=True)
    content_text = Column(Text, nullable=True)
    duration = Column(String, nullable=True, default="15 mins")
    order = Column(Integer, default=1)

    module = relationship("Module", back_populates="lessons")

class AIQuestion(Base):
    __tablename__ = "ai_questions"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    material_id = Column(Integer, ForeignKey("materials.id"), nullable=True)
    question_text = Column(Text, nullable=False)
    options_json = Column(Text, nullable=False)  # JSON array of 4 options
    correct_answer = Column(String, nullable=False)
    explanation = Column(Text, nullable=False)
    difficulty = Column(String, default="medium")  # easy, medium, hard
    source_document = Column(String, nullable=False)
    source_page = Column(Integer, default=1)
    status = Column(String, default="DRAFT")  # DRAFT, APPROVED, REJECTED, PUBLISHED
    created_at = Column(DateTime, default=datetime.utcnow)

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    duration_minutes = Column(Integer, default=15)
    attempts_allowed = Column(Integer, default=1)
    show_answers_immediately = Column(Boolean, default=True)
    passing_score_pct = Column(Float, default=40.0)
    is_published = Column(Boolean, default=True)
    questions_json = Column(Text, nullable=False)
    max_score = Column(Float, default=100.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    module = relationship("Module", back_populates="quizzes")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    score_obtained = Column(Float, nullable=False, default=0.0)
    max_score = Column(Float, nullable=False, default=100.0)
    percentage = Column(Float, nullable=False, default=0.0)
    time_taken_seconds = Column(Integer, default=120)
    answers_json = Column(Text, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    quiz = relationship("Quiz", back_populates="attempts")

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# --- DBMS VIRTUAL LAB MODELS ---

class DBMSDatabase(Base):
    __tablename__ = "dbms_databases"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, default="General")
    tables_schema_json = Column(Text, nullable=False)  # JSON structure of tables, columns, PKs, FKs
    sample_seed_sql = Column(Text, nullable=False)     # SQL DDL & DML script to seed database
    table_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class DBMSSession(Base):
    __tablename__ = "dbms_sessions"

    id = Column(String, primary_key=True, index=True)  # UUID session token
    student_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    database_name = Column(String, nullable=False)
    schema_name = Column(String, nullable=False)       # Isolated schema/db name
    status = Column(String, default="ACTIVE")          # ACTIVE, EXPIRED, TERMINATED
    queries_executed = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)

class DBMSChallenge(Base):
    __tablename__ = "dbms_challenges"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    topic = Column(String, nullable=False)             # SELECT, JOIN, GROUP BY, CTE, Subquery, Normalization, etc.
    difficulty = Column(String, default="Medium")      # Easy, Medium, Hard, Expert
    database_name = Column(String, nullable=False)     # e.g., Employee Management, E-Commerce
    starter_sql = Column(Text, nullable=True)
    reference_sql = Column(Text, nullable=False)       # Ideal / reference solution query
    expected_output_json = Column(Text, nullable=True) # Pre-computed expected result JSON
    test_cases_json = Column(Text, nullable=False)     # Visible and hidden test cases array
    competency_name = Column(String, nullable=False, default="SQL Queries")
    max_score = Column(Float, default=100.0)
    time_limit_seconds = Column(Integer, default=60)
    is_published = Column(Boolean, default=True)
    created_by_trainer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class DBMSSubmission(Base):
    __tablename__ = "dbms_submissions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    challenge_id = Column(Integer, ForeignKey("dbms_challenges.id"), nullable=False)
    query_text = Column(Text, nullable=False)
    score = Column(Float, default=0.0)
    is_correct = Column(Boolean, default=False)
    execution_time_ms = Column(Float, default=0.0)
    test_results_json = Column(Text, nullable=False)   # Detailed test case results (PASS/FAIL)
    ai_feedback_json = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)

class DBMSQueryHistory(Base):
    __tablename__ = "dbms_query_history"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String, nullable=True)
    database_name = Column(String, nullable=False)
    query_text = Column(Text, nullable=False)
    status = Column(String, default="SUCCESS")         # SUCCESS, ERROR
    rows_affected = Column(Integer, default=0)
    execution_time_ms = Column(Float, default=0.0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class DBMSCompetencyProgress(Base):
    __tablename__ = "dbms_competency_progress"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subskill_name = Column(String, nullable=False)     # SQL Fundamentals, Filtering, Aggregations, JOINs, Subqueries, Normalization, Transactions, Optimization
    score = Column(Float, default=0.0)
    mastery_pct = Column(Float, default=0.0)
    attempts_count = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow)

class DBMSLearningEvent(Base):
    __tablename__ = "dbms_learning_events"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String, nullable=True)
    challenge_id = Column(Integer, nullable=True)
    event_type = Column(String, nullable=False)       # EXECUTE_QUERY, SUBMIT_CHALLENGE, REQUEST_HINT, EXPLAIN_ERROR, DESIGN_SCHEMA
    details_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

