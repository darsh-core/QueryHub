import React, { useState, useEffect } from 'react';
import { modulesApi } from '../../services/api';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { VideoPlayer } from './VideoPlayer';
import { BookOpen, Video, FileText, CheckCircle, Clock } from 'lucide-react';

export const ModuleBrowser = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    modulesApi.getAll().then((res) => {
      setModules(res.data);
      if (res.data.length > 0 && res.data[0].lessons?.length > 0) {
        setSelectedLesson(res.data[0].lessons[0]);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-brand-dark">Course Modules & Lecture Videos</h2>
        <p className="text-xs text-brand-secondary">Stream video lectures, review lesson outlines, and track learning progress</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-brand-secondary font-medium">Loading course catalog...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video & Content Viewer */}
          <div className="lg:col-span-2 space-y-4">
            {selectedLesson ? (
              <VideoPlayer lesson={selectedLesson} />
            ) : (
              <Card className="text-center py-12">
                <BookOpen className="w-12 h-12 text-brand-secondary mx-auto mb-3 opacity-50" />
                <p className="text-sm font-bold text-brand-dark">Select a lesson to begin watching</p>
              </Card>
            )}
          </div>

          {/* Module & Lesson Accordion List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-brand-dark uppercase tracking-wider">Course Syllabus Outline</h3>
            {modules.map((mod) => (
              <Card key={mod.id} className="!p-4">
                <div className="mb-3">
                  <span className="text-[10px] font-bold text-brand-sand bg-brand-dark px-2 py-0.5 rounded-md">
                    {mod.code}
                  </span>
                  <h4 className="text-sm font-bold text-brand-dark mt-1">{mod.title}</h4>
                  <p className="text-[11px] text-brand-secondary line-clamp-2 mt-0.5">{mod.description}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-brand-border/60">
                  {mod.lessons && mod.lessons.map((les) => {
                    const isCurrent = selectedLesson && selectedLesson.id === les.id;
                    return (
                      <button
                        key={les.id}
                        onClick={() => setSelectedLesson(les)}
                        className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between transition-all duration-150 ${
                          isCurrent 
                            ? 'bg-brand-dark text-white shadow-sm' 
                            : 'bg-brand-bg/70 hover:bg-brand-border/40 text-brand-dark'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {les.content_type === 'VIDEO' ? (
                            <Video className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-brand-sand' : 'text-brand-secondary'}`} />
                          ) : (
                            <FileText className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-brand-sand' : 'text-brand-sand'}`} />
                          )}
                          <span className="text-xs font-semibold truncate">{les.title}</span>
                        </div>
                        <span className={`text-[10px] font-mono shrink-0 ml-2 ${isCurrent ? 'text-brand-sand/80' : 'text-brand-secondary'}`}>
                          {les.duration || '12m'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
