import React, { useState, useEffect } from 'react';
import { dbmsLabApi } from '../../services/api';
import { DBMSErDiagramModal } from './DBMSErDiagramModal';
import { 
  Database, Table, Play, RefreshCw, Copy, Download, Sparkles, 
  HelpCircle, ChevronRight, ChevronDown, CheckCircle2, AlertTriangle, 
  Clock, Code, FileText, Layers, FileSpreadsheet, Eye, Terminal, BookOpen,
  Zap, CornerDownRight, Lightbulb, RotateCcw, Filter, Key, Plus, Trash2, PlusCircle
} from 'lucide-react';

export const DBMSLabIDE = () => {
  // Database & Schema State
  const [databases, setDatabases] = useState([]);
  const [selectedDb, setSelectedDb] = useState('Employee Management');
  const [schema, setSchema] = useState(null);
  const [expandedTables, setExpandedTables] = useState({});
  const [erModalOpen, setErModalOpen] = useState(false);

  // SQL Editor State
  const [sqlQuery, setSqlQuery] = useState("SELECT e.first_name, e.last_name, e.job_title, d.dept_name, e.salary\nFROM employees e\nJOIN departments d ON e.dept_id = d.dept_id\nWHERE e.salary > 90000\nORDER BY e.salary DESC;");
  const [executing, setExecuting] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);

  // Results & Output State
  const [queryResult, setQueryResult] = useState(null);
  const [activeResultTab, setActiveResultTab] = useState('table'); // table | json | visualizer | error
  const [queryHistory, setQueryHistory] = useState([]);
  const [executionPlan, setExecutionPlan] = useState(null);

  // AI Mentor State
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [hintLevel, setHintLevel] = useState(1);

  // Table Data Preview Modal State
  const [previewTableModal, setPreviewTableModal] = useState(null);

  // Custom DB & Table Creation Modal State
  const [createDbModalOpen, setCreateDbModalOpen] = useState(false);
  const [newDbName, setNewDbName] = useState('');
  const [newDbDesc, setNewDbDesc] = useState('');

  const [createTableModalOpen, setCreateTableModalOpen] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableCols, setNewTableCols] = useState([
    { name: 'id', type: 'INTEGER', pk: true, not_null: true },
    { name: 'name', type: 'VARCHAR(100)', pk: false, not_null: true },
    { name: 'created_at', type: 'DATE', pk: false, not_null: false }
  ]);
  const [createTableSuccess, setCreateTableSuccess] = useState('');

  useEffect(() => {
    fetchInitialDatabases();
  }, []);

  useEffect(() => {
    if (selectedDb) {
      initLabSession(selectedDb);
    }
  }, [selectedDb]);

  const fetchInitialDatabases = async () => {
    try {
      const res = await dbmsLabApi.getDatabases();
      setDatabases(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchema = async (dbName, sessionId = activeSessionId) => {
    try {
      const res = await dbmsLabApi.getSchema(dbName, sessionId);
      setSchema(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const initLabSession = async (dbName) => {
    try {
      const res = await dbmsLabApi.createSession(dbName);
      const sessId = res.data.session_id;
      setActiveSessionId(sessId);
      fetchSchema(dbName, sessId);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTableExpand = (tableName) => {
    setExpandedTables(prev => ({ ...prev, [tableName]: !prev[tableName] }));
  };

  const handleExecuteSql = async () => {
    if (!sqlQuery.trim()) return;

    setExecuting(true);
    setAiResponse('');
    try {
      const res = await dbmsLabApi.executeQuery(sqlQuery, selectedDb, activeSessionId);
      setQueryResult(res.data);

      if (res.data.status === 'ERROR') {
        setActiveResultTab('error');
      } else {
        setActiveResultTab('table');
        fetchSchema(selectedDb, activeSessionId);
        fetchInitialDatabases();
      }

      setQueryHistory(prev => [
        {
          query: sqlQuery,
          status: res.data.status,
          time_ms: res.data.execution_time_ms,
          timestamp: new Date().toLocaleTimeString()
        },
        ...prev.slice(0, 15)
      ]);

      const planRes = await dbmsLabApi.explainQueryPlan(sqlQuery, selectedDb);
      setExecutionPlan(planRes.data);

    } catch (err) {
      console.error(err);
      setQueryResult({
        status: 'ERROR',
        error_message: err.message || 'Execution error occurred.',
        friendly_error_explanation: 'Failed to connect to isolated execution engine.',
        columns: [],
        rows: []
      });
      setActiveResultTab('error');
    } finally {
      setExecuting(false);
    }
  };

  const handleFormatSql = () => {
    const formatted = sqlQuery
      .replace(/\s+/g, ' ')
      .replace(/\bSELECT\b/gi, '\nSELECT')
      .replace(/\bFROM\b/gi, '\nFROM')
      .replace(/\bJOIN\b/gi, '\nJOIN')
      .replace(/\bWHERE\b/gi, '\nWHERE')
      .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
      .replace(/\bHAVING\b/gi, '\nHAVING')
      .replace(/\bORDER BY\b/gi, '\nORDER BY')
      .replace(/\bCREATE TABLE\b/gi, '\nCREATE TABLE')
      .trim();
    setSqlQuery(formatted);
  };

  const handleCopyResultsCsv = () => {
    if (!queryResult || !queryResult.columns) return;
    const header = queryResult.columns.join(',');
    const rows = queryResult.rows.map(r => r.join(',')).join('\n');
    const csvContent = `${header}\n${rows}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDb.replace(/\s+/g, '_')}_query_results.csv`;
    a.click();
  };

  const handleTriggerAiAction = async (actionType) => {
    setAiLoading(true);
    setAiDrawerOpen(true);
    try {
      const res = await dbmsLabApi.triggerAiAction({
        action: actionType,
        query_text: sqlQuery,
        error_message: queryResult?.error_message,
        database_name: selectedDb,
        hint_level: hintLevel
      });

      if (actionType === 'explain') {
        setAiResponse(res.data.explanation);
      } else if (actionType === 'hint') {
        setAiResponse(res.data.hint_text);
        setHintLevel(res.data.next_level || 1);
      } else if (actionType === 'mistake') {
        setAiResponse(res.data.diagnosis);
      } else if (actionType === 'optimize') {
        setAiResponse(res.data.optimization_tips);
      }
    } catch (err) {
      setAiResponse('AI Mentor response unavailable right now.');
    } finally {
      setAiLoading(false);
    }
  };

  const handlePreviewTableData = async (tableName) => {
    try {
      const res = await dbmsLabApi.getTableData(selectedDb, tableName, activeSessionId);
      setPreviewTableModal({
        tableName,
        data: res.data
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCustomDatabase = async (e) => {
    e.preventDefault();
    if (!newDbName.trim()) return;
    try {
      await dbmsLabApi.createCustomDatabase(newDbName.trim(), newDbDesc.trim() || 'Student Custom Database');
      await fetchInitialDatabases();
      setSelectedDb(newDbName.trim());
      setCreateDbModalOpen(false);
      setNewDbName('');
      setNewDbDesc('');
    } catch (err) {
      alert("Failed to create database workspace.");
    }
  };

  const handleAddColumnRow = () => {
    setNewTableCols(prev => [
      ...prev,
      { name: `col_${prev.length + 1}`, type: 'VARCHAR(50)', pk: false, not_null: false }
    ]);
  };

  const handleRemoveColumnRow = (idx) => {
    setNewTableCols(prev => prev.filter((_, i) => i !== idx));
  };

  const handleColumnChange = (idx, field, val) => {
    setNewTableCols(prev => prev.map((col, i) => i === idx ? { ...col, [field]: val } : col));
  };

  const handleCreateCustomTable = async (e) => {
    e.preventDefault();
    if (!newTableName.trim() || newTableCols.length === 0) return;
    setCreateTableSuccess('');
    try {
      const res = await dbmsLabApi.createCustomTable({
        session_id: activeSessionId,
        database_name: selectedDb,
        table_name: newTableName.trim(),
        columns: newTableCols
      });
      
      setCreateTableSuccess(res.data.message);
      fetchSchema(selectedDb, activeSessionId);
      fetchInitialDatabases();

      if (res.data.ddl_sql) {
        setSqlQuery(`${res.data.ddl_sql}\n\nSELECT * FROM ${newTableName.trim()};`);
      }

      setTimeout(() => {
        setCreateTableModalOpen(false);
        setNewTableName('');
        setCreateTableSuccess('');
      }, 1000);

    } catch (err) {
      alert(err.response?.data?.detail || "Failed to create table.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* 1. White Header Toolbar */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black shadow">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                DBMS Virtual Lab <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full">SQL IDE v2.0</span>
              </h2>
              <p className="text-[10px] text-slate-500 hidden sm:block">
                Isolated SQL Sandbox Execution & Realtime ER Schema Visualizer
              </p>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden md:block" />

          {/* Active Database Dropdown */}
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-600 hidden sm:inline">Database:</span>
            <select
              value={selectedDb}
              onChange={(e) => setSelectedDb(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              {databases.map(db => (
                <option key={db.name} value={db.name} className="bg-white text-slate-900">
                  {db.name} ({db.table_count || db.tables?.length || 0} tables)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateDbModalOpen(true)}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm transition-all"
            title="Create Custom Database"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">+ Database</span>
          </button>

          <button
            onClick={() => setCreateTableModalOpen(true)}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm transition-all"
            title="Create Custom Table"
          >
            <Table className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">+ Table</span>
          </button>

          <button
            onClick={() => setErModalOpen(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            title="Interactive ER Diagram"
          >
            <Layers className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline">ER Diagram</span>
          </button>

          <button
            onClick={() => handleTriggerAiAction('explain')}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition-all"
            title="Ask AI DBMS Mentor"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">AI Mentor</span>
          </button>
        </div>
      </div>

      {/* 2. Main 3-Panel Workplace Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* PANEL 1: LEFT DATABASE EXPLORER SIDEBAR */}
        <aside className="w-64 sm:w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto p-3 space-y-3 select-none shadow-sm">
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" /> Database Explorer
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCreateTableModalOpen(true)}
                className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition"
                title="Create Table"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => fetchSchema(selectedDb, activeSessionId)}
                className="p-1 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-900 transition"
                title="Refresh Schema"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Database Meta */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span>{schema?.database_name || selectedDb}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                {schema?.tables?.length || 0} Tables
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-2">{schema?.description}</p>
          </div>

          {/* Tables List */}
          <div className="space-y-1 flex-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">
              Database Tables ({schema?.tables?.length || 0})
            </span>

            {schema?.tables?.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center space-y-2 border border-dashed border-slate-300">
                <Table className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600">No tables created yet.</p>
                <button
                  onClick={() => setCreateTableModalOpen(true)}
                  className="px-3 py-1 bg-blue-600 text-white font-bold text-xs rounded-lg shadow"
                >
                  + Build First Table
                </button>
              </div>
            ) : (
              schema?.tables?.map((table) => {
                const isExpanded = expandedTables[table.name];
                return (
                  <div key={table.name} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden text-xs shadow-sm">
                    
                    {/* Table Title Bar */}
                    <div 
                      className="p-2.5 flex items-center justify-between hover:bg-slate-100 cursor-pointer transition"
                      onClick={() => toggleTableExpand(table.name)}
                    >
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-blue-600" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                        <Table className="w-3.5 h-3.5 text-blue-600" />
                        <span>{table.name}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewTableData(table.name);
                        }}
                        className="p-1 hover:bg-blue-100 rounded text-slate-500 hover:text-blue-700 transition"
                        title="Preview 20 Sample Rows"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                    </div>

                    {/* Columns Dropdown List */}
                    {isExpanded && (
                      <div className="bg-white p-2.5 space-y-1.5 border-t border-slate-200 text-[11px] font-mono">
                        {table.columns.map((col) => (
                          <div key={col.name} className="flex items-center justify-between text-slate-700">
                            <span className="flex items-center gap-1.5">
                              {col.pk ? (
                                <Key className="w-3 h-3 text-amber-600 shrink-0" title="Primary Key" />
                              ) : col.fk ? (
                                <CornerDownRight className="w-3 h-3 text-sky-600 shrink-0" title={`Foreign Key (${col.fk})`} />
                              ) : (
                                <span className="w-3 h-3 block" />
                              )}
                              <span className={col.pk ? 'font-bold text-amber-700' : ''}>{col.name}</span>
                            </span>
                            <span className="text-[10px] text-slate-400">{col.type}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* PANEL 2: CENTER SQL CODE EDITOR & QUERY OUTPUT */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
          
          {/* Top Code Editor Controls */}
          <div className="bg-white border-b border-slate-200 p-2.5 flex items-center justify-between flex-wrap gap-2 text-xs shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-mono text-blue-700 font-bold flex items-center gap-1">
                <Terminal className="w-4 h-4" /> SQL Editor
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 text-[11px]">Shortcuts: <kbd className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-mono">Ctrl + Enter</kbd> to execute</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleFormatSql}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition font-semibold border border-slate-200"
              >
                Auto Format
              </button>

              <button
                onClick={() => setSqlQuery("SELECT * FROM employees LIMIT 10;")}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition font-semibold border border-slate-200"
              >
                Clear
              </button>

              <button
                onClick={handleExecuteSql}
                disabled={executing}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg shadow transition flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                {executing ? 'Executing...' : 'Run Query'}
              </button>
            </div>
          </div>

          {/* SQL Editor Area */}
          <div className="h-64 sm:h-72 relative border-b border-slate-200 bg-slate-950">
            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder="Type SQL statements here (e.g. SELECT, CREATE TABLE, INSERT, UPDATE, JOIN)..."
              className="w-full h-full p-4 bg-slate-950 text-emerald-400 placeholder-slate-600 font-mono text-sm sm:text-base font-medium focus:outline-none resize-none leading-relaxed border-none selection:bg-blue-600 selection:text-white shadow-inner"
            />
          </div>

          {/* Results Header Tabs */}
          <div className="bg-white border-b border-slate-200 px-3 py-1.5 flex items-center justify-between text-xs shadow-sm">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveResultTab('table')}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  activeResultTab === 'table' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Table className="w-3.5 h-3.5" /> Results Table
              </button>

              <button
                onClick={() => setActiveResultTab('visualizer')}
                className={`px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 ${
                  activeResultTab === 'visualizer' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" /> Execution Pipeline
              </button>

              {queryResult?.status === 'ERROR' && (
                <button
                  onClick={() => setActiveResultTab('error')}
                  className="px-3 py-1 rounded-lg font-bold transition flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> SQL Error
                </button>
              )}
            </div>

            {queryResult && queryResult.status === 'SUCCESS' && (
              <div className="flex items-center gap-3 text-[11px] text-slate-600">
                <span>Latency: <strong className="text-emerald-700 font-mono">{queryResult.execution_time_ms} ms</strong></span>
                <span>Rows: <strong className="text-slate-900 font-mono">{queryResult.rows_affected}</strong></span>
                <button 
                  onClick={handleCopyResultsCsv}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 flex items-center gap-1 transition font-medium"
                  title="Export to CSV"
                >
                  <Download className="w-3 h-3" /> Export CSV
                </button>
              </div>
            )}
          </div>

          {/* Results Content Area */}
          <div className="flex-1 overflow-auto p-3 bg-slate-50">
            {!queryResult ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2 text-center">
                <Code className="w-10 h-10 opacity-40 text-blue-600" />
                <p className="text-xs text-slate-600">Click <strong className="text-slate-900 font-mono">Run Query</strong> or press <strong className="text-slate-900 font-mono">Ctrl+Enter</strong> to execute SQL.</p>
              </div>
            ) : activeResultTab === 'error' ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5" /> SQL Execution Error
                </div>
                <div className="p-3 bg-white font-mono text-rose-800 rounded-xl border border-rose-200">
                  {queryResult.error_message}
                </div>
                {queryResult.friendly_error_explanation && (
                  <div className="p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-200">
                    <p className="font-bold mb-1 text-amber-800">Diagnostic Guidance:</p>
                    <p>{queryResult.friendly_error_explanation}</p>
                  </div>
                )}
                <button
                  onClick={() => handleTriggerAiAction('mistake')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow transition"
                >
                  Ask AI Mentor to Fix Error
                </button>
              </div>
            ) : activeResultTab === 'visualizer' ? (
              <div className="space-y-4 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">Logical SQL Execution Pipeline</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {executionPlan?.logical_flow?.map((node) => (
                    <div key={node.step} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 shadow-sm">
                      <div className="flex items-center justify-between font-bold text-blue-900">
                        <span>Step {node.step}: {node.clause}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Active</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{node.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-sm">
                {queryResult.columns.length === 0 ? (
                  <div className="p-6 text-center text-emerald-700 font-semibold text-xs">
                    Query executed successfully. ({queryResult.rows_affected} rows affected)
                  </div>
                ) : (
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                      <tr>
                        {queryResult.columns.map((col, idx) => (
                          <th key={idx} className="px-4 py-2.5">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queryResult.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50 transition">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-4 py-2 text-slate-800 whitespace-nowrap">
                              {cell === null ? <span className="text-slate-400 italic">NULL</span> : String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 3. Modals */}

      {/* Interactive ER Diagram Modal */}
      <DBMSErDiagramModal
        isOpen={erModalOpen}
        onClose={() => setErModalOpen(false)}
        databaseName={selectedDb}
        schema={schema}
        onGenerateSql={(ddl) => setSqlQuery(ddl)}
        onExplainAi={() => handleTriggerAiAction('explain')}
      />

      {/* Create Custom Database Modal */}
      {createDbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" /> Create Custom Database
              </h3>
              <button onClick={() => setCreateDbModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleCreateCustomDatabase} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Database Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Inventory DB"
                  value={newDbName}
                  onChange={(e) => setNewDbName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Custom database for project tracking"
                  value={newDbDesc}
                  onChange={(e) => setNewDbDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCreateDbModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-extrabold rounded-xl hover:bg-blue-700 transition">
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Custom Table Builder Modal */}
      {createTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Table className="w-5 h-5 text-amber-600" /> Create Custom Table Builder
              </h3>
              <button onClick={() => setCreateTableModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            {createTableSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold">
                {createTableSuccess}
              </div>
            )}

            <form onSubmit={handleCreateCustomTable} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Database</label>
                <input
                  type="text"
                  disabled
                  value={selectedDb}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Table Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. products_catalog"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 font-mono"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Table Columns Definition</label>
                  <button
                    type="button"
                    onClick={handleAddColumnRow}
                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold transition flex items-center gap-1 border border-blue-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Column
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {newTableCols.map((col, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <input
                        type="text"
                        required
                        placeholder="Column Name"
                        value={col.name}
                        onChange={(e) => handleColumnChange(idx, 'name', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                      />

                      <select
                        value={col.type}
                        onChange={(e) => handleColumnChange(idx, 'type', e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                      >
                        <option value="INTEGER">INTEGER</option>
                        <option value="VARCHAR(50)">VARCHAR(50)</option>
                        <option value="VARCHAR(100)">VARCHAR(100)</option>
                        <option value="TEXT">TEXT</option>
                        <option value="DECIMAL(10,2)">DECIMAL(10,2)</option>
                        <option value="REAL">REAL</option>
                        <option value="DATE">DATE</option>
                        <option value="BOOLEAN">BOOLEAN</option>
                      </select>

                      <label className="flex items-center gap-1 text-[11px] text-amber-700 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={col.pk}
                          onChange={(e) => handleColumnChange(idx, 'pk', e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        PK
                      </label>

                      <label className="flex items-center gap-1 text-[11px] text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={col.not_null}
                          onChange={(e) => handleColumnChange(idx, 'not_null', e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        NOT NULL
                      </label>

                      {newTableCols.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveColumnRow(idx)}
                          className="p-1 hover:bg-rose-100 text-rose-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCreateTableModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-extrabold rounded-xl hover:bg-blue-700 transition">
                  Build & Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Sample Data Preview Modal */}
      {previewTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-hidden flex flex-col text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Table className="w-4 h-4 text-blue-600" /> Table Sample Data: <span className="text-blue-700">{previewTableModal.tableName}</span>
              </h3>
              <button onClick={() => setPreviewTableModal(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-50 border border-slate-200 rounded-xl p-2">
              {previewTableModal.data?.columns?.length > 0 ? (
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-200 text-slate-700 uppercase text-[10px]">
                    <tr>
                      {previewTableModal.data.columns.map((c, i) => (
                        <th key={i} className="px-3 py-2">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {previewTableModal.data.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-white">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3 py-1.5 text-slate-800">
                            {cell === null ? <span className="text-slate-400 italic">NULL</span> : String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-slate-500 text-xs p-4 text-center">No rows found in table.</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewTableModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
