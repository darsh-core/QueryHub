import React, { useState, useEffect } from 'react';
import { dbmsLabApi } from '../../services/api';
import { Award, BookOpen, CheckCircle2, TrendingUp, AlertCircle, ArrowRight, Zap, Target } from 'lucide-react';

export const DBMSStudentAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dbmsLabApi.getStudentAnalytics(1).then((res) => {
      setAnalytics(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-[#081F5C] border-t-transparent rounded-full animate-spin" />
        <span>Loading your DBMS competency progress...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 font-sans bg-slate-50 min-h-screen">
      {/* Top Banner */}
      <div className="p-8 bg-white text-slate-900 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Target className="w-7 h-7 text-blue-600" /> DBMS Competency Progress & Mastery Report
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Real-time competency tracking across SQL fundamentals, relational querying, joins, aggregations, normalization, and query performance.
          </p>
        </div>

        <div className="px-4 py-3 bg-slate-100 rounded-2xl border border-slate-200 text-center font-mono">
          <span className="text-3xl font-black text-blue-600">{analytics?.accuracy_pct || 0}%</span>
          <p className="text-[10px] text-slate-500 font-sans font-bold">Overall Accuracy</p>
        </div>
      </div>

      {/* Subskill Competency Mastery Bars */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-600" /> Subskill Mastery Progress
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics?.competencies?.map((c, idx) => (
            <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-800">{c.subskill_name}</span>
                <span className="font-mono text-blue-600">{c.mastery_pct}%</span>
              </div>

              <div className="h-2 bg-slate-200 rounded-full overflow-hidden w-full">
                <div 
                  style={{ width: `${c.mastery_pct}%` }} 
                  className={`h-full rounded-full ${c.mastery_pct >= 80 ? 'bg-emerald-500' : (c.mastery_pct >= 60 ? 'bg-amber-500' : 'bg-red-500')}`} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized AI Recommendations */}
      <div className="bg-white text-slate-900 p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-500" /> Personalized Learning Recommendations
        </h2>

        <div className="space-y-3">
          {analytics?.recommendations?.map((rec, idx) => (
            <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
              <span className="font-bold text-blue-600 uppercase tracking-wider text-[10px]">
                Target Area: {rec.subskill}
              </span>
              <p className="text-slate-700 leading-relaxed font-sans">{rec.advice}</p>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-bold flex items-center justify-between">
                <span>Recommended Course Unit: {rec.recommended_module}</span>
                <span className="flex items-center gap-1 text-blue-600 hover:underline cursor-pointer">
                  Open Material <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
