import React, { useState } from 'react';
import { ragApi } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { CheckSquare, Sparkles, Send, Bot, Layers, Award } from 'lucide-react';

export const QuickAnalyticsWidget = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState(null);

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setAiAnswer(null);
    try {
      const res = await ragApi.askAssistant(query);
      setAiAnswer(res.data.answer);
    } catch (err) {
      setAiAnswer("Could not retrieve AI response. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Quick Metrics */}
      <div className="space-y-4">
        <div className="p-5 bg-lms-surface border border-lms-border rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-bold text-lms-taupe uppercase tracking-wider">DBMS Course Modules</p>
            <p className="text-2xl font-black text-lms-dark mt-1">5 Modules</p>
            <p className="text-[11px] text-lms-taupe mt-0.5">ER, SQL, Normalization, Indexing, ACID</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-lms-dark text-lms-sand flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-lms-surface border border-lms-border rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-bold text-lms-taupe uppercase tracking-wider">Quizzes Assessed</p>
            <p className="text-2xl font-black text-lms-dark mt-1">5 Quizzes</p>
            <p className="text-[11px] text-emerald-800 font-medium mt-0.5">Evaluated via Qwen 3.2 AI</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-lms-sand/30 text-lms-dark flex items-center justify-center font-bold">
            <Award className="w-6 h-6 text-lms-dark" />
          </div>
        </div>
      </div>

      {/* AI Study Assistant Quick-Ask Box */}
      <Card 
        title="Ask Qwen AI Assistant" 
        subtitle="RAG Vector Search over DBMS Lecture Decks"
        className="lg:col-span-2"
      >
        <form onSubmit={handleAskAI} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. What is BCNF? How does Strict 2PL work? Compare INNER vs LEFT JOIN."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-xs bg-lms-bg border border-lms-border rounded-xl text-lms-dark focus:outline-none focus:ring-2 focus:ring-lms-taupe"
            />
            <Button type="submit" disabled={loading || !query.trim()} icon={Send}>
              {loading ? 'Searching...' : 'Ask AI'}
            </Button>
          </div>

          {aiAnswer && (
            <div className="p-4 bg-lms-bg border border-lms-border/60 rounded-xl space-y-2 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-bold text-lms-dark">
                <Bot className="w-4 h-4 text-lms-sand" /> Qwen 3.2 AI Grounded Response:
              </div>
              <p className="text-xs text-lms-dark whitespace-pre-line leading-relaxed">{aiAnswer}</p>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};
