import React, { useState } from 'react';
import { 
  X, ZoomIn, ZoomOut, RefreshCw, Key, Database, Table, Sparkles, 
  ArrowRight, Code, BookOpen 
} from 'lucide-react';

export const DBMSErDiagramModal = ({ isOpen, onClose, databaseName, schema, onGenerateSql, onExplainAi }) => {
  const [zoom, setZoom] = useState(100);

  if (!isOpen || !schema) return null;

  const tables = schema.tables || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 font-sans animate-fadeIn">
      <div className="bg-white text-slate-900 w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="h-16 px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Entity-Relationship (ER) Schema Diagram
                <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-black">
                  {databaseName}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Visual entity relationships, foreign key bindings, and cardinalities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-100 rounded-xl px-2 py-1 border border-slate-200 text-xs font-mono">
              <button 
                onClick={() => setZoom(z => Math.max(60, z - 15))}
                className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-slate-800 font-bold">{zoom}%</span>
              <button 
                onClick={() => setZoom(z => Math.min(150, z + 15))}
                className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setZoom(100)}
                className="p-1 hover:bg-slate-200 rounded text-slate-600 hover:text-slate-900 ml-1 border-l border-slate-200"
                title="Reset Zoom"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => onExplainAi && onExplainAi(databaseName)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Explain Schema with AI</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ER Diagram Canvas */}
        <div className="flex-1 overflow-auto p-8 bg-slate-100 relative flex items-start justify-center">
          <div 
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
            className="transition-transform duration-150 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl w-full my-auto"
          >
            {tables.map((tbl, idx) => (
              <div 
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:border-blue-500 transition-all group"
              >
                {/* Table Header Card */}
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900 tracking-wide">{tbl.name}</h3>
                  </div>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-mono font-semibold border border-blue-100">
                    {tbl.columns?.length || 0} fields
                  </span>
                </div>

                {/* Column Attributes List */}
                <div className="p-3 space-y-1.5 flex-1 divide-y divide-slate-100 text-xs">
                  {tbl.columns.map((col, cIdx) => (
                    <div key={cIdx} className="pt-1.5 first:pt-0 flex items-center justify-between text-slate-700">
                      <div className="flex items-center gap-2 min-w-0">
                        {col.pk ? (
                          <span className="p-0.5 bg-amber-100 text-amber-700 rounded" title="Primary Key">
                            <Key className="w-3.5 h-3.5 text-amber-700" />
                          </span>
                        ) : col.fk ? (
                          <span className="p-0.5 bg-sky-100 text-sky-700 rounded" title={`Foreign Key -> ${col.fk}`}>
                            <ArrowRight className="w-3.5 h-3.5 text-sky-700" />
                          </span>
                        ) : (
                          <span className="w-3.5 h-3.5 block rounded-full bg-slate-200" />
                        )}

                        <span className={`font-mono text-xs truncate ${col.pk ? 'font-bold text-amber-700' : (col.fk ? 'text-sky-700 font-semibold' : 'text-slate-800')}`}>
                          {col.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">{col.type}</span>
                        {col.pk && <span className="text-[9px] bg-amber-500 text-white font-bold px-1 rounded">PK</span>}
                        {col.fk && <span className="text-[9px] bg-sky-500 text-white font-bold px-1 rounded">FK</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Table Footer Actions */}
                <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-mono">1-to-N Relations</span>
                  <button 
                    onClick={() => onGenerateSql && onGenerateSql(`SELECT * FROM ${tbl.name} LIMIT 10;`)}
                    className="text-blue-600 hover:underline font-bold flex items-center gap-1"
                  >
                    <Code className="w-3 h-3" /> Select SQL
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="h-14 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Primary Key (PK)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Foreign Key (FK) Relationship
            </span>
          </div>
          <span>QueryHub DBMS ER Schema Visualizer Engine</span>
        </div>

      </div>
    </div>
  );
};
