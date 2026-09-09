import React, { useState, useEffect } from 'react';
import { dbmsLabApi } from '../../services/api';
import { 
  Trophy, Award, Flame, CheckCircle2, RefreshCw, 
  Search, UserCheck, Star, ArrowLeft, Zap, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DBMSLeaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dbmsLabApi.getLeaderboard();
      setLeaderboard(res.data.leaderboard || res.data || []);
    } catch (err) {
      console.error('Failed to fetch DBMS leaderboard', err);
      setError('Unable to load leaderboard. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const filteredLeaderboard = leaderboard.filter(entry => 
    (entry.student_name || `Student ${entry.student_id}`).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-300 text-amber-700 font-black flex items-center justify-center shadow text-lg">
            🥇
          </div>
        );
      case 2:
        return (
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-black flex items-center justify-center shadow text-lg">
            🥈
          </div>
        );
      case 3:
        return (
          <div className="w-9 h-9 rounded-full bg-amber-200/60 border border-amber-400 text-amber-900 font-black flex items-center justify-center shadow text-lg">
            🥉
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs">
            #{rank}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
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
                <Trophy className="w-7 h-7 text-amber-500" />
                DBMS Mastery Leaderboard
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Real-time rankings based on solved SQL challenges, accuracy, streak, and competency points.
              </p>
            </div>
          </div>

          <button
            onClick={fetchLeaderboard}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Ranks
          </button>
        </div>

        {/* Top 3 Podium Cards */}
        {!loading && !error && leaderboard.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Rank 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center transform md:translate-y-4">
              <div className="text-3xl mb-2">🥈</div>
              <h3 className="text-lg font-bold text-slate-900">{leaderboard[1]?.student_name || `Student ${leaderboard[1]?.student_id}`}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Rank #2</p>
              <div className="mt-4 pt-4 border-t border-slate-100 w-full space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Points:</span>
                  <span className="font-bold text-amber-600">{leaderboard[1]?.total_points || 0} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Solved:</span>
                  <span className="font-semibold text-emerald-600">{leaderboard[1]?.challenges_solved || 0}</span>
                </div>
              </div>
            </div>

            {/* Rank 1 */}
            <div className="bg-white border-2 border-amber-400 rounded-2xl p-6 shadow-md flex flex-col items-center text-center transform md:-translate-y-2">
              <div className="inline-block bg-amber-400 text-amber-950 px-3 py-0.5 rounded-full text-xs font-black mb-2 uppercase tracking-wide">
                👑 Top SQL Master
              </div>
              <div className="text-4xl mb-2">🥇</div>
              <h3 className="text-xl font-black text-slate-900">{leaderboard[0]?.student_name || `Student ${leaderboard[0]?.student_id}`}</h3>
              <p className="text-xs text-amber-700 font-bold mt-0.5">Rank #1 Champion</p>
              <div className="mt-4 pt-4 border-t border-slate-100 w-full space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Points:</span>
                  <span className="font-black text-amber-600 text-sm">{leaderboard[0]?.total_points || 0} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Solved:</span>
                  <span className="font-bold text-emerald-600">{leaderboard[0]?.challenges_solved || 0}</span>
                </div>
              </div>
            </div>

            {/* Rank 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center transform md:translate-y-6">
              <div className="text-3xl mb-2">🥉</div>
              <h3 className="text-lg font-bold text-slate-900">{leaderboard[2]?.student_name || `Student ${leaderboard[2]?.student_id}`}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Rank #3</p>
              <div className="mt-4 pt-4 border-t border-slate-100 w-full space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Points:</span>
                  <span className="font-bold text-amber-600">{leaderboard[2]?.total_points || 0} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Solved:</span>
                  <span className="font-semibold text-emerald-600">{leaderboard[2]?.challenges_solved || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search leaderboard by student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 transition text-slate-900 placeholder-slate-400 shadow-sm"
          />
        </div>

        {/* Leaderboard Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Fetching live rankings...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-center">
            <p className="font-bold">{error}</p>
          </div>
        ) : filteredLeaderboard.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-sm">
            No leaderboard records found.
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-800">
                <thead className="bg-slate-100 text-slate-700 uppercase text-xs tracking-wider font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4">Total Points</th>
                    <th className="px-6 py-4">Challenges Solved</th>
                    <th className="px-6 py-4">Accuracy</th>
                    <th className="px-6 py-4">Streak</th>
                    <th className="px-6 py-4">Mastery Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeaderboard.map((entry, idx) => {
                    const rank = idx + 1;
                    return (
                      <tr 
                        key={entry.student_id || idx} 
                        className={`hover:bg-slate-50 transition ${rank <= 3 ? 'bg-blue-50/40' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRankBadge(rank)}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-800">
                            {(entry.student_name || 'S')[0]}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{entry.student_name || `Student ${entry.student_id}`}</div>
                            <div className="text-xs text-slate-500 font-normal">DBMS Scholar</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-extrabold text-amber-600 text-base">
                          {entry.total_points || 0} pts
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-emerald-700 font-bold">
                          <CheckCircle2 className="w-4 h-4 inline mr-1 text-emerald-600" />
                          {entry.challenges_solved || 0} solved
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-700">
                          {entry.accuracy ? `${entry.accuracy}%` : '100%'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-amber-600 font-bold">
                          <Flame className="w-4 h-4 inline mr-1 text-amber-500 fill-amber-500" />
                          {entry.streak || 1} days
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                            {rank === 1 ? 'SQL Grandmaster' : rank <= 3 ? 'SQL Master' : 'SQL Practitioner'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DBMSLeaderboard;
