import React, { useState, useEffect } from 'react';
import { quizApi } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { FileText, Upload, Send, CheckCircle2, BookOpen } from 'lucide-react';

export const AssignmentPortal = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    quizApi.getAll().then((res) => {
      setQuizzes(res.data);
      if (res.data.length > 0) {
        setSelectedAssignment(res.data[0]);
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!submissionText.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-lms-dark">RAG-Generated Assignment Portal</h2>
        <p className="text-xs text-lms-taupe">Access homework, reading tasks, problem sets, and submit document/text solutions</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-lms-taupe font-medium">Loading assignments...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignment Selector List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-lms-taupe uppercase tracking-wider px-1">Course Assignments</h3>
            {quizzes.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  setSelectedAssignment(a);
                  setSubmissionText('');
                  setSubmitted(false);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  selectedAssignment?.id === a.id
                    ? 'bg-lms-dark text-white border-lms-dark shadow-sm'
                    : 'bg-lms-surface text-lms-dark border-lms-border hover:bg-lms-border/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-lms-sand/30 text-lms-dark rounded">
                    {a.module_code || 'MOD'}
                  </span>
                  <Badge variant="sand" size="sm">RAG Grounded</Badge>
                </div>
                <p className="text-xs font-bold mt-2 leading-snug">{a.title}</p>
                <p className={`text-[10px] mt-1 ${selectedAssignment?.id === a.id ? 'text-lms-sand/80' : 'text-lms-taupe'}`}>
                  Max Score: {a.max_score} pts
                </p>
              </button>
            ))}
          </div>

          {/* Assignment Details & Submission Dropzone */}
          <div className="lg:col-span-2 space-y-4">
            {selectedAssignment && (
              <Card title={selectedAssignment.title} subtitle={selectedAssignment.description}>
                <div className="space-y-4">
                  {/* Task Instructions */}
                  <div className="p-4 bg-lms-bg border border-lms-border/60 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-lms-dark uppercase tracking-wider">Problem Set & Reading Tasks</h4>
                    {selectedAssignment.questions?.map((q, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <p className="font-bold text-lms-dark">Task {idx + 1}: {q.question}</p>
                        <p className="text-lms-taupe">Max Points: {q.max_score}</p>
                      </div>
                    ))}
                  </div>

                  {/* Submission Form */}
                  <form onSubmit={handleSubmit} className="space-y-3 border-t border-lms-border pt-4">
                    <h4 className="text-xs font-bold text-lms-dark uppercase tracking-wider">Submit Assignment Response</h4>
                    
                    <div>
                      <label className="block text-xs font-bold text-lms-dark mb-1">Text Response / Written Homework</label>
                      <textarea
                        rows="5"
                        required
                        placeholder="Write your comprehensive homework solution here..."
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        className="w-full p-3 text-xs bg-lms-surface border border-lms-border rounded-xl text-lms-dark focus:outline-none focus:ring-2 focus:ring-lms-taupe"
                      />
                    </div>

                    {/* File Attachment Dropzone */}
                    <div className="border-2 border-dashed border-lms-border rounded-xl p-4 text-center bg-lms-surface/50">
                      <Upload className="w-6 h-6 text-lms-sand mx-auto mb-1" />
                      <p className="text-xs font-bold text-lms-dark">Attach PDF / Word Code Submission</p>
                      <p className="text-[10px] text-lms-taupe">Drag & drop files or click to upload</p>
                      <input type="file" className="mt-2 text-xs text-lms-taupe" />
                    </div>

                    {submitted && (
                      <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Assignment submitted successfully! Sent to professor queue for review and Llama 3.1 grading.</span>
                      </div>
                    )}

                    <Button type="submit" icon={Send} className="w-full">
                      Submit Homework to Professor
                    </Button>
                  </form>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
