import React, { useState } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { ModuleBrowser } from '../components/student/ModuleBrowser';
import { CourseNotesViewer } from '../components/student/CourseNotesViewer';
import { AssignmentPortal } from '../components/student/AssignmentPortal';
import { QuizEvaluator } from '../components/student/QuizEvaluator';

export const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('courses');

  return (
    <div className="min-h-screen bg-lms-bg flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role="STUDENT" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'courses' && <ModuleBrowser />}
          {activeTab === 'notes' && <CourseNotesViewer />}
          {activeTab === 'assignments' && <AssignmentPortal />}
          {activeTab === 'quizzes' && <QuizEvaluator />}
        </main>
      </div>
    </div>
  );
};
