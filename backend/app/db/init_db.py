import json
from app.db.database import SessionLocal, engine, Base
from app.db.models import User, Module, Material, DocumentChunk, Lesson, AIQuestion, Quiz, QuizAttempt, Announcement

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Ensure slides_json column exists in materials table (SQLite schema migration)
    try:
        from sqlalchemy import text
        db.execute(text("ALTER TABLE materials ADD COLUMN slides_json TEXT"))
        db.commit()
    except Exception:
        pass  # Column already exists

    # 1. Primary Users
    trainer = db.query(User).filter(User.email == "christy@skct.edu.in").first()
    if not trainer:
        trainer = User(
            email="christy@skct.edu.in",
            name="Prof. Christy (SKCT)",
            password_hash="DBMS@123",
            role="TRAINER",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        )
        db.add(trainer)

    student1 = db.query(User).filter(User.email == "alex.rivera@skct.edu.in").first()
    if not student1:
        student1 = User(
            email="alex.rivera@skct.edu.in",
            name="Alex Rivera",
            role="STUDENT",
            avatar_url="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"
        )
        db.add(student1)

    db.commit()

    # 2. 10 DBMS Course Modules Curriculum
    dbms_modules_data = [
        {
            "code": "DBMS-101",
            "title": "Module 1: Introduction to DBMS",
            "description": "Database Management Systems vs traditional File Systems, data independence, DBMS architecture, and core data abstractions.",
            "order": 1,
            "filename": "DBMS_Mod1_Intro.pdf",
            "slides": [
                {"title": "Slide 1: Database Management Systems Overview", "content": "A DBMS is software for storing, querying, and managing structured data safely with concurrency control, transaction guarantees, and crash recovery."},
                {"title": "Slide 2: DBMS vs File Processing Systems", "content": "File systems suffer from data redundancy, inconsistency, difficulty in accessing data, isolation issues, and lack of atomic updates."},
                {"title": "Slide 3: Levels of Data Abstraction", "content": "Physical Level (how data is stored), Logical Level (what data is stored), and View Level (customized user perspectives)."}
            ],
            "questions": [
                {
                    "question": "Which of the following is a major disadvantage of traditional file processing systems?",
                    "options": ["A) High query execution speed", "B) Data redundancy and inconsistency", "C) Automatic concurrency control", "D) Strong data integrity"],
                    "correct_answer": "B) Data redundancy and inconsistency",
                    "explanation": "File systems lack centralized metadata management, leading to duplicate data and inconsistencies across files.",
                    "difficulty": "easy",
                    "source_page": 2
                },
                {
                    "question": "What level of data abstraction describes HOW the data is physically stored on disk storage?",
                    "options": ["A) Logical Level", "B) View Level", "C) Physical Level", "D) Conceptual Level"],
                    "correct_answer": "C) Physical Level",
                    "explanation": "The physical level describes low-level data structures and byte storage details on physical storage media.",
                    "difficulty": "easy",
                    "source_page": 3
                }
            ]
        },
        {
            "code": "DBMS-102",
            "title": "Module 2: Database Architecture",
            "description": "ANSI-SPARC 3-Schema Architecture, Logical and Physical Data Independence, and Client-Server DBMS models.",
            "order": 2,
            "filename": "DBMS_Mod2_Architecture.pdf",
            "slides": [
                {"title": "Slide 1: Three-Schema Architecture", "content": "Divides the database into External Schema (User Views), Conceptual Schema (Logical Design), and Internal Schema (Physical Storage)."},
                {"title": "Slide 2: Data Independence", "content": "Logical Data Independence enables changing the conceptual schema without altering view schemas. Physical Data Independence enables changing physical storage without altering conceptual schemas."},
                {"title": "Slide 3: Client-Server & Multi-Tier DBMS", "content": "Modern DBMS systems separate user interfaces (frontend), application servers (business logic), and database engines (data store)."}
            ],
            "questions": [
                {
                    "question": "The capacity to modify the physical schema without requiring changes to the conceptual schema is known as:",
                    "options": ["A) Logical Data Independence", "B) Physical Data Independence", "C) Referential Integrity", "D) View Abstraction"],
                    "correct_answer": "B) Physical Data Independence",
                    "explanation": "Physical Data Independence hides physical storage reorganization (e.g. adding B-tree indexes) from conceptual schemas.",
                    "difficulty": "medium",
                    "source_page": 2
                }
            ]
        },
        {
            "code": "DBMS-103",
            "title": "Module 3: Data Models & ER Diagramming",
            "description": "Entity-Relationship (ER) modeling, entities, attributes, relationships, cardinalities, weak entities, and extended ER features.",
            "order": 3,
            "filename": "DBMS_Mod3_ER_Models.pdf",
            "slides": [
                {"title": "Slide 1: ER Model Concepts", "content": "Entities represent real-world objects. Attributes describe properties (Simple, Composite, Multi-valued, Derived)."},
                {"title": "Slide 2: Relationship Sets & Cardinalities", "content": "Associations between entities: 1-to-1, 1-to-Many, Many-to-1, and Many-to-Many with participation constraints (Total vs Partial)."},
                {"title": "Slide 3: Weak Entity Sets", "content": "Entities that do not have a primary key of their own and depend on an identifying owner entity set via an identifying relationship."}
            ],
            "questions": [
                {
                    "question": "Which type of attribute can be divided into smaller sub-parts (e.g. Full Name -> First Name, Last Name)?",
                    "options": ["A) Multi-valued Attribute", "B) Composite Attribute", "C) Derived Attribute", "D) Key Attribute"],
                    "correct_answer": "B) Composite Attribute",
                    "explanation": "Composite attributes can be broken down into component sub-attributes.",
                    "difficulty": "easy",
                    "source_page": 1
                }
            ]
        },
        {
            "code": "DBMS-104",
            "title": "Module 4: Relational Model & Relational Algebra",
            "description": "Relational keys, tuples, integrity constraints (Entity, Referential), and Relational Algebra operations (σ, π, ×, ⋈).",
            "order": 4,
            "filename": "DBMS_Mod4_Relational_Algebra.pdf",
            "slides": [
                {"title": "Slide 1: Relational Model Fundamentals", "content": "A relation is a table with rows (tuples) and columns (attributes). Candidate keys uniquely identify tuples; foreign keys reference primary keys."},
                {"title": "Slide 2: Basic Relational Algebra Operations", "content": "Selection (σ) filters rows; Projection (π) selects columns; Cartesian Product (×) combines all tuple pairs."},
                {"title": "Slide 3: Natural Join & Set Operations", "content": "Natural Join (⋈) pairs tuples based on matching attribute names. Union (∪), Intersection (∩), and Set Difference (-)."}
            ],
            "questions": [
                {
                    "question": "Which relational algebra operator selects specific columns from a relation while eliminating duplicate tuples?",
                    "options": ["A) Selection (σ)", "B) Projection (π)", "C) Natural Join (⋈)", "D) Cartesian Product (×)"],
                    "correct_answer": "B) Projection (π)",
                    "explanation": "Projection (π) yields a vertical subset of attributes from a relation.",
                    "difficulty": "medium",
                    "source_page": 2
                }
            ]
        },
        {
            "code": "DBMS-105",
            "title": "Module 5: Structured Query Language (SQL)",
            "description": "DDL, DML, DCL commands, complex queries, INNER/LEFT/RIGHT/FULL JOINs, GROUP BY, HAVING, and correlated subqueries.",
            "order": 5,
            "filename": "DBMS_Mod5_SQL_Mastery.pdf",
            "slides": [
                {"title": "Slide 1: SQL Data Definition & Manipulation", "content": "DDL: CREATE, ALTER, DROP. DML: SELECT, INSERT, UPDATE, DELETE. Integrity constraints: NOT NULL, UNIQUE, CHECK, FOREIGN KEY."},
                {"title": "Slide 2: SQL Joins Demystified", "content": "INNER JOIN returns matching records. LEFT OUTER JOIN retains all left records. RIGHT OUTER JOIN retains all right records."},
                {"title": "Slide 3: Aggregations & Grouping", "content": "COUNT(), SUM(), AVG(), MIN(), MAX() with GROUP BY. HAVING clause filters aggregated groups."}
            ],
            "questions": [
                {
                    "question": "Which SQL clause must be used to filter groups AFTER aggregate calculations have been computed?",
                    "options": ["A) WHERE", "B) HAVING", "C) ORDER BY", "D) GROUP BY"],
                    "correct_answer": "B) HAVING",
                    "explanation": "WHERE filters individual rows prior to grouping; HAVING filters aggregated groups after GROUP BY.",
                    "difficulty": "easy",
                    "source_page": 3
                }
            ]
        },
        {
            "code": "DBMS-106",
            "title": "Module 6: Functional Dependencies",
            "description": "Functional Dependencies (FDs), closure of attribute sets (X+), Armstrong's Axioms, canonical cover, and dependency preservation.",
            "order": 6,
            "filename": "DBMS_Mod6_Functional_Dependencies.pdf",
            "slides": [
                {"title": "Slide 1: Defining Functional Dependencies", "content": "X → Y means the value of attribute set X uniquely determines the value of attribute set Y in every valid relation state."},
                {"title": "Slide 2: Armstrong's Axioms", "content": "Reflexivity (if Y ⊆ X, X → Y), Augmentation (if X → Y, XZ → YZ), Transitivity (if X → Y and Y → Z, X → Z)."},
                {"title": "Slide 3: Attribute Closure Algorithm", "content": "Computing X+ under a set of FDs to determine candidate keys and superkeys."}
            ],
            "questions": [
                {
                    "question": "According to Armstrong's Axioms, if X → Y and Y → Z hold in a relation schema, which inference rule proves X → Z?",
                    "options": ["A) Reflexivity Rule", "B) Augmentation Rule", "C) Transitivity Rule", "D) Decomposition Rule"],
                    "correct_answer": "C) Transitivity Rule",
                    "explanation": "Transitivity states that if X determines Y and Y determines Z, then X determines Z.",
                    "difficulty": "medium",
                    "source_page": 2
                }
            ]
        },
        {
            "code": "DBMS-107",
            "title": "Module 7: Normalization (1NF to BCNF)",
            "description": "Insertion, deletion, and update anomalies, First Normal Form (1NF), 2NF (full FD), 3NF (transitive FD), and Boyce-Codd Normal Form (BCNF).",
            "order": 7,
            "filename": "DBMS_Mod7_Normalization.pdf",
            "slides": [
                {"title": "Slide 1: Purpose of Normalization", "content": "Normalizing relations eliminates data redundancy and update anomalies while preserving functional dependencies and lossless joins."},
                {"title": "Slide 2: First & Second Normal Forms", "content": "1NF requires atomic attribute values. 2NF eliminates partial dependencies (non-prime attributes must depend on the full primary key)."},
                {"title": "Slide 3: 3NF vs BCNF", "content": "3NF eliminates transitive dependencies. BCNF requires that for every non-trivial FD X → Y, X must be a superkey."}
            ],
            "questions": [
                {
                    "question": "A relation schema R is in Boyce-Codd Normal Form (BCNF) if for every non-trivial functional dependency X → Y:",
                    "options": ["A) Y is a prime attribute", "B) X is a superkey", "C) X is atomic", "D) Y is NULL"],
                    "correct_answer": "B) X is a superkey",
                    "explanation": "BCNF strictly requires that the determinant X in any non-trivial FD X → Y must be a superkey.",
                    "difficulty": "hard",
                    "source_page": 3
                }
            ]
        },
        {
            "code": "DBMS-108",
            "title": "Module 8: Transactions & Concurrency Control",
            "description": "ACID properties, serializability, schedule isolation levels, Two-Phase Locking (2PL), Strict 2PL, and deadlock detection/prevention.",
            "order": 8,
            "filename": "DBMS_Mod8_Transactions.pdf",
            "slides": [
                {"title": "Slide 1: ACID Guarantees", "content": "Atomicity (all-or-nothing), Consistency (integrity constraints), Isolation (concurrency control), Durability (persisted logs)."},
                {"title": "Slide 2: Concurrency & Serializability", "content": "Conflict serializable schedules produce outputs equivalent to some serial execution order. Conflict operations: Read-Write, Write-Read, Write-Write."},
                {"title": "Slide 3: Two-Phase Locking Protocols", "content": "Growing Phase (acquiring locks) and Shrinking Phase (releasing locks). Strict 2PL holds exclusive locks until commit."}
            ],
            "questions": [
                {
                    "question": "Which concurrency control protocol ensures conflict serializability by holding all exclusive locks until transaction commit?",
                    "options": ["A) Simple Timestamp Ordering", "B) Strict Two-Phase Locking (Strict 2PL)", "C) Optimistic Concurrency Control", "D) Basic 2PL without holding locks"],
                    "correct_answer": "B) Strict Two-Phase Locking (Strict 2PL)",
                    "explanation": "Strict 2PL prevents dirty reads and cascading rollbacks by holding exclusive locks until transaction completion.",
                    "difficulty": "hard",
                    "source_page": 3
                }
            ]
        },
        {
            "code": "DBMS-109",
            "title": "Module 9: Indexing & B+ Trees",
            "description": "Primary, secondary, dense, and sparse indexes, B-Trees, B+ Trees architecture, fan-out factor, and hash indexing.",
            "order": 9,
            "filename": "DBMS_Mod9_Indexing_BPlusTrees.pdf",
            "slides": [
                {"title": "Slide 1: Indexing Concepts", "content": "Indexes speed up data retrieval by maintaining auxiliary search structures at the cost of additional disk space and update overhead."},
                {"title": "Slide 2: B+ Tree Data Structure", "content": "Balanced search tree where internal nodes contain search keys and leaf nodes contain actual data pointers with sequential leaf linking."},
                {"title": "Slide 3: Why B+ Trees for Disk Storage", "content": "High node fan-out minimizes tree height (typically 3-4 levels for millions of rows), reducing disk I/O operations."}
            ],
            "questions": [
                {
                    "question": "Why are B+ Trees preferred over Binary Search Trees (BSTs) for indexing disk-based database tables?",
                    "options": ["A) High node fan-out reduces tree height and disk block reads", "B) B+ trees do not require any memory", "C) BSTs allow duplicate keys", "D) B+ trees store all data in internal nodes"],
                    "correct_answer": "A) High node fan-out reduces tree height and disk block reads",
                    "explanation": "B+ Trees have large node branching factors (fan-out), minimizing tree height and drastically reducing disk I/O reads.",
                    "difficulty": "medium",
                    "source_page": 3
                }
            ]
        },
        {
            "code": "DBMS-110",
            "title": "Module 10: Query Processing & Optimization",
            "description": "Query processing pipeline (Parsing, Translation, Optimization, Execution), relational expression equivalence, cost-based optimizer, and join algorithms.",
            "order": 10,
            "filename": "DBMS_Mod10_Query_Optimization.pdf",
            "slides": [
                {"title": "Slide 1: Query Execution Steps", "content": "High-level SQL query -> Parsing & Translation -> Relational Algebra Expression -> Query Optimizer -> Execution Plan -> Database Engine."},
                {"title": "Slide 2: Cost-Based Query Optimizer", "content": "Estimates CPU and disk I/O cost using database statistics (catalog histograms, tuple counts, block counts)."},
                {"title": "Slide 3: Join Execution Algorithms", "content": "Nested Loop Join, Block Nested Loop Join, Hash Join, and Sort-Merge Join."}
            ],
            "questions": [
                {
                    "question": "In query optimization, what component estimates the execution cost of alternative query evaluation plans?",
                    "options": ["A) Query Parser", "B) Cost-Based Optimizer", "C) Lexical Analyzer", "D) Transaction Manager"],
                    "correct_answer": "B) Cost-Based Optimizer",
                    "explanation": "The cost-based optimizer uses catalog statistics to estimate disk I/O and CPU costs for alternative execution trees.",
                    "difficulty": "medium",
                    "source_page": 2
                }
            ]
        }
    ]

    for m_data in dbms_modules_data:
        mod = db.query(Module).filter(Module.code == m_data["code"]).first()
        if not mod:
            mod = Module(
                code=m_data["code"],
                title=m_data["title"],
                description=m_data["description"],
                order=m_data["order"]
            )
            db.add(mod)
            db.commit()
            db.refresh(mod)

        pass

    # 6. Seed DBMS Virtual Lab Pre-built Databases
    from app.services.dbms_sandbox import DBMSSandbox
    from app.db.models import DBMSDatabase, DBMSChallenge

    for db_name, db_info in DBMSSandbox.PREBUILT_DATABASES.items():
        existing_db = db.query(DBMSDatabase).filter(DBMSDatabase.name == db_name).first()
        if not existing_db:
            db_record = DBMSDatabase(
                name=db_info["name"],
                display_name=db_info["name"],
                description=db_info["description"],
                category=db_info["category"],
                tables_schema_json=json.dumps(db_info["tables"]),
                sample_seed_sql=db_info["seed_sql"],
                table_count=len(db_info["tables"])
            )
            db.add(db_record)

    # 7. Seed DBMS Practice Challenges
    existing_challenges_count = db.query(DBMSChallenge).count()
    if existing_challenges_count == 0:
        seed_challenges = [
            {
                "title": "Basic Projection: List All Engineering Employees",
                "description": "Write a query to retrieve the first_name, last_name, job_title, and salary of all employees working in the 'Engineering' department (dept_id = 10). Sort the results alphabetically by last_name.",
                "topic": "SELECT & WHERE",
                "difficulty": "Easy",
                "database_name": "Employee Management",
                "starter_sql": "-- Write your SQL query below\nSELECT \nFROM employees\nWHERE ;\n",
                "reference_sql": "SELECT first_name, last_name, job_title, salary FROM employees WHERE dept_id = 10 ORDER BY last_name ASC;",
                "competency_name": "Filtering & Sorting",
                "max_score": 100.0,
                "test_cases": [
                    {"name": "Department Filter Test (dept_id = 10)", "is_hidden": False, "description": "Ensures only Engineering department employees are returned."},
                    {"name": "Alphabetical Ordering Test", "is_hidden": False, "description": "Checks if output rows are sorted by last_name in ascending order."},
                    {"name": "Column Selection Validation", "is_hidden": True, "description": "Verifies exact 4 target columns (first_name, last_name, job_title, salary)."}
                ]
            },
            {
                "title": "Department Salary Aggregation & High Pay Threshold",
                "description": "Calculate the total salary payout (sum) and average salary for each department. Return department names alongside total_salary and avg_salary, filtering for departments where average salary exceeds $100,000.",
                "topic": "GROUP BY & HAVING",
                "difficulty": "Medium",
                "database_name": "Employee Management",
                "starter_sql": "-- Write your SQL aggregation query below\nSELECT d.dept_name, SUM(e.salary) AS total_salary, AVG(e.salary) AS avg_salary\nFROM departments d\nJOIN employees e ON d.dept_id = e.dept_id\n;\n",
                "reference_sql": "SELECT d.dept_name, SUM(e.salary) AS total_salary, AVG(e.salary) AS avg_salary FROM departments d JOIN employees e ON d.dept_id = e.dept_id GROUP BY d.dept_id, d.dept_name HAVING AVG(e.salary) > 100000 ORDER BY avg_salary DESC;",
                "competency_name": "Aggregations & GROUP BY",
                "max_score": 100.0,
                "test_cases": [
                    {"name": "GROUP BY Department Validation", "is_hidden": False, "description": "Checks that employee records are grouped per department."},
                    {"name": "HAVING Filter (> $100k)", "is_hidden": False, "description": "Verifies low-paying departments are filtered out."},
                    {"name": "Descending Salary Sort", "is_hidden": True, "description": "Checks sort order by average salary descending."}
                ]
            },
            {
                "title": "High-Value E-Commerce Customer Orders",
                "description": "Identify all Platinum membership customers who have placed completed orders with a total amount greater than $1,000. Return customer name, city, order_date, and total_amount.",
                "topic": "INNER JOIN",
                "difficulty": "Medium",
                "database_name": "E-Commerce",
                "starter_sql": "-- Write your E-Commerce JOIN query below\nSELECT \nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\n;\n",
                "reference_sql": "SELECT c.name, c.city, o.order_date, o.total_amount FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE c.membership_tier = 'Platinum' AND o.total_amount > 1000 AND o.status = 'COMPLETED';",
                "competency_name": "JOIN Operations",
                "max_score": 100.0,
                "test_cases": [
                    {"name": "Customer & Order Join Validation", "is_hidden": False, "description": "Verifies correct JOIN syntax between customers and orders."},
                    {"name": "Membership Tier & Total Amount Filter", "is_hidden": False, "description": "Checks filtering for Platinum tier and > $1000 order total."}
                ]
            },
            {
                "title": "Subquery: Employees Earning Above Department Average",
                "description": "Write a correlated subquery to find all employees who earn more than the average salary of their own respective department. Display emp_id, first_name, last_name, salary, and dept_id.",
                "topic": "Subqueries & CTEs",
                "difficulty": "Hard",
                "database_name": "Employee Management",
                "starter_sql": "-- Write your correlated subquery\nSELECT emp_id, first_name, last_name, salary, dept_id\nFROM employees e1\nWHERE salary > (\n    -- Subquery here\n);\n",
                "reference_sql": "SELECT e1.emp_id, e1.first_name, e1.last_name, e1.salary, e1.dept_id FROM employees e1 WHERE e1.salary > (SELECT AVG(e2.salary) FROM employees e2 WHERE e2.dept_id = e1.dept_id);",
                "competency_name": "Subqueries & CTEs",
                "max_score": 100.0,
                "test_cases": [
                    {"name": "Correlated Subquery Evaluation", "is_hidden": False, "description": "Verifies row-by-row average calculation per department."},
                    {"name": "Salary Threshold Comparison", "is_hidden": True, "description": "Validates that returned employees strictly earn above department mean."}
                ]
            },
            {
                "title": "Window Functions: Dense Rank of Salaries by Department",
                "description": "Use the DENSE_RANK() window function to rank employees by salary within each department. Display dept_id, first_name, last_name, salary, and salary_rank.",
                "topic": "Window Functions",
                "difficulty": "Expert",
                "database_name": "Employee Management",
                "starter_sql": "-- Use DENSE_RANK() OVER (PARTITION BY ... ORDER BY ...)\nSELECT dept_id, first_name, last_name, salary,\n       DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS salary_rank\nFROM employees;\n",
                "reference_sql": "SELECT dept_id, first_name, last_name, salary, DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS salary_rank FROM employees ORDER BY dept_id, salary_rank;",
                "competency_name": "Query Optimization & Window Functions",
                "max_score": 100.0,
                "test_cases": [
                    {"name": "Window Function Partition Check", "is_hidden": False, "description": "Verifies PARTITION BY dept_id logic."},
                    {"name": "Rank Ordering Check", "is_hidden": True, "description": "Checks DENSE_RANK values match descending salary ordering."}
                ]
            }
        ]

        for sc in seed_challenges:
            c_obj = DBMSChallenge(
                title=sc["title"],
                description=sc["description"],
                topic=sc["topic"],
                difficulty=sc["difficulty"],
                database_name=sc["database_name"],
                starter_sql=sc["starter_sql"],
                reference_sql=sc["reference_sql"],
                test_cases_json=json.dumps(sc["test_cases"]),
                competency_name=sc["competency_name"],
                max_score=sc["max_score"],
                is_published=True
            )
            db.add(c_obj)

    db.commit()
    db.close()
    print("Database ready with DBMS Virtual Lab databases and challenges!")

if __name__ == "__main__":
    init_db()
