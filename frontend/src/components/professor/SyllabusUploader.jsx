import React, { useState, useEffect } from 'react';
import { modulesApi, ragApi } from '../../services/api';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { UploadCloud, FileText, CheckCircle2, Cpu, Database, Eye, Presentation } from 'lucide-react';
import { GoogleClassroomViewerModal } from '../student/GoogleClassroomViewerModal';

export const SyllabusUploader = () => {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    modulesApi.getAll().then((res) => {
      setModules(res.data);
      if (res.data.length > 0) {
        setSelectedModule(res.data[0].id.toString());
      }
    });
  }, []);

  const loadDocuments = async (modId) => {
    if (!modId) return;
    try {
      const res = await ragApi.getModuleDocs(modId);
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedModule) {
      loadDocuments(selectedModule);
    }
  }, [selectedModule]);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedModule) {
      alert('Please select a course module and a document file.');
      return;
    }

    setUploading(true);
    setSuccessMsg('');
    try {
      const res = await ragApi.ingestDocument(selectedModule, file);
      setSuccessMsg(`Successfully processed "${res.data.filename}". Generated ${res.data.chunks_count} vector text chunks!`);
      setFile(null);
      loadDocuments(selectedModule);
    } catch (err) {
      alert('Document ingestion failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-brand-dark">RAG Vector Document Ingestion</h2>
        <p className="text-xs text-brand-secondary">Upload course syllabi, lecture slides, or textbook excerpts to power grounded AI notes and quiz generation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Upload Document" className="md:col-span-2">
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">Target Course Module</label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-brand-bg border border-brand-border rounded-lg text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-secondary"
              >
                {modules.map((m) => (
                  <option key={m.id} value={m.id}>{m.code}: {m.title}</option>
                ))}
              </select>
            </div>

            <div className="border-2 border-dashed border-brand-border hover:border-brand-secondary rounded-xl p-6 text-center bg-brand-bg/50 transition-colors">
              <UploadCloud className="w-10 h-10 text-brand-secondary mx-auto mb-2" />
              <p className="text-xs font-bold text-brand-dark">Select Syllabus or Lecture PDF / PPTX File</p>
              <p className="text-[11px] text-brand-secondary mt-1">Supports PDF, PPTX, PPT, TXT, and Markdown files up to 50MB</p>
              <input
                type="file"
                accept=".pdf,.pptx,.ppt,.txt,.md"
                onChange={(e) => setFile(e.target.files[0])}
                className="mt-3 text-xs text-brand-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-sand file:text-brand-dark hover:file:bg-brand-secondary hover:file:text-white"
              />
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <Button type="submit" disabled={uploading || !file} className="w-full" icon={Database}>
              {uploading ? 'Processing & Vectorizing Document...' : 'Ingest into RAG Engine'}
            </Button>
          </form>
        </Card>

        {/* Uploaded Documents List */}
        <Card title="Ingested Module Corpus">
          <div className="space-y-3">
            {documents.length === 0 ? (
              <p className="text-xs text-brand-secondary italic">No documents ingested for this module yet.</p>
            ) : (
              documents.map((doc) => {
                const isPdf = doc.file_type === 'PDF' || doc.title?.toLowerCase().endsWith('.pdf');
                return (
                  <div key={doc.id} className="p-3 bg-brand-bg border border-brand-border/60 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-black shrink-0 ${
                          isPdf ? 'bg-red-600 text-white' : 'bg-[#D9531E] text-white'
                        }`}>
                          {isPdf ? 'PDF' : 'P'}
                        </div>
                        <p className="text-xs font-bold text-brand-dark truncate">{doc.title || doc.filename}</p>
                      </div>
                      <Badge variant="sand" size="sm">{doc.pages_count} {isPdf ? 'Pages' : 'Slides'}</Badge>
                    </div>

                    <div className="flex items-center justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewMaterial(doc);
                          setPreviewOpen(true);
                        }}
                        className="px-2.5 py-1 bg-[#081F5C] hover:bg-[#0F3470] text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3 h-3" /> Preview
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Live Google Classroom Preview Modal */}
      <GoogleClassroomViewerModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        documentTitle={previewMaterial?.title || "Uploaded Course Document"}
        moduleTitle={`Module ${selectedModule}`}
        fileUrl={previewMaterial?.file_url}
        pdfUrl={previewMaterial?.pdf_url}
        slides={previewMaterial?.slides || []}
        pagesCount={previewMaterial?.pages_count || 1}
        rawFileType={previewMaterial?.file_type}
      />
    </div>
  );
};
