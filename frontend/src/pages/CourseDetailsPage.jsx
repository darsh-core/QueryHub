import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { modulesApi } from '../services/api';
import { Navbar } from '../components/common/Navbar';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Database, Cpu, Layers, ArrowRight, Download, BookOpen, Sparkles, CheckCircle2, Clock } from 'lucide-react';

import bannerImg from '../assets/banner.jpg';

export const CourseDetailsPage = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const location = useLocation();

  const isDsaPath = (courseId && courseId.toLowerCase() === 'dsa') || location.pathname.includes('/course/dsa');
  const [allModules, setAllModules] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(isDsaPath ? 'DSA' : 'DBMS');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      setSelectedCourse(courseId.toLowerCase() === 'dsa' ? 'DSA' : 'DBMS');
    } else if (location.pathname.includes('/course/dsa')) {
      setSelectedCourse('DSA');
    }
  }, [courseId, location.pathname]);

  useEffect(() => {
    modulesApi.getAll().then((res) => {
      const unique = [];
      const seen = new Set();
      for (const m of res.data) {
        if (!seen.has(m.code)) {
          seen.add(m.code);
          unique.push(m);
        }
      }
      setAllModules(unique);
      setLoading(false);
    });
  }, []);

  const handleDownloadSyllabus = () => {
    alert(`Syllabus PDF for ${selectedCourse} downloaded successfully!`);
  };

  const filteredModules = allModules.filter((m) => {
    if (selectedCourse === 'DBMS') return m.code.startsWith('DBMS');
    return m.code.startsWith('DSA');
  });

  return (
    <div className="min-h-screen bg-lms-bg flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Course Filter Tabs */}
        <div className="flex items-center justify-between border-b border-lms-border pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedCourse('DBMS')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                selectedCourse === 'DBMS'
                  ? 'bg-lms-dark text-lms-sand shadow-md'
                  : 'bg-lms-surface text-lms-taupe hover:text-lms-dark border border-lms-border'
              }`}
            >
              <Database className="w-4 h-4" /> DBMS (23IT201)
            </button>

            <button
              onClick={() => setSelectedCourse('DSA')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                selectedCourse === 'DSA'
                  ? 'bg-lms-dark text-lms-sand shadow-md'
                  : 'bg-lms-surface text-lms-taupe hover:text-lms-dark border border-lms-border'
              }`}
            >
              <Cpu className="w-4 h-4" /> Data Structures & Algorithms (23IT202)
            </button>
          </div>

          <span className="text-xs font-bold text-lms-taupe hidden sm:inline">
            Active Course Selection
          </span>
        </div>

        {/* Course Header Banner */}
        <div 
          className="relative overflow-hidden text-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl border border-lms-sand/30 bg-cover bg-center bg-no-repeat transition-all duration-300"
          style={{ backgroundImage: `url(${bannerImg})` }}
        >
          <div className="absolute inset-0 bg-slate-950/65 backdrop-brightness-90"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge variant="sand">{selectedCourse === 'DBMS' ? 'CS-501' : 'CS-502'}</Badge>
                <span className="text-xs text-lms-sand font-bold">Spring Semester</span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                {selectedCourse === 'DBMS' 
                  ? 'Database Management Systems (DBMS)' 
                  : 'Data Structures & Algorithms (DSA)'}
              </h1>
              
              <p className="text-xs sm:text-sm text-lms-surface/90 leading-relaxed">
                {selectedCourse === 'DBMS'
                  ? 'Comprehensive study of relational database design, SQL querying, functional dependencies, 3NF/BCNF normalization, indexing structures (B+ Trees), transaction isolation, and ACID properties.'
                  : 'Master core computational structures, asymptotic complexity analysis (Big-O), arrays, linked lists, stacks, queues, binary search trees (BST), heaps, sorting, graph traversals, and dynamic programming.'}
              </p>

              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-white">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" 
                    alt="Dr. Christy Jeba Malar" 
                    className="w-6 h-6 rounded-full border border-lms-sand"
                  />
                  <span className="font-bold">Prof. Christy (SKCT)</span>
                </div>
                <span className="text-[#F1F6F9]">•</span>
                <span className="text-xs text-[#F1F6F9] font-semibold">{filteredModules.length} Modules • Qwen 2.5 AI Assessed</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              <Button variant="sand" icon={Download} onClick={handleDownloadSyllabus}>
                Download Syllabus PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Interactive Modules List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-lms-dark tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-lms-sand" /> Interactive Course Curriculum ({filteredModules.length} Modules)
            </h2>
            <span className="text-xs font-semibold text-lms-taupe">Click any module to open workspace</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-lms-taupe font-medium">Loading curriculum modules...</div>
          ) : filteredModules.length === 0 ? (
            <div className="bg-lms-surface border border-lms-border rounded-2xl p-12 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-lms-taupe mx-auto opacity-50" />
              <h3 className="text-base font-bold text-lms-dark">No modules uploaded yet for {selectedCourse}</h3>
              <p className="text-xs text-lms-taupe max-w-md mx-auto">
                All mock modules have been removed. Upload course slide decks via the Trainer Portal or switch to DBMS to view active course curriculum.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setSelectedCourse('DBMS')}>
                  Switch to DBMS (CS-501)
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/visualizers')}>
                  Open DSA Visualizer Suite
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredModules.map((mod, idx) => (
                <div
                  key={mod.id}
                  onClick={() => navigate(`/course/module/${mod.id}`)}
                  className="bg-lms-surface border border-lms-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-lms-taupe transition-all duration-200 cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-lms-dark text-lms-sand font-extrabold text-base flex items-center justify-center shrink-0 shadow">
                      M{idx + 1}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-lms-sand bg-lms-dark px-2 py-0.5 rounded">
                          {mod.code}
                        </span>
                        <span className="text-xs text-lms-taupe font-semibold">
                          {mod.lessons?.length || 3} Lecture Slides
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-lms-dark group-hover:text-lms-taupe transition-colors">
                        {mod.title}
                      </h3>

                      <p className="text-xs text-lms-taupe line-clamp-2 leading-relaxed">
                        {mod.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    <Badge variant="sand" className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Qwen Quiz
                    </Badge>
                    <Button variant="primary" size="sm" icon={ArrowRight} className="group-hover:translate-x-1 transition-transform">
                      Open Module
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
