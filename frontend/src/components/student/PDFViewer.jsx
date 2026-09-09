import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Search, 
  Download, Maximize2, FileText, CheckCircle2, Bookmark 
} from 'lucide-react';

export const PDFViewer = ({ title, filePath, totalPages = 15, onBookmark }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(c => c + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(c => c - 1);
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 25, 200));
  const handleZoomOut = () => setZoom(z => Math.max(z - 25, 75));

  return (
    <div className={`bg-lms-surface border border-lms-border rounded-3xl overflow-hidden shadow-xl flex flex-col ${isFullScreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full h-[650px]'}`}>
      
      {/* Top Toolbar */}
      <div className="bg-lms-dark text-white px-4 py-3 flex items-center justify-between flex-wrap gap-3 border-b border-lms-sand/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-lms-sand/20 flex items-center justify-center text-lms-sand">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white line-clamp-1">{title || "DBMS_Course_Notes.pdf"}</h3>
            <p className="text-[10px] text-lms-sand font-mono">PDF Reader • Page {currentPage} of {totalPages}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-xs hidden sm:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-lms-taupe" />
          <input
            type="text"
            placeholder="Search document text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1 text-xs bg-white/10 border border-white/20 rounded-xl text-white placeholder-lms-sand/60 focus:outline-none focus:ring-1 focus:ring-lms-sand"
          />
        </div>

        {/* Page & Zoom Navigation Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/15">
            <button 
              onClick={handlePrevPage} 
              disabled={currentPage === 1}
              className="p-1 hover:bg-white/20 rounded-lg text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono text-lms-sand font-bold">{currentPage} / {totalPages}</span>
            <button 
              onClick={handleNextPage} 
              disabled={currentPage === totalPages}
              className="p-1 hover:bg-white/20 rounded-lg text-white disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/15">
            <button onClick={handleZoomOut} className="p-1 hover:bg-white/20 rounded-lg text-white">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono text-lms-sand font-bold">{zoom}%</span>
            <button onClick={handleZoomIn} className="p-1 hover:bg-white/20 rounded-lg text-white">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white border border-white/15"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Content Area */}
      <div className="flex-1 overflow-auto p-6 flex justify-center bg-lms-bg">
        <div 
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          className="w-full max-w-3xl bg-white shadow-2xl rounded-2xl p-8 border border-lms-border min-h-[500px] transition-transform duration-200"
        >
          {/* Header Marker */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-lms-border">
            <span className="text-[10px] font-bold text-lms-taupe uppercase tracking-wider">DBMS Course Study Notes</span>
            <span className="text-[10px] font-mono text-lms-dark font-bold bg-lms-sand/30 px-2 py-0.5 rounded-full">Page {currentPage}</span>
          </div>

          {/* Page Content Render Simulation */}
          <div className="space-y-4 text-lms-dark font-sans leading-relaxed text-sm">
            <h2 className="text-xl font-extrabold text-lms-dark tracking-tight">
              Section {currentPage}: Core Database Architecture & Relational Principles
            </h2>

            <p className="text-xs text-lms-taupe leading-relaxed">
              Database management systems organize structured data according to formal relational algebra specifications. 
              The primary key enforces entity integrity by guaranteeing that no two distinct tuples in a relation share identical key attributes.
            </p>

            <div className="p-4 bg-lms-surface border-l-4 border-lms-taupe rounded-r-xl space-y-2">
              <h4 className="text-xs font-bold text-lms-dark">Key Academic Rules (ANSI-SPARC Specification):</h4>
              <ul className="text-xs text-lms-taupe space-y-1 list-disc list-inside font-medium">
                <li>Logical Data Independence protects view schemas from changes to conceptual models.</li>
                <li>Physical Data Independence allows index modifications without altering query logic.</li>
                <li>Boyce-Codd Normal Form (BCNF) strictly requires determinants to be superkeys.</li>
              </ul>
            </div>

            <p className="text-xs text-lms-taupe leading-relaxed">
              When executing queries, cost-based optimizers translate SQL syntax into abstract relational algebra operator trees (σ, π, ⋈). 
              The tree with the minimal estimated disk block reads is selected for execution by the engine.
            </p>
          </div>

          {/* Footer Page Bar */}
          <div className="mt-12 pt-4 border-t border-lms-border flex items-center justify-between text-[10px] text-lms-taupe">
            <span>DBMS Academic Portal • SKCT Department of Computer Science</span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
