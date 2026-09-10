import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { HeroBanner } from '../components/dashboard/HeroBanner';
import { FeaturedCourseCard } from '../components/dashboard/FeaturedCourseCard';
import { QuickAnalyticsWidget } from '../components/dashboard/QuickAnalyticsWidget';
import { AskDBMSDrawer } from '../components/student/AskDBMSDrawer';
import { 
  Bot, Sparkles, Terminal, Trophy, Network, GitMerge, Zap, 
  BarChart2, ArrowRight, Database 
} from 'lucide-react';

export const MainDashboard = () => {
  const navigate = useNavigate();
  const [askDrawerOpen, setAskDrawerOpen] = useState(false);

  const labModules = [
    {
      title: "Interactive SQL IDE",
      desc: "Multi-tab SQL query editor, autocomplete, EXPLAIN query planner, & 8 live sample databases.",
      icon: Terminal,
      color: "from-emerald-600 to-teal-800",
      path: "/student/dbms-lab",
      tag: "Live IDE"
    },
    {
      title: "Practice & Evaluation Hub",
      desc: "Solve trainer SQL challenges across Easy to Hard levels with automated test case evaluation.",
      icon: Trophy,
      color: "from-amber-600 to-yellow-800",
      path: "/student/dbms-lab/practice",
      tag: "Automated Grading"
    },
    {
      title: "Visual Design & Normalization",
      desc: "Drag-and-drop ER diagram builder, PK/FK relationships, and 1NF to BCNF table decomposition.",
      icon: Network,
      color: "from-blue-600 to-indigo-800",
      path: "/student/dbms-lab/design",
      tag: "ER & BCNF Visualizer"
    },
    {
      title: "ACID Transactions & Analytics",
      desc: "Interactive transaction timeline simulator (BEGIN, COMMIT, ROLLBACK) and competency mastery radar.",
      icon: Zap,
      color: "from-[#081F5C] to-slate-900",
      path: "/student/dbms-lab/transactions",
      tag: "Concurrency & Mastery"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0F5FF] flex flex-col font-sans relative">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* 1. Compact Hero Banner */}
        <HeroBanner />

        {/* 2. Virtual Lab Quick Access Grid (4 Focused Cards) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#081F5C] tracking-tight flex items-center gap-2">
              <Database className="w-4 h-4 text-[#081F5C]" />
              DBMS Virtual Lab Quick Access
            </h2>
            <button
              onClick={() => navigate('/student/dbms-lab')}
              className="text-xs font-bold text-[#081F5C] hover:underline flex items-center gap-1"
            >
              Open SQL IDE <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {labModules.map((lab, idx) => {
              const Icon = lab.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(lab.path)}
                  className="bg-white border border-[#D0E3FF] hover:border-[#081F5C] rounded-xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${lab.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#D0E3FF]/50 text-[#081F5C]">
                        {lab.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-[#081F5C] group-hover:text-blue-700 transition-colors">
                        {lab.title}
                      </h3>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {lab.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#081F5C] group-hover:text-blue-700">
                    <span>Open Module</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Featured Course Syllabus Card */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#081F5C] tracking-tight">Active Course Syllabus</h2>
            <span className="text-xs font-semibold text-slate-500">23IT201 • Database Management Systems</span>
          </div>

          <FeaturedCourseCard />
        </div>

        {/* 4. Analytics & AI Assistant Quick-Search */}
        <div className="space-y-3 pt-1">
          <h2 className="text-base font-bold text-[#081F5C] tracking-tight">Analytics & AI Study Tools</h2>
          <QuickAnalyticsWidget />
        </div>
      </main>

      {/* Floating QueryHub AI Assistant Button */}
      <button
        onClick={() => setAskDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#081F5C] text-white px-4 py-2.5 rounded-full shadow-xl hover:bg-[#0F3470] transition-all flex items-center gap-2 border border-[#D0E3FF]/40 hover:scale-105"
      >
        <Bot className="w-4 h-4 text-[#D0E3FF]" />
        <span className="text-xs font-bold">QueryHub AI</span>
        <Sparkles className="w-3 h-3 text-amber-300" />
      </button>

      {/* RAG Ask Assistant Drawer */}
      <AskDBMSDrawer 
        isOpen={askDrawerOpen} 
        onClose={() => setAskDrawerOpen(false)} 
      />
    </div>
  );
};

