import React, { useState } from 'react';
import { ragApi } from '../../services/api';
import { 
  Bot, Send, X, Sparkles, BookOpen, ExternalLink, 
  CheckCircle2, RefreshCw, FileText 
} from 'lucide-react';

export const AskDBMSDrawer = ({ isOpen, onClose, moduleId = null, moduleTitle = "All DBMS Modules" }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `Hello! I am QueryHub AI, powered by Qwen 2.5 7B RAG. Ask me any question about database architecture, SQL queries, functional dependencies, normalization, transactions, or B+ tree indexing!`,
      citations: []
    }
  ]);

  if (!isOpen) return null;

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userQ = query.trim();
    setQuery('');
    setMessages(prev => [...prev, { sender: 'user', text: userQ }]);
    setLoading(true);

    try {
      const res = await ragApi.askAssistant(userQ, moduleId);
      const data = res.data;
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: data.answer,
          citations: data.citations || []
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: "I am currently unable to connect to QueryHub AI. Please ensure backend services are active.",
          citations: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-lg bg-lms-surface border-l border-lms-border h-full flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-4 bg-lms-dark text-white flex items-center justify-between border-b border-lms-sand/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-lms-sand/20 text-lms-sand flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                QueryHub AI <Sparkles className="w-3.5 h-3.5 text-lms-sand" />
              </h3>
              <p className="text-[10px] text-lms-sand font-mono">Qwen 2.5 7B • RAG Grounded Citations</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-lms-bg">
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl p-4 text-xs font-medium space-y-2 shadow-sm ${
                m.sender === 'user' 
                  ? 'bg-lms-dark text-white rounded-br-none' 
                  : 'bg-white text-lms-dark border border-lms-border rounded-bl-none'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>

                {/* Source Citations Pill Badges */}
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-lms-border/60 space-y-1.5">
                    <span className="text-[10px] font-bold text-lms-taupe uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-lms-dark" /> Verified Document Sources:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.citations.map((c, cIdx) => (
                        <span 
                          key={cIdx} 
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-lms-surface text-lms-dark border border-lms-border"
                        >
                          <FileText className="w-3 h-3 text-lms-taupe" />
                          {c.document} — Page {c.page}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 bg-white border border-lms-border rounded-2xl max-w-xs text-xs font-bold text-lms-taupe animate-pulse">
              <RefreshCw className="w-4 h-4 text-lms-dark animate-spin" />
              QueryHub AI (Qwen 2.5 7B) thinking...
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleAsk} className="p-3 bg-white border-t border-lms-border flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask QueryHub AI about DBMS architecture, 2PL, normal forms..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-3 py-2 text-xs bg-lms-surface border border-lms-border rounded-xl text-lms-dark placeholder-lms-taupe focus:outline-none focus:ring-2 focus:ring-lms-dark font-medium"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="p-2 bg-lms-dark text-white rounded-xl hover:bg-lms-dark/90 disabled:opacity-40 transition-colors shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
