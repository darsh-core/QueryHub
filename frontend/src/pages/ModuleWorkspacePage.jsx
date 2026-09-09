import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { modulesApi } from '../services/api';
import { Navbar } from '../components/common/Navbar';
import { SlideViewer } from '../components/course/SlideViewer';
import { ModuleQuizWorkspace } from '../components/course/ModuleQuizWorkspace';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ChevronLeft, Presentation, Sparkles, Layers, BookOpen } from 'lucide-react';

export const ModuleWorkspacePage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [moduleData, setModuleData] = useState(null);
  const [activeTab, setActiveTab] = useState('slides'); // 'slides' or 'quiz'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    modulesApi.getAll().then((res) => {
      const found = res.data.find(m => m.id.toString() === moduleId.toString()) || res.data[0];
      setModuleData(found);
      setLoading(false);
    });
  }, [moduleId]);

  return (
    <div className="min-h-screen bg-lms-bg flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/course/dbms')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-lms-taupe hover:text-lms-dark transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to DBMS Course Modules
          </button>

          <span className="text-xs font-mono font-bold text-lms-dark bg-lms-surface px-2.5 py-1 rounded-lg border border-lms-border">
            Workspace: {moduleData?.code || 'DBMS'}
          </span>
        </div>

        {/* Module Header Title */}
        {loading ? (
          <div className="p-8 text-center text-lms-taupe font-medium">Loading module workspace...</div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="sand">{moduleData?.code}</Badge>
              <span className="text-xs text-lms-taupe font-bold">Interactive Module Workspace</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-black text-lms-dark">
              {moduleData?.title}
            </h1>

            <p className="text-xs text-lms-taupe leading-relaxed max-w-3xl">
              {moduleData?.description}
            </p>
          </div>
        )}

        {/* Tab Navigation Switcher */}
        <div className="flex border-b border-lms-border gap-2">
          <button
            onClick={() => setActiveTab('slides')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'slides'
                ? 'border-lms-dark text-lms-dark bg-lms-surface/50 rounded-t-xl'
                : 'border-transparent text-lms-taupe hover:text-lms-dark'
            }`}
          >
            <Presentation className="w-4 h-4 text-lms-sand" />
            Tab 1: Lecture Slides & PDF Materials
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'quiz'
                ? 'border-lms-dark text-lms-dark bg-lms-surface/50 rounded-t-xl'
                : 'border-transparent text-lms-taupe hover:text-lms-dark'
            }`}
          >
            <Sparkles className="w-4 h-4 text-lms-sand" />
            Tab 2: RAG-Generated Quizzes & Qwen 3.2 Evaluator
          </button>
        </div>

        {/* Workspace Tab Contents */}
        {moduleData && (
          <div>
            {activeTab === 'slides' && (
              <SlideViewer moduleData={moduleData} lessons={moduleData.lessons} />
            )}

            {activeTab === 'quiz' && (
              <ModuleQuizWorkspace moduleData={moduleData} />
            )}
          </div>
        )}
      </main>
    </div>
  );
};
