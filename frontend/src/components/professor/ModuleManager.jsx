import React, { useState, useEffect } from 'react';
import { modulesApi } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { Plus, Video, FileText, Trash2, Layers, BookOpen } from 'lucide-react';

export const ModuleManager = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    lessons: [
      { title: 'Lecture 1: Introduction', description: '', content_type: 'VIDEO', video_url: '', duration: '15 mins' }
    ]
  });

  const loadModules = async () => {
    setLoading(true);
    try {
      const res = await modulesApi.getAll();
      setModules(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, []);

  const handleAddLessonField = () => {
    setFormData({
      ...formData,
      lessons: [
        ...formData.lessons,
        { title: `Lecture ${formData.lessons.length + 1}`, description: '', content_type: 'VIDEO', video_url: '', duration: '15 mins' }
      ]
    });
  };

  const handleRemoveLessonField = (idx) => {
    setFormData({
      ...formData,
      lessons: formData.lessons.filter((_, i) => i !== idx)
    });
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    try {
      await modulesApi.create(formData);
      setIsModalOpen(false);
      setFormData({
        code: '',
        title: '',
        description: '',
        lessons: [{ title: 'Lecture 1', description: '', content_type: 'VIDEO', video_url: '', duration: '15 mins' }]
      });
      loadModules();
    } catch (err) {
      alert('Failed to create module');
    }
  };

  const handleDeleteModule = async (id) => {
    if (window.confirm('Delete this course module?')) {
      try {
        await modulesApi.delete(id);
        loadModules();
      } catch (err) {
        alert('Failed to delete module');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-brand-dark">Course Module Management</h2>
          <p className="text-xs text-brand-secondary">Organize curriculum chapters, lecture recordings, and study materials</p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
          Create New Module
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-brand-secondary font-medium">Loading course modules...</div>
      ) : modules.length === 0 ? (
        <Card className="text-center py-12">
          <Layers className="w-12 h-12 text-brand-secondary mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-brand-dark">No Course Modules Created Yet</h3>
          <p className="text-xs text-brand-secondary mt-1 mb-4">Get started by creating your first course module.</p>
          <Button icon={Plus} onClick={() => setIsModalOpen(true)}>Create Module</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {modules.map((mod) => (
            <Card 
              key={mod.id}
              title={`${mod.code}: ${mod.title}`}
              subtitle={`${mod.lessons?.length || 0} Lessons & Materials Included`}
              action={
                <button 
                  onClick={() => handleDeleteModule(mod.id)}
                  className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete Module"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              }
            >
              <p className="text-sm text-brand-dark mb-4">{mod.description}</p>
              
              <div className="space-y-2 border-t border-brand-border/60 pt-3">
                <h4 className="text-xs font-bold text-brand-secondary uppercase tracking-wider mb-2">Lesson Breakdown</h4>
                {mod.lessons && mod.lessons.length > 0 ? (
                  mod.lessons.map((les) => (
                    <div key={les.id} className="flex items-center justify-between p-3 bg-brand-bg/60 border border-brand-border/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {les.content_type === 'VIDEO' ? (
                          <Video className="w-4 h-4 text-brand-secondary" />
                        ) : (
                          <FileText className="w-4 h-4 text-brand-sand" />
                        )}
                        <div>
                          <p className="text-xs font-bold text-brand-dark">{les.title}</p>
                          <p className="text-[11px] text-brand-secondary">{les.description || 'Lecture material'}</p>
                        </div>
                      </div>
                      <Badge variant={les.content_type === 'VIDEO' ? 'secondary' : 'sand'}>
                        {les.duration || les.content_type}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-brand-secondary italic">No lessons added to this module yet.</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Module Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Course Module">
        <form onSubmit={handleCreateModule} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Module Code</label>
              <input 
                type="text" 
                required
                placeholder="e.g. CS-501"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="w-full px-3 py-2 text-sm bg-brand-surface border border-brand-border rounded-lg text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-secondary"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-brand-dark mb-1">Module Title</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Artificial Intelligence & Neural Networks"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 text-sm bg-brand-surface border border-brand-border rounded-lg text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-secondary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">Module Overview / Syllabus Description</label>
            <textarea 
              rows="3"
              placeholder="Overview of topics, learning objectives, and prerequisites..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 text-sm bg-brand-surface border border-brand-border rounded-lg text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-secondary"
            />
          </div>

          {/* Lessons Form Section */}
          <div className="border-t border-brand-border pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider">Initial Lessons</h4>
              <button 
                type="button" 
                onClick={handleAddLessonField}
                className="text-xs text-brand-secondary hover:text-brand-dark font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Lesson
              </button>
            </div>

            {formData.lessons.map((les, idx) => (
              <div key={idx} className="p-3 bg-brand-surface border border-brand-border rounded-xl space-y-2 relative">
                {formData.lessons.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => handleRemoveLessonField(idx)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text"
                    placeholder="Lesson Title"
                    required
                    value={les.title}
                    onChange={(e) => {
                      const updated = [...formData.lessons];
                      updated[idx].title = e.target.value;
                      setFormData({...formData, lessons: updated});
                    }}
                    className="px-2.5 py-1.5 text-xs bg-brand-bg border border-brand-border rounded-md text-brand-dark"
                  />
                  <select
                    value={les.content_type}
                    onChange={(e) => {
                      const updated = [...formData.lessons];
                      updated[idx].content_type = e.target.value;
                      setFormData({...formData, lessons: updated});
                    }}
                    className="px-2.5 py-1.5 text-xs bg-brand-bg border border-brand-border rounded-md text-brand-dark"
                  >
                    <option value="VIDEO">Video Recording</option>
                    <option value="NOTES">Reading Notes</option>
                  </select>
                </div>
                <input 
                  type="text"
                  placeholder={les.content_type === 'VIDEO' ? 'Embed Video URL (YouTube)' : 'Short summary or link'}
                  value={les.video_url}
                  onChange={(e) => {
                    const updated = [...formData.lessons];
                    updated[idx].video_url = e.target.value;
                    setFormData({...formData, lessons: updated});
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-brand-bg border border-brand-border rounded-md text-brand-dark"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save & Publish Module</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
