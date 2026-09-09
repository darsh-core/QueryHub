import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, BookOpen, ArrowRight, Cpu, Award, Terminal, Trophy } from 'lucide-react';
import { Button } from '../common/Button';
import img1 from '../../assets/img1.png';

export const HeroBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-[#081F5C] text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-[#D0E3FF]/30">
      {/* Background Graphic Accent Overlay */}
      <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-[#D0E3FF]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute right-1/3 top-0 w-64 h-64 bg-[#D0E3FF]/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div className="lg:col-span-2 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D0E3FF]/20 border border-[#D0E3FF]/40 text-[#D0E3FF] rounded-full text-xs font-bold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" /> Powered by Qwen AI • Intelligent SQL Virtual Lab
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white">
            Explore. Query. Optimize. Master.
          </h1>

          <p className="text-xs sm:text-sm text-[#D0E3FF]/95 max-w-2xl leading-relaxed">
            Welcome to an intelligent DBMS learning environment where database concepts become hands-on experiences. Design relational schemas, write and execute SQL in real time, visualize query execution, master normalization from 1NF to BCNF, explore B+ Tree indexing, and understand ACID transactions through interactive simulations.
          </p>

          <p className="text-xs text-[#D0E3FF]/80 max-w-2xl leading-relaxed">
            Get instant AI-powered explanations, progressive hints, query optimization insights, automated SQL evaluation, competency tracking, and personalized learning recommendations — all within one unified virtual database laboratory.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button 
              onClick={() => navigate('/student/dbms-lab')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#D0E3FF] text-[#081F5C] font-extrabold rounded-xl hover:bg-white transition shadow-lg text-sm"
            >
              <Terminal className="w-4 h-4 text-[#081F5C]" /> Launch SQL Virtual Lab
            </button>
            
            <button 
              onClick={() => navigate('/student/dbms-lab/practice')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-[#D0E3FF]/30 text-white font-bold rounded-xl transition text-sm"
            >
              <Trophy className="w-4 h-4 text-amber-300" /> Practice Challenges
            </button>

            <button
              onClick={() => navigate('/course/dbms')}
              className="flex items-center gap-2 px-4 py-2.5 bg-transparent hover:bg-white/5 text-[#D0E3FF] font-semibold text-xs transition"
            >
              <BookOpen className="w-4 h-4" /> Course Modules
            </button>
          </div>
        </div>

        {/* Database Vector Graphic Illustration */}
        <div className="hidden lg:flex flex-col items-center justify-center relative">
          <img 
            src={img1} 
            alt="Interactive DBMS Lab" 
            className="max-h-56 w-auto object-contain rounded-2xl shadow-xl hover:scale-105 transition-transform border border-[#D0E3FF]/20" 
          />
        </div>
      </div>
    </div>
  );
};
