import React, { useState, useEffect } from 'react';
import { quizApi } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { CheckSquare, Cpu, Edit3, User, Eye, AlertCircle, BarChart2 } from 'lucide-react';

export const SubmissionsReview = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideScore, setOverrideScore] = useState('');
  const [instructorComment, setInstructorComment] = useState('');
  const [submittingOverride, setSubmittingOverride] = useState(false);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res = await quizApi.getSubmissions();
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleOpenOverride = (sub) => {
    setSelectedSub(sub);
    setOverrideScore(sub.score.toString());
    setInstructorComment(sub.instructor_comment || '');
    setOverrideModalOpen(true);
  };

  const handleSaveOverride = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    setSubmittingOverride(true);
    try {
      await quizApi.overrideGrade({
        submission_id: selectedSub.id,
        override_score: parseFloat(overrideScore),
        instructor_comment: instructorComment
      });
      setOverrideModalOpen(false);
      loadSubmissions();
    } catch (err) {
      alert('Failed to override grade.');
    } finally {
      setSubmittingOverride(false);
    }
  };

  // Analytics summary calculations
  const totalSubmissions = submissions.length;
  const avgScore = totalSubmissions > 0 
    ? Math.round(submissions.reduce((acc, s) => acc + (s.max_score > 0 ? (s.score / s.max_score) * 100 : 0), 0) / totalSubmissions) 
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-lms-dark">Student Analytics & Manual Grade Override</h2>
        <p className="text-xs text-lms-taupe">Analytics overview of student performance, quiz scores evaluated by Llama 3.1, and manual score overrides</p>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-lms-surface border border-lms-border rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-lms-dark text-lms-sand flex items-center justify-center font-bold">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-lms-taupe uppercase">Total Submissions</p>
            <p className="text-xl font-extrabold text-lms-dark">{totalSubmissions}</p>
          </div>
        </div>

        <div className="p-4 bg-lms-surface border border-lms-border rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-lms-sand/30 text-lms-dark flex items-center justify-center font-bold">
            %
          </div>
          <div>
            <p className="text-[10px] font-bold text-lms-taupe uppercase">Average Class Score</p>
            <p className="text-xl font-extrabold text-lms-dark">{avgScore}%</p>
          </div>
        </div>

        <div className="p-4 bg-lms-surface border border-lms-border rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-lms-taupe uppercase">Llama 3.1 Evaluated</p>
            <p className="text-xl font-extrabold text-lms-dark">100% Automated</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-lms-taupe font-medium">Loading student progress analytics...</div>
      ) : submissions.length === 0 ? (
        <Card className="text-center py-12">
          <CheckSquare className="w-12 h-12 text-lms-taupe mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-lms-dark">No Submissions Recorded</h3>
          <p className="text-xs text-lms-taupe mt-1">Student submissions will be listed here.</p>
        </Card>
      ) : (
        /* Analytics & Submissions Table */
        <Card title="Student Submissions & Score Ledger">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-lms-border bg-lms-bg text-lms-taupe uppercase tracking-wider font-bold">
                  <th className="p-3">Student</th>
                  <th className="p-3">Quiz Title</th>
                  <th className="p-3">Submitted</th>
                  <th className="p-3">Llama 3.1 Score</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lms-border/60">
                {submissions.map((sub) => {
                  const pct = sub.max_score > 0 ? Math.round((sub.score / sub.max_score) * 100) : 0;
                  return (
                    <tr key={sub.id} className="hover:bg-lms-bg/50 transition-colors">
                      <td className="p-3 font-semibold text-lms-dark">
                        <div>{sub.student_name}</div>
                        <div className="text-[10px] text-lms-taupe font-mono">{sub.student_email}</div>
                      </td>
                      <td className="p-3 font-medium text-lms-dark">{sub.quiz_title}</td>
                      <td className="p-3 text-lms-taupe">{new Date(sub.submitted_at).toLocaleDateString()}</td>
                      <td className="p-3 font-extrabold text-lms-dark">
                        {sub.score} / {sub.max_score} <span className="text-[10px] font-normal text-lms-taupe">({pct}%)</span>
                      </td>
                      <td className="p-3">
                        <Badge variant={sub.status === 'OVERRIDDEN' ? 'warning' : 'success'}>
                          {sub.status === 'OVERRIDDEN' ? 'Override Applied' : 'Llama 3.1 Graded'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="outline" size="sm" onClick={() => handleOpenOverride(sub)} icon={Edit3}>
                          Review / Override
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Override Modal */}
      {selectedSub && (
        <Modal 
          isOpen={overrideModalOpen} 
          onClose={() => setOverrideModalOpen(false)} 
          title={`Manual Grade Override: ${selectedSub.quiz_title}`}
        >
          <form onSubmit={handleSaveOverride} className="space-y-4">
            <div className="bg-lms-surface p-3.5 rounded-xl border border-lms-border text-xs space-y-1">
              <p><strong>Student:</strong> {selectedSub.student_name} ({selectedSub.student_email})</p>
              <p><strong>Original AI Score:</strong> {selectedSub.ai_feedback?.overall_score} / {selectedSub.max_score}</p>
            </div>

            {/* Answer & AI Breakdown */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {(selectedSub.ai_feedback?.evaluations || selectedSub.ai_feedback?.question_evaluations)?.map((q, idx) => (
                <div key={idx} className="p-3 bg-lms-bg rounded-lg border border-lms-border/60 text-xs space-y-1">
                  <p className="font-bold text-lms-dark">Q{idx + 1}: Score {q.score_obtained ?? q.score_earned} / {q.max_score}</p>
                  <p className="text-lms-dark italic bg-white/70 p-2 rounded">
                    Student Answer: "{selectedSub.student_answers?.[q.question_id] || selectedSub.student_answers?.[idx + 1] || 'No answer'}"
                  </p>
                  <p className="text-lms-taupe"><strong>AI Feedback:</strong> {q.feedback}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-lms-dark mb-1">Override Score (Max: {selectedSub.max_score})</label>
                <input 
                  type="number"
                  step="0.5"
                  required
                  max={selectedSub.max_score}
                  value={overrideScore}
                  onChange={(e) => setOverrideScore(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-lms-surface border border-lms-border rounded-lg text-lms-dark focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-lms-dark mb-1">Instructor Comments</label>
                <input 
                  type="text"
                  placeholder="Reason for score adjustment..."
                  value={instructorComment}
                  onChange={(e) => setInstructorComment(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-lms-surface border border-lms-border rounded-lg text-lms-dark focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setOverrideModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submittingOverride}>
                {submittingOverride ? 'Saving...' : 'Save & Publish Override Grade'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
