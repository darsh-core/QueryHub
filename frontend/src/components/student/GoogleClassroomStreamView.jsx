import React, { useState } from 'react';
import { GoogleClassroomViewerModal } from './GoogleClassroomViewerModal';
import { 
  MoreVertical, MessageSquare, Send, FileText, Presentation, 
  ExternalLink, Bookmark, CheckCircle2, ChevronRight
} from 'lucide-react';

export const GoogleClassroomStreamView = ({ moduleTitle = "MODULE LECTURE MATERIALS", materials = [] }) => {
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [comments, setComments] = useState({});
  const [newCommentInput, setNewCommentInput] = useState({});

  const handleOpenViewer = (mat) => {
    setSelectedMaterial(mat);
    setViewerOpen(true);
  };

  const handleAddComment = (matId) => {
    const text = newCommentInput[matId];
    if (!text || !text.trim()) return;
    setComments(prev => ({
      ...prev,
      [matId]: [...(prev[matId] || []), text.trim()]
    }));
    setNewCommentInput(prev => ({ ...prev, [matId]: '' }));
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Google Classroom Classwork / Stream Section Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-[#1967d2]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1967d2] flex items-center justify-center font-bold">
            <Bookmark className="w-5 h-5 fill-current text-[#1967d2]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1f1f1f] tracking-tight">
              {moduleTitle}
            </h2>
            <p className="text-xs text-[#5f6368]">
              {materials.length} {materials.length === 1 ? 'material' : 'materials'} posted for students
            </p>
          </div>
        </div>

        <button 
          className="p-2 rounded-full hover:bg-black/5 text-[#5f6368] transition-colors"
          title="Module options"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Stream Post Cards Container */}
      {materials.length === 0 ? (
        <div className="p-12 bg-white border border-[#dadce0] rounded-xl text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#e8f0fe] text-[#1967d2] flex items-center justify-center mx-auto shadow-xs">
            <Bookmark className="w-7 h-7 text-[#1967d2]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#1f1f1f]">No materials posted yet</h3>
            <p className="text-xs text-[#5f6368] max-w-md mx-auto">
              Your instructor hasn't uploaded any PDF lecture notes or PowerPoint slide decks for this module yet. When published, they will appear here in Google Classroom stream format.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {materials.map((mat) => {
            const isPdf = mat.rawFileType === 'PDF' || mat.fileName?.toLowerCase().endsWith('.pdf');
            return (
              <div 
                key={mat.id} 
                className="bg-white border border-[#dadce0] rounded-xl shadow-xs hover:shadow-md transition-shadow overflow-hidden space-y-3"
              >
                {/* 1. Post Header: Teacher Avatar, Name, Post Action, Date */}
                <div className="p-4 sm:p-5 pb-0 flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    {/* Google Classroom Teal / Blue Circular Material Icon */}
                    <div className="w-10 h-10 rounded-full bg-[#1967d2] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
                      </svg>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-[#1f1f1f] leading-snug">
                        {mat.author || "Prof. Christy (SKCT)"} posted a new material:{' '}
                        <span className="font-bold text-[#1967d2]">{mat.title}</span>
                      </h3>
                      <p className="text-xs text-[#5f6368] mt-0.5">{mat.date}</p>
                    </div>
                  </div>

                  <button className="p-1.5 rounded-full hover:bg-black/5 text-[#5f6368] transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* 2. Optional Teacher Description / Instructions */}
                {mat.description && (
                  <div className="px-4 sm:px-5 text-xs text-[#3c4043] leading-relaxed whitespace-pre-line">
                    {mat.description}
                  </div>
                )}

                {/* 3. Google Classroom Attachment Card */}
                <div className="px-4 sm:px-5">
                  <div 
                    onClick={() => handleOpenViewer(mat)}
                    className="w-full max-w-xl bg-white border border-[#dadce0] hover:border-[#bdc1c6] rounded-lg overflow-hidden cursor-pointer hover:shadow-sm transition-all flex items-center group"
                  >
                    {/* Left Icon / Thumbnail Box */}
                    <div className={`w-24 h-20 shrink-0 border-r border-[#dadce0] flex flex-col items-center justify-center p-2 select-none ${
                      isPdf ? 'bg-[#fce8e6]' : 'bg-[#fef7e0]'
                    }`}>
                      {isPdf ? (
                        /* Google Drive Red PDF Badge */
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-8 h-10 bg-[#ea4335] rounded-xs relative shadow-xs flex flex-col items-center justify-center text-white">
                            <span className="text-[9px] font-black tracking-tighter uppercase font-mono">PDF</span>
                            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-white/40 rounded-bl-xs" />
                          </div>
                          <span className="text-[9px] font-bold text-[#ea4335] mt-1 uppercase">PDF Document</span>
                        </div>
                      ) : (
                        /* Google Slides Yellow / Orange Icon */
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-10 h-8 bg-[#fbbc04] border border-[#f29900] rounded-xs shadow-xs flex items-center justify-center text-white">
                            <Presentation className="w-5 h-5 text-[#b06000]" />
                          </div>
                          <span className="text-[9px] font-bold text-[#b06000] mt-1 uppercase">Google Slides</span>
                        </div>
                      )}
                    </div>

                    {/* Right File Info */}
                    <div className="p-3.5 min-w-0 flex-1 flex flex-col justify-center">
                      <h4 className="text-sm font-medium text-[#3c4043] group-hover:text-[#1967d2] truncate transition-colors">
                        {mat.fileName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-[#5f6368] mt-0.5 font-sans">
                        <span className="font-semibold text-[#1f1f1f]">{isPdf ? 'PDF' : 'PowerPoint'}</span>
                        <span>•</span>
                        <span>{mat.pagesCount} {isPdf ? 'pages' : 'slides'}</span>
                      </div>
                    </div>

                    {/* Subtle click affordance arrow */}
                    <div className="pr-3.5 text-[#5f6368] group-hover:text-[#1967d2] transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* 4. Google Classroom Class Comments Bar */}
                <div className="border-t border-[#dadce0] p-3 sm:px-5 bg-white space-y-2">
                  {/* Existing Comments List */}
                  {comments[mat.id] && comments[mat.id].length > 0 && (
                    <div className="space-y-2 pb-1">
                      {comments[mat.id].map((c, cIdx) => (
                        <div key={cIdx} className="flex items-start gap-2.5 text-xs text-[#3c4043]">
                          <div className="w-6 h-6 rounded-full bg-[#5f6368] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                            S
                          </div>
                          <div className="bg-[#f1f3f4] px-3 py-1.5 rounded-xl flex-1">
                            <span className="font-semibold text-[#1f1f1f] mr-1.5">Student</span>
                            <span>{c}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Class Comment Input */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <div className="w-7 h-7 rounded-full bg-[#1967d2] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      S
                    </div>
                    <div className="flex-1 relative flex items-center">
                      <input
                        type="text"
                        placeholder="Add class comment..."
                        value={newCommentInput[mat.id] || ''}
                        onChange={(e) => setNewCommentInput(prev => ({ ...prev, [mat.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(mat.id)}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-[#dadce0] focus:border-[#1967d2] rounded-full text-[#3c4043] focus:outline-none focus:ring-1 focus:ring-[#1967d2] transition-all placeholder-[#70757a]"
                      />
                      <button 
                        onClick={() => handleAddComment(mat.id)}
                        className="absolute right-1.5 p-1 rounded-full text-[#1967d2] hover:bg-[#e8f0fe] transition-colors"
                        title="Send comment"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Google Classroom Fullscreen Presentation & Document Viewer Modal */}
      <GoogleClassroomViewerModal 
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        documentTitle={selectedMaterial?.fileName || selectedMaterial?.title || "Lecture Material"}
        moduleTitle={moduleTitle}
        fileUrl={selectedMaterial?.fileUrl || selectedMaterial?.file_url}
        pdfUrl={selectedMaterial?.pdfUrl || selectedMaterial?.pdf_url}
        slides={selectedMaterial?.slides || []}
        pagesCount={selectedMaterial?.pagesCount || selectedMaterial?.pages_count}
        rawFileType={selectedMaterial?.rawFileType || selectedMaterial?.file_type}
      />

    </div>
  );
};
