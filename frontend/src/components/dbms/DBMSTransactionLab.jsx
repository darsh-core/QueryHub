import React, { useState } from 'react';
import { Zap, Play, RotateCcw, CheckCircle2, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DBMSTransactionLab = () => {
  const navigate = useNavigate();
  const [txnState, setTxnState] = useState('IDLE'); // IDLE | ACTIVE | COMMITTED | ABORTED
  const [isolationLevel, setIsolationLevel] = useState('READ COMMITTED');
  const [logTrace, setLogTrace] = useState([]);
  const [savepoints, setSavepoints] = useState([]);
  const [balance, setBalance] = useState(5000);

  const handleBegin = () => {
    setTxnState('ACTIVE');
    setLogTrace(prev => [...prev, `[${new Date().toLocaleTimeString()}] BEGIN TRANSACTION; (Isolation: ${isolationLevel})`]);
  };

  const handleExecuteDebit = () => {
    if (txnState !== 'ACTIVE') return;
    setBalance(b => b - 500);
    setLogTrace(prev => [...prev, `[${new Date().toLocaleTimeString()}] UPDATE accounts SET balance = balance - 500 WHERE acc_id = 101;`]);
  };

  const handleSavepoint = () => {
    if (txnState !== 'ACTIVE') return;
    const spName = `sp_${savepoints.length + 1}`;
    setSavepoints(prev => [...prev, spName]);
    setLogTrace(prev => [...prev, `[${new Date().toLocaleTimeString()}] SAVEPOINT ${spName};`]);
  };

  const handleCommit = () => {
    if (txnState !== 'ACTIVE') return;
    setTxnState('COMMITTED');
    setLogTrace(prev => [...prev, `[${new Date().toLocaleTimeString()}] COMMIT; (Transaction changes persisted to disk storage)`]);
  };

  const handleRollback = () => {
    if (txnState !== 'ACTIVE') return;
    setTxnState('ABORTED');
    setBalance(5000);
    setSavepoints([]);
    setLogTrace(prev => [...prev, `[${new Date().toLocaleTimeString()}] ROLLBACK; (All uncommitted changes aborted)`]);
  };

  const handleReset = () => {
    setTxnState('IDLE');
    setBalance(5000);
    setSavepoints([]);
    setLogTrace([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-slate-700 hover:text-slate-900 border border-slate-200"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Zap className="w-7 h-7 text-amber-500 fill-amber-500" />
                ACID Transaction & Concurrency Simulator
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Execute BEGIN, COMMIT, ROLLBACK, & SAVEPOINT timelines while observing transaction isolation levels.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition border border-slate-200 flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Reset Lab
            </button>
          </div>
        </div>

        {/* Transaction Control Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Isolation Level:</span>
              <select
                value={isolationLevel}
                onChange={(e) => setIsolationLevel(e.target.value)}
                disabled={txnState === 'ACTIVE'}
                className="bg-slate-50 text-slate-900 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 cursor-pointer focus:outline-none"
              >
                <option value="READ UNCOMMITTED">READ UNCOMMITTED (Dirty Reads Allowed)</option>
                <option value="READ COMMITTED">READ COMMITTED (Default)</option>
                <option value="REPEATABLE READ">REPEATABLE READ (Snapshot Reads)</option>
                <option value="SERIALIZABLE">SERIALIZABLE (Strict Strict 2PL)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-bold">Transaction State:</span>
              <span className={`px-3 py-1 rounded-full font-black uppercase text-xs ${
                txnState === 'ACTIVE' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                txnState === 'COMMITTED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                txnState === 'ABORTED' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {txnState}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleBegin}
              disabled={txnState === 'ACTIVE'}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-40"
            >
              BEGIN TRANSACTION
            </button>

            <button
              onClick={handleExecuteDebit}
              disabled={txnState !== 'ACTIVE'}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-40"
            >
              UPDATE Balance (-$500)
            </button>

            <button
              onClick={handleSavepoint}
              disabled={txnState !== 'ACTIVE'}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-40"
            >
              Set SAVEPOINT
            </button>

            <button
              onClick={handleCommit}
              disabled={txnState !== 'ACTIVE'}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-40"
            >
              COMMIT
            </button>

            <button
              onClick={handleRollback}
              disabled={txnState !== 'ACTIVE'}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-40"
            >
              ROLLBACK
            </button>
          </div>
        </div>

        {/* Live Balance & Execution Log */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" /> Account State
            </h3>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-xs text-slate-500 font-bold">Account #101 Balance:</span>
              <p className="text-2xl font-black text-emerald-700 font-mono">${balance.toFixed(2)}</p>
            </div>
          </div>

          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" /> Write-Ahead Logging (WAL) Timeline
            </h3>
            <div className="p-4 bg-slate-900 text-amber-300 font-mono text-xs rounded-xl h-48 overflow-y-auto space-y-1.5 border border-slate-800">
              {logTrace.length === 0 ? (
                <span className="text-slate-600 italic">No transactions executed yet. Click BEGIN TRANSACTION to start.</span>
              ) : (
                logTrace.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
