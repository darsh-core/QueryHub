import React, { useState, useEffect } from 'react';
import { GoogleClassroomStreamView } from '../student/GoogleClassroomStreamView';
import { ragApi } from '../../services/api';

export const SlideViewer = ({ moduleData }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (moduleData?.id) {
      setLoading(true);
      ragApi.getModuleDocs(moduleData.id).then((res) => {
        setDocuments(res.data);
        setLoading(false);
      });
    }
  }, [moduleData]);

  const materials = documents.map(d => {
    const isPPT = d.file_type === 'PPT' || d.title?.toLowerCase().endsWith('.pptx') || d.title?.toLowerCase().endsWith('.ppt');
    const displayTitle = d.title || d.filename || "Lecture Material";
    return {
      id: d.id,
      author: "Prof. Christy (SKCT)",
      title: displayTitle,
      description: d.description || "",
      date: d.created_at ? `Posted ${new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : "Posted recently",
      fileName: d.filename || d.title,
      fileType: isPPT ? "Google Slides" : "PDF",
      rawFileType: isPPT ? "PPT" : "PDF",
      fileUrl: d.file_url,
      slides: d.slides || [],
      pagesCount: d.pages_count || (d.slides?.length || 1),
      slidePreviewTitle: d.slides?.[0]?.title || moduleData?.title || displayTitle,
      slideSub: moduleData?.code ? `${moduleData.code} • Database Management Systems` : "23IT201 • DBMS"
    };
  });

  return (
    <div className="animate-fadeIn py-2">
      {loading ? (
        <div className="p-8 text-center text-lms-taupe font-medium flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-lms-dark border-t-transparent rounded-full animate-spin"></div>
          <span>Loading course lecture materials...</span>
        </div>
      ) : (
        <GoogleClassroomStreamView 
          moduleTitle={moduleData?.title ? moduleData.title.toUpperCase() : "MODULE LECTURE MATERIALS"}
          materials={materials}
        />
      )}
    </div>
  );
};
