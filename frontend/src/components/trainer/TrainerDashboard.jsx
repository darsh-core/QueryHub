import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, modulesApi, ragApi, quizApi } from '../../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell 
} from 'recharts';
import { 
  ShieldCheck, UploadCloud, CheckCircle2, Clock, Users, Eye, 
  Sparkles, Layers, Check, Edit3, Trash2, Send, Plus, RefreshCw, 
  FileText, ExternalLink, HelpCircle, Presentation 
} from 'lucide-react';
import { GoogleClassroomViewerModal } from '../student/GoogleClassroomViewerModal';

export const TrainerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics'); // analytics | upload | generate | review | publisher
  const [analytics, setAnalytics] = useState(null);
  const [modules, setModules] = useState([]);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  // File Upload State
  const [uploadModuleId, setUploadModuleId] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadStep, setUploadStep] = useState(0); // 0: idle, 1: uploading, 2: extracting, 3: embedding, 4: complete
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [materialsList, setMaterialsList] = useState([]);
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // AI Quiz Generator State
  const [genModuleId, setGenModuleId] = useState('');
  const [genNumQuestions, setGenNumQuestions] = useState(5);
  const [genDifficulty, setGenDifficulty] = useState('medium');
  const [genStyle, setGenStyle] = useState('Conceptual');
  const [generating, setGenerating] = useState(false);
  const [genSuccessMsg, setGenSuccessMsg] = useState('');

  // Quiz Publisher State
  const [publisherTitle, setPublisherTitle] = useState('Comprehensive Module Assessment');
  const [publisherDesc, setPublisherDesc] = useState('Qwen 2.5 RAG Assessed Multiple Choice Examination');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [modRes, qRes, aRes, matRes] = await Promise.all([
        modulesApi.getAll(),
        quizApi.getReviewQueue(),
        authApi.getAnalytics(),
        ragApi.getAllMaterials()
      ]);
      setModules(modRes.data);
      setReviewQueue(qRes.data);
      setAnalytics(aRes.data);
      setMaterialsList(matRes.data || []);
      if (modRes.data.length > 0) {
        setUploadModuleId(modRes.data[0].id.toString());
        setGenModuleId(modRes.data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Upload handler with simulated step progression
  const handleMaterialUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadModuleId) return;

    setUploadStep(1);
    try {
      setTimeout(() => setUploadStep(2), 500);
      setTimeout(() => setUploadStep(3), 1000);

      const res = await ragApi.ingestDocument(uploadModuleId, uploadFile, uploadTitle, uploadDescription);

      setTimeout(() => {
        setUploadStep(4);
        const count = res.data.slides_count || res.data.pages_count || 1;
        const typeStr = res.data.file_type === 'PPT' ? 'presentation slides' : 'document pages';
        setUploadSuccessMsg(`Successfully published "${res.data.filename}" to Google Classroom stream! Extracted ${count} ${typeStr}.`);
        setUploadFile(null);
        setUploadTitle('');
        setUploadDescription('');
        fetchInitialData();
      }, 1500);
    } catch (err) {
      alert("Error uploading document.");
      setUploadStep(0);
    }
  };

  // Delete material
  const handleDeleteMaterial = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This will remove it from the student portal.`)) return;
    try {
      await ragApi.deleteMaterial(id);
      fetchInitialData();
    } catch (err) {
      alert("Failed to delete material.");
    }
  };

  // Generate AI Questions
  const handleGenerateAIQuiz = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setGenSuccessMsg('');
    try {
      const res = await quizApi.generateAIQuestions({
        module_id: parseInt(genModuleId),
        num_questions: genNumQuestions,
        difficulty: genDifficulty,
        style: genStyle
      });
      setGenSuccessMsg(res.data.message);
      fetchInitialData();
      setActiveTab('review');
    } catch (err) {
      alert("Failed to generate AI quiz.");
    } finally {
      setGenerating(false);
    }
  };

  // Approve AI question
  const handleApproveQuestion = async (id) => {
    try {
      await quizApi.approveQuestion(id);
      fetchInitialData();
    } catch (err) {
      alert("Error approving question");
    }
  };

  // Reject AI question
  const handleRejectQuestion = async (id) => {
    try {
      await quizApi.rejectQuestion(id);
      fetchInitialData();
    } catch (err) {
      alert("Error deleting question");
    }
  };

  // Toggle selection for quiz publishing
  const toggleQuestionSelection = (id) => {
    setSelectedQuestionIds(prev => 
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  // Publish Quiz to Student LMS
  const handlePublishQuiz = async (e) => {
    e.preventDefault();
    if (selectedQuestionIds.length === 0) {
      alert("Please select at least 1 approved question to publish.");
      return;
    }
    setPublishing(true);
    try {
      const res = await quizApi.publishQuiz({
        module_id: parseInt(genModuleId || modules[0]?.id),
        title: publisherTitle,
        description: publisherDesc,
        duration_minutes: 15,
        question_ids: selectedQuestionIds
      });
      alert(res.data.message);
      setSelectedQuestionIds([]);
      fetchInitialData();
    } catch (err) {
      alert("Error publishing quiz.");
    } finally {
      setPublishing(false);
    }
  };

  const scoreData = analytics?.score_distribution || [];
  const participationData = analytics?.module_participation || [];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fadeIn font-sans">
      
      {/* Header Banner */}
      <div className="p-6 bg-lms-dark text-white rounded-3xl shadow-xl border border-lms-sand/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-lms-sand text-lms-dark rounded-full text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Trainer Portal
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Prof. Christy (SKCT)</h1>
          <p className="text-xs text-lms-sand/90">
            Upload PDF/PPT slide decks, generate Qwen 2.5 RAG quizzes, review citations, and publish assessments.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => navigate('/trainer/dbms-lab')}
            className="px-4 py-2 bg-[#D0E3FF] hover:bg-white text-[#081F5C] rounded-xl text-xs font-extrabold shadow-md transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-[#081F5C]" /> Trainer DBMS Lab Dashboard
          </button>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/15"
          >
            View Public Student LMS
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-lms-border">
        {[
          { id: 'analytics', label: 'Recharts Analytics' },
          { id: 'upload', label: 'Upload Materials' },
          { id: 'generate', label: 'RAG AI Quiz Generator' },
          { id: 'review', label: `Question Review Queue (${reviewQueue.length})` },
          { id: 'publisher', label: 'Quiz Publisher' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-lms-dark text-white shadow-md' 
                : 'bg-lms-surface text-lms-taupe hover:text-lms-dark border border-lms-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: RECHARTS ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-lms-surface border border-lms-border rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-lms-taupe uppercase tracking-wider">Total Visitors</p>
                <p className="text-2xl font-black text-lms-dark mt-1">{analytics?.total_visitors ?? 0}</p>
                <p className="text-[10px] text-emerald-700 font-bold mt-0.5">Live Database Users</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-lms-dark text-white flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-lms-surface border border-lms-border rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-lms-taupe uppercase tracking-wider">Active Online</p>
                <p className="text-2xl font-black text-lms-dark mt-1">{analytics?.active_students_online ?? 0} Students</p>
                <p className="text-[10px] text-lms-taupe mt-0.5">Registered Student Accounts</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-lms-sand text-lms-dark flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-lms-surface border border-lms-border rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-lms-taupe uppercase tracking-wider">DBMS Modules</p>
                <p className="text-2xl font-black text-lms-dark mt-1">{analytics?.total_modules ?? modules.length} Modules</p>
                <p className="text-[10px] text-lms-taupe mt-0.5">Full syllabus active</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-lms-dark text-white flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-lms-surface border border-lms-border rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-lms-taupe uppercase tracking-wider">Quizzes Attempted</p>
                <p className="text-2xl font-black text-lms-dark mt-1">{analytics?.total_attempts ?? 0}</p>
                <p className="text-[10px] text-emerald-700 font-bold mt-0.5">Real Quiz & SQL Submissions</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-lms-sand text-lms-dark flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Recharts Graphical Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Score Distribution Bar Chart */}
            <div className="bg-white border border-lms-border rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-black text-lms-dark">Score Distribution Across Assessments</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#BFD8F8" />
                    <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#002C66' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#002C66' }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#002C66" radius={[8, 8, 0, 0]}>
                      {scoreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#002C66' : '#0A4D9E'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Module Participation & Average Score */}
            <div className="bg-white border border-lms-border rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-black text-lms-dark">Module Participation & Average Score (%)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={participationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#BFD8F8" />
                    <XAxis dataKey="module" tick={{ fontSize: 10, fill: '#002C66' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#002C66' }} />
                    <Tooltip />
                    <Bar dataKey="avg_score" name="Avg Score (%)" fill="#1D61B8" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Visitor Log Table */}
          <div className="bg-white border border-lms-border rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-lms-dark">Live Visitor Log & Student Activity</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-lms-surface text-lms-dark border-b border-lms-border font-bold uppercase tracking-wider">
                    <th className="p-3">User / Student</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Last Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lms-border/60">
                  {analytics?.logged_in_users?.map((u) => (
                    <tr key={u.id} className="hover:bg-lms-surface/40 transition-colors font-medium">
                      <td className="p-3 font-bold text-lms-dark flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-lms-sand text-lms-dark font-bold flex items-center justify-center text-xs">
                          {u.name[0]}
                        </div>
                        {u.name}
                      </td>
                      <td className="p-3 font-mono text-lms-taupe">{u.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'TRAINER' ? 'bg-lms-dark text-white' : 'bg-lms-surface text-lms-dark border border-lms-border'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-lms-taupe">{u.login_time}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status.includes('Online') || u.status.includes('Active') 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-black text-lms-dark">{u.last_quiz_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: UPLOAD MATERIALS */}
      {activeTab === 'upload' && (
        <div className="bg-white border border-lms-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-lms-dark">Attach PDF / PPTX Slide Decks</h3>
            <p className="text-xs text-lms-taupe">
              Upload PDF or PowerPoint (.pptx) lecture notes. Files are automatically parsed into 500-token chunks for Qwen 2.5 RAG quizzes.
            </p>
          </div>

          <form onSubmit={handleMaterialUpload} className="space-y-5 bg-[#ffffff] border border-[#dadce0] rounded-2xl p-6 shadow-xs">
            {/* Header: Google Classroom Material Icon & Action */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#dadce0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1967d2] text-white flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#1f1f1f]">Post Material</h4>
                  <p className="text-xs text-[#5f6368]">
                    Share PDF lecture notes or PowerPoint presentations directly to student Google Classroom stream
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1.5 text-xs text-[#5f6368]">
                  <span className="font-medium">Topic:</span>
                  <select
                    value={uploadModuleId}
                    onChange={(e) => setUploadModuleId(e.target.value)}
                    className="px-2.5 py-1 text-xs bg-white border border-[#dadce0] rounded-lg text-[#1f1f1f] font-semibold focus:outline-none focus:border-[#1967d2]"
                  >
                    {modules.map(m => (
                      <option key={m.id} value={m.id}>{m.code}: {m.title}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!uploadFile || (uploadStep > 0 && uploadStep < 4)}
                  className="px-5 py-2 bg-[#1967d2] hover:bg-[#155724] disabled:bg-[#dadce0] disabled:text-[#80868b] text-white rounded-md text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <UploadCloud className="w-4 h-4" /> Post
                </button>
              </div>
            </div>

            {/* Title & Description inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5f6368] mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Module 1 Lecture: Database Architecture & Relational Model"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#dadce0] focus:border-[#1967d2] rounded-lg text-[#1f1f1f] focus:outline-none focus:ring-1 focus:ring-[#1967d2] transition-all placeholder-[#80868b]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5f6368] mb-1">Description (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Add instructions or overview for your students..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-[#dadce0] focus:border-[#1967d2] rounded-lg text-[#1f1f1f] focus:outline-none focus:ring-1 focus:ring-[#1967d2] transition-all placeholder-[#80868b]"
                />
              </div>

              {/* Attach File Section */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#5f6368]">Attach</label>

                {!uploadFile ? (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#dadce0] hover:border-[#1967d2] rounded-xl cursor-pointer bg-[#fafafa] hover:bg-[#f8fafd] transition-all group">
                    <input
                      type="file"
                      accept=".pptx,.ppt,.pdf"
                      required
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setUploadFile(file);
                          if (!uploadTitle) {
                            setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
                          }
                        }
                      }}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#1967d2] flex items-center justify-center group-hover:scale-105 transition-transform mb-2">
                      <UploadCloud className="w-5 h-5 text-[#1967d2]" />
                    </div>
                    <p className="text-xs font-bold text-[#1967d2]">Upload file</p>
                    <p className="text-[11px] text-[#5f6368] mt-0.5">Click to browse or drag and drop PDF (.pdf) or PowerPoint (.pptx, .ppt)</p>
                  </label>
                ) : (
                  /* Google Classroom Attachment Preview Card */
                  <div className="flex items-center justify-between p-3.5 bg-white border border-[#dadce0] rounded-xl max-w-lg shadow-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                        uploadFile.name.toLowerCase().endsWith('.pdf') ? 'bg-[#fce8e6]' : 'bg-[#fef7e0]'
                      }`}>
                        {uploadFile.name.toLowerCase().endsWith('.pdf') ? (
                          <div className="w-6 h-8 bg-[#ea4335] rounded-xs text-white text-[8px] font-black flex items-center justify-center font-mono">
                            PDF
                          </div>
                        ) : (
                          <Presentation className="w-6 h-6 text-[#b06000]" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#1f1f1f] truncate" title={uploadFile.name}>
                          {uploadFile.name}
                        </p>
                        <p className="text-[11px] text-[#5f6368] mt-0.5">
                          {uploadFile.name.toLowerCase().endsWith('.pdf') ? 'PDF document' : 'PowerPoint presentation'} • {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setUploadFile(null)}
                      className="p-1.5 rounded-full hover:bg-black/5 text-[#5f6368] hover:text-red-600 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Step Progress Tracker */}
            {uploadStep > 0 && (
              <div className="p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-[#1f1f1f]">
                  <span>Publishing to Classroom Stream...</span>
                  <span>Step {uploadStep} of 4</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className={`p-2 rounded-lg text-center text-[10px] font-bold ${uploadStep >= 1 ? 'bg-[#1967d2] text-white' : 'bg-white text-[#5f6368] border border-[#dadce0]'}`}>
                    1. Upload
                  </div>
                  <div className={`p-2 rounded-lg text-center text-[10px] font-bold ${uploadStep >= 2 ? 'bg-[#1967d2] text-white' : 'bg-white text-[#5f6368] border border-[#dadce0]'}`}>
                    2. Extract
                  </div>
                  <div className={`p-2 rounded-lg text-center text-[10px] font-bold ${uploadStep >= 3 ? 'bg-[#1967d2] text-white' : 'bg-white text-[#5f6368] border border-[#dadce0]'}`}>
                    3. Parse Slides
                  </div>
                  <div className={`p-2 rounded-lg text-center text-[10px] font-bold ${uploadStep >= 4 ? 'bg-[#137333] text-white' : 'bg-white text-[#5f6368] border border-[#dadce0]'}`}>
                    4. Published
                  </div>
                </div>
              </div>
            )}

            {uploadSuccessMsg && (
              <div className="p-3.5 bg-[#e6f4ea] text-[#137333] border border-[#ceead6] rounded-xl text-xs font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#137333]" />
                  <span>{uploadSuccessMsg}</span>
                </div>
              </div>
            )}
          </form>

          {/* Uploaded Course Materials & Live Previews */}
          <div className="border-t border-lms-border pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-lms-dark flex items-center gap-2">
                  <Layers className="w-4 h-4 text-lms-sand" /> Active Course Materials in Student Portal ({materialsList.length})
                </h4>
                <p className="text-xs text-lms-taupe">
                  All PDF documents and PPTX slide decks accessible to students in Google Classroom format
                </p>
              </div>
              <button
                type="button"
                onClick={fetchInitialData}
                className="p-1.5 hover:bg-lms-surface rounded-lg text-lms-taupe hover:text-lms-dark text-xs flex items-center gap-1 border border-lms-border"
                title="Refresh materials list"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {materialsList.length === 0 ? (
              <div className="p-8 bg-lms-surface rounded-2xl text-center space-y-2 border border-lms-border">
                <div className="w-10 h-10 rounded-full bg-[#081F5C]/10 text-[#081F5C] flex items-center justify-center mx-auto">
                  <Layers className="w-5 h-5 text-[#081F5C]" />
                </div>
                <h5 className="text-xs font-black text-lms-dark">No Active Materials in Student Portal</h5>
                <p className="text-[11px] text-lms-taupe max-w-sm mx-auto">
                  Upload a PDF document or PPTX presentation slide deck above to make it instantly accessible to students in Google Classroom format.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {materialsList.map((mat) => {
                  const isPdfMat = mat.file_type === 'PDF' || mat.title?.toLowerCase().endsWith('.pdf');
                  return (
                    <div 
                      key={mat.id}
                      className="p-4 bg-lms-surface border border-lms-border rounded-2xl flex flex-col justify-between space-y-3 hover:border-lms-dark transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${
                            isPdfMat ? 'bg-red-600 text-white' : 'bg-[#D9531E] text-white'
                          }`}>
                            {isPdfMat ? 'PDF' : 'P'}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-lms-dark truncate" title={mat.title}>
                              {mat.title}
                            </h5>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-lms-taupe">
                              <span className="font-bold text-lms-dark bg-white px-1.5 py-0.5 rounded border border-lms-border">
                                {mat.module_code || `Module ${mat.module_id}`}
                              </span>
                              <span>•</span>
                              <span>{mat.pages_count} {isPdfMat ? 'Pages' : 'Slides'}</span>
                            </div>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold shrink-0">
                          Live
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-lms-border/60">
                        <span className="text-[10px] text-lms-taupe font-mono">
                          {mat.created_at ? new Date(mat.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently added'}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewMaterial(mat);
                              setPreviewOpen(true);
                            }}
                            className="px-2.5 py-1.5 bg-[#081F5C] hover:bg-[#0F3470] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview as Student
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMaterial(mat.id, mat.title)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold border border-red-200 transition-colors"
                            title="Delete material"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: GENERATE AI QUIZ */}
      {activeTab === 'generate' && (
        <div className="bg-white border border-lms-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-lms-dark flex items-center gap-2">
              Generate AI Quiz via Qwen 2.5 7B <Sparkles className="w-4 h-4 text-lms-sand" />
            </h3>
            <p className="text-xs text-lms-taupe">
              Instruct Qwen 2.5 7B to generate structured MCQs with exact source document and page citations. Generated MCQs enter the Question Review Queue.
            </p>
          </div>

          <form onSubmit={handleGenerateAIQuiz} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-lms-dark mb-1">Target Module</label>
                <select
                  value={genModuleId}
                  onChange={(e) => setGenModuleId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-lms-surface border border-lms-border rounded-xl text-lms-dark font-medium"
                >
                  {modules.map(m => (
                    <option key={m.id} value={m.id}>{m.code}: {m.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-lms-dark mb-1"># Questions</label>
                <select
                  value={genNumQuestions}
                  onChange={(e) => setGenNumQuestions(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-lms-surface border border-lms-border rounded-xl text-lms-dark font-medium"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-lms-dark mb-1">Difficulty</label>
                <select
                  value={genDifficulty}
                  onChange={(e) => setGenDifficulty(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-lms-surface border border-lms-border rounded-xl text-lms-dark font-medium"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-lms-dark mb-1">Style</label>
                <select
                  value={genStyle}
                  onChange={(e) => setGenStyle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-lms-surface border border-lms-border rounded-xl text-lms-dark font-medium"
                >
                  <option value="Conceptual">Conceptual</option>
                  <option value="Analytical">Analytical</option>
                  <option value="Application">Application Based</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-3 bg-lms-dark text-white rounded-xl text-xs font-black shadow-md hover:bg-lms-dark/90 transition-colors flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Qwen 2.5 7B Generating MCQs with Citations...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-lms-sand" /> Generate AI Draft Questions
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: QUESTION REVIEW QUEUE */}
      {activeTab === 'review' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-lms-dark">Question Review Queue ({reviewQueue.length})</h3>
            <p className="text-xs text-lms-taupe">Approve draft questions to add them to the Publisher Bank.</p>
          </div>

          {reviewQueue.length === 0 ? (
            <div className="p-8 bg-white border border-lms-border rounded-3xl text-center text-xs text-lms-taupe font-medium">
              No draft questions pending review. Use the AI Quiz Generator tab to create new MCQs.
            </div>
          ) : (
            reviewQueue.map((q) => (
              <div key={q.id} className="p-6 bg-white border border-lms-border rounded-3xl shadow-xl space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-lms-dark bg-lms-sand px-2.5 py-0.5 rounded-full">
                      {q.module_code}
                    </span>
                    <h4 className="text-sm font-black text-lms-dark mt-2">{q.question_text}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    q.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {q.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options?.map((opt, oIdx) => (
                    <div 
                      key={oIdx}
                      className={`p-2.5 rounded-xl text-xs font-medium border ${
                        opt === q.correct_answer ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900' : 'bg-lms-surface border-lms-border text-lms-dark'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-lms-surface rounded-xl text-xs text-lms-dark border border-lms-border font-medium">
                  <p className="font-bold text-lms-taupe">Explanation:</p>
                  <p>{q.explanation}</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-mono font-bold text-lms-taupe flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-lms-dark" />
                    Source: {q.source_document} — Page {q.source_page}
                  </span>

                  <div className="flex items-center gap-2">
                    {q.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleApproveQuestion(q.id)}
                        className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve Question
                      </button>
                    )}
                    <button
                      onClick={() => handleRejectQuestion(q.id)}
                      className="px-3 py-1.5 bg-red-100 text-red-800 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: QUIZ PUBLISHER */}
      {activeTab === 'publisher' && (
        <div className="bg-white border border-lms-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-lms-dark">Publish Approved Questions to Student LMS</h3>
            <p className="text-xs text-lms-taupe">
              Select approved questions from the repository to compose a new public online assessment.
            </p>
          </div>

          <form onSubmit={handlePublishQuiz} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-lms-dark mb-1">Assessment Title</label>
                <input
                  type="text"
                  required
                  value={publisherTitle}
                  onChange={(e) => setPublisherTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-lms-surface border border-lms-border rounded-xl text-lms-dark font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-lms-dark mb-1">Assessment Description</label>
                <input
                  type="text"
                  required
                  value={publisherDesc}
                  onChange={(e) => setPublisherDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-lms-surface border border-lms-border rounded-xl text-lms-dark font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-lms-dark">
                Select Approved Questions ({selectedQuestionIds.length} selected):
              </label>
              
              <div className="max-h-64 overflow-y-auto space-y-2 border border-lms-border p-3 rounded-2xl bg-lms-surface">
                {reviewQueue.filter(q => q.status === 'APPROVED' || q.status === 'PUBLISHED').map(q => (
                  <div 
                    key={q.id}
                    onClick={() => toggleQuestionSelection(q.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                      selectedQuestionIds.includes(q.id) 
                        ? 'bg-lms-dark text-white border-lms-dark' 
                        : 'bg-white text-lms-dark border-lms-border hover:bg-lms-surface'
                    }`}
                  >
                    <div>
                      <span className="font-bold font-mono text-[10px] opacity-80">{q.module_code}</span>
                      <p className="font-semibold line-clamp-1">{q.question_text}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                      selectedQuestionIds.includes(q.id) ? 'bg-lms-sand text-lms-dark border-lms-sand font-bold' : 'border-lms-border'
                    }`}>
                      {selectedQuestionIds.includes(q.id) && '✓'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={publishing || selectedQuestionIds.length === 0}
              className="w-full py-3 bg-lms-dark text-white rounded-xl text-xs font-black shadow-md hover:bg-lms-dark/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Send className="w-4 h-4" /> Publish Quiz to Public Student Portal
            </button>
          </form>
        </div>
      )}

      {/* Live Google Classroom Modal for Trainer / Teacher Preview */}
      <GoogleClassroomViewerModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        documentTitle={previewMaterial?.title || "Uploaded Course Document"}
        moduleTitle={previewMaterial?.module_title || "Course Material"}
        fileUrl={previewMaterial?.file_url}
        pdfUrl={previewMaterial?.pdf_url}
        slides={previewMaterial?.slides || []}
        pagesCount={previewMaterial?.pages_count || 1}
        rawFileType={previewMaterial?.file_type}
      />

    </div>
  );
};
