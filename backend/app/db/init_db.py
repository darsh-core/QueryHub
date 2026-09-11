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

    # 3. 10 DSA (Data Structures & Algorithms) Course Modules Curriculum
    dsa_modules_data = [
        {
            "code": "DSA-101",
            "title": "Module 1: Introduction to Data Structures & Complexity",
            "description": "Abstract Data Types (ADTs), Big-O, Big-Omega, Big-Theta asymptotic notations, time-space trade-offs, and amortized complexity analysis.",
            "order": 1,
            "filename": "DSA_Mod1_Intro_Complexity.pdf",
            "slides": [
                {"title": "Slide 1: Abstract Data Types & Data Structures", "content": "An ADT specifies what operations can be performed (e.g. Stack, Queue, Map), while a Data Structure is the concrete implementation in memory."},
                {"title": "Slide 2: Asymptotic Notations (Big-O, Ω, Θ)", "content": "Big-O defines upper bounds (worst-case), Big-Omega defines lower bounds (best-case), and Big-Theta defines tight bound analysis of running time."},
                {"title": "Slide 3: Space & Time Trade-offs", "content": "Analyzing auxiliary memory usage versus CPU execution cycles. Amortized time complexity averages operation costs over a sequence of operations."}
            ],
            "questions": [
                {
                    "question": "Which asymptotic notation describes the strict TIGHT BOUND (both upper and lower) execution time of an algorithm?",
                    "options": ["A) Big-O (O)", "B) Big-Omega (Ω)", "C) Big-Theta (Θ)", "D) Little-o (o)"],
                    "correct_answer": "C) Big-Theta (Θ)",
                    "explanation": "Big-Theta (Θ) specifies that a function is bounded both above and below by constant multiples of g(n).",
                    "difficulty": "easy",
                    "source_page": 2
                },
                {
                    "question": "What is the amortized time complexity of inserting an element into a dynamic array (like Python list or C++ std::vector)?",
                    "options": ["A) O(n)", "B) O(1)", "C) O(log n)", "D) O(n^2)"],
                    "correct_answer": "B) O(1)",
                    "explanation": "Resizing takes O(n) infrequently when capacity doubles, but averaged over n insertions, each append takes O(1) amortized time.",
                    "difficulty": "medium",
                    "source_page": 3
                }
            ]
        },
        {
            "code": "DSA-102",
            "title": "Module 2: Arrays, Dynamic Arrays & Two-Pointers",
            "description": "Contiguous memory allocation, row/column-major layout, 2D arrays, prefix sums, sliding window, and two-pointer techniques.",
            "order": 2,
            "filename": "DSA_Mod2_Arrays_TwoPointers.pdf",
            "slides": [
                {"title": "Slide 1: Contiguous Array Memory Allocation", "content": "Elements are stored sequentially in adjacent memory blocks. Element lookup by index takes O(1) time via base address math: Addr = Base + index * element_size."},
                {"title": "Slide 2: Two-Pointer Technique", "content": "Using left and right pointers moving towards each other or at different speeds to solve array problems (e.g. 2-Sum sorted, palindrome check, container with most water) in O(n)."},
                {"title": "Slide 3: Sliding Window Pattern", "content": "Maintaining a dynamic window over contiguous sub-arrays to compute maximum sum, longest substring without repeating characters in O(n) time."}
            ],
            "questions": [
                {
                    "question": "Given a sorted array of integers, which algorithm pattern finds two numbers that sum to a target value in O(n) time and O(1) extra space?",
                    "options": ["A) Binary Search Tree", "B) Two-Pointer Technique", "C) Merge Sort", "D) Dynamic Programming"],
                    "correct_answer": "B) Two-Pointer Technique",
                    "explanation": "With two pointers starting at opposite ends, we increment left if sum < target or decrement right if sum > target in linear O(n) time.",
                    "difficulty": "easy",
                    "source_page": 2
                }
            ]
        },
        {
            "code": "DSA-103",
            "title": "Module 3: Linked Lists (Singly, Doubly & Circular)",
            "description": "Node pointers, dynamic memory allocation, singly linked list operations, doubly linked list traversal, cycle detection (Floyd's Fast & Slow pointer).",
            "order": 3,
            "filename": "DSA_Mod3_LinkedLists.pdf",
            "slides": [
                {"title": "Slide 1: Singly Linked Lists", "content": "Non-contiguous memory allocation where each node contains data and a pointer to the next node. Insertion/Deletion at head takes O(1) time."},
                {"title": "Slide 2: Doubly & Circular Linked Lists", "content": "Doubly linked lists contain both next and prev pointers enabling bidirectional traversal. Circular lists link tail node back to head node."},
                {"title": "Slide 3: Floyd's Cycle Detection Algorithm", "content": "Uses two pointers moving at different speeds (Slow = 1 step, Fast = 2 steps). If a loop exists, fast and slow pointers will inevitably meet inside the cycle."}
            ],
            "questions": [
                {
                    "question": "What is the time complexity of detecting a cycle in a Singly Linked List using Floyd's Tortoise and Hare (Fast & Slow pointers) algorithm?",
                    "options": ["A) O(1)", "B) O(log n)", "C) O(n)", "D) O(n^2)"],
                    "correct_answer": "C) O(n)",
                    "explanation": "Floyd's algorithm traverses the list in O(n) time using O(1) additional memory space.",
                    "difficulty": "medium",
                    "source_page": 3
                }
            ]
        },
        {
            "code": "DSA-104",
            "title": "Module 4: Stacks, Queues & Deques",
            "description": "LIFO vs FIFO ordering principles, array & linked list implementations, expression evaluation (Infix, Prefix, Postfix), and Monotonic Stacks.",
            "order": 4,
            "filename": "DSA_Mod4_Stacks_Queues.pdf",
            "slides": [
                {"title": "Slide 1: Stack Architecture (LIFO)", "content": "Last-In, First-Out data structure. Primary operations: Push(x) O(1), Pop() O(1), Peek() O(1). Used in call stacks, undo mechanisms, and parenthetical matching."},
                {"title": "Slide 2: Queue Architecture (FIFO)", "content": "First-In, First-Out data structure. Enqueue(x) adds to rear, Dequeue() removes from front. Circular queues solve array boundary drift."},
                {"title": "Slide 3: Expression Parsing & Monotonic Stack", "content": "Converting Infix to Postfix (Reverse Polish Notation) using Shunting Yard algorithm. Monotonic stacks solve Next Greater Element problems in O(n)."}
            ],
            "questions": [
                {
                    "question": "Which data structure follows the Last-In, First-Out (LIFO) access principle?",
                    "options": ["A) Queue", "B) Stack", "C) Priority Queue", "D) Circular Buffer"],
                    "correct_answer": "B) Stack",
                    "explanation": "Stacks strictly operate on LIFO principle where the last pushed element is the first to be popped.",
                    "difficulty": "easy",
                    "source_page": 1
                }
            ]
        },
        {
            "code": "DSA-105",
            "title": "Module 5: Trees & Binary Search Trees (BST)",
            "description": "Tree terminology, binary trees, Depth-First Traversals (Inorder, Preorder, Postorder), Breadth-First (Level-order), BST operations, and Lowest Common Ancestor (LCA).",
            "order": 5,
            "filename": "DSA_Mod5_Trees_BST.pdf",
            "slides": [
                {"title": "Slide 1: Binary Tree Properties", "content": "Hierarchical structure where each node has at most two children (left and right). Maximum nodes at depth d = 2^d. Inorder traversal of BST yields sorted keys."},
                {"title": "Slide 2: Binary Search Tree (BST) Invariant", "content": "For every node X, all keys in X's left subtree are strictly smaller than X.key, and all keys in X's right subtree are strictly greater."},
                {"title": "Slide 3: Tree Traversals & Balancing", "content": "DFS: Inorder (Left, Root, Right), Preorder (Root, Left, Right), Postorder (Left, Right, Root). BFS uses Queue. Balanced trees (AVL/Red-Black) guarantee O(log n) operations."}
            ],
            "questions": [
                {
                    "question": "Which tree traversal order produces sorted elements when applied to a valid Binary Search Tree (BST)?",
                    "options": ["A) Preorder Traversal", "B) Inorder Traversal", "C) Postorder Traversal", "D) Level-order Traversal"],
                    "correct_answer": "B) Inorder Traversal",
                    "explanation": "Inorder traversal visits Left Subtree -> Root -> Right Subtree, retrieving BST keys in non-decreasing sorted order.",
                    "difficulty": "easy",
                    "source_page": 3
                }
            ]
        },
        {
            "code": "DSA-106",
            "title": "Module 6: Heaps & Priority Queues",
            "description": "Binary Heap complete tree property, Min-Heap vs Max-Heap invariants, array representation, Heapify O(n), and Heap Sort.",
            "order": 6,
            "filename": "DSA_Mod6_Heaps_PriorityQueues.pdf",
            "slides": [
                {"title": "Slide 1: Binary Heap Property", "content": "A complete binary tree stored in contiguous array. Min-Heap: parent <= children. Max-Heap: parent >= children. Node i children at indices 2i+1 and 2i+2."},
                {"title": "Slide 2: Heap Operations", "content": "Insert(x): append and sift-up O(log n). ExtractMin/Max: swap root with last, pop, sift-down O(log n). Peek O(1)."},
                {"title": "Slide 3: Heapify & Heap Sort", "content": "Build-Heap (Heapify) constructs a heap from an unsorted array in linear O(n) time. Heap Sort achieves O(n log n) sorting with O(1) extra space."}
            ],
            "questions": [
                {
                    "question": "What is the time complexity of building a heap from an unsorted array of n elements using the bottom-up Heapify algorithm?",
                    "options": ["A) O(n log n)", "B) O(n)", "C) O(log n)", "D) O(n^2)"],
                    "correct_answer": "B) O(n)",
                    "explanation": "Bottom-up Heapify computes sum of heights h/2^h, converging geometrically to O(n) total operations.",
                    "difficulty": "hard",
                    "source_page": 3
                }
            ]
        },
        {
            "code": "DSA-107",
            "title": "Module 7: Hash Tables & Hashing Techniques",
            "description": "Hash functions, load factor α = n/m, collision resolution strategies (Separate Chaining, Open Addressing - Linear/Quadratic Probing, Double Hashing).",
            "order": 7,
            "filename": "DSA_Mod7_Hashing.pdf",
            "slides": [
                {"title": "Slide 1: Hash Function & Buckets", "content": "Hash function h(k) maps arbitrary keys to fixed integer index range [0..m-1]. Good hash functions distribute keys uniformly to minimize collisions."},
                {"title": "Slide 2: Separate Chaining vs Open Addressing", "content": "Chaining handles collisions by keeping linked lists per bucket. Open Addressing searches next available slot using probing sequences."},
                {"title": "Slide 3: Load Factor & Dynamic Resizing", "content": "Load factor α = n/m. When α exceeds threshold (e.g. 0.75), table capacity m doubles and all keys are rehashed to maintain O(1) average lookup."}
            ],
            "questions": [
                {
                    "question": "In Hash Tables with Open Addressing, what phenomenon occurs when consecutive occupied slots form long contiguous blocks, increasing search times?",
                    "options": ["A) Secondary Clustering", "B) Primary Clustering", "C) Hash Overflows", "D) Chain Thrashing"],
                    "correct_answer": "B) Primary Clustering",
                    "explanation": "Linear probing creates long contiguous runs of occupied slots (primary clustering), degrading search performance.",
                    "difficulty": "medium",
                    "source_page": 2
                }
            ]
        },
        {
            "code": "DSA-108",
            "title": "Module 8: Searching & Sorting Algorithms",
            "description": "Comparison-based sorting (Bubble, Insertion, Selection, QuickSort, MergeSort), Non-comparison sorting (Count/Radix), and Binary Search variants.",
            "order": 8,
            "filename": "DSA_Mod8_Searching_Sorting.pdf",
            "slides": [
                {"title": "Slide 1: Binary Search & Variants", "content": "Efficiently searches sorted arrays in O(log n) time by halving search range each step. Computes lower bound, upper bound, and exact match."},
                {"title": "Slide 2: Divide & Conquer Sorting (Quick & Merge)", "content": "Merge Sort: guarantees O(n log n) stable sorting using O(n) auxiliary space. QuickSort: in-place average O(n log n) using Lomuto/Hoare partition."},
                {"title": "Slide 3: Sorting Lower Bounds", "content": "Decision tree model proves any comparison-based sorting algorithm requires at least Ω(n log n) comparison operations in worst case."}
            ],
            "questions": [
                {
                    "question": "Which sorting algorithm guarantees O(n log n) worst-case time complexity while maintaining STABLE relative order of equal elements?",
                    "options": ["A) Quick Sort", "B) Heap Sort", "C) Merge Sort", "D) Selection Sort"],
                    "correct_answer": "C) Merge Sort",
                    "explanation": "Merge Sort consistently divides arrays into halves and merges in O(n log n) time while remaining stable.",
                    "difficulty": "easy",
                    "source_page": 2
                }
            ]
        },
        {
            "code": "DSA-109",
            "title": "Module 9: Graph Algorithms (BFS, DFS & Shortest Path)",
            "description": "Graph representations (Adjacency Matrix vs List), Breadth-First Search (BFS), Depth-First Search (DFS), Topological Sort, Dijkstra's Shortest Path, and Minimum Spanning Trees (Kruskal/Prim).",
            "order": 9,
            "filename": "DSA_Mod9_Graph_Algorithms.pdf",
            "slides": [
                {"title": "Slide 1: Graph Representations & Traversals", "content": "Adjacency matrix O(V^2) vs Adjacency list O(V+E). BFS uses Queue to explore level-by-level (unweighted shortest path). DFS uses Stack/Recursion."},
                {"title": "Slide 2: Topological Sorting & Cycle Detection", "content": "Ordering DAG (Directed Acyclic Graph) vertices such that for edge u->v, u appears before v. Kahn's In-Degree algorithm or DFS post-order traversal."},
                {"title": "Slide 3: Shortest Path & MST (Dijkstra, Kruskal, Prim)", "content": "Dijkstra finds single-source shortest path in non-negative weighted graphs in O((V+E) log V). Kruskal/Prim build Minimum Spanning Trees."}
            ],
            "questions": [
                {
                    "question": "What is the time complexity of Dijkstra's algorithm for finding single-source shortest path using a Min-Heap priority queue on graph G=(V, E)?",
                    "options": ["A) O(V^2)", "B) O((V + E) log V)", "C) O(V * E)", "D) O(E^2)"],
                    "correct_answer": "B) O((V + E) log V)",
                    "explanation": "Min-Heap priority queue allows extracting minimum distance vertex in O(log V) and updating E edges in O(E log V) time.",
                    "difficulty": "medium",
                    "source_page": 3
                }
            ]
        },
        {
            "code": "DSA-110",
            "title": "Module 10: Dynamic Programming & Greedy Paradigm",
            "description": "Overlapping subproblems and optimal substructure, Memoization (top-down) vs Tabulation (bottom-up), 0/1 Knapsack, Longest Common Subsequence (LCS), and Greedy Choice Property.",
            "order": 10,
            "filename": "DSA_Mod10_Dynamic_Programming.pdf",
            "slides": [
                {"title": "Slide 1: Core Principles of Dynamic Programming", "content": "DP breaks complex problems into smaller subproblems, caching intermediate solutions to avoid exponential recalculations. Requires Optimal Substructure and Overlapping Subproblems."},
                {"title": "Slide 2: Top-Down Memoization vs Bottom-Up Tabulation", "content": "Memoization recursively solves subproblems saving outputs in a hash table or array. Tabulation iteratively fills an n-dimensional table from base cases up."},
                {"title": "Slide 3: Classic DP Problems (Knapsack, LCS, LIS)", "content": "0/1 Knapsack O(N*W), Longest Common Subsequence O(M*N), Coin Change, and Longest Increasing Subsequence O(N log N)."}
            ],
            "questions": [
                {
                    "question": "What two key conditions MUST a optimization problem satisfy for Dynamic Programming to be successfully applied?",
                    "options": [
                        "A) Greedy Choice Property & Disjoint Subproblems",
                        "B) Optimal Substructure & Overlapping Subproblems",
                        "C) Linear Searchable State & Sortable Keys",
                        "D) Monotonicity & Strictly Increasing Functions"
                    ],
                    "correct_answer": "B) Optimal Substructure & Overlapping Subproblems",
                    "explanation": "Optimal Substructure allows constructing optimal solutions from optimal subproblems; Overlapping Subproblems ensures subproblems repeat.",
                    "difficulty": "medium",
                    "source_page": 1
                }
            ]
        }
    ]

    all_modules_data = dbms_modules_data + dsa_modules_data

    for m_data in all_modules_data:
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

        # 4. Create or Update Material
        mat = db.query(Material).filter(Material.module_id == mod.id).first()
        if not mat:
            mat = Material(
                module_id=mod.id,
                title=f"{m_data['title']} Reference Deck",
                file_type="PDF",
                file_path=m_data["filename"],
                slides_json=json.dumps(m_data["slides"])
            )
            db.add(mat)
            db.commit()
            db.refresh(mat)

        # 5. Create Lessons & DocumentChunks for slide decks
        for idx, slide in enumerate(m_data["slides"]):
            les = db.query(Lesson).filter(Lesson.module_id == mod.id, Lesson.title == slide["title"]).first()
            if not les:
                les = Lesson(
                    module_id=mod.id,
                    title=slide["title"],
                    content_type="DOCUMENT",
                    duration="10m",
                    order=idx + 1,
                    video_url=None
                )
                db.add(les)

            chunk = db.query(DocumentChunk).filter(DocumentChunk.material_id == mat.id, DocumentChunk.page_number == idx + 1).first()
            if not chunk:
                chunk = DocumentChunk(
                    material_id=mat.id,
                    chunk_text=f"{slide['title']}\n{slide['content']}",
                    page_number=idx + 1
                )
                db.add(chunk)

        # 6. Create AIQuestions
        for q_data in m_data.get("questions", []):
            existing_q = db.query(AIQuestion).filter(
                AIQuestion.module_id == mod.id,
                AIQuestion.question_text == q_data["question"]
            ).first()
            if not existing_q:
                q_obj = AIQuestion(
                    module_id=mod.id,
                    material_id=mat.id,
                    question_text=q_data["question"],
                    options_json=json.dumps(q_data["options"]),
                    correct_answer=q_data["correct_answer"],
                    explanation=q_data["explanation"],
                    difficulty=q_data["difficulty"],
                    source_document=m_data["filename"],
                    source_page=q_data.get("source_page", 1),
                    status="PUBLISHED"
                )
                db.add(q_obj)

        db.commit()

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
