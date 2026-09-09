import React, { useState, useEffect } from 'react';
import { quizApi } from '../../services/api';
import { 
  Award, Clock, CheckCircle2, XCircle, ChevronLeft, 
  ChevronRight, AlertCircle, Sparkles, BookOpen, FileText, Send 
} from 'lucide-react';

export const StudentExamPortal = ({ quiz, onBack }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState((quiz.duration_minutes || 15) * 60);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [resultReport, setResultReport] = useState(null);

  const questions = quiz.questions || [];
  const currentQ = questions[currentIdx] || {};
  const qId = currentQ.question_id || (currentIdx + 1).toString();

  useEffect(() => {
    if (resultReport) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resultReport]);

  const handleSelectOption = (optionStr) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: optionStr
    }));
  };

  const handleSubmitQuiz = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    try {
      const res = await quizApi.submit({
        quiz_id: quiz.id,
        student_name: "Student Guest",
        answers: selectedAnswers,
        time_taken_seconds: (quiz.duration_minutes * 60) - timeLeft
      });
      setResultReport(res.data);
    } catch (err) {
      alert("Error submitting exam. Please check connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPct = ((currentIdx + 1) / questions.length) * 100;
  const answeredCount = Object.keys(selectedAnswers).length;

  if (resultReport) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 animate-fadeIn">
        <div className="bg-lms-surface border border-lms-border rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-lms-dark text-white mx-auto flex items-center justify-center shadow-lg">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              resultReport.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {resultReport.passed ? 'Assessment Passed' : 'Needs Review'}
            </span>
            <h2 className="text-3xl font-black text-lms-dark tracking-tight mt-2">
              Score: {resultReport.percentage}%
            </h2>
            <p className="text-xs text-lms-taupe font-medium mt-1">
              You scored {resultReport.score_obtained} out of {resultReport.max_score} points ({resultReport.correct_count} of {resultReport.total_questions} questions correct).
            </p>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={onBack}
              className="px-5 py-2.5 bg-lms-dark text-white rounded-xl text-xs font-bold shadow-md hover:bg-lms-dark/90 transition-colors"
            >
              Return to Module Catalog
            </button>
          </div>
        </div>

        {/* Answer Breakdown with Explanations & Citations */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-lms-dark tracking-tight">Detailed Answer Review & Source Citations</h3>
          
          {resultReport.feedback.map((f, idx) => (
            <div 
              key={idx} 
              className={`p-5 bg-white border-2 rounded-2xl shadow-sm space-y-3 ${
                f.is_correct ? 'border-emerald-200' : 'border-red-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-xs font-bold text-lms-dark">
                  Question {idx + 1}: {f.question}
                </h4>
                <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                  f.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {f.is_correct ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {f.is_correct ? 'Correct' : 'Incorrect'}
                </span>
              </div>

              <div className="text-xs space-y-1 font-medium">
                <p className="text-lms-taupe">Your Answer: <span className="font-bold text-lms-dark">{f.user_answer}</span></p>
                <p className="text-emerald-800 font-bold">Correct Answer: {f.correct_answer}</p>
              </div>

              <div className="p-3 bg-lms-surface rounded-xl text-xs text-lms-dark font-medium border border-lms-border">
                <p className="font-bold mb-1">Academic Explanation:</p>
                <p className="text-lms-taupe">{f.explanation}</p>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-lms-taupe font-mono font-bold pt-1">
                <FileText className="w-3.5 h-3.5 text-lms-dark" />
                <span>Source Grounding: {f.source_document} — Page {f.source_page}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Header Bar */}
      <div className="bg-lms-dark text-white p-4 sm:p-6 rounded-3xl shadow-xl flex items-center justify-between flex-wrap gap-4 border border-lms-sand/20">
        <div>
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs text-lms-sand font-bold hover:underline mb-1"
          >
            <ChevronLeft className="w-4 h-4" /> Exit Exam
          </button>
          <h2 className="text-lg font-black text-white">{quiz.title}</h2>
          <p className="text-xs text-lms-sand/90 font-mono">Qwen 2.5 RAG Assessed Online Quiz</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-white/10 border border-white/20 rounded-xl text-xs font-mono font-bold text-lms-sand flex items-center gap-2">
            <Clock className="w-4 h-4 text-lms-sand" />
            <span>Time Left: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-2 bg-lms-sand text-lms-dark font-black text-xs rounded-xl hover:bg-white transition-colors shadow-md flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" /> Submit Exam
          </button>
        </div>
      </div>

      {/* Progress Bar & Question Selector Grid */}
      <div className="bg-lms-surface border border-lms-border p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-lms-dark">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span className="font-mono text-lms-taupe">{answeredCount} of {questions.length} Answered</span>
        </div>

        <div className="w-full bg-lms-border h-2 rounded-full overflow-hidden">
          <div 
            style={{ width: `${progressPct}%` }}
            className="bg-lms-dark h-full transition-all duration-300"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {questions.map((q, idx) => {
            const qIdStr = q.question_id || (idx + 1).toString();
            const isAnswered = !!selectedAnswers[qIdStr];
            return (
              <button
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all ${
                  idx === currentIdx 
                    ? 'bg-lms-dark text-white ring-2 ring-lms-dark/30 shadow-sm' 
                    : (isAnswered ? 'bg-lms-sand text-lms-dark font-black' : 'bg-white text-lms-taupe border border-lms-border')
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Question Card */}
      <div className="bg-white border border-lms-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-lms-taupe bg-lms-surface px-2.5 py-1 rounded-full border border-lms-border">
            Question #{currentIdx + 1}
          </span>
          <h3 className="text-base sm:text-lg font-black text-lms-dark leading-snug">
            {currentQ.question}
          </h3>
        </div>

        {/* 4 MCQ Option Radio Cards */}
        <div className="space-y-3">
          {currentQ.options?.map((opt, oIdx) => {
            const isSelected = selectedAnswers[qId] === opt;
            return (
              <div
                key={oIdx}
                onClick={() => handleSelectOption(opt)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'bg-lms-surface border-lms-dark ring-2 ring-lms-dark/20 shadow-md' 
                    : 'bg-white border-lms-border hover:bg-lms-surface/50'
                }`}
              >
                <span className="text-xs font-bold text-lms-dark">{opt}</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-lms-dark bg-lms-dark text-white' : 'border-lms-border'
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Next/Prev Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-lms-border">
          <button
            onClick={() => setCurrentIdx(i => Math.max(i - 1, 0))}
            disabled={currentIdx === 0}
            className="px-4 py-2 bg-lms-surface text-lms-dark border border-lms-border rounded-xl text-xs font-bold flex items-center gap-1 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <button
            onClick={() => setCurrentIdx(i => Math.min(i + 1, questions.length - 1))}
            disabled={currentIdx === questions.length - 1}
            className="px-4 py-2 bg-lms-dark text-white rounded-xl text-xs font-bold flex items-center gap-1 disabled:opacity-40 shadow-md"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Submission Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-lms-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-lms-dark">Confirm Exam Submission</h3>
            <p className="text-xs text-lms-taupe font-medium">
              You have answered {answeredCount} out of {questions.length} questions. Are you sure you want to submit your assessment?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-lms-surface text-lms-dark border border-lms-border rounded-xl text-xs font-bold"
              >
                Continue Exam
              </button>
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="px-4 py-2 bg-lms-dark text-white rounded-xl text-xs font-bold shadow-md"
              >
                {submitting ? 'Evaluating...' : 'Yes, Submit Answers'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
