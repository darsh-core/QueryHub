import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, Presentation, Grid, 
  Maximize2, Download, Play, CheckCircle2, Bookmark 
} from 'lucide-react';

export const PPTViewer = ({ slides = [], title = "DBMS_Lecture_Deck.pptx" }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const defaultSlides = slides.length > 0 ? slides : [
    { title: "Slide 1: Introduction to DBMS Architecture", content: "Overview of Database Systems, 3-Schema Architecture, Data Abstraction Levels, and Concurrency Control." },
    { title: "Slide 2: Relational Model & Keys", content: "Primary Keys, Candidate Keys, Foreign Keys, Tuple Integrity Constraints, and Referential Integrity Rules." },
    { title: "Slide 3: Relational Algebra Operators", content: "Selection (σ), Projection (π), Cartesian Product (×), Natural Join (⋈), and Set Operations (∪, ∩, -)." },
    { title: "Slide 4: SQL Query Execution Pipeline", content: "Parsing, Query Translation, Relational Tree Rewriting, Cost-Based Optimizer, and Plan Execution." },
    { title: "Slide 5: Normalization (1NF to BCNF)", content: "Functional Dependencies, Insertion/Deletion Anomalies, 1NF, 2NF, 3NF, and Boyce-Codd Normal Form." },
  ];

  const totalSlides = defaultSlides.length;
  const slide = defaultSlides[currentSlide];

  return (
    <div className={`bg-lms-surface border border-lms-border rounded-3xl overflow-hidden shadow-xl flex flex-col ${isFullScreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full h-[650px]'}`}>
      
      {/* Top Toolbar */}
      <div className="bg-lms-dark text-white px-4 py-3 flex items-center justify-between flex-wrap gap-3 border-b border-lms-sand/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-lms-sand/20 flex items-center justify-center text-lms-sand">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white line-clamp-1">{title}</h3>
            <p className="text-[10px] text-lms-sand font-mono">PPT Slide Deck • Slide {currentSlide + 1} of {totalSlides}</p>
          </div>
        </div>

        {/* Slide Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${showGrid ? 'bg-lms-sand text-lms-dark' : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'}`}
          >
            <Grid className="w-4 h-4" /> Grid View
          </button>

          <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/15">
            <button 
              onClick={() => setCurrentSlide(s => Math.max(s - 1, 0))} 
              disabled={currentSlide === 0}
              className="p-1 hover:bg-white/20 rounded-lg text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-mono text-lms-sand font-bold">{currentSlide + 1} / {totalSlides}</span>
            <button 
              onClick={() => setCurrentSlide(s => Math.min(s + 1, totalSlides - 1))} 
              disabled={currentSlide === totalSlides - 1}
              className="p-1 hover:bg-white/20 rounded-lg text-white disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white border border-white/15"
            title="Full Screen Presentation"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Presentation Content Area */}
      <div className="flex-1 overflow-auto p-6 bg-lms-bg flex justify-center items-center">
        {showGrid ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-5xl">
            {defaultSlides.map((s, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  setCurrentSlide(idx);
                  setShowGrid(false);
                }}
                className={`p-4 bg-white border-2 rounded-2xl cursor-pointer hover:shadow-lg transition-all flex flex-col justify-between h-44 ${idx === currentSlide ? 'border-lms-taupe ring-2 ring-lms-taupe/30' : 'border-lms-border'}`}
              >
                <div>
                  <span className="text-[10px] font-mono font-bold text-lms-taupe bg-lms-sand/30 px-2 py-0.5 rounded-full">Slide {idx + 1}</span>
                  <h4 className="text-xs font-bold text-lms-dark mt-2 line-clamp-2">{s.title}</h4>
                  <p className="text-[11px] text-lms-taupe mt-1 line-clamp-3">{s.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl p-8 sm:p-12 border border-lms-border min-h-[440px] flex flex-col justify-between relative overflow-hidden">
            
            {/* Top Slide Header */}
            <div>
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-lms-border">
                <span className="text-xs font-mono font-extrabold text-lms-dark bg-lms-sand/40 px-3 py-1 rounded-full">
                  DBMS PRESENTATION SLIDE {currentSlide + 1}
                </span>
                <span className="text-xs font-bold text-lms-taupe">SKCT Courseware</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-lms-dark tracking-tight mb-4">
                {slide.title}
              </h2>

              <div className="p-6 bg-lms-surface rounded-2xl border border-lms-border text-lms-dark space-y-3">
                <p className="text-sm font-medium leading-relaxed">
                  {slide.content}
                </p>
              </div>
            </div>

            {/* Slide Navigation Buttons Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-lms-border">
              <button
                onClick={() => setCurrentSlide(s => Math.max(s - 1, 0))}
                disabled={currentSlide === 0}
                className="px-4 py-2 bg-lms-surface text-lms-dark border border-lms-border rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Slide
              </button>

              <span className="text-xs font-mono font-bold text-lms-taupe">Slide {currentSlide + 1} / {totalSlides}</span>

              <button
                onClick={() => setCurrentSlide(s => Math.min(s + 1, totalSlides - 1))}
                disabled={currentSlide === totalSlides - 1}
                className="px-4 py-2 bg-lms-dark text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 shadow-md"
              >
                Next Slide <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
