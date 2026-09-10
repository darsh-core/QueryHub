import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Terminal, Trophy, Cpu } from 'lucide-react';
import img1 from '../../assets/img1.png';

export const HeroBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-[#081F5C] text-white rounded-2xl p-5 sm:p-6 shadow-md border border-[#D0E3FF]/30">
      {/* Subtle Background Glow */}
      <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-[#D0E3FF]/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#D0E3FF]/20 border border-[#D0E3FF]/30 text-[#D0E3FF] rounded-full text-[11px] font-bold uppercase tracking-wider">
            <Cpu className="w-3 h-3" /> Qwen 2.5 Powered • DBMS Virtual Lab
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug text-white">
            DBMS Learning Portal & SQL Virtual Lab
          </h1>

          <p className="text-xs text-[#D0E3FF]/90 font-normal leading-relaxed">
            Master relational database architecture, write & test SQL queries in real time, visualize ER schemas, and solve practice challenges with instant AI feedback.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button 
              onClick={() => navigate('/student/dbms-lab')}
              className="flex items-center gap-2 px-4 py-2 bg-[#D0E3FF] text-[#081F5C] font-extrabold rounded-lg hover:bg-white transition shadow-sm text-xs"
            >
              <Terminal className="w-3.5 h-3.5 text-[#081F5C]" /> Launch SQL Virtual Lab
            </button>
            
            <button 
              onClick={() => navigate('/student/dbms-lab/practice')}
              className="flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-[#D0E3FF]/30 text-white font-semibold rounded-lg transition text-xs"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-300" /> Practice Challenges
            </button>
          </div>
        </div>

        {/* Hero Graphic Accent */}
        <div className="hidden lg:flex shrink-0">
          <img 
            src={img1} 
            alt="Interactive DBMS Lab" 
            className="h-32 w-auto object-contain rounded-xl shadow-md border border-[#D0E3FF]/20" 
          />
        </div>
      </div>
    </div>
  );
};

