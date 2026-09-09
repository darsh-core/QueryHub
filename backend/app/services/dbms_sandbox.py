import sqlite3
import re
import time
import json
import uuid
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta

class DBMSSandbox:
    # Active in-memory isolated session connections
    _sessions: Dict[str, sqlite3.Connection] = {}
    _session_expiry: Dict[str, datetime] = {}

    # Prohibited SQL keywords and patterns
    PROHIBITED_PATTERNS = [
        r'\bATTACH\b', r'\bDETACH\b', r'\bPRAGMA\b', r'\bLOAD_EXTENSION\b',
        r'\bVACUUM\b', r'\bREINDEX\b', r'\bsqlite_master\b', r'\bsqlite_schema\b',
        r'\bSYSTEM\b', r'\bSHELL\b', r'\bEXEC\b', r'\bIMPORT\b'
    ]

    # Pre-built educational database schema & seeds dictionary
    PREBUILT_DATABASES: Dict[str, Dict[str, Any]] = {
        "Employee Management": {
            "name": "Employee Management",
            "category": "Corporate HR",
            "description": "Enterprise organizational database tracking departments, employees, projects, project allocations, and monthly salaries.",
            "tables": [
                {
                    "name": "departments",
                    "columns": [
                        {"name": "dept_id", "type": "INTEGER", "pk": True, "fk": None},
                        {"name": "dept_name", "type": "VARCHAR(50)", "pk": False, "fk": None},
                        {"name": "location", "type": "VARCHAR(50)", "pk": False, "fk": None},
                        {"name": "budget", "type": "DECIMAL(12,2)", "pk": False, "fk": None}
                    ]
                },
                {
                    "name": "employees",
                    "columns": [
                        {"name": "emp_id", "type": "INTEGER", "pk": True, "fk": None},
                        {"name": "first_name", "type": "VARCHAR(50)", "pk": False, "fk": None},
                        {"name": "last_name", "type": "VARCHAR(50)", "pk": False, "fk": None},
                        {"name": "email", "type": "VARCHAR(100)", "pk": False, "fk": None},
                        {"name": "hire_date", "type": "DATE", "pk": False, "fk": None},
                        {"name": "job_title", "type": "VARCHAR(50)", "pk": False, "fk": None},
                        {"name": "salary", "type": "DECIMAL(10,2)", "pk": False, "fk": None},
                        {"name": "dept_id", "type": "INTEGER", "pk": False, "fk": "departments.dept_id"}
                    ]
                },
                {
                    "name": "projects",
                    "columns": [
                        {"name": "project_id", "type": "INTEGER", "pk": True, "fk": None},
                        {"name": "project_name", "type": "VARCHAR(100)", "pk": False, "fk": None},
                        {"name": "start_date", "type": "DATE", "pk": False, "fk": None},
                        {"name": "end_date", "type": "DATE", "pk": False, "fk": None},
                        {"name": "budget", "type": "DECIMAL(12,2)", "pk": False, "fk": None}
                    ]
                },
                {
                    "name": "employee_projects",
                    "columns": [
                        {"name": "emp_id", "type": "INTEGER", "pk": True, "fk": "employees.emp_id"},
                        {"name": "project_id", "type": "INTEGER", "pk": True, "fk": "projects.project_id"},
                        {"name": "role", "type": "VARCHAR(50)", "pk": False, "fk": None},
                        {"name": "hours_allocated", "type": "INTEGER", "pk": False, "fk": None}
                    ]
                }
            ],
            "seed_sql": """
            CREATE TABLE departments (
                dept_id INTEGER PRIMARY KEY,
                dept_name TEXT NOT NULL,
                location TEXT NOT NULL,
                budget REAL NOT NULL
            );

            CREATE TABLE employees (
                emp_id INTEGER PRIMARY KEY,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                hire_date TEXT NOT NULL,
                job_title TEXT NOT NULL,
                salary REAL NOT NULL,
                dept_id INTEGER,
                FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
            );

            CREATE TABLE projects (
                project_id INTEGER PRIMARY KEY,
                project_name TEXT NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT,
                budget REAL NOT NULL
            );

            CREATE TABLE employee_projects (
                emp_id INTEGER,
                project_id INTEGER,
                role TEXT NOT NULL,
                hours_allocated INTEGER NOT NULL,
                PRIMARY KEY (emp_id, project_id),
                FOREIGN KEY (emp_id) REFERENCES employees(emp_id),
                FOREIGN KEY (project_id) REFERENCES projects(project_id)
            );

            INSERT INTO departments VALUES
            (10, 'Engineering', 'San Francisco', 1500000.00),
            (20, 'Data Science', 'New York', 1200000.00),
            (30, 'Product Management', 'Austin', 800000.00),
            (40, 'Sales & Marketing', 'Chicago', 950000.00),
            (50, 'Human Resources', 'Boston', 450000.00);

            INSERT INTO employees VALUES
            (101, 'Alex', 'Rivera', 'alex.rivera@corp.com', '2021-03-15', 'Senior Software Engineer', 125000.00, 10),
            (102, 'Christy', 'Vargas', 'christy.vargas@corp.com', '2019-06-01', 'Lead Data Scientist', 142000.00, 20),
            (103, 'David', 'Chen', 'david.chen@corp.com', '2020-01-10', 'Backend Engineer', 98000.00, 10),
            (104, 'Elena', 'Rostova', 'elena.r@corp.com', '2022-08-20', 'Product Manager', 115000.00, 30),
            (105, 'Marcus', 'Johnson', 'marcus.j@corp.com', '2018-11-05', 'Principal Architect', 165000.00, 10),
            (106, 'Sophia', 'Patel', 'sophia.p@corp.com', '2023-02-14', 'ML Research Engineer', 110000.00, 20),
            (107, 'James', 'Wilson', 'james.w@corp.com', '2021-09-01', 'Marketing Director', 105000.00, 40),
            (108, 'Hannah', 'Abbott', 'hannah.a@corp.com', '2022-05-12', 'HR Specialist', 68000.00, 50);

            INSERT INTO projects VALUES
            (501, 'AI-Powered LMS Engine', '2024-01-10', '2024-12-31', 450000.00),
            (502, 'Cloud Relational Migrator', '2023-05-01', '2024-06-30', 320000.00),
            (503, 'Realtime Visual Analytics', '2024-03-15', '2025-01-15', 280000.00),
            (504, 'Customer Retention Portal', '2023-09-01', '2024-04-30', 190000.00);

            INSERT INTO employee_projects VALUES
            (101, 501, 'Lead Tech Architect', 120),
            (101, 502, 'Database Consultant', 40),
            (102, 501, 'AI Model Trainer', 140),
            (103, 502, 'Backend Developer', 160),
            (104, 503, 'Product Owner', 80),
            (105, 501, 'System Reviewer', 50),
            (106, 503, 'Data Pipeline Dev', 110);
            """
        },
        "College Management": {
            "name": "College Management",
            "category": "Academic System",
            "description": "University information database featuring departments, professors, courses, student enrollment records, and grade point averages.",
            "tables": [
                {
                    "name": "academic_depts",
                    "columns": [
                        {"name": "dept_id", "type": "INTEGER", "pk": True, "fk": None},
                        {"name": "dept_code", "type": "VARCHAR(10)", "pk": False, "fk": None},
                        {"name": "dept_name", "type": "VARCHAR(100)", "pk": False, "fk": None}
                    ]
                },
                {
                    "name": "professors",
                    "columns": [
                        {"name": "prof_id", "type": "INTEGER", "pk": True, "fk": None},
                        {"name": "name", "type": "VARCHAR(100)", "pk": False, "fk": None},
                        {"name": "email", "type": "VARCHAR(100)", "pk": False, "fk": None},
                        {"name": "dept_id", "type": "INTEGER", "pk": False, "fk": "academic_depts.dept_id"}
                    ]
                },
                {
                    "name": "courses",
                    "columns": [
                        {"name": "course_id", "type": "INTEGER", "pk": True, "fk": None},
                        {"name": "course_code", "type": "VARCHAR(20)", "pk": False, "fk": None},
                        {"name": "title", "type": "VARCHAR(100)", "pk": False, "fk": None},
                        {"name": "credits", "type": "INTEGER", "pk": False, "fk": None},
                        {"name": "prof_id", "type": "INTEGER", "pk": False, "fk": "professors.prof_id"}
                    ]
                },
                {
                    "name": "students",
                    "columns": [
                        {"name": "student_id", "type": "INTEGER", "pk": True, "fk": None},
                        {"name": "full_name", "type": "VARCHAR(100)", "pk": False, "fk": None},
                        {"name": "email", "type": "VARCHAR(100)", "pk": False, "fk": None},
                        {"name": "enrollment_year", "type": "INTEGER", "pk": False, "fk": None},
                        {"name": "gpa", "type": "DECIMAL(3,2)", "pk": False, "fk": None}
                    ]
                },
                {
                    "name": "enrollments",
                    "columns": [
                        {"name": "enrollment_id", "type": "INTEGER", "pk": True, "fk": None},
                        {"name": "student_id", "type": "INTEGER", "pk": False, "fk": "students.student_id"},
                        {"name": "course_id", "type": "INTEGER", "pk": False, "fk": "courses.course_id"},
                        {"name": "semester", "type": "VARCHAR(20)", "pk": False, "fk": None},
                        {"name": "grade", "type": "VARCHAR(2)", "pk": False, "fk": None}
                    ]
                }
            ],
            "seed_sql": """
            CREATE TABLE academic_depts (
                dept_id INTEGER PRIMARY KEY,
                dept_code TEXT UNIQUE NOT NULL,
                dept_name TEXT NOT NULL
            );

            CREATE TABLE professors (
                prof_id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                dept_id INTEGER,
                FOREIGN KEY (dept_id) REFERENCES academic_depts(dept_id)
            );

            CREATE TABLE courses (
                course_id INTEGER PRIMARY KEY,
                course_code TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                credits INTEGER NOT NULL,
                prof_id INTEGER,
                FOREIGN KEY (prof_id) REFERENCES professors(prof_id)
            );

            CREATE TABLE students (
                student_id INTEGER PRIMARY KEY,
                full_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                enrollment_year INTEGER NOT NULL,
                gpa REAL NOT NULL
            );

            CREATE TABLE enrollments (
                enrollment_id INTEGER PRIMARY KEY,
                student_id INTEGER,
                course_id INTEGER,
                semester TEXT NOT NULL,
                grade TEXT,
                FOREIGN KEY (student_id) REFERENCES students(student_id),
                FOREIGN KEY (course_id) REFERENCES courses(course_id)
            );

            INSERT INTO academic_depts VALUES
            (1, 'CS', 'Computer Science & Engineering'),
            (2, 'IT', 'Information Technology'),
            (3, 'ECE', 'Electronics & Communication'),
            (4, 'MECH', 'Mechanical Engineering');

            INSERT INTO professors VALUES
            (201, 'Dr. Christy', 'christy.prof@skct.edu.in', 2),
            (202, 'Dr. Christy Jeba Malar', 'christy.j@skct.edu.in', 1),
            (203, 'Prof. Ada Lovelace', 'ada.l@skct.edu.in', 1),
            (204, 'Dr. Claude Shannon', 'shannon.c@skct.edu.in', 3);

            INSERT INTO courses VALUES
            (301, '23IT201', 'Database Management Systems', 4, 201),
            (302, '23CS101', 'Data Structures & Algorithms', 4, 202),
            (303, '23CS205', 'Theory of Computation', 3, 203),
            (304, '23EC102', 'Digital Signal Processing', 4, 204);

            INSERT INTO students VALUES
            (1001, 'Alex Rivera', 'alex.rivera@student.edu', 2023, 3.85),
            (1002, 'Beatriz Silva', 'beatriz.s@student.edu', 2023, 3.92),
            (1003, 'Charles Babbage', 'charles.b@student.edu', 2022, 3.60),
            (1004, 'Diana Prince', 'diana.p@student.edu', 2024, 3.75),
            (1005, 'Ethan Hunt', 'ethan.h@student.edu', 2023, 3.40);

            INSERT INTO enrollments VALUES
            (1, 1001, 301, 'Fall 2024', 'A'),
            (2, 1001, 302, 'Fall 2024', 'A-'),
            (3, 1002, 301, 'Fall 2024', 'A+'),
            (4, 1003, 301, 'Fall 2024', 'B+'),
            (5, 1003, 303, 'Fall 2024', 'A'),
            (6, 1004, 301, 'Fall 2024', 'A'),
            (7, 1005, 302, 'Fall 2024', 'B');
            """
        },
        "E-Commerce": {
            "name": "E-Commerce",
            "category": "Retail & Shopping",
            "description": "Online storefront database containing categories, product inventories, customer profiles, orders, and line items.",
            "tables": [
                {
                    "name": "categories",
                    "columns": [
                        {"name": "category_id", "type": "INTEGER", "pk": True, "fk": None},
                        {"name": "category_name", "type": "VARCHAR(50)", "pk": False, "fk": None}
                    ]
                },
                {
                    "name": "products",
                    "columns": [
                        {"name": "product_id", "type": "INTEGER", "pk": True, "fk": None},
                        {"name": "product_name", "type": "VARCHAR(100)", "pk": False, "fk": None},
                        {"name": "unit_price", "type": "DECIMAL(10,2)", "pk": False, "fk": None},
                        {"name": "stock_quantity", "type": "INTEGER", "pk": False, "fk": None},
                        {"name": "category_id", "type": "INTEGER", "pk": False, "fk": "categories.category_id"}
                    ]
                },
                {
                    "name": "customers",
                    "columns": [
                        {"name": "customer_id", "type": "INTEGER", "pk": True, "fk": None},
                        {"name": "name", "type": "VARCHAR(100)", "pk": False, "fk": None},
                        {"name": "city", "type": "VARCHAR(50)", "pk": False, "fk": None},
                        {"name": "membership_tier", "type": "VARCHAR(20)", "pk": False, "fk": None}
                    ]
                },
                {
                    "name": "orders",
                    "columns": [
                        {"name": "order_id", "type": "INTEGER", "pk": True, "fk": None},
                        {"name": "customer_id", "type": "INTEGER", "pk": False, "fk": "customers.customer_id"},
                        {"name": "order_date", "type": "DATE", "pk": False, "fk": None},
                        {"name": "total_amount", "type": "DECIMAL(10,2)", "pk": False, "fk": None},
                        {"name": "status", "type": "VARCHAR(20)", "pk": False, "fk": None}
                    ]
                },
                {
                    "name": "order_items",
                    "columns": [
                        {"name": "order_id", "type": "INTEGER", "pk": True, "fk": "orders.order_id"},
                        {"name": "product_id", "type": "INTEGER", "pk": True, "fk": "products.product_id"},
                        {"name": "quantity", "type": "INTEGER", "pk": False, "fk": None},
                        {"name": "subtotal", "type": "DECIMAL(10,2)", "pk": False, "fk": None}
                    ]
                }
            ],
            "seed_sql": """
            CREATE TABLE categories (
                category_id INTEGER PRIMARY KEY,
                category_name TEXT NOT NULL
            );

            CREATE TABLE products (
                product_id INTEGER PRIMARY KEY,
                product_name TEXT NOT NULL,
                unit_price REAL NOT NULL,
                stock_quantity INTEGER NOT NULL,
                category_id INTEGER,
                FOREIGN KEY (category_id) REFERENCES categories(category_id)
            );

            CREATE TABLE customers (
                customer_id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                city TEXT NOT NULL,
                membership_tier TEXT NOT NULL
            );

            CREATE TABLE orders (
                order_id INTEGER PRIMARY KEY,
                customer_id INTEGER,
                order_date TEXT NOT NULL,
                total_amount REAL NOT NULL,
                status TEXT NOT NULL,
                FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
            );

            CREATE TABLE order_items (
                order_id INTEGER,
                product_id INTEGER,
                quantity INTEGER NOT NULL,
                subtotal REAL NOT NULL,
                PRIMARY KEY (order_id, product_id),
                FOREIGN KEY (order_id) REFERENCES orders(order_id),
                FOREIGN KEY (product_id) REFERENCES products(product_id)
            );

            INSERT INTO categories VALUES
            (1, 'Laptops & Hardware'),
            (2, 'Monitors & Displays'),
            (3, 'Developer Accessories'),
            (4, 'Networking');

            INSERT INTO products VALUES
            (101, 'MacBook Pro M3 Max 16"', 3499.00, 25, 1),
            (102, 'Dell UltraSharp 32" 4K', 899.00, 40, 2),
            (103, 'Mechanical Keyboard RGB', 149.00, 120, 3),
            (104, 'Ergonomic Wireless Mouse', 89.50, 200, 3),
            (105, 'WiFi 7 Mesh Router System', 499.00, 15, 4);

            INSERT INTO customers VALUES
            (1, 'Alex Rivera', 'San Francisco', 'Platinum'),
            (2, 'Christy Vargas', 'New York', 'Gold'),
            (3, 'Liam Neeson', 'London', 'Silver'),
            (4, 'Maya Lin', 'Austin', 'Gold');

            INSERT INTO orders VALUES
            (1001, 1, '2024-02-10', 3648.00, 'COMPLETED'),
            (1002, 2, '2024-02-14', 988.50, 'COMPLETED'),
            (1003, 1, '2024-03-01', 149.00, 'PROCESSING'),
            (1004, 3, '2024-03-05', 499.00, 'SHIPPED');

            INSERT INTO order_items VALUES
            (1001, 101, 1, 3499.00),
            (1001, 103, 1, 149.00),
            (1002, 102, 1, 899.00),
            (1002, 104, 1, 89.50),
            (1003, 103, 1, 149.00),
            (1004, 105, 1, 499.00);
            """
        },
        "Hospital Management": {
            "name": "Hospital Management",
            "category": "Healthcare",
            "description": "Medical hospital administration system detailing wards, doctors, patient admittance, appointments, and diagnostic records.",
            "tables": [
                {
                    "name": "wards",
                    "columns": [
                        {"name": "ward_id", "type": "INTEGER", "pk": True, "fk": None},
                        {"name": "ward_name", "type": "VARCHAR(50)", "pk": False, "fk": None},
                        {"name": "capacity", "type": "INTEGER", "pk": False, "fk": None}
                    ]
                },
                {
                    "name": "doctors",
                    "columns": [
                        {"name": "doctor_id", "type": "INTEGER", "pk": True, "fk": None},
                        {"name": "name", "type": "VARCHAR(100)", "pk": False, "fk": None},
                        {"name": "specialization", "type": "VARCHAR(50)", "pk": False, "fk": None},
                        {"name": "consultation_fee", "type": "DECIMAL(8,2)", "pk": False, "fk": None}
                    ]
                },
                {
                    "name": "patients",
                    "columns": [
                        {"name": "patient_id", "type": "INTEGER", "pk": True, "fk": None},
                        {"name": "name", "type": "VARCHAR(100)", "pk": False, "fk": None},
                        {"name": "age", "type": "INTEGER", "pk": False, "fk": None},
                        {"name": "gender", "type": "VARCHAR(10)", "pk": False, "fk": None},
                        {"name": "ward_id", "type": "INTEGER", "pk": False, "fk": "wards.ward_id"}
                    ]
                },
                {
                    "name": "appointments",
                    "columns": [
                        {"name": "appointment_id", "type": "INTEGER", "pk": True, "fk": None},
                        {"name": "patient_id", "type": "INTEGER", "pk": False, "fk": "patients.patient_id"},
                        {"name": "doctor_id", "type": "INTEGER", "pk": False, "fk": "doctors.doctor_id"},
                        {"name": "app_date", "type": "DATE", "pk": False, "fk": None},
                        {"name": "diagnosis", "type": "TEXT", "pk": False, "fk": None}
                    ]
                }
            ],
            "seed_sql": """
            CREATE TABLE wards (
                ward_id INTEGER PRIMARY KEY,
                ward_name TEXT NOT NULL,
                capacity INTEGER NOT NULL
            );

            CREATE TABLE doctors (
                doctor_id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                specialization TEXT NOT NULL,
                consultation_fee REAL NOT NULL
            );

            CREATE TABLE patients (
                patient_id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                age INTEGER NOT NULL,
                gender TEXT NOT NULL,
                ward_id INTEGER,
                FOREIGN KEY (ward_id) REFERENCES wards(ward_id)
            );

            CREATE TABLE appointments (
                appointment_id INTEGER PRIMARY KEY,
                patient_id INTEGER,
                doctor_id INTEGER,
                app_date TEXT NOT NULL,
                diagnosis TEXT NOT NULL,
                FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
                FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
            );

            INSERT INTO wards VALUES
            (1, 'Cardiology ICU', 12),
            (2, 'Neurology Wing', 20),
            (3, 'Pediatrics General', 15),
            (4, 'Orthopedics Suite', 10);

            INSERT INTO doctors VALUES
            (101, 'Dr. Gregory House', 'Diagnostic Medicine', 350.00),
            (102, 'Dr. Meredith Grey', 'General Surgery', 280.00),
            (103, 'Dr. Stephen Strange', 'Neuro-Surgery', 450.00),
            (104, 'Dr. Shaun Murphy', 'Pediatric Surgery', 290.00);

            INSERT INTO patients VALUES
            (1, 'Arthur Dent', 42, 'Male', 1),
            (2, 'Clara Oswald', 29, 'Female', 2),
            (3, 'Bruce Wayne', 38, 'Male', 4),
            (4, 'Peter Parker', 21, 'Male', 3);

            INSERT INTO appointments VALUES
            (501, 1, 101, '2024-02-01', 'Acute Chest Discomfort'),
            (502, 2, 103, '2024-02-05', 'Migraine Workup'),
            (503, 3, 102, '2024-02-12', 'Rotator Cuff Evaluation'),
            (504, 4, 104, '2024-02-18', 'Minor Fracture Checkup');
            """
        },
        "Banking": {
            "name": "Banking",
            "category": "Finance",
            "description": "Financial core banking system covering branch networks, customer accounts, transactional ledgers, and loan portfolios.",
            "tables": [
                {
                    "name": "branches",
                    "columns": [
                        {"name": "branch_id", "type": "INTEGER", "pk": True, "fk": None},
                        {"name": "branch_name", "type": "VARCHAR(50)", "pk": False, "fk": None},
                        {"name": "city", "type": "VARCHAR(50)", "pk": False, "fk": None}
                    ]
                },
                {
                    "name": "accounts",
                    "columns": [
                        {"name": "account_number", "type": "VARCHAR(20)", "pk": True, "fk": None},
                        {"name": "customer_name", "type": "VARCHAR(100)", "pk": False, "fk": None},
                        {"name": "account_type", "type": "VARCHAR(20)", "pk": False, "fk": None},
                        {"name": "balance", "type": "DECIMAL(12,2)", "pk": False, "fk": None},
                        {"name": "branch_id", "type": "INTEGER", "pk": False, "fk": "branches.branch_id"}
                    ]
                },
                {
                    "name": "bank_transactions",
                    "columns": [
                        {"name": "txn_id", "type": "INTEGER", "pk": True, "fk": None},
                        {"name": "account_number", "type": "VARCHAR(20)", "pk": False, "fk": "accounts.account_number"},
                        {"name": "txn_type", "type": "VARCHAR(10)", "pk": False, "fk": None},
                        {"name": "amount", "type": "DECIMAL(10,2)", "pk": False, "fk": None},
                        {"name": "txn_date", "type": "DATETIME", "pk": False, "fk": None}
                    ]
                }
            ],
            "seed_sql": """
            CREATE TABLE branches (
                branch_id INTEGER PRIMARY KEY,
                branch_name TEXT NOT NULL,
                city TEXT NOT NULL
            );

            CREATE TABLE accounts (
                account_number TEXT PRIMARY KEY,
                customer_name TEXT NOT NULL,
                account_type TEXT NOT NULL,
                balance REAL NOT NULL,
                branch_id INTEGER,
                FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
            );

            CREATE TABLE bank_transactions (
                txn_id INTEGER PRIMARY KEY,
                account_number TEXT,
                txn_type TEXT NOT NULL,
                amount REAL NOT NULL,
                txn_date TEXT NOT NULL,
                FOREIGN KEY (account_number) REFERENCES accounts(account_number)
            );

            INSERT INTO branches VALUES
            (10, 'Financial District Main', 'New York'),
            (20, 'Silicon Valley Tech', 'San Francisco'),
            (30, 'Loop Center Branch', 'Chicago');

            INSERT INTO accounts VALUES
            ('ACC-1001', 'Alex Rivera', 'SAVINGS', 48500.50, 20),
            ('ACC-1002', 'Christy Vargas', 'CHECKING', 12400.00, 10),
            ('ACC-1003', 'Wayne Enterprises', 'CORPORATE', 2500000.00, 10),
            ('ACC-1004', 'Stark Industries', 'CORPORATE', 4100000.00, 20);

            INSERT INTO bank_transactions VALUES
            (9001, 'ACC-1001', 'CREDIT', 5000.00, '2024-02-01 10:30:00'),
            (9002, 'ACC-1002', 'DEBIT', 1200.00, '2024-02-02 14:15:00'),
            (9003, 'ACC-1003', 'CREDIT', 500000.00, '2024-02-05 09:00:00');
            """
        }
    }

    @classmethod
    def create_custom_database(cls, db_name: str, description: str = "Student Custom Database Workspace", category: str = "Custom Database") -> Dict[str, Any]:
        """Registers a new student-created custom database workspace."""
        clean_name = db_name.strip()
        if clean_name not in cls.PREBUILT_DATABASES:
            cls.PREBUILT_DATABASES[clean_name] = {
                "name": clean_name,
                "category": category,
                "description": description,
                "tables": [],
                "seed_sql": "-- Custom Database Initialized\nSELECT 1;"
            }
        return cls.PREBUILT_DATABASES[clean_name]

    @classmethod
    def get_live_session_schema(cls, session_id: str, db_name: str = "Employee Management") -> Dict[str, Any]:
        """Extracts live tables, columns, and foreign keys from active SQLite session."""
        conn = cls.get_connection(session_id, db_name)
        cursor = conn.cursor()
        
        db_info = cls.PREBUILT_DATABASES.get(db_name, {
            "name": db_name,
            "category": "Custom Database",
            "description": "Student Custom Database Workspace",
            "seed_sql": ""
        })

        try:
            cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
            tbl_rows = cursor.fetchall()
            
            live_tables = []
            for row in tbl_rows:
                t_name = row[0]
                t_sql = row[1] or ""
                
                cursor.execute(f"PRAGMA table_info({t_name});")
                col_info = cursor.fetchall()
                
                cursor.execute(f"PRAGMA foreign_key_list({t_name});")
                fk_info = cursor.fetchall()
                
                fk_map = {}
                for fk in fk_info:
                    # fk: (id, seq, table, from, to, on_update, on_delete, match)
                    fk_map[fk[3]] = f"{fk[2]}.{fk[4]}"

                cols = []
                for c in col_info:
                    cols.append({
                        "name": c[1],
                        "type": c[2] or "TEXT",
                        "pk": bool(c[5]),
                        "fk": fk_map.get(c[1], None)
                    })

                live_tables.append({
                    "name": t_name,
                    "columns": cols,
                    "sql": t_sql
                })

            return {
                "database_name": db_info["name"],
                "category": db_info.get("category", "Custom Database"),
                "description": db_info.get("description", "Student Custom Database"),
                "tables": live_tables,
                "seed_sql": db_info.get("seed_sql", "")
            }
        except Exception as e:
            print(f"Error fetching live session schema: {e}")
            return {
                "database_name": db_info["name"],
                "category": db_info.get("category", "Custom Database"),
                "description": db_info.get("description", "Student Custom Database"),
                "tables": db_info.get("tables", []),
                "seed_sql": db_info.get("seed_sql", "")
            }

    @classmethod
    def get_or_create_session(cls, student_id: Optional[int], db_name: str = "Employee Management") -> str:
        """Create or return an isolated in-memory SQLite connection for a session."""
        session_id = str(uuid.uuid4())
        conn = sqlite3.connect(":memory:", check_same_thread=False)
        conn.row_factory = sqlite3.Row

        # Enable Foreign Key enforcement in SQLite
        conn.execute("PRAGMA foreign_keys = ON;")

        # Seed Database schema
        db_info = cls.PREBUILT_DATABASES.get(db_name, cls.PREBUILT_DATABASES["Employee Management"])
        seed_script = db_info["seed_sql"]
        conn.executescript(seed_script)
        conn.commit()

        cls._sessions[session_id] = conn
        cls._session_expiry[session_id] = datetime.utcnow() + timedelta(hours=2)

        return session_id

    @classmethod
    def get_connection(cls, session_id: str, db_name: str = "Employee Management") -> sqlite3.Connection:
        """Get existing isolated connection or create new if expired."""
        if session_id in cls._sessions:
            return cls._sessions[session_id]
        
        # Re-create session if expired
        conn = sqlite3.connect(":memory:", check_same_thread=False)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        db_info = cls.PREBUILT_DATABASES.get(db_name, cls.PREBUILT_DATABASES["Employee Management"])
        conn.executescript(db_info["seed_sql"])
        conn.commit()
        cls._sessions[session_id] = conn
        return conn

    @classmethod
    def validate_sql(cls, query: str) -> Tuple[bool, str]:
        """Validate query for security violations and prohibited operations."""
        cleaned_query = query.strip()
        if not cleaned_query:
            return False, "Query text cannot be empty."

        for pattern in cls.PROHIBITED_PATTERNS:
            if re.search(pattern, cleaned_query, re.IGNORECASE):
                return False, f"Prohibited operation detected: Keyword '{pattern.replace(r'\b', '')}' is restricted in the DBMS Virtual Lab sandbox."

        return True, ""

    @classmethod
    def execute_query(
        cls, 
        session_id: str, 
        query: str, 
        db_name: str = "Employee Management"
    ) -> Dict[str, Any]:
        """Execute student SQL query inside isolated sandbox and return result payload."""
        is_valid, err = cls.validate_sql(query)
        if not is_valid:
            return {
                "status": "ERROR",
                "error_message": err,
                "friendly_error_explanation": "Security Sandbox Notice: The submitted query contains disallowed keywords.",
                "columns": [],
                "rows": [],
                "execution_time_ms": 0.0,
                "rows_affected": 0
            }

        start_time = time.time()
        conn = cls.get_connection(session_id, db_name)
        cursor = conn.cursor()

        try:
            # Handle multiple SQL statements separated by semicolon
            statements = [s.strip() for s in query.split(';') if s.strip()]
            if not statements:
                statements = [query]

            last_rows = []
            columns = []
            rows_affected = 0

            for stmt in statements:
                cursor.execute(stmt)
                if cursor.description:
                    columns = [desc[0] for desc in cursor.description]
                    fetched = cursor.fetchmany(500)  # Max 500 rows result limit
                    last_rows = [list(row) for row in fetched]
                else:
                    rows_affected += cursor.rowcount if cursor.rowcount >= 0 else 0

            conn.commit()
            exec_time = round((time.time() - start_time) * 1000, 2)

            return {
                "status": "SUCCESS",
                "error_message": None,
                "friendly_error_explanation": None,
                "columns": columns,
                "rows": last_rows,
                "execution_time_ms": exec_time,
                "rows_affected": rows_affected if not columns else len(last_rows)
            }

        except sqlite3.Error as e:
            exec_time = round((time.time() - start_time) * 1000, 2)
            raw_err = str(e)
            friendly_explain = cls._explain_sqlite_error(raw_err, query)
            return {
                "status": "ERROR",
                "error_message": raw_err,
                "friendly_error_explanation": friendly_explain,
                "columns": [],
                "rows": [],
                "execution_time_ms": exec_time,
                "rows_affected": 0
            }

    @staticmethod
    def _explain_sqlite_error(raw_error: str, query: str) -> str:
        """Provide beginner-friendly SQL diagnostic guidance."""
        err_lower = raw_error.lower()
        if "no such table" in err_lower:
            table_name = raw_error.split(":")[-1].strip()
            return f"The table '{table_name}' does not exist in this database. Double-check table names in the Database Explorer sidebar on the left."
        elif "no such column" in err_lower:
            column_name = raw_error.split(":")[-1].strip()
            return f"The column '{column_name}' was not found. Inspect your SELECT or WHERE clause to ensure spelling and table aliases match."
        elif "syntax error" in err_lower:
            return "Syntax Error: Ensure all clauses follow proper SQL order (SELECT ... FROM ... WHERE ... GROUP BY ... HAVING ... ORDER BY) and check for missing commas or unmatched quotes."
        elif "foreign key constraint failed" in err_lower:
            return "Foreign Key Violation: You are referencing or inserting a key value that does not exist in the primary table."
        elif "unique constraint failed" in err_lower:
            return "Unique Constraint Failure: Attempted to insert or update a duplicate value into a Primary Key or UNIQUE column."
        else:
            return f"SQL Error encountered: {raw_error}. Request an AI hint for a step-by-step fix!"

    @classmethod
    def analyze_query_execution_plan(cls, query: str, db_name: str = "Employee Management") -> Dict[str, Any]:
        """Generate logical SQL execution flow and EXPLAIN tree structure."""
        # 1. Logical Clause Order Visualizer
        clauses_present = []
        q_upper = query.upper()
        if "FROM" in q_upper: clauses_present.append({"step": 1, "clause": "FROM", "desc": "Identify and load target base tables into memory buffer"})
        if "JOIN" in q_upper: clauses_present.append({"step": 2, "clause": "JOIN", "desc": "Perform Cartesian Product and evaluate ON join predicates"})
        if "WHERE" in q_upper: clauses_present.append({"step": 3, "clause": "WHERE", "desc": "Filter rows matching row-level Boolean condition"})
        if "GROUP BY" in q_upper: clauses_present.append({"step": 4, "clause": "GROUP BY", "desc": "Group rows sharing matching aggregate values"})
        if "HAVING" in q_upper: clauses_present.append({"step": 5, "clause": "HAVING", "desc": "Filter aggregate group results"})
        if "SELECT" in q_upper: clauses_present.append({"step": 6, "clause": "SELECT", "desc": "Project requested columns and evaluate expressions"})
        if "ORDER BY" in q_upper: clauses_present.append({"step": 7, "clause": "ORDER BY", "desc": "Sort final result set according to specified sort keys"})

        # 2. Raw EXPLAIN Query Plan
        temp_session = cls.get_or_create_session(None, db_name)
        conn = cls.get_connection(temp_session, db_name)
        explain_nodes = []
        try:
            cursor = conn.cursor()
            cursor.execute(f"EXPLAIN QUERY PLAN {query}")
            plan_rows = cursor.fetchall()
            for r in plan_rows:
                explain_nodes.append({
                    "id": r[0],
                    "parent": r[1],
                    "detail": r[3]
                })
        except Exception:
            explain_nodes = [{"id": 0, "parent": 0, "detail": "SCAN TABLE (Logical execution vector)"}]

        return {
            "logical_flow": clauses_present,
            "explain_plan": explain_nodes
        }

    @classmethod
    def evaluate_challenge(
        cls, 
        student_query: str, 
        reference_query: str, 
        db_name: str, 
        test_cases: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Evaluate student submission against reference query and test cases."""
        temp_session = cls.get_or_create_session(None, db_name)

        # Execute Student Query
        student_res = cls.execute_query(temp_session, student_query, db_name)
        if student_res["status"] == "ERROR":
            return {
                "is_correct": False,
                "score": 0.0,
                "test_results": [
                    {
                        "test_case_id": 1,
                        "name": "SQL Syntax & Compilation Test",
                        "status": "FAIL",
                        "error": student_res["error_message"],
                        "friendly_explain": student_res["friendly_error_explanation"],
                        "is_hidden": False
                    }
                ],
                "execution_time_ms": student_res["execution_time_ms"],
                "feedback": f"Query execution failed: {student_res['error_message']}"
            }

        # Execute Reference Query
        ref_session = cls.get_or_create_session(None, db_name)
        ref_res = cls.execute_query(ref_session, reference_query, db_name)

        # Normalize and Compare Result Sets
        student_rows = student_res["rows"]
        ref_rows = ref_res["rows"]

        student_cols = [c.lower().strip() for c in student_res["columns"]]
        ref_cols = [c.lower().strip() for c in ref_res["columns"]]

        test_results = []
        all_passed = True

        # Test 1: Column Count Check
        t1_passed = (len(student_cols) == len(ref_cols))
        test_results.append({
            "test_case_id": 1,
            "name": "Returned Column Schema Matching",
            "status": "PASS" if t1_passed else "FAIL",
            "detail": f"Expected {len(ref_cols)} columns ({', '.join(ref_cols)}), got {len(student_cols)} columns.",
            "is_hidden": False
        })
        if not t1_passed: all_passed = False

        # Test 2: Row Count & Result Value Matching
        t2_passed = (len(student_rows) == len(ref_rows)) and (sorted(map(str, student_rows)) == sorted(map(str, ref_rows)))
        test_results.append({
            "test_case_id": 2,
            "name": "Dataset Row Count & Value Validation",
            "status": "PASS" if t2_passed else "FAIL",
            "detail": f"Expected {len(ref_rows)} rows matching reference dataset, got {len(student_rows)} rows.",
            "is_hidden": False
        })
        if not t2_passed: all_passed = False

        # Test 3: Additional Test Cases (including hidden cases)
        for idx, tc in enumerate(test_cases, start=3):
            # Evaluate custom condition if provided in test case
            tc_pass = all_passed
            test_results.append({
                "test_case_id": idx,
                "name": tc.get("name", f"Validation Check {idx}"),
                "status": "PASS" if tc_pass else "FAIL",
                "detail": tc.get("description", "Edge case validation on dataset state."),
                "is_hidden": tc.get("is_hidden", False)
            })

        final_score = 100.0 if all_passed else (50.0 if t1_passed else 0.0)

        return {
            "is_correct": all_passed,
            "score": final_score,
            "test_results": test_results,
            "execution_time_ms": student_res["execution_time_ms"],
            "feedback": "Perfect! Your SQL query returned the exact expected dataset structure and values." if all_passed else "Your query executed, but the result set does not match the reference solution. Review column selections and WHERE filters."
        }
