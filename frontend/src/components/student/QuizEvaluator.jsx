import React, { useState, useEffect } from 'react';
import { quizApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { CheckSquare, Cpu, Sparkles, Send, Award, AlertCircle, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

export const QuizEvaluator = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const res = await quizApi.getAll();
      setQuizzes(res.data);
      if (res.data.length > 0) {
        setSelectedQuiz(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (qId, text) => {
    setAnswers({
      ...answers,
      [qId]: text
    });
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    if (!selectedQuiz) return;

    setEvaluating(true);
    setEvaluationResult(null);

    try {
      const res = await quizApi.evaluate({
        quiz_id: selectedQuiz.id,
        student_email: user?.email || "student@gmail.com",
        student_name: user?.name || "Alex Rivera",
        answers: answers
      });
      setEvaluationResult(res.data.evaluation);
    } catch (err) {
      alert("Quiz evaluation failed. Make sure backend service is running.");
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-lms-dark">Automated Llama 3.1 Quiz Portal</h2>
        <p className="text-xs text-lms-taupe">Interactive Multiple Choice & Short Answer quizzes with real-time AI evaluation</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-lms-taupe font-medium">Loading available quizzes...</div>
      ) : quizzes.length === 0 ? (
        <Card className="text-center py-12">
          <CheckSquare className="w-12 h-12 text-lms-taupe mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-lms-dark">No Quizzes Available</h3>
          <p className="text-xs text-lms-taupe mt-1">Check back once your professor publishes new assignments.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quiz Selector Sidebar */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-lms-taupe uppercase tracking-wider px-1">Available Quizzes</h3>
            {quizzes.map((q) => (
              <button
                key={q.id}
                onClick={() => {
                  setSelectedQuiz(q);
                  setAnswers({});
                  setEvaluationResult(null);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  selectedQuiz?.id === q.id
                    ? 'bg-lms-dark text-white border-lms-dark shadow-sm'
                    : 'bg-lms-surface text-lms-dark border-lms-border hover:bg-lms-border/40'
                }`}
              >
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-lms-sand/30 text-lms-dark rounded">
                  {q.module_code || 'MOD'}
                </span>
                <p className="text-xs font-bold mt-1.5 leading-snug">{q.title}</p>
                <p className={`text-[10px] mt-1 ${selectedQuiz?.id === q.id ? 'text-lms-sand/80' : 'text-lms-taupe'}`}>
                  Max Score: {q.max_score} pts
                </p>
              </button>
            ))}
          </div>

          {/* Main Quiz Area & Results */}
          <div className="lg:col-span-3 space-y-6">
            {selectedQuiz && (
              <Card 
                title={selectedQuiz.title} 
                subtitle={`Module Assessment • ${selectedQuiz.questions?.length || 0} Questions • Max Score ${selectedQuiz.max_score}`}
              >
                <form onSubmit={handleSubmitQuiz} className="space-y-6">
                  {selectedQuiz.questions?.map((q, idx) => {
                    const qId = q.question_id || q.id || (idx + 1).toString();
                    const isMC = q.type === 'Multiple Choice' || (q.options && q.options.length > 0);

                    return (
                      <div key={idx} className="p-4 bg-lms-bg border border-lms-border/60 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-bold text-lms-dark flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-lms-dark text-white text-[11px] flex items-center justify-center font-mono">
                              {idx + 1}
                            </span>
                            Question ({q.max_score} points)
                          </p>
                          <Badge variant="sand">{isMC ? 'Multiple Choice' : 'Short Answer'}</Badge>
                        </div>
                        <p className="text-sm font-semibold text-lms-dark leading-relaxed">{q.question}</p>

                        {isMC ? (
                          <div className="space-y-2 pt-1">
                            {q.options?.map((opt, optIdx) => (
                              <label key={optIdx} className="flex items-center gap-2.5 p-2.5 bg-lms-surface border border-lms-border rounded-lg text-xs cursor-pointer hover:bg-lms-border/30">
                                <input
                                  type="radio"
                                  name={`q_${qId}`}
                                  value={opt}
                                  checked={answers[qId] === opt}
                                  onChange={() => handleAnswerChange(qId, opt)}
                                  className="text-lms-dark focus:ring-lms-taupe"
                                />
                                <span className="text-lms-dark font-medium">{opt}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            rows="3"
                            required
                            placeholder="Type your response here..."
                            value={answers[qId] || ''}
                            onChange={(e) => handleAnswerChange(qId, e.target.value)}
                            className="w-full p-3 text-xs bg-lms-surface border border-lms-border rounded-lg text-lms-dark focus:outline-none focus:ring-2 focus:ring-lms-taupe"
                          />
                        )}
                      </div>
                    );
                  })}

                  <Button type="submit" disabled={evaluating} icon={evaluating ? RefreshCw : Send} className="w-full py-3">
                    {evaluating ? 'Llama 3.1 AI Model is Evaluating Answers...' : 'Submit for AI Assessment'}
                  </Button>
                </form>
              </Card>
            )}

            {/* Instant AI Evaluation Results Display */}
            {evaluationResult && (
              <Card 
                title="Llama 3.1 Assessment Report" 
                subtitle={`Evaluation Engine: ${evaluationResult.engine || 'Llama 3.1 Local (Ollama)'}`}
                headerClassName="bg-lms-sand/10"
              >
                <div className="space-y-6">
                  {/* Score Banner */}
                  <div className="p-5 bg-lms-dark text-white rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                      <p className="text-xs text-lms-sand uppercase tracking-wider font-bold">Overall Score Report</p>
                      <h3 className="text-2xl font-black mt-1">
                        {evaluationResult.overall_score} <span className="text-sm font-normal text-lms-sand/80">/ {evaluationResult.max_score} pts ({evaluationResult.percentage}%)</span>
                      </h3>
                      <p className="text-xs text-lms-sand/90 mt-1">{evaluationResult.summary_feedback}</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-lms-sand/20 border border-lms-sand/40 flex items-center justify-center text-lms-sand">
                      <Award className="w-8 h-8" />
                    </div>
                  </div>

                  {/* Question Breakdown */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-lms-taupe uppercase tracking-wider">Per-Question Evaluation & Rubric Comparison</h4>
                    {(evaluationResult.evaluations || evaluationResult.question_evaluations)?.map((ev, i) => (
                      <div key={i} className="p-4 bg-lms-bg border border-lms-border/60 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-bold text-lms-dark flex items-center gap-1.5">
                            {ev.is_correct ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            )}
                            Question {i + 1}
                          </p>
                          <Badge variant={ev.is_correct ? 'success' : 'sand'}>
                            Score: {ev.score_obtained ?? ev.score_earned} / {ev.max_score} pts
                          </Badge>
                        </div>

                        <p className="text-xs text-lms-dark font-medium leading-relaxed">{ev.feedback}</p>

                        {ev.missing_concepts && ev.missing_concepts.length > 0 && (
                          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">Missing Concepts & Rubric Gaps:</span>
                              <ul className="list-disc list-inside mt-0.5">
                                {ev.missing_concepts.map((mc, idx) => (
                                  <li key={idx}>{mc}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
