import React, { useState, useEffect } from 'react';
import { dbmsLabApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircle, XCircle, AlertTriangle, Clock, Code, Database, 
  Search, Filter, RefreshCw, ChevronRight, Award, Calendar, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DBMSSubmissionHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dbmsLabApi.getSubmissionHistory(user?.id || 1);
      setSubmissions(res.data.submissions || res.data || []);
    } catch (err) {
      console.error('Failed to fetch submission history', err);
      setError('Unable to load submission history. Please ensure backend service is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = (sub.challenge_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (sub.submitted_query || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' ? true : sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Accepted
          </span>
        );
      case 'WRONG_ANSWER':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Wrong Answer
          </span>
        );
      case 'SYNTAX_ERROR':
      case 'RUNTIME_ERROR':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> {status.replace('_', ' ')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/student/dbms-lab/practice')}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-slate-700 hover:text-slate-900 border border-slate-200"
              title="Back to Practice Hub"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-7 h-7 text-blue-600" />
                Submission History & Audit Log
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Review your SQL challenge executions, test result comparisons, execution times, and evaluation details.
              </p>
            </div>
          </div>

          <button
            onClick={fetchHistory}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh History
          </button>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by challenge title or SQL code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition text-slate-900 placeholder-slate-400 shadow-sm"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <Filter className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition text-slate-900 appearance-none shadow-sm"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACCEPTED">Accepted Only</option>
              <option value="WRONG_ANSWER">Wrong Answer Only</option>
              <option value="SYNTAX_ERROR">Syntax Error Only</option>
            </select>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Loading your submission history...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-center">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-rose-600" />
            <p className="font-bold">{error}</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
            <Code className="w-12 h-12 text-slate-400 mx-auto mb-1" />
            <h3 className="text-lg font-bold text-slate-800">No Submissions Found</h3>
            <p className="text-sm text-slate-500">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Try adjusting your search query or filters.'
                : 'Solve challenges in the DBMS Practice Hub to see your submission logs here!'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-800">
                <thead className="bg-slate-100 text-slate-700 uppercase text-xs tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Challenge</th>
                    <th className="px-6 py-4">Executed Query</th>
                    <th className="px-6 py-4">Execution Time</th>
                    <th className="px-6 py-4">Points</th>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(sub.status)}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {sub.challenge_title || `Challenge #${sub.challenge_id}`}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-700 max-w-xs truncate">
                        {sub.submitted_query}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-xs">
                        {sub.execution_time_ms ? `${sub.execution_time_ms.toFixed(2)} ms` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-amber-600">
                        +{sub.points_earned || 0} pts
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                        {sub.created_at ? new Date(sub.created_at).toLocaleString() : 'Just now'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition"
                        >
                          View Details <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-600" />
                  Submission #{selectedSubmission.id} Details
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Challenge: {selectedSubmission.challenge_title || `Challenge #${selectedSubmission.challenge_id}`}
                </p>
              </div>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div><span className="text-slate-500">Status:</span> {getStatusBadge(selectedSubmission.status)}</div>
              <div><span className="text-slate-500">Execution Time:</span> <span className="text-slate-900 font-mono font-bold">{selectedSubmission.execution_time_ms ? `${selectedSubmission.execution_time_ms.toFixed(2)} ms` : 'N/A'}</span></div>
              <div><span className="text-slate-500">Points Earned:</span> <span className="text-amber-600 font-extrabold">+{selectedSubmission.points_earned || 0}</span></div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Executed SQL Query:
              </label>
              <pre className="bg-slate-900 text-amber-300 p-4 rounded-xl font-mono text-sm border border-slate-800 overflow-x-auto whitespace-pre-wrap">
                {selectedSubmission.submitted_query}
              </pre>
            </div>

            {selectedSubmission.error_message && (
              <div>
                <label className="text-xs font-bold text-rose-700 uppercase tracking-wider block mb-2">
                  Error Details:
                </label>
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-900 text-xs font-mono">
                  {selectedSubmission.error_message}
                </div>
              </div>
            )}

            {selectedSubmission.eval_details && (
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Evaluation Analysis:
                </label>
                <pre className="bg-slate-100 p-4 rounded-xl text-slate-800 font-mono text-xs border border-slate-200 overflow-x-auto">
                  {typeof selectedSubmission.eval_details === 'object'
                    ? JSON.stringify(selectedSubmission.eval_details, null, 2)
                    : selectedSubmission.eval_details}
                </pre>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-5 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DBMSSubmissionHistory;
