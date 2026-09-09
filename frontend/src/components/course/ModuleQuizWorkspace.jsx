import React, { useState, useEffect } from 'react';
import { quizApi } from '../../services/api';
import { StudentExamPortal } from '../student/StudentExamPortal';
import { Sparkles, Award, Play, BookOpen, Clock, CheckCircle2 } from 'lucide-react';

export const ModuleQuizWorkspace = ({ moduleData }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (moduleData?.id) {
      setLoading(true);
      quizApi.getByModule(moduleData.id).then((res) => {
        setQuizzes(res.data);
        setLoading(false);
      });
    }
  }, [moduleData]);

  if (activeQuiz) {
    return <StudentExamPortal quiz={activeQuiz} onBack={() => setActiveQuiz(null)} />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      
      <div className="space-y-1">
        <h3 className="text-lg font-black text-lms-dark flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-lms-taupe" /> Qwen 2.5 RAG Assessment Center
        </h3>
        <p className="text-xs text-lms-taupe">
          Take public online assessments for {moduleData?.title}. No student login required. Instant score evaluation and citation feedback.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-lms-taupe font-medium">Loading module assessments...</div>
      ) : quizzes.length === 0 ? (
        <div className="p-12 bg-white border border-lms-border rounded-3xl text-center space-y-3 shadow-xl">
          <Award className="w-12 h-12 text-lms-taupe mx-auto opacity-60" />
          <h4 className="text-base font-black text-lms-dark">No Published Assessments Yet</h4>
          <p className="text-xs text-lms-taupe max-w-md mx-auto">
            The instructor (Prof. Christy) can generate and publish Qwen 2.5 RAG quizzes for this module via the Trainer Portal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((q) => (
            <div key={q.id} className="p-6 bg-white border border-lms-border rounded-3xl shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-lms-dark bg-lms-surface px-2.5 py-0.5 rounded-full border border-lms-border">
                  Published Assessment
                </span>
                <h4 className="text-base font-black text-lms-dark">{q.title}</h4>
                <p className="text-xs text-lms-taupe line-clamp-2">{q.description}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-lms-taupe font-mono pt-2 border-t border-lms-border">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-lms-dark" /> {q.duration_minutes} Mins
                </span>
                <span>{q.questions?.length || 4} Questions</span>
              </div>

              <button
                onClick={() => setActiveQuiz(q)}
                className="w-full py-2.5 bg-lms-dark text-white rounded-xl text-xs font-black shadow-md hover:bg-lms-dark/90 transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" /> Start Online Quiz
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
