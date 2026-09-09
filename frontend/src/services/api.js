import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getCurrentUser: () => api.get('/auth/me'),
  getAnalytics: () => api.get('/auth/analytics'),
};

export const modulesApi = {
  getAll: () => api.get('/modules'),
  getById: (id) => api.get(`/modules/${id}`),
};

export const ragApi = {
  ingestDocument: (moduleId, file, title = '', description = '') => {
    const formData = new FormData();
    formData.append('module_id', moduleId);
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);

    return api.post('/rag/ingest', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getModuleDocs: (moduleId) => api.get(`/rag/documents/${moduleId}`),
  getAllMaterials: () => api.get('/rag/materials'),
  deleteMaterial: (id) => api.delete(`/rag/materials/${id}`),
  askAssistant: (query, moduleId = null) => api.post('/rag/ask-assistant', { query, module_id: moduleId }),
};

export const quizApi = {
  getAll: () => api.get('/quiz/all'),
  getByModule: (moduleId) => api.get(`/quiz/module/${moduleId}`),
  submit: (submissionData) => api.post('/quiz/submit', submissionData),
  generateAIQuestions: (data) => api.post('/quiz/ai/generate', data),
  getReviewQueue: () => api.get('/quiz/ai/review-queue'),
  approveQuestion: (id) => api.post(`/quiz/ai/approve/${id}`),
  approveAll: (moduleId) => api.post(`/quiz/ai/approve-all/${moduleId}`),
  editQuestion: (id, data) => api.put(`/quiz/ai/edit/${id}`, data),
  rejectQuestion: (id) => api.delete(`/quiz/ai/reject/${id}`),
  publishQuiz: (data) => api.post('/quiz/publish-quiz', data),
};

export const dbmsLabApi = {
  createSession: (databaseName = 'Employee Management', studentId = 1) => 
    api.post('/dbms/sessions', { database_name: databaseName, student_id: studentId }),
  
  getSession: (sessionId) => api.get(`/dbms/sessions/${sessionId}`),
  
  executeQuery: (queryText, databaseName = 'Employee Management', sessionId = null, studentId = 1) => 
    api.post('/dbms/query/execute', {
      session_id: sessionId,
      database_name: databaseName,
      query_text: queryText,
      student_id: studentId
    }),
  
  explainQueryPlan: (queryText, databaseName = 'Employee Management') => 
    api.post('/dbms/query/explain', { query_text: queryText, database_name: databaseName }),
  
  getDatabases: () => api.get('/dbms/databases'),
  
  createCustomDatabase: (databaseName, description = 'Student Custom Database Workspace', category = 'Custom Database') =>
    api.post('/dbms/databases/custom', { database_name: databaseName, description, category }),

  createCustomTable: (tableData) => api.post('/dbms/tables/create', tableData),

  getSchema: (databaseName, sessionId = null) => 
    api.get(`/dbms/databases/${encodeURIComponent(databaseName)}/schema${sessionId ? '?session_id=' + sessionId : ''}`),
  
  getTableData: (databaseName, tableName, sessionId = null) => 
    api.get(`/dbms/tables/${encodeURIComponent(databaseName)}/${encodeURIComponent(tableName)}/data${sessionId ? '?session_id=' + sessionId : ''}`),
  
  getChallenges: (topic = null, difficulty = null) => {
    const params = new URLSearchParams();
    if (topic) params.append('topic', topic);
    if (difficulty) params.append('difficulty', difficulty);
    return api.get(`/dbms/challenges?${params.toString()}`);
  },
  
  getChallengeById: (id) => api.get(`/dbms/challenges/${id}`),
  
  createChallenge: (data) => api.post('/dbms/challenges', data),
  updateChallenge: (id, data) => api.put(`/dbms/challenges/${id}`, data),
  deleteChallenge: (id) => api.delete(`/dbms/challenges/${id}`),
  
  evaluateSubmission: (challengeId, queryText, studentId = 1) => 
    api.post('/dbms/evaluate', { challenge_id: challengeId, query_text: queryText, student_id: studentId }),
  
  triggerAiAction: (data) => api.post('/dbms/ai/action', data),
  
  generateAiChallenge: (data) => api.post('/dbms/ai/generate-challenge', data),
  
  getStudentAnalytics: (studentId = 1) => api.get(`/dbms/analytics/student?student_id=${studentId}`),
  
  getTrainerAnalytics: () => api.get('/dbms/analytics/trainer'),
  
  getSubmissionHistory: (studentId = 1) => api.get(`/dbms/submissions/history?student_id=${studentId}`),
  
  getSubmissionDetail: (id) => api.get(`/dbms/submissions/${id}`),
  
  getLeaderboard: () => api.get('/dbms/leaderboard')
};

export default api;
