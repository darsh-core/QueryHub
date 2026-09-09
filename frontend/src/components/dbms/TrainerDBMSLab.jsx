import React, { useState, useEffect } from 'react';
import { dbmsLabApi } from '../../services/api';
import { 
  ShieldCheck, Plus, Sparkles, CheckCircle2, Clock, Users, Eye, 
  Trash2, Edit3, Layers, BookOpen, AlertTriangle, Send 
} from 'lucide-react';

export const TrainerDBMSLab = () => {
  const [activeTab, setActiveTab] = useState('challenges'); // challenges | create | ai_gen | analytics
  const [challenges, setChallenges] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Challenge Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('JOIN');
  const [difficulty, setDifficulty] = useState('Medium');
  const [databaseName, setDatabaseName] = useState('Employee Management');
  const [starterSql, setStarterSql] = useState('-- Starter SQL\nSELECT \n');
  const [referenceSql, setReferenceSql] = useState('');
  const [competencyName, setCompetencyName] = useState('JOIN Operations');
  const [maxScore, setMaxScore] = useState(100);

  // AI Generator State
  const [aiTopic, setAiTopic] = useState('Subqueries & CTEs');
  const [aiDifficulty, setAiDifficulty] = useState('Hard');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGeneratedDraft, setAiGeneratedDraft] = useState(null);

  useEffect(() => {
    fetchTrainerData();
  }, []);

  const fetchTrainerData = async () => {
    setLoading(true);
    try {
      const [cRes, aRes] = await Promise.all([
        dbmsLabApi.getChallenges(),
        dbmsLabApi.getTrainerAnalytics()
      ]);
      setChallenges(cRes.data || []);
      setAnalytics(aRes.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    try {
      await dbmsLabApi.createChallenge({
        title,
        description,
        topic,
        difficulty,
        database_name: databaseName,
        starter_sql: starterSql,
        reference_sql: referenceSql,
        test_cases: [
          { name: "Schema Output Validation", is_hidden: False, description: "Validates returned column structure." },
          { name: "Result Set & Value Verification", is_hidden: False, description: "Checks rows match reference query." },
          { name: "Edge Case & Hidden Test", is_hidden: True, description: "Validates corner case data state." }
        ],
        competency_name: competencyName,
        max_score: parseFloat(maxScore),
        is_published: true
      });

      alert("Challenge published successfully!");
      setTitle('');
      setDescription('');
      setReferenceSql('');
      fetchTrainerData();
      setActiveTab('challenges');
    } catch (err) {
      alert("Error publishing challenge.");
    }
  };

  const handleGenerateAiDraft = async () => {
    setAiGenerating(true);
    try {
      const res = await dbmsLabApi.generateAiChallenge({
        topic: aiTopic,
        difficulty: aiDifficulty,
        competency: `${aiTopic} Operations`
      });
      setAiGeneratedDraft(res.data);
    } catch (err) {
      alert("Failed to generate AI challenge draft.");
    } finally {
      setAiGenerating(false);
    }
  };

  const handlePublishAiDraft = async () => {
    if (!aiGeneratedDraft) return;
    try {
      await dbmsLabApi.createChallenge({
        title: aiGeneratedDraft.title,
        description: aiGeneratedDraft.description,
        topic: aiGeneratedDraft.topic,
        difficulty: aiGeneratedDraft.difficulty,
        database_name: aiGeneratedDraft.database_name,
        starter_sql: aiGeneratedDraft.starter_sql,
        reference_sql: aiGeneratedDraft.reference_sql,
        test_cases: aiGeneratedDraft.test_cases,
        competency_name: aiGeneratedDraft.competency_name,
        max_score: 100.0,
        is_published: true
      });
      alert("AI Challenge approved and published!");
      setAiGeneratedDraft(null);
      fetchTrainerData();
      setActiveTab('challenges');
    } catch (err) {
      alert("Failed to publish draft.");
    }
  };

  const handleDeleteChallenge = async (id) => {
    if (!window.confirm("Are you sure you want to delete this challenge?")) return;
    try {
      await dbmsLabApi.deleteChallenge(id);
      fetchTrainerData();
    } catch (err) {
      alert("Error deleting challenge.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 font-sans bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <div className="p-8 bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-blue-600" /> Trainer DBMS Lab Authoring & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Create custom SQL challenges, generate AI question drafts, map subskill competencies, and track class-wide DBMS mastery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Challenge
          </button>
          <button
            onClick={() => setActiveTab('ai_gen')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-4 h-4" /> AI Question Generator
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('challenges')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'challenges' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          All Challenges ({challenges.length})
        </button>

        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'create' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          Manual Challenge Authoring
        </button>

        <button
          onClick={() => setActiveTab('ai_gen')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'ai_gen' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          AI Question Generator
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          Classroom DBMS Analytics
        </button>
      </div>

      {/* TAB 1: CHALLENGES LIST */}
      {activeTab === 'challenges' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((c) => (
              <div key={c.id} className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {c.topic}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">{c.difficulty}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{c.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">{c.database_name}</span>
                  <button
                    onClick={() => handleDeleteChallenge(c.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete Challenge"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MANUAL CHALLENGE AUTHORING */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateChallenge} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Author New DBMS SQL Challenge</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Challenge Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Find Highest Paid Software Engineer per Department"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Database</label>
              <select
                value={databaseName}
                onChange={(e) => setDatabaseName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="Employee Management">Employee Management</option>
                <option value="College Management">College Management</option>
                <option value="E-Commerce">E-Commerce</option>
                <option value="Hospital Management">Hospital Management</option>
                <option value="Banking">Banking</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Problem Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed instructions and requirements..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reference / Ideal SQL Query Solution</label>
            <textarea
              required
              rows={3}
              value={referenceSql}
              onChange={(e) => setReferenceSql(e.target.value)}
              placeholder="SELECT ... FROM ... WHERE ...;"
              className="w-full px-3 py-2 text-xs bg-slate-900 text-emerald-300 font-mono rounded-xl focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-white" /> Publish Challenge
          </button>
        </form>
      )}

      {/* TAB 3: AI QUESTION GENERATOR */}
      {activeTab === 'ai_gen' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" /> Qwen AI Challenge Generator
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Topic</label>
                <select
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="JOIN">JOIN Operations</option>
                  <option value="GROUP BY & HAVING">GROUP BY & Aggregations</option>
                  <option value="Subqueries & CTEs">Subqueries & CTEs</option>
                  <option value="Window Functions">Window Functions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty</label>
                <select
                  value={aiDifficulty}
                  onChange={(e) => setAiDifficulty(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateAiDraft}
              disabled={aiGenerating}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {aiGenerating ? 'Generating Draft...' : 'Generate Challenge Draft with AI'}
            </button>
          </div>

          {/* AI Draft Review Box */}
          {aiGeneratedDraft && (
            <div className="bg-white text-slate-900 p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> AI Generated Draft (Review Required)
                </span>
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full">{aiGeneratedDraft.difficulty}</span>
              </div>

              <h3 className="text-base font-bold text-slate-900">{aiGeneratedDraft.title}</h3>
              <p className="text-xs text-slate-600">{aiGeneratedDraft.description}</p>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 font-mono">Reference Solution:</span>
                <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-emerald-300">
                  {aiGeneratedDraft.reference_sql}
                </pre>
              </div>

              <button
                onClick={handlePublishAiDraft}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-white" /> Approve & Publish Challenge
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CLASSROOM ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900">Classroom DBMS Competency Metrics</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center font-mono">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-2xl font-black text-blue-600">{analytics?.total_learners ?? 0}</span>
              <p className="text-xs text-slate-500 font-sans mt-1 font-bold">Active Student Learners</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-2xl font-black text-emerald-600">{analytics?.average_pass_rate_pct ?? 0}%</span>
              <p className="text-xs text-slate-500 font-sans mt-1 font-bold">Average Pass Rate</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-2xl font-black text-purple-600">{analytics?.weakest_competency || 'None'}</span>
              <p className="text-xs text-slate-500 font-sans mt-1 font-bold">Weakest Competency Area</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
