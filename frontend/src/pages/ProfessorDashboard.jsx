import React, { useState } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { ModuleManager } from '../components/professor/ModuleManager';
import { SyllabusUploader } from '../components/professor/SyllabusUploader';
import { RAGNotesGenerator } from '../components/professor/RAGNotesGenerator';
import { SubmissionsReview } from '../components/professor/SubmissionsReview';

export const ProfessorDashboard = () => {
  const [activeTab, setActiveTab] = useState('modules');

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role="PROFESSOR" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'modules' && <ModuleManager />}
          {activeTab === 'rag-upload' && <SyllabusUploader />}
          {activeTab === 'rag-notes' && <RAGNotesGenerator />}
          {activeTab === 'submissions' && <SubmissionsReview />}
        </main>
      </div>
    </div>
  );
};
