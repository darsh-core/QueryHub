import React from 'react';
import { BookOpen, FileText, CheckSquare, UploadCloud, Sparkles, Layers, PenTool } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, role = 'STUDENT' }) => {
  const professorTabs = [
    { id: 'modules', label: 'Module Manager', icon: Layers, desc: 'Manage courses, chapters & release dates' },
    { id: 'rag-upload', label: 'RAG Knowledge Indexer', icon: UploadCloud, desc: 'Upload documents & vector chunking' },
    { id: 'rag-notes', label: 'RAG Notes & Rubric Builder', icon: Sparkles, desc: 'Generate assignments & configure temperature' },
    { id: 'submissions', label: 'Student Analytics & Grades', icon: CheckSquare, desc: 'Llama 3.1 scores & manual overrides' },
  ];

  const studentTabs = [
    { id: 'courses', label: 'Course Modules', icon: BookOpen, desc: 'Videos, lectures & chapter markers' },
    { id: 'notes', label: 'RAG AI Study Guides', icon: FileText, desc: 'Context-grounded notes & Ask AI' },
    { id: 'assignments', label: 'Assignment Portal', icon: PenTool, desc: 'Homework tasks & text submissions' },
    { id: 'quizzes', label: 'Take Quizzes & Evaluation', icon: CheckSquare, desc: 'Instant feedback via Llama 3.1' },
  ];

  const tabs = role === 'PROFESSOR' ? professorTabs : studentTabs;

  return (
    <aside className="w-full md:w-64 bg-lms-surface border-b md:border-b-0 md:border-r border-lms-border p-4 flex flex-col gap-2">
      <div className="px-3 py-2 text-xs font-bold text-lms-taupe uppercase tracking-wider">
        {role === 'PROFESSOR' ? 'Instructor Control Panel' : 'Student Learning Hub'}
      </div>
      <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200 whitespace-nowrap md:whitespace-normal ${
                isActive
                  ? 'bg-lms-dark text-white shadow-sm ring-1 ring-lms-dark'
                  : 'text-lms-dark hover:bg-lms-border/40 hover:text-lms-dark'
              }`}
            >
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${isActive ? 'text-lms-sand' : 'text-lms-taupe'}`} />
              <div>
                <p className="text-sm font-semibold leading-tight">{tab.label}</p>
                <p className={`text-[11px] mt-0.5 hidden md:block ${isActive ? 'text-lms-sand/80' : 'text-lms-taupe'}`}>
                  {tab.desc}
                </p>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
