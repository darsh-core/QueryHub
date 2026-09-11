import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { MainDashboard } from './pages/MainDashboard';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { ModuleWorkspacePage } from './pages/ModuleWorkspacePage';
import { VisualizersPage } from './pages/VisualizersPage';
import { TrainerPortalPage } from './pages/TrainerPortalPage';

// DBMS Virtual Lab Components
import { DBMSLabIDE } from './components/dbms/DBMSLabIDE';
import { DBMSPracticeWorkspace } from './components/dbms/DBMSPracticeWorkspace';
import { DBMSDesignLab } from './components/dbms/DBMSDesignLab';
import { DBMSNormalizationLab } from './components/dbms/DBMSNormalizationLab';
import { DBMSTransactionLab } from './components/dbms/DBMSTransactionLab';
import { DBMSStudentAnalytics } from './components/dbms/DBMSStudentAnalytics';
import DBMSSubmissionHistory from './components/dbms/DBMSSubmissionHistory';
import DBMSLeaderboard from './components/dbms/DBMSLeaderboard';
import { TrainerDBMSLab } from './components/dbms/TrainerDBMSLab';

// Root Route: Renders Login Page first if not authenticated, or redirects to portal if logged in
const RootRoute = () => {
  const { user } = useAuth();
  if (!user) {
    return <LoginPage />;
  }
  if (user.role === 'TRAINER' || user.role === 'PROFESSOR') {
    return <Navigate to="/trainer" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default Root: Login Page First */}
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Student Dashboard Route (Protected) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainDashboard />
            </ProtectedRoute>
          } />

          {/* Course Details Pages (DBMS & DSA) */}
          <Route path="/course/dbms" element={
            <ProtectedRoute>
              <CourseDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/course/dsa" element={
            <ProtectedRoute>
              <CourseDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/course/:courseId" element={
            <ProtectedRoute>
              <CourseDetailsPage />
            </ProtectedRoute>
          } />

          {/* Module Detail Workspace */}
          <Route path="/course/dbms/module/:moduleId" element={
            <ProtectedRoute>
              <ModuleWorkspacePage />
            </ProtectedRoute>
          } />
          <Route path="/course/:courseId/module/:moduleId" element={
            <ProtectedRoute>
              <ModuleWorkspacePage />
            </ProtectedRoute>
          } />

          {/* Qwen Interactive Visualizer Suite */}
          <Route path="/visualizers" element={
            <ProtectedRoute>
              <VisualizersPage />
            </ProtectedRoute>
          } />

          {/* DBMS Virtual Lab Routes */}
          <Route path="/student/dbms-lab" element={
            <ProtectedRoute>
              <DBMSLabIDE />
            </ProtectedRoute>
          } />
          <Route path="/student/dbms-lab/practice" element={
            <ProtectedRoute>
              <DBMSPracticeWorkspace />
            </ProtectedRoute>
          } />
          <Route path="/student/dbms-lab/design" element={
            <ProtectedRoute>
              <DBMSDesignLab />
            </ProtectedRoute>
          } />
          <Route path="/student/dbms-lab/normalization" element={
            <ProtectedRoute>
              <DBMSNormalizationLab />
            </ProtectedRoute>
          } />
          <Route path="/student/dbms-lab/transactions" element={
            <ProtectedRoute>
              <DBMSTransactionLab />
            </ProtectedRoute>
          } />
          <Route path="/student/dbms-lab/analytics" element={
            <ProtectedRoute>
              <DBMSStudentAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/student/dbms-lab/history" element={
            <ProtectedRoute>
              <DBMSSubmissionHistory />
            </ProtectedRoute>
          } />
          <Route path="/student/dbms-lab/leaderboard" element={
            <ProtectedRoute>
              <DBMSLeaderboard />
            </ProtectedRoute>
          } />

          {/* Trainer Portal Routes (Strict Access for Trainer) */}
          <Route path="/trainer" element={
            <ProtectedRoute allowedRoles={['TRAINER', 'PROFESSOR']}>
              <TrainerPortalPage />
            </ProtectedRoute>
          } />
          <Route path="/trainer/dbms-lab" element={
            <ProtectedRoute allowedRoles={['TRAINER', 'PROFESSOR']}>
              <TrainerDBMSLab />
            </ProtectedRoute>
          } />

          {/* Fallback route */}
          <Route path="*" element={<RootRoute />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
