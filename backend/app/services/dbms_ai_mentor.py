import json
from typing import Dict, Any, List, Optional
from app.services.rag_service import RAGService

class DBMSAIMentor:
    @classmethod
    def explain_query(cls, query: str, db_name: str) -> Dict[str, Any]:
        """Provide a clean, beginner-friendly line-by-line breakdown of a SQL query."""
        if not query or not query.strip():
            return {"explanation": "Please enter a valid SQL query to explain."}

        lines = [l.strip() for l in query.split('\n') if l.strip()]
        steps = []
        for idx, line in enumerate(lines, 1):
            l_upper = line.upper()
            if l_upper.startswith("SELECT"):
                steps.append(f"**Line {idx} (`{line}`)**: Selects the target fields and columns to project in the final result set.")
            elif "FROM" in l_upper:
                steps.append(f"**Line {idx} (`{line}`)**: Specifies the primary source table from the `{db_name}` database.")
            elif "JOIN" in l_upper:
                steps.append(f"**Line {idx} (`{line}`)**: Performs a JOIN operation to link rows between related tables using a foreign key relationship.")
            elif "WHERE" in l_upper:
                steps.append(f"**Line {idx} (`{line}`)**: Filters the dataset to only include rows that satisfy this condition.")
            elif "GROUP BY" in l_upper:
                steps.append(f"**Line {idx} (`{line}`)**: Groups identical rows together so aggregate functions (e.g. COUNT, SUM, AVG) can compute metrics per group.")
            elif "HAVING" in l_upper:
                steps.append(f"**Line {idx} (`{line}`)**: Filters aggregated groups after the GROUP BY computation completes.")
            elif "ORDER BY" in l_upper:
                steps.append(f"**Line {idx} (`{line}`)**: Sorts the output rows in ascending or descending order.")
            else:
                steps.append(f"**Line {idx} (`{line}`)**: SQL clause operation.")

        summary = (
            f"### SQL Query Breakdown (`{db_name}` Database)\n\n" +
            "\n".join(steps) +
            "\n\n**Takeaway**: This query reads from the database, applies relational conditions, and structures the output for reporting."
        )

        return {"explanation": summary}

    @classmethod
    def give_hint(cls, challenge_title: str, topic: str, student_query: str, hint_level: int = 1) -> Dict[str, Any]:
        """Generate progressive hints: Level 1 (Concept), Level 2 (Clause Guidance), Level 3 (Near Solution)."""
        if hint_level == 1:
            hint_text = (
                f"💡 **Level 1 Hint (Core Concept)**: This problem relates to **{topic}**.\n\n"
                f"Think about what table contains the required fields for *{challenge_title}*. "
                f"Before writing the full query, verify which columns contain the values you need to filter or calculate."
            )
        elif hint_level == 2:
            hint_text = (
                f"🔍 **Level 2 Hint (Clause Recommendation)**:\n\n"
                f"• Check your `FROM` and `JOIN` clauses to make sure tables are properly connected.\n"
                f"• If you are grouping records, remember that all un-aggregated columns in your `SELECT` list must appear in the `GROUP BY` clause!"
            )
        else:
            hint_text = (
                f"🎯 **Level 3 Hint (Near Solution Guidance)**:\n\n"
                f"Inspect your syntax against the standard pattern:\n"
                f"```sql\n"
                f"SELECT column1, COUNT(column2)\n"
                f"FROM table_name\n"
                f"WHERE condition\n"
                f"GROUP BY column1\n"
                f"HAVING COUNT(column2) > 1;\n"
                f"```"
            )

        return {
            "hint_level": hint_level,
            "hint_text": hint_text,
            "next_level": min(3, hint_level + 1)
        }

    @classmethod
    def find_mistake(cls, student_query: str, error_message: str, db_name: str) -> Dict[str, Any]:
        """Diagnose student SQL mistake and provide step-by-step resolution."""
        if not error_message:
            error_message = "Logic Mismatch: Query executed successfully but output does not match expected reference result."

        err_lower = error_message.lower()
        if "no such column" in err_lower:
            col = error_message.split(":")[-1].strip()
            fix_guide = (
                f"### 🛠️ Error Diagnosis: Unknown Column `{col}`\n\n"
                f"1. **Root Cause**: SQL engine cannot find column `{col}` in the specified table.\n"
                f"2. **How to Fix**: Open the **Database Explorer** on the left to verify exact column spelling or table alias prefixes."
            )
        elif "no such table" in err_lower:
            tbl = error_message.split(":")[-1].strip()
            fix_guide = (
                f"### 🛠️ Error Diagnosis: Unknown Table `{tbl}`\n\n"
                f"1. **Root Cause**: Table `{tbl}` is not present in `{db_name}`.\n"
                f"2. **How to Fix**: Select the correct database from the top database dropdown menu."
            )
        else:
            fix_guide = (
                f"### 🛠️ AI Diagnostic Assistant\n\n"
                f"**Observed Issue**: `{error_message}`\n\n"
                f"**Recommended Checklist**:\n"
                f"1. Verify `SELECT` columns exist in table schema.\n"
                f"2. Check `JOIN` condition syntax (e.g. `tableA.id = tableB.id`).\n"
                f"3. Ensure string literals use single quotes `'like this'`."
            )

        return {"diagnosis": fix_guide}

    @classmethod
    def optimize_query(cls, query: str) -> Dict[str, Any]:
        """Provide SQL performance tuning recommendations."""
        advice = [
            "• **Index Utilization**: Ensure columns used in `WHERE`, `JOIN ON`, and `ORDER BY` clauses are indexed for $O(\\log N)$ lookup speed.",
            "• **Avoid `SELECT *`**: Replace wildcard `SELECT *` with explicit column names to reduce memory payload and network serialization bandwidth.",
            "• **JOIN Optimization**: Filter dataset early inside subqueries or CTEs before performing heavy `INNER JOIN` operations on multi-million row tables."
        ]

        return {
            "optimization_tips": "\n\n".join(advice),
            "recommendation": "Query is well-structured for standard educational schemas."
        }

    @classmethod
    def generate_ai_challenge(
        cls, 
        topic: str = "JOIN", 
        difficulty: str = "Medium", 
        competency: str = "SQL Queries"
    ) -> Dict[str, Any]:
        """Generate a complete trainer SQL challenge draft."""
        title = f"Mastering {topic}: {difficulty} Level Challenge"
        desc = (
            f"Write a SQL query demonstrating **{topic}** concepts on the **Employee Management** database. "
            f"Your query should select department names along with total employee counts and average salaries, "
            f"filtering out departments with fewer than 2 employees."
        )

        starter_sql = "-- Write your SQL query below\nSELECT \nFROM \n"
        reference_sql = (
            "SELECT d.dept_name, COUNT(e.emp_id) AS total_employees, AVG(e.salary) AS avg_salary\n"
            "FROM departments d\n"
            "JOIN employees e ON d.dept_id = e.dept_id\n"
            "GROUP BY d.dept_id, d.dept_name\n"
            "HAVING COUNT(e.emp_id) >= 2\n"
            "ORDER BY avg_salary DESC;"
        )

        test_cases = [
            {"name": "Schema & Column Output Test", "is_hidden": False, "description": "Checks returned column structure (dept_name, total_employees, avg_salary)."},
            {"name": "Aggregation & HAVING Filter Test", "is_hidden": False, "description": "Validates group counts >= 2 filter."},
            {"name": "Ordering & Hidden Edge Case", "is_hidden": True, "description": "Validates descending sort order and NULL handling."}
        ]

        return {
            "title": title,
            "description": desc,
            "topic": topic,
            "difficulty": difficulty,
            "database_name": "Employee Management",
            "starter_sql": starter_sql,
            "reference_sql": reference_sql,
            "test_cases": test_cases,
            "competency_name": competency,
            "max_score": 100.0,
            "explanation": f"Teaches {topic} syntax with GROUP BY and HAVING clauses."
        }
