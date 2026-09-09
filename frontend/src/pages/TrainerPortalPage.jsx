import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { TrainerDashboard } from '../components/trainer/TrainerDashboard';

export const TrainerPortalPage = () => {
  return (
    <div className="min-h-screen bg-lms-bg flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <TrainerDashboard />
      </main>
    </div>
  );
};
