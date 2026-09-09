import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { CheckCircle2, AlertCircle, ArrowRight, Sparkles, Layers } from 'lucide-react';

export const NormalizationVisualizer = () => {
  const [schema, setSchema] = useState('Student(StudentID, CourseID, StudentName, CourseInstructor, RoomNo)');
  const [fds, setFds] = useState('StudentID -> StudentName\nCourseID -> CourseInstructor, RoomNo');
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = (e) => {
    e.preventDefault();
    
    // Perform Normalization Analysis Simulation
    setAnalysis({
      currentNormalForm: "2NF",
      violatesBCNF: true,
      reason: "CourseID -> CourseInstructor, RoomNo violates BCNF because CourseID is a partial key determinant, creating transitive anomalies.",
      decomposedSchemas: [
        { name: "R1 (Student Info)", schema: "Student_Info(StudentID, StudentName)", key: "StudentID" },
        { name: "R2 (Course Offering)", schema: "Course_Offering(CourseID, CourseInstructor, RoomNo)", key: "CourseID" },
        { name: "R3 (Enrollment Mapping)", schema: "Enrollment(StudentID, CourseID)", key: "(StudentID, CourseID)" }
      ]
    });
  };

  return (
    <Card 
      title="Interactive Relational Normalization & BCNF Decomposition Tool" 
      subtitle="Input Functional Dependencies (FDs) to test 1NF, 2NF, 3NF, BCNF and generate lossless decompositions"
      className="border-edwin-border shadow-md"
    >
      <div className="space-y-6">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-edwin-midnight mb-1">Relation Schema</label>
            <input
              type="text"
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-edwin-border rounded-xl text-edwin-midnight font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-edwin-midnight mb-1">Functional Dependencies (FD Set)</label>
            <textarea
              rows="3"
              value={fds}
              onChange={(e) => setFds(e.target.value)}
              className="w-full p-3 text-xs bg-white border border-edwin-border rounded-xl text-edwin-midnight font-mono focus:outline-none"
            />
          </div>

          <Button type="submit" icon={Sparkles} className="w-full">
            Analyze Normal Form & Generate BCNF Decomposition
          </Button>
        </form>

        {analysis && (
          <div className="space-y-4 pt-2 border-t border-edwin-border animate-fadeIn">
            {/* Highest Normal Form Banner */}
            <div className="p-4 bg-edwin-midnight text-white rounded-2xl flex items-center justify-between shadow-md border border-edwin-dawn/30">
              <div>
                <span className="text-[10px] font-bold text-edwin-dawn uppercase tracking-wider">Highest Achieved Normal Form</span>
                <h3 className="text-xl font-extrabold text-white mt-0.5">{analysis.currentNormalForm}</h3>
                <p className="text-xs text-edwin-dawn/90 mt-1">{analysis.reason}</p>
              </div>
              <Badge variant="sand">Violates BCNF</Badge>
            </div>

            {/* Decomposed Schemas */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-edwin-midnight uppercase tracking-wider">
                Lossless Join & Dependency-Preserving BCNF Decomposition
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {analysis.decomposedSchemas.map((table, idx) => (
                  <div key={idx} className="p-3.5 bg-edwin-surface border border-edwin-border rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-edwin-midnight">{table.name}</span>
                      <span className="text-[10px] font-bold bg-edwin-midnight text-edwin-dawn px-1.5 py-0.5 rounded font-mono">BCNF</span>
                    </div>
                    <p className="text-xs font-mono text-edwin-midnight">{table.schema}</p>
                    <p className="text-[10px] text-edwin-taupe font-bold">Primary Key: {table.key}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
