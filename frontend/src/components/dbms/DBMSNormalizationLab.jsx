import React, { useState } from 'react';
import { GitMerge, ArrowRight, CheckCircle2, AlertTriangle, RefreshCw, Layers, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DBMSNormalizationLab = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [unnormalizedData, setUnnormalizedData] = useState({
    table_name: 'student_course_registration',
    columns: ['student_id', 'student_name', 'course_codes', 'course_names', 'instructor_names', 'instructor_offices']
  });

  const [normalForm, setNormalForm] = useState('UNNORMALIZED');

  const steps = [
    {
      step: 1,
      title: 'Unnormalized Form (UNF)',
      desc: 'Table contains multi-valued attributes and composite lists (e.g. course_codes = "CS101, CS202").',
      badge: '0NF'
    },
    {
      step: 2,
      title: 'First Normal Form (1NF)',
      desc: 'Eliminate multi-valued attributes; ensure every column attribute value is atomic.',
      badge: '1NF'
    },
    {
      step: 3,
      title: 'Second Normal Form (2NF)',
      desc: 'Eliminate partial dependencies; non-prime attributes must depend on the full composite primary key.',
      badge: '2NF'
    },
    {
      step: 4,
      title: 'Third Normal Form (3NF)',
      desc: 'Eliminate transitive dependencies (X -> Y -> Z); non-prime attributes must depend only on superkeys.',
      badge: '3NF'
    },
    {
      step: 5,
      title: 'Boyce-Codd Normal Form (BCNF)',
      desc: 'Strict BCNF requirement: For every non-trivial functional dependency X -> Y, X must be a superkey.',
      badge: 'BCNF'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
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
                <GitMerge className="w-7 h-7 text-purple-600" />
                Interactive Normalization Lab (1NF to BCNF)
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Decompose unnormalized relations, test functional dependency closures, and eliminate insertion, update & deletion anomalies.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-purple-100 text-purple-800 font-extrabold rounded-xl text-xs border border-purple-200">
              Active Stage: {steps[currentStep - 1].badge}
            </span>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {steps.map((st) => (
            <button
              key={st.step}
              onClick={() => setCurrentStep(st.step)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                currentStep === st.step
                  ? 'bg-purple-600 text-white border-purple-700 shadow'
                  : currentStep > st.step
                  ? 'bg-white border-purple-200 text-purple-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between font-extrabold text-xs">
                <span>Step {st.step}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  currentStep === st.step ? 'bg-white text-purple-900' : 'bg-slate-100 text-slate-700'
                }`}>
                  {st.badge}
                </span>
              </div>
              <p className="text-xs font-bold mt-1 line-clamp-1">{st.title}</p>
            </button>
          ))}
        </div>

        {/* Normalization Stage Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-xs text-slate-600">{steps[currentStep - 1].desc}</p>
          </div>

          {/* Interactive Stage Visualization */}
          {currentStep === 1 && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> Unnormalized Table Anomalies Detected
                </div>
                <p>Contains repeating groups and multi-valued attributes in 'course_codes' and 'instructor_names'.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-200 text-slate-700 font-bold text-[11px]">
                    <tr>
                      <th className="p-3">student_id</th>
                      <th className="p-3">student_name</th>
                      <th className="p-3 text-rose-700 font-bold">course_codes (Multi-valued)</th>
                      <th className="p-3">instructor_names</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3">101</td>
                      <td className="p-3">Alex Rivera</td>
                      <td className="p-3 text-rose-700 font-bold">"CS101, CS202, CS305"</td>
                      <td className="p-3">"Prof. Christy, Dr. Chen"</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition shadow flex items-center gap-2"
              >
                Proceed to 1NF Conversion <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1NF Conversion Achieved
                </div>
                <p>Atomic attribute values enforced across every cell. Composite key (student_id, course_code) defined.</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-200 text-slate-700 font-bold text-[11px]">
                    <tr>
                      <th className="p-3 text-amber-700">student_id (PK)</th>
                      <th className="p-3 text-amber-700">course_code (PK)</th>
                      <th className="p-3">student_name</th>
                      <th className="p-3">instructor_name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3 font-bold text-amber-700">101</td>
                      <td className="p-3 font-bold text-amber-700">CS101</td>
                      <td className="p-3">Alex Rivera</td>
                      <td className="p-3">Prof. Christy</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-amber-700">101</td>
                      <td className="p-3 font-bold text-amber-700">CS202</td>
                      <td className="p-3">Alex Rivera</td>
                      <td className="p-3">Dr. Chen</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition shadow flex items-center gap-2"
              >
                Decompose to 2NF <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {currentStep >= 3 && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Lossless Decomposition Complete
                </div>
                <p>Relation decomposed into normalized tables. All functional dependencies preserved!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-bold text-purple-900 block">Table 1: students</span>
                  <p className="font-mono text-slate-700"><u>student_id</u>, student_name, email</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-bold text-purple-900 block">Table 2: enrollments</span>
                  <p className="font-mono text-slate-700"><u>student_id</u>, <u>course_id</u>, grade</p>
                </div>
              </div>

              {currentStep < 5 && (
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="px-5 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition shadow flex items-center gap-2"
                >
                  Advance to Next Normal Form <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
