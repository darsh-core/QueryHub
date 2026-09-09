import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Database, Filter, Layers, Sparkles } from 'lucide-react';

export const SqlJoinVisualizer = () => {
  const [joinType, setJoinType] = useState('INNER');

  const studentsTable = [
    { id: 1, name: 'Alex Rivera', dept_id: 101 },
    { id: 2, name: 'Dr. Sarah', dept_id: 102 },
    { id: 3, name: 'John Doe', dept_id: 103 },
    { id: 4, name: 'Emma Watson', dept_id: 999 }, // No matching dept
  ];

  const departmentsTable = [
    { dept_id: 101, dept_name: 'Computer Science' },
    { dept_id: 102, dept_name: 'Artificial Intelligence' },
    { dept_id: 103, dept_name: 'Data Architecture' },
    { dept_id: 104, dept_name: 'Robotics' }, // No student in this dept
  ];

  const computeJoinResults = () => {
    let results = [];

    if (joinType === 'INNER') {
      studentsTable.forEach(s => {
        const d = departmentsTable.find(dept => dept.dept_id === s.dept_id);
        if (d) {
          results.push({ ...s, dept_name: d.dept_name });
        }
      });
    } else if (joinType === 'LEFT') {
      studentsTable.forEach(s => {
        const d = departmentsTable.find(dept => dept.dept_id === s.dept_id);
        results.push({ ...s, dept_name: d ? d.dept_name : 'NULL' });
      });
    } else if (joinType === 'RIGHT') {
      departmentsTable.forEach(d => {
        const matchingStudents = studentsTable.filter(s => s.dept_id === d.dept_id);
        if (matchingStudents.length > 0) {
          matchingStudents.forEach(s => {
            results.push({ id: s.id, name: s.name, dept_id: d.dept_id, dept_name: d.dept_name });
          });
        } else {
          results.push({ id: 'NULL', name: 'NULL', dept_id: d.dept_id, dept_name: d.dept_name });
        }
      });
    } else { // FULL
      // Combine LEFT and remaining RIGHT
      const left = [];
      studentsTable.forEach(s => {
        const d = departmentsTable.find(dept => dept.dept_id === s.dept_id);
        left.push({ ...s, dept_name: d ? d.dept_name : 'NULL' });
      });
      departmentsTable.forEach(d => {
        if (!studentsTable.some(s => s.dept_id === d.dept_id)) {
          left.push({ id: 'NULL', name: 'NULL', dept_id: d.dept_id, dept_name: d.dept_name });
        }
      });
      results = left;
    }

    return results;
  };

  const results = computeJoinResults();

  return (
    <Card 
      title="Interactive SQL JOIN Venn & Table Visualizer" 
      subtitle="Visualizing tuple matching logic for INNER, LEFT, RIGHT, and FULL OUTER JOINs"
      className="border-edwin-border shadow-md"
    >
      <div className="space-y-6">
        {/* Join Type Buttons */}
        <div className="flex flex-wrap items-center gap-2 p-2 bg-edwin-surface rounded-2xl border border-edwin-border">
          {['INNER', 'LEFT', 'RIGHT', 'FULL'].map((type) => (
            <button
              key={type}
              onClick={() => setJoinType(type)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                joinType === type
                  ? 'bg-edwin-midnight text-white shadow-md'
                  : 'bg-white text-edwin-midnight border border-edwin-border hover:bg-edwin-dawn/30'
              }`}
            >
              {type} JOIN
            </button>
          ))}
        </div>

        {/* Dynamic Venn Graphic */}
        <div className="p-6 bg-edwin-midnight text-white rounded-2xl border border-edwin-dawn/30 flex flex-col md:flex-row items-center justify-around gap-6 relative shadow-inner">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-edwin-dawn">Students Table (Left)</span>
            <div className="w-24 h-24 rounded-full border-4 border-edwin-dawn bg-edwin-navy/80 flex items-center justify-center font-bold text-sm">
              Left
            </div>
          </div>

          <div className="text-center space-y-1">
            <Badge variant="sand">{joinType} JOIN Query</Badge>
            <p className="text-[11px] text-edwin-dawn max-w-xs mt-1">
              {joinType === 'INNER' && 'Returns only tuples where student.dept_id = department.dept_id'}
              {joinType === 'LEFT' && 'Returns all student tuples, padding missing department tuples with NULL'}
              {joinType === 'RIGHT' && 'Returns all department tuples, padding missing student tuples with NULL'}
              {joinType === 'FULL' && 'Returns all tuples from both tables, padding non-matching attributes with NULL'}
            </p>
          </div>

          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-edwin-dawn">Departments Table (Right)</span>
            <div className="w-24 h-24 rounded-full border-4 border-edwin-dawn bg-edwin-navy/80 flex items-center justify-center font-bold text-sm">
              Right
            </div>
          </div>
        </div>

        {/* Live Result Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-edwin-midnight uppercase tracking-wider">
            Query Result Set ({results.length} Tuples Returned)
          </h4>
          <div className="overflow-x-auto border border-edwin-border rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-edwin-surface text-edwin-midnight border-b border-edwin-border font-bold">
                  <th className="p-2.5">Student ID</th>
                  <th className="p-2.5">Student Name</th>
                  <th className="p-2.5">Dept ID</th>
                  <th className="p-2.5">Department Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edwin-border/60 bg-white">
                {results.map((row, idx) => (
                  <tr key={idx} className="hover:bg-edwin-surface/40">
                    <td className="p-2.5 font-mono text-edwin-midnight">{row.id}</td>
                    <td className="p-2.5 font-semibold text-edwin-midnight">{row.name}</td>
                    <td className="p-2.5 font-mono text-edwin-navy">{row.dept_id}</td>
                    <td className="p-2.5 font-bold text-edwin-midnight">
                      <span className={row.dept_name === 'NULL' ? 'text-red-500 font-mono' : 'text-emerald-700'}>
                        {row.dept_name}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Card>
  );
};
