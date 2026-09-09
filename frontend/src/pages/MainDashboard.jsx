import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { HeroBanner } from '../components/dashboard/HeroBanner';
import { FeaturedCourseCard } from '../components/dashboard/FeaturedCourseCard';
import { QuickAnalyticsWidget } from '../components/dashboard/QuickAnalyticsWidget';
import { AskDBMSDrawer } from '../components/student/AskDBMSDrawer';
import { 
  Bot, Sparkles, Terminal, Trophy, Network, GitMerge, Zap, 
  BarChart2, ArrowRight, ShieldCheck, Database, Layers 
} from 'lucide-react';

export const MainDashboard = () => {
  const navigate = useNavigate();
  const [askDrawerOpen, setAskDrawerOpen] = useState(false);

  const labModules = [
    {
      title: "Interactive SQL IDE",
      desc: "Multi-tab editor, autocomplete, EXPLAIN analyzer, table viewer, & 8 pre-built database schemas.",
      icon: Terminal,
      color: "from-emerald-600 to-teal-800",
      path: "/student/dbms-lab",
      tag: "Live Environment"
    },
    {
      title: "Practice & Evaluation Hub",
      desc: "Solve trainer challenges across Easy to Expert levels with real-time test case comparison.",
      icon: Trophy,
      color: "from-amber-600 to-yellow-800",
      path: "/student/dbms-lab/practice",
      tag: "Automated Grading"
    },
    {
      title: "Visual Database Design Lab",
      desc: "Interactive ER diagrams with draggable entity nodes, PK/FK relationships, and AI schema analysis.",
      icon: Network,
      color: "from-blue-600 to-indigo-800",
      path: "/student/dbms-lab/design",
      tag: "ER Visualizer"
    },
    {
      title: "Normalization Lab (1NF-BCNF)",
      desc: "Step-by-step table decomposition, functional dependency validation, and lossless join checks.",
      icon: GitMerge,
      color: "from-purple-600 to-indigo-900",
      path: "/student/dbms-lab/normalization",
      tag: "Theory in Action"
    },
    {
      title: "ACID Transaction Lab",
      desc: "Interactive BEGIN, COMMIT, ROLLBACK, & SAVEPOINT timeline simulator with isolation levels.",
      icon: Zap,
      color: "from-[#081F5C] to-slate-900",
      path: "/student/dbms-lab/transactions",
      tag: "Concurrency Visualizer"
    },
    {
      title: "Competency & Progress Analytics",
      desc: "Track mastery across DDL, DML, Joins, Aggregation, Subqueries, Indexing, and ACID principles.",
      icon: BarChart2,
      color: "from-sky-700 to-blue-950",
      path: "/student/dbms-lab/analytics",
      tag: "Mastery Radar"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0F5FF] flex flex-col font-sans relative">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto">
        {/* 1. Hero Banner */}
        <HeroBanner />

        {/* 2. DBMS Virtual Lab Interactive Suites Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-[#081F5C] tracking-tight flex items-center gap-2">
                <Database className="w-6 h-6 text-[#081F5C]" />
                DBMS Interactive Virtual Lab Suite
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Complete browser-based SQL environment, schema visualizers, and automated challenge evaluation.
              </p>
            </div>
            <button
              onClick={() => navigate('/student/dbms-lab')}
              className="text-xs font-bold text-[#081F5C] hover:underline flex items-center gap-1"
            >
              Open SQL IDE <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {labModules.map((lab, idx) => {
              const Icon = lab.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigate(lab.path)}
                  className="bg-white border border-[#D0E3FF] hover:border-[#081F5C]/40 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${lab.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#D0E3FF]/50 text-[#081F5C]">
                        {lab.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#081F5C] group-hover:text-blue-700 transition">
                        {lab.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {lab.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#081F5C] group-hover:text-blue-700">
                    <span>Explore Module</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Featured Course Card: Database Management Systems (DBMS) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#081F5C] tracking-tight">Featured Core Course</h2>
            <span className="text-xs font-semibold text-slate-500">CS-501 • Spring Semester</span>
          </div>

          <FeaturedCourseCard />
        </div>

        {/* 4. Quick Analytics & Qwen AI Search Widget */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-[#081F5C] tracking-tight font-sans">Analytics & AI Study Tools</h2>
          <QuickAnalyticsWidget />
        </div>
      </main>

      {/* Floating Ask DBMS AI Assistant Trigger Button */}
      <button
        onClick={() => setAskDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#081F5C] text-white px-5 py-3 rounded-full shadow-2xl hover:bg-[#081F5C]/90 transition-all flex items-center gap-2 border border-[#D0E3FF]/40 hover:scale-105"
      >
        <Bot className="w-5 h-5 text-[#D0E3FF]" />
        <span className="text-xs font-black">Ask DBMS AI</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
      </button>

      {/* RAG Ask Assistant Drawer */}
      <AskDBMSDrawer 
        isOpen={askDrawerOpen} 
        onClose={() => setAskDrawerOpen(false)} 
      />
    </div>
  );
};
