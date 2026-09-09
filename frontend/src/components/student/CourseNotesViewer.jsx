import React, { useState, useEffect } from 'react';
import { modulesApi, ragApi } from '../../services/api';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { FileText, Sparkles, Copy, Check, Search, Bot, MessageSquare, Send, X, BookOpen } from 'lucide-react';

export const CourseNotesViewer = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // AI Assistant Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: 'Hello! I am your AI Course Assistant powered by RAG over your lecture slides and syllabus. Ask me anything about this course!' }
  ]);

  useEffect(() => {
    modulesApi.getAll().then((res) => {
      setModules(res.data);
      if (res.data.length > 0) {
        setSelectedModule(res.data[0]);
      }
      setLoading(false);
    });
  }, []);

  const noteLessons = selectedModule?.lessons?.filter(l => 
    l.content_type === 'NOTES' && 
    (searchQuery === '' || l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.content_text?.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const handleCopyNotes = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAskAssistant = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    const userMsg = aiQuery.trim();
    setAiQuery('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiLoading(true);

    try {
      const res = await ragApi.askAssistant(userMsg, selectedModule?.id);
      setChatHistory(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          text: res.data.answer,
          context: res.data.retrieved_context
        }
      ]);
    } catch (err) {
      setChatHistory(prev => [
        ...prev, 
        { role: 'assistant', text: 'Sorry, I ran into an issue retrieving context from the vector store. Please try again.' }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-lms-dark">RAG-Synthesized Interactive Study Guides</h2>
          <p className="text-xs text-lms-taupe">Context-grounded study notes with search, key takeaways & AI RAG assistant</p>
        </div>

        <Button 
          onClick={() => setDrawerOpen(true)} 
          icon={Bot} 
          variant="sand"
          className="shadow-md"
        >
          Ask AI Assistant
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-lms-taupe absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search notes, formulas, or key terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-lms-surface border border-lms-border rounded-xl text-lms-dark focus:outline-none focus:ring-2 focus:ring-lms-taupe"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-lms-taupe font-medium">Loading course materials...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Module Selector Sidebar */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-lms-taupe uppercase tracking-wider px-1">Course Modules</h3>
            {modules.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedModule(m)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedModule?.id === m.id
                    ? 'bg-lms-dark text-white border-lms-dark shadow-sm'
                    : 'bg-lms-surface text-lms-dark border-lms-border hover:bg-lms-border/30'
                }`}
              >
                <p className="text-xs font-bold font-mono">{m.code}</p>
                <p className="text-xs font-medium truncate">{m.title}</p>
              </button>
            ))}
          </div>

          {/* Notes Content Display */}
          <div className="md:col-span-3 space-y-4">
            {noteLessons.length === 0 ? (
              <Card className="text-center py-12">
                <Sparkles className="w-12 h-12 text-lms-sand mx-auto mb-3 opacity-60" />
                <h3 className="text-base font-bold text-lms-dark">No Matching Study Notes Found</h3>
                <p className="text-xs text-lms-taupe mt-1">Try adjusting your search query or select another module.</p>
              </Card>
            ) : (
              noteLessons.map((note) => (
                <Card 
                  key={note.id} 
                  title={note.title}
                  subtitle={note.description}
                  action={
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCopyNotes(note.content_text)}
                      icon={copied ? Check : Copy}
                    >
                      {copied ? 'Copied' : 'Copy Notes'}
                    </Button>
                  }
                >
                  <div className="p-5 bg-lms-bg rounded-xl border border-lms-border/60 font-sans text-xs text-lms-dark whitespace-pre-line leading-relaxed">
                    {note.content_text}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Slide-out "Ask AI Assistant" RAG Drawer */}
      {drawerOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-lms-surface border-l border-lms-border shadow-2xl flex flex-col animate-slideLeft">
          {/* Drawer Header */}
          <div className="p-4 bg-lms-dark text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-lms-sand" />
              <div>
                <h3 className="font-bold text-sm leading-none">RAG AI Assistant</h3>
                <p className="text-[10px] text-lms-sand mt-0.5">Vector-grounded over lecture materials</p>
              </div>
            </div>
            <button onClick={() => setDrawerOpen(false)} className="text-lms-sand hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Chat Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-lms-bg">
            {chatHistory.map((msg, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-xl text-xs max-w-[90%] leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-lms-dark text-white ml-auto' 
                    : 'bg-lms-surface text-lms-dark border border-lms-border mr-auto'
                }`}
              >
                <p>{msg.text}</p>
                {msg.context && (
                  <details className="mt-2 text-[10px] text-lms-taupe border-t border-lms-border pt-1">
                    <summary className="cursor-pointer font-bold">View Grounded Vector Source Context</summary>
                    <div className="p-2 bg-white/50 rounded mt-1 font-mono text-[9px] max-h-32 overflow-y-auto">
                      {msg.context}
                    </div>
                  </details>
                )}
              </div>
            ))}
            {aiLoading && (
              <div className="p-3 bg-lms-surface border border-lms-border rounded-xl text-xs text-lms-dark mr-auto flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-lms-sand animate-spin" />
                <span>Searching vector store & formulating answer...</span>
              </div>
            )}
          </div>

          {/* Drawer Input */}
          <form onSubmit={handleAskAssistant} className="p-3 border-t border-lms-border bg-lms-surface flex gap-2">
            <input
              type="text"
              placeholder="Ask a question about syllabus..."
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-lms-bg border border-lms-border rounded-lg text-lms-dark focus:outline-none focus:ring-2 focus:ring-lms-taupe"
            />
            <Button type="submit" size="sm" icon={Send} disabled={aiLoading || !aiQuery.trim()}>
              Send
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
