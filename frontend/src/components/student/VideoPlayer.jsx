import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Video, FileText, Sparkles, Clock, PlayCircle, Bookmark } from 'lucide-react';

export const VideoPlayer = ({ lesson }) => {
  if (!lesson) return null;

  const isVideo = lesson.content_type === 'VIDEO';

  // Timestamped chapter markers
  const chapterMarkers = [
    { time: "00:00", title: "Introduction & Context Overview" },
    { time: "04:15", title: "Theoretical Foundations & Mathematical Formulas" },
    { time: "10:30", title: "Practical Application & System Execution" },
    { time: "15:45", title: "Summary Takeaways & Q&A Review" }
  ];

  return (
    <Card className="!p-0 overflow-hidden shadow-md">
      {isVideo ? (
        <div className="aspect-video w-full bg-black relative flex items-center justify-center">
          {lesson.video_url && lesson.video_url.includes('youtube.com') ? (
            <iframe 
              src={lesson.video_url} 
              title={lesson.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="text-center p-8 text-white/80">
              <Video className="w-12 h-12 mx-auto mb-2 text-lms-sand opacity-80 animate-pulse" />
              <p className="font-bold text-sm text-white">{lesson.title}</p>
              <p className="text-xs text-white/60 mt-1">Interactive Lecture Stream Active</p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 bg-lms-surface border-b border-lms-border flex items-center gap-3">
          <FileText className="w-8 h-8 text-lms-sand shrink-0" />
          <div>
            <h3 className="font-bold text-lms-dark text-base">{lesson.title}</h3>
            <p className="text-xs text-lms-taupe">RAG Grounded Study Guide & Lecture Notes</p>
          </div>
        </div>
      )}

      <div className="p-6 space-y-4 bg-lms-surface">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-lms-dark">{lesson.title}</h3>
          <Badge variant="sand" className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {lesson.duration || '15 mins'}
          </Badge>
        </div>

        <p className="text-xs text-lms-taupe leading-relaxed">
          {lesson.description || "In this lesson, we cover essential concepts, mathematical foundations, and operational execution steps."}
        </p>

        {/* Timestamped Chapter Markers */}
        {isVideo && (
          <div className="pt-3 border-t border-lms-border/60">
            <h4 className="text-xs font-bold text-lms-dark flex items-center gap-1.5 uppercase tracking-wider mb-2">
              <Bookmark className="w-3.5 h-3.5 text-lms-sand" /> Timestamped Chapter Markers
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {chapterMarkers.map((marker, i) => (
                <button
                  key={i}
                  className="flex items-center gap-2 p-2 bg-lms-bg hover:bg-lms-border/40 rounded-lg border border-lms-border/50 text-left transition-colors"
                >
                  <span className="px-2 py-0.5 bg-lms-dark text-lms-sand font-mono text-[10px] rounded font-bold">
                    {marker.time}
                  </span>
                  <span className="text-xs text-lms-dark font-medium truncate">{marker.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {lesson.content_text && (
          <div className="mt-4 pt-4 border-t border-lms-border/60">
            <h4 className="text-xs font-bold text-lms-dark flex items-center gap-1.5 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-lms-sand" /> Lesson Notes & Transcript
            </h4>
            <div className="p-4 bg-lms-bg rounded-xl border border-lms-border/50 text-xs text-lms-dark whitespace-pre-line leading-relaxed">
              {lesson.content_text}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
