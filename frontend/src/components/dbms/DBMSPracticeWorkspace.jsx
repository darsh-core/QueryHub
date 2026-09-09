import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dbmsLabApi } from '../../services/api';
import { 
  CheckCircle2, XCircle, Play, Send, Sparkles, Trophy, Clock, 
  HelpCircle, ArrowLeft, BookOpen, Layers, Terminal, Award, 
  Check, RefreshCw, Filter, ChevronRight 
} from 'lucide-react';

export const DBMSPracticeWorkspace = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();

  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [activeTopic, setActiveTopic] = useState('ALL');
  const [activeDifficulty, setActiveDifficulty] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Challenge Workspace State
  const [userSql, setUserSql] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  // AI Mentor Hint State
  const [hintText, setHintText] = useState('');
  const [hintLevel, setHintLevel] = useState(1);
  const [hintLoading, setHintLoading] = useState(false);

  useEffect(() => {
    fetchChallenges();
  }, [activeTopic, activeDifficulty]);

  useEffect(() => {
    if (challengeId) {
      fetchSingleChallenge(challengeId);
    }
  }, [challengeId]);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const topicFilter = activeTopic === 'ALL' ? null : activeTopic;
      const diffFilter = activeDifficulty === 'ALL' ? null : activeDifficulty;
      const res = await dbmsLabApi.getChallenges(topicFilter, diffFilter);
      setChallenges(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleChallenge = async (id) => {
    try {
      const res = await dbmsLabApi.getChallengeById(id);
      setSelectedChallenge(res.data);
      setUserSql(res.data.starter_sql || '-- Write your SQL query here\nSELECT ');
      setEvalResult(null);
      setHintText('');
      setHintLevel(1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitSolution = async () => {
    if (!userSql.trim() || !selectedChallenge) return;

    setSubmitting(true);
    try {
      const res = await dbmsLabApi.evaluateSubmission(selectedChallenge.id, userSql);
      setEvalResult(res.data);
    } catch (err) {
      alert("Submission evaluation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestHint = async () => {
    if (!selectedChallenge) return;
    setHintLoading(true);
    try {
      const res = await dbmsLabApi.triggerAiAction({
        action: 'hint',
        challenge_title: selectedChallenge.title,
        topic: selectedChallenge.topic,
        query_text: userSql,
        hint_level: hintLevel
      });
      setHintText(res.data.hint_text);
      setHintLevel(res.data.next_level || 1);
    } catch (err) {
      setHintText('Hint unavailable right now.');
    } finally {
      setHintLoading(false);
    }
  };

  if (selectedChallenge) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50 text-slate-900 font-sans overflow-hidden">
        
        {/* Workspace Top Header Bar */}
        <div className="h-14 px-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedChallenge(null);
                navigate('/student/dbms-lab/practice');
              }}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                {selectedChallenge.title}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedChallenge.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                  selectedChallenge.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                  'bg-purple-100 text-purple-800 border border-purple-200'
                }`}>
                  {selectedChallenge.difficulty}
                </span>
              </h2>
              <p className="text-[10px] text-slate-500 font-medium">
                {selectedChallenge.topic} • {selectedChallenge.database_name} • Max Score: {selectedChallenge.max_score} pts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRequestHint}
              disabled={hintLoading}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{hintLoading ? 'Generating Hint...' : `Request Hint (Level ${hintLevel})`}</span>
            </button>

            <button
              onClick={handleSubmitSolution}
              disabled={submitting}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition disabled:opacity-50"
            >
              {submitting ? 'Evaluating...' : <><Send className="w-4 h-4" /> Submit Solution</>}
            </button>
          </div>
        </div>

        {/* Workspace 2-Panel Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Panel: Problem Statement & Hints */}
          <div className="w-1/2 border-r border-slate-200 flex flex-col bg-white overflow-y-auto p-6 space-y-4 shadow-sm">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Problem Description
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans pt-2">
                {selectedChallenge.description}
              </p>
            </div>

            {/* Test Case Overview Checklist */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Validation Criteria ({selectedChallenge.test_cases?.length || 0} Test Cases)
              </h4>
              <div className="space-y-1.5 text-xs text-slate-700">
                {selectedChallenge.test_cases?.map((tc, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${tc.is_hidden ? 'bg-purple-500' : 'bg-emerald-500'}`} />
                    <span className="font-semibold text-slate-900">{tc.name}</span>
                    {tc.is_hidden && <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 rounded font-bold border border-purple-200">Hidden</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Hint Section */}
            {hintText && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <Sparkles className="w-4 h-4 text-amber-600" /> AI Mentor Hint (Level {hintLevel - 1})
                </div>
                <p className="text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                  {hintText}
                </p>
              </div>
            )}
          </div>

          {/* Right Panel: SQL Editor & Test Case Evaluation Results */}
          <div className="w-1/2 flex flex-col bg-slate-50">
            <div className="h-1/2 border-b border-slate-200 flex flex-col relative bg-white">
              <div className="h-10 px-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>SQL Solution Editor</span>
                <span>Press Submit to Evaluate</span>
              </div>
              <textarea
                value={userSql}
                onChange={(e) => setUserSql(e.target.value)}
                className="w-full h-full p-4 bg-slate-950 text-emerald-400 font-mono text-sm leading-relaxed focus:outline-none resize-none border-none selection:bg-blue-600 selection:text-white"
              />
            </div>

            {/* Evaluation Results Output Panel */}
            <div className="h-1/2 p-4 bg-slate-50 overflow-y-auto space-y-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" /> Automated Test Evaluation Results
              </h4>

              {evalResult ? (
                <div className="space-y-3">
                  <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                    evalResult.is_correct ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <div>
                      <span className="font-extrabold text-sm block">
                        {evalResult.is_correct ? '🎉 Challenge Passed!' : '❌ Incorrect Solution'}
                      </span>
                      <span className="text-xs">
                        Points Earned: <strong className="font-bold">{evalResult.points_earned} pts</strong> • Latency: {evalResult.execution_time_ms} ms
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      evalResult.is_correct ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                    }`}>
                      {evalResult.status}
                    </span>
                  </div>

                  {evalResult.error_message && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 font-mono text-xs rounded-xl">
                      {evalResult.error_message}
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Visible Test Case Outputs</span>
                    {evalResult.visible_test_cases?.map((vt, i) => (
                      <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 text-xs shadow-sm">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-900">{vt.name}</span>
                          <span className={vt.passed ? 'text-emerald-600' : 'text-rose-600'}>
                            {vt.passed ? '✓ PASSED' : '✕ FAILED'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Write your query above and click <strong className="text-slate-700">Submit Solution</strong> to run automated test cases.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Hub Top Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-slate-700 hover:text-slate-900 border border-slate-200"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Trophy className="w-7 h-7 text-amber-500" />
                DBMS SQL Practice & Challenge Hub
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Solve trainer-authored database challenges across DDL, DML, Joins, Aggregation, Subqueries, Indexing, and Transactions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/student/dbms-lab/leaderboard')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl transition shadow flex items-center gap-1.5"
            >
              <Trophy className="w-4 h-4 text-white" /> View Leaderboard
            </button>

            <button
              onClick={() => navigate('/student/dbms-lab/history')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4 text-white" /> Submission Audit
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-blue-600" /> Challenge Topic & Difficulty Filters
            </span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setActiveTopic('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                activeTopic === 'ALL' ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Topics
            </button>
            {['DDL', 'DML', 'Joins', 'Aggregation', 'Subqueries', 'Indexing', 'Transactions'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTopic(t)}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  activeTopic === t ? 'bg-blue-600 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Fetching practice challenges...</p>
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-sm">
            No practice challenges found matching filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {challenges.map((ch) => (
              <div 
                key={ch.id} 
                className="bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      {ch.topic}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ch.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      ch.difficulty === 'Medium' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-purple-100 text-purple-800 border border-purple-200'
                    }`}>
                      {ch.difficulty}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                      {ch.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {ch.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-600">+{ch.max_score} pts</span>
                  <button
                    onClick={() => setSelectedChallenge(ch)}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1"
                  >
                    Solve Challenge <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default DBMSPracticeWorkspace;
