import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, Printer, Download, ZoomIn, 
  ZoomOut, HelpCircle, ExternalLink, FileText, Presentation, 
  Maximize2, Minimize2, Sidebar, Table as TableIcon, BookOpen, CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { resolveBackendUrl } from '../../services/api';

export const GoogleClassroomViewerModal = ({ 
  isOpen, 
  onClose, 
  documentTitle = "Lecture Material", 
  moduleTitle = "DBMS Module",
  fileUrl = null,
  pdfUrl = null,
  slides = [],
  pagesCount = 1,
  rawFileType = null
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [viewMode, setViewMode] = useState('slide'); // 'slide' | 'text' | 'pdf'

  const resolvedFileUrl = resolveBackendUrl(fileUrl);
  const resolvedPdfUrl = resolveBackendUrl(pdfUrl);

  const isPDF = rawFileType === 'PDF' || 
    (fileUrl && fileUrl.toLowerCase().endsWith('.pdf')) || 
    (documentTitle && documentTitle.toLowerCase().endsWith('.pdf'));

  const isPPT = rawFileType === 'PPT' || 
    (fileUrl && (fileUrl.toLowerCase().endsWith('.pptx') || fileUrl.toLowerCase().endsWith('.ppt'))) || 
    (documentTitle && (documentTitle.toLowerCase().endsWith('.pptx') || documentTitle.toLowerCase().endsWith('.ppt')));

  // Total pages
  const totalPages = Math.max(1, pagesCount || slides.length || 1);

  // Active slide content
  const activeSlideIndex = Math.min(Math.max(0, currentPage - 1), Math.max(0, slides.length - 1));
  const activeSlide = slides.length > 0 ? slides[activeSlideIndex] : null;

  // Effective PDF url (for PDFs or converted PPTX)
  const effectivePdfUrl = isPDF ? (resolvedFileUrl || resolvedPdfUrl) : (resolvedPdfUrl || resolveBackendUrl(activeSlide?.pdf_url) || null);

  // Reset page and mode whenever document changes or opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setZoom(100);
      setViewMode(isPDF ? 'pdf' : (activeSlide?.image_url ? 'slide' : 'text'));
    }
  }, [isOpen, fileUrl, documentTitle, isPDF]);

  // Keyboard navigation for presentation slides
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        setCurrentPage(p => Math.min(totalPages, p + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentPage(p => Math.max(1, p - 1));
      } else if (e.key === 'Escape' && !isFullScreen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, totalPages, isFullScreen, onClose]);

  if (!isOpen) return null;

  const currentSlideTitle = activeSlide?.title || (isPPT ? `Slide ${currentPage}` : `Document Page ${currentPage}`);
  const currentSlideBullets = activeSlide?.bullets || [];
  const currentSlideTables = activeSlide?.tables || [];
  const currentSlideNotes = activeSlide?.notes || '';

  const handleDownloadFile = () => {
    const downloadLink = fileUrl || effectivePdfUrl;
    if (downloadLink) {
      const link = document.createElement('a');
      link.href = downloadLink;
      link.download = documentTitle || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Downloading ${documentTitle}...`);
    }
  };

  const handlePrint = () => {
    if (effectivePdfUrl) {
      const printWindow = window.open(effectivePdfUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
        printWindow.print();
      }
    } else {
      window.print();
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-[#121212] text-white flex flex-col font-sans animate-fadeIn select-none ${isFullScreen ? 'p-0' : ''}`}>
      
      {/* 1. Top Google Classroom Navigation & Toolbar */}
      <div className="h-14 bg-[#202124] border-b border-[#3c4043] px-3 sm:px-4 flex items-center justify-between shrink-0 select-none z-20">
        
        {/* Left: Back Arrow, Type Badge, Document Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 max-w-xs sm:max-w-sm">
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition-colors shrink-0"
            title="Close viewer (Esc)"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 shadow-sm ${
              isPDF ? 'bg-[#ea4335] text-white' : 'bg-[#fbbc04] text-gray-900'
            }`}>
              {isPDF ? 'PDF' : <Presentation className="w-4 h-4 text-[#b06000]" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-semibold text-white tracking-tight truncate" title={documentTitle}>
                {documentTitle}
              </h2>
              <p className="text-[10px] text-gray-400 font-medium truncate">
                {moduleTitle} • {isPDF ? 'PDF Document' : 'Google Slides Presentation'}
              </p>
            </div>
          </div>
        </div>

        {/* Center-Left: Mode Toggle for Slides (Original Slides vs Structured Text vs PDF) */}
        {isPPT && (
          <div className="hidden md:flex items-center bg-[#2A2B2D] p-1 rounded-xl border border-[#3C4043] text-xs">
            <button
              onClick={() => setViewMode('slide')}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'slide' 
                  ? 'bg-[#4285F4] text-white shadow-sm font-bold' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title="Show exact visual presentation slides"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Original Slides</span>
            </button>

            <button
              onClick={() => setViewMode('text')}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                viewMode === 'text' 
                  ? 'bg-[#4285F4] text-white shadow-sm font-bold' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              title="Show structured bullet points and speaker notes"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Text & Notes</span>
            </button>

            {effectivePdfUrl && (
              <button
                onClick={() => setViewMode('pdf')}
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  viewMode === 'pdf' 
                    ? 'bg-[#4285F4] text-white shadow-sm font-bold' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                title="View full slide deck as PDF"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>PDF Document</span>
              </button>
            )}
          </div>
        )}

        {/* Center: Open With Google Docs / Google Slides Button */}
        {fileUrl && !isPPT && (
          <div className="hidden lg:flex items-center">
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-[#303134] hover:bg-[#3c4043] border border-[#5f6368] text-white rounded-full text-xs font-medium flex items-center gap-2 shadow-xs transition-colors"
              title="Open document in browser tab"
            >
              <span className="w-2 h-2 rounded-full bg-[#ea4335]" />
              <span>Open with Google Docs</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
          </div>
        )}

        {/* Middle Toolbar: Page Nav, Zoom Controls, Print, Download */}
        <div className="flex items-center gap-2 sm:gap-4 bg-[#28292a] px-2.5 py-1 rounded-xl border border-[#3c4043]">
          
          {/* Slide / Page Counter Navigation */}
          <div className="flex items-center gap-1 text-xs text-gray-300 font-mono">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 hover:bg-white/10 rounded disabled:opacity-30 transition-colors"
              title="Previous (←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="hidden sm:inline text-gray-400">{isPDF ? 'Page' : 'Slide'}</span>
            <input 
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) {
                  setCurrentPage(Math.min(totalPages, Math.max(1, val)));
                }
              }}
              className="w-9 px-1 py-0.5 bg-[#141414] border border-[#555] rounded text-center text-white text-xs font-mono focus:outline-none focus:border-[#4285F4]"
            />
            <span className="text-gray-400">/ {totalPages}</span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 hover:bg-white/10 rounded disabled:opacity-30 transition-colors"
              title="Next (→)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-gray-600 hidden sm:block" />

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-1">
            <button 
              onClick={() => setZoom(z => Math.max(z - 15, 60))}
              className="p-1 hover:bg-white/10 rounded text-gray-300 hover:text-white transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] text-gray-300 font-mono w-10 text-center">{zoom}%</span>
            <button 
              onClick={() => setZoom(z => Math.min(z + 15, 175))}
              className="p-1 hover:bg-white/10 rounded text-gray-300 hover:text-white transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <div className="h-4 w-px bg-gray-600 hidden sm:block" />

          {/* Print & Download Actions */}
          <button 
            onClick={handlePrint}
            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors"
            title="Print document"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button 
            onClick={handleDownloadFile}
            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors flex items-center gap-1"
            title="Download uploaded original file"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline text-[11px] font-medium">Download</span>
          </button>
        </div>

        {/* Right Action: Open in New Tab, Fullscreen, Thumbnail Toggle */}
        <div className="flex items-center gap-2">
          {isPPT && (
            <button
              onClick={() => setShowThumbnails(!showThumbnails)}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                showThumbnails ? 'bg-white/20 text-white border-white/30' : 'bg-transparent text-gray-400 border-[#444] hover:text-white'
              }`}
              title="Toggle slide thumbnail list"
            >
              <Sidebar className="w-4 h-4" />
              <span className="hidden lg:inline text-[11px]">Slides</span>
            </button>
          )}

          <button 
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-colors"
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen presentation mode"}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {(fileUrl || effectivePdfUrl) && (
            <a 
              href={fileUrl || effectivePdfUrl} 
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-[#4285F4] hover:bg-[#3367D6] rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm transition-colors"
              title="Open raw file directly in browser tab"
            >
              <span className="hidden sm:inline">Open in Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* 2. Main Content Viewport */}
      <div className="flex-1 overflow-hidden bg-[#181818] flex">
        
        {/* If PPT: Left Slides Thumbnail Bar (Authentic Google Slides style with thumbnails) */}
        {isPPT && showThumbnails && slides.length > 0 && (
          <aside className="w-48 sm:w-56 bg-[#1F1F1F] border-r border-[#333333] overflow-y-auto p-3 space-y-2.5 shrink-0 hidden md:block select-none">
            <div className="flex items-center justify-between pb-1 px-1 border-b border-[#333]">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Slide Decks ({slides.length})</span>
              <span className="text-[9px] font-mono text-gray-500">Google Slides</span>
            </div>

            {slides.map((s, idx) => {
              const slideNum = idx + 1;
              const isSelected = slideNum === currentPage;
              return (
                <div 
                  key={idx}
                  onClick={() => setCurrentPage(slideNum)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-[#2A2A2A] border-[#4285F4] ring-2 ring-[#4285F4]/40 shadow-lg text-white' 
                      : 'bg-[#181818] border-[#333] hover:border-gray-500 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {/* Real visual slide thumbnail if available */}
                  {s.image_url ? (
                    <div className="w-full aspect-[16/9] bg-black rounded-lg overflow-hidden border border-gray-700/60 mb-1.5 relative shadow-xs">
                      <img 
                        src={resolveBackendUrl(s.image_url)} 
                        alt={`Slide ${slideNum}`} 
                        className="w-full h-full object-contain bg-[#111]"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="absolute top-1 left-1 bg-black/75 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold text-white">
                        {slideNum}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className={`font-mono font-bold px-1.5 py-0.2 rounded text-[9px] ${
                        isSelected ? 'bg-[#4285F4] text-white' : 'bg-[#2E2E2E] text-gray-400'
                      }`}>
                        {slideNum}
                      </span>
                      <span className="text-[8px] text-gray-500 uppercase truncate max-w-[80px]">Slide {slideNum}</span>
                    </div>
                  )}

                  <p className="text-[11px] font-semibold line-clamp-1 leading-tight">
                    {s.title || `Slide ${slideNum}`}
                  </p>

                  <div className="h-1 bg-[#333] rounded-full overflow-hidden w-full mt-1.5">
                    <div className={`h-full ${isSelected ? 'bg-[#4285F4] w-full' : 'bg-gray-600 w-1/3'}`} />
                  </div>
                </div>
              );
            })}
          </aside>
        )}

        {/* Center Viewer Canvas */}
        <main className="flex-1 overflow-auto p-3 sm:p-6 flex flex-col items-center justify-center relative">
          
          {/* 2A. PDF VIEWER (Direct browser native embedding without 404) */}
          {isPDF ? (
            <div className="w-full max-w-6xl h-full min-h-[640px] flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-400 relative">
              {effectivePdfUrl ? (
                <iframe 
                  src={`${effectivePdfUrl}#toolbar=1&navpanes=1&statusbar=1&view=FitH`} 
                  title={documentTitle}
                  className="w-full flex-1 min-h-[680px] border-0"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-700 space-y-3">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto" />
                  <h3 className="text-lg font-bold text-gray-900">PDF File Ready to View</h3>
                  <p className="text-xs text-gray-500 max-w-md">
                    The uploaded document <span className="font-semibold text-gray-800">"{documentTitle}"</span> is available in the course repository.
                  </p>
                  <button
                    onClick={handleDownloadFile}
                    className="px-4 py-2 bg-[#081F5C] text-white rounded-xl text-xs font-bold hover:bg-[#0F3470]"
                  >
                    Download & Open PDF
                  </button>
                </div>
              )}

              {/* Bottom PDF Status Bar */}
              <div className="bg-[#F8FAFC] border-t border-gray-200 px-4 py-2 text-xs text-gray-600 flex items-center justify-between">
                <span className="font-semibold text-gray-700">Document: {documentTitle}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-gray-500">Google Classroom Embedded PDF Viewer</span>
                  <button 
                    onClick={handleDownloadFile}
                    className="text-xs text-[#081F5C] font-bold hover:underline"
                  >
                    Save Copy
                  </button>
                </div>
              </div>
            </div>
          ) : viewMode === 'slide' && activeSlide?.image_url ? (
            /* 2B. AUTHENTIC SLIDE IMAGE RENDERER (100% Exact Presentation Layout, Backgrounds, Diagrams & Fonts) */
            <div className="w-full flex flex-col items-center justify-center my-auto">
              <div 
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
                className="transition-transform duration-150 relative max-w-5xl w-full flex items-center justify-center shadow-2xl rounded-xl overflow-hidden border border-[#333] bg-[#0c0c0d]"
              >
                <img 
                  src={resolveBackendUrl(activeSlide.image_url)} 
                  alt={currentSlideTitle}
                  onError={() => setViewMode('text')}
                  className="max-h-[75vh] w-auto max-w-full object-contain select-none block rounded-lg"
                />
              </div>

              {/* Bottom Slide Navigation Bar */}
              <div className="flex items-center justify-between w-full max-w-4xl text-xs text-gray-400 font-mono px-2 pt-3 select-none">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-[#2D2D2D] hover:bg-[#383838] text-white rounded-lg disabled:opacity-30 flex items-center gap-1.5 transition-colors font-sans font-bold shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous Slide
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-gray-300">Slide <span className="font-bold text-white">{currentPage}</span> of {totalPages} • Use arrow keys to navigate</span>
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-[#2D2D2D] hover:bg-[#383838] text-white rounded-lg disabled:opacity-30 flex items-center gap-1.5 transition-colors font-sans font-bold shadow-xs"
                >
                  Next Slide <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : viewMode === 'pdf' && effectivePdfUrl ? (
            /* 2C. CONVERTED PPTX AS SCROLLABLE PDF */
            <div className="w-full max-w-6xl h-full min-h-[640px] flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-400 relative">
              <iframe 
                src={`${effectivePdfUrl}#toolbar=1&navpanes=1&statusbar=1&view=FitH&page=${currentPage}`} 
                title={documentTitle}
                className="w-full flex-1 min-h-[680px] border-0"
              />
            </div>
          ) : (
            /* 2D. STRUCTURED TEXT & NOTES VIEW */
            <div 
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
              className="w-full max-w-5xl transition-transform duration-150 space-y-4 my-auto select-text"
            >
              <div className="bg-white text-gray-900 shadow-2xl rounded-xl overflow-hidden border border-gray-300 min-h-[520px] flex flex-col justify-between">
                
                {/* Header */}
                <div className="bg-[#081F5C] text-white px-6 py-3 font-bold text-xs uppercase tracking-wider flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#E5B54F]" />
                    <span>23IT201 • DATABASE MANAGEMENT SYSTEMS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/80 font-mono uppercase">{moduleTitle}</span>
                    <span className="font-mono text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold">
                      SLIDE {currentPage} / {totalPages}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-8 sm:p-12 flex-1 space-y-6 flex flex-col justify-between">
                  <div className="space-y-2 border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0F3470]">
                      <Presentation className="w-4 h-4 text-[#081F5C]" />
                      <span>Lecture Slide Deck • {documentTitle}</span>
                    </div>
                    <h1 className={`${currentSlideTitle.length > 90 ? 'text-base sm:text-lg' : (currentSlideTitle.length > 50 ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl')} font-black text-[#081F5C] tracking-tight leading-snug`}>
                      {currentSlideTitle}
                    </h1>
                  </div>

                  <div className="flex-1 space-y-4">
                    {currentSlideBullets.length > 0 ? (
                      <ul className="space-y-3.5 text-sm sm:text-base text-gray-800 leading-relaxed list-none">
                        {currentSlideBullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="flex items-start gap-3">
                            <span className="w-2 h-2 rounded-full bg-[#081F5C] mt-2 shrink-0" />
                            <span 
                              className="flex-1"
                              dangerouslySetInnerHTML={{
                                __html: bullet.replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-[#081F5C]">$1</strong>')
                              }}
                            />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-6 bg-[#F0F5FF] rounded-xl border border-[#C7D9F8] text-sm text-[#081F5C] leading-relaxed whitespace-pre-line font-medium">
                        {activeSlide?.content || `Slide ${currentPage} content from uploaded presentation deck "${documentTitle}".`}
                      </div>
                    )}

                    {currentSlideTables.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                          <TableIcon className="w-4 h-4 text-[#081F5C]" />
                          <span>Slide Data Table:</span>
                        </div>
                        {currentSlideTables.map((tableRows, tIdx) => (
                          <div key={tIdx} className="overflow-x-auto border border-gray-300 rounded-lg shadow-xs">
                            <table className="min-w-full divide-y divide-gray-200 text-xs text-left">
                              <tbody className="divide-y divide-gray-100">
                                {tableRows.map((row, rIdx) => (
                                  <tr key={rIdx} className={rIdx === 0 ? 'bg-[#F0F5FF] font-bold text-[#081F5C]' : 'hover:bg-gray-50'}>
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx} className="px-3 py-2 border-r last:border-r-0 border-gray-200">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentSlideNotes && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 mt-4 space-y-1">
                        <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800">Instructor Notes:</span>
                        <p className="font-sans leading-relaxed">{currentSlideNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                    <span>Department of Information Technology • SKCT</span>
                    <span className="font-mono text-[11px] text-[#081F5C] font-bold">Slide {currentPage} of {totalPages}</span>
                  </div>
                </div>

                <div className="bg-[#081F5C] text-white px-6 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>{moduleTitle}</span>
                  <span className="text-[10px] font-mono">POWERPOINT SLIDE PRESENTATION</span>
                </div>
              </div>

              {/* Nav */}
              <div className="flex items-center justify-between text-xs text-gray-400 font-mono px-2 pt-1 select-none">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-[#2D2D2D] hover:bg-[#383838] text-white rounded-lg disabled:opacity-30 flex items-center gap-1.5 transition-colors font-sans font-bold"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous Slide
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-gray-300">Use arrow keys <span className="font-bold text-white">←</span> and <span className="font-bold text-white">→</span> to navigate</span>
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-[#2D2D2D] hover:bg-[#383838] text-white rounded-lg disabled:opacity-30 flex items-center gap-1.5 transition-colors font-sans font-bold"
                >
                  Next Slide <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Quick Help / Info Pill */}
      <div className="absolute bottom-4 right-4 z-30 hidden sm:flex items-center gap-2 bg-[#2A2A2A]/90 backdrop-blur-md border border-[#444] px-3 py-1.5 rounded-full text-[11px] text-gray-300 shadow-xl">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>Authentic Google Classroom {isPDF ? 'PDF viewer' : 'Slide presentation'}</span>
      </div>

    </div>
  );
};
