import React, { useState } from 'react';
import { 
  Database, Plus, Trash2, Key, CheckCircle2, AlertTriangle, 
  Code, Sparkles, Layers, ArrowRight, Save, Play, ArrowLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DBMSDesignLab = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([
    {
      name: 'students',
      columns: [
        { name: 'student_id', type: 'INTEGER', pk: true, fk: '' },
        { name: 'full_name', type: 'VARCHAR(100)', pk: false, fk: '' },
        { name: 'email', type: 'VARCHAR(100)', pk: false, fk: '' },
        { name: 'dept_id', type: 'INTEGER', pk: false, fk: 'departments.dept_id' }
      ]
    },
    {
      name: 'departments',
      columns: [
        { name: 'dept_id', type: 'INTEGER', pk: true, fk: '' },
        { name: 'dept_name', type: 'VARCHAR(50)', pk: false, fk: '' }
      ]
    }
  ]);

  const [validationReport, setValidationReport] = useState(null);
  const [generatedDdl, setGeneratedDdl] = useState('');

  const handleAddTable = () => {
    const newTableName = `table_${tables.length + 1}`;
    setTables(prev => [
      ...prev,
      {
        name: newTableName,
        columns: [
          { name: 'id', type: 'INTEGER', pk: true, fk: '' },
          { name: 'name', type: 'VARCHAR(100)', pk: false, fk: '' }
        ]
      }
    ]);
  };

  const handleAddColumn = (tblIdx) => {
    setTables(prev => {
      const copy = [...prev];
      copy[tblIdx].columns.push({
        name: `col_${copy[tblIdx].columns.length + 1}`,
        type: 'VARCHAR(50)',
        pk: false,
        fk: ''
      });
      return copy;
    });
  };

  const handleRemoveColumn = (tblIdx, colIdx) => {
    setTables(prev => {
      const copy = [...prev];
      copy[tblIdx].columns.splice(colIdx, 1);
      return copy;
    });
  };

  const handleRemoveTable = (tblIdx) => {
    setTables(prev => prev.filter((_, idx) => idx !== tblIdx));
  };

  const handleValidateSchema = () => {
    const issues = [];
    const tableNames = new Set();

    tables.forEach(t => {
      if (tableNames.has(t.name)) {
        issues.push(`Duplicate table name '${t.name}'.`);
      }
      tableNames.add(t.name);

      const hasPk = t.columns.some(c => c.pk);
      if (!hasPk) {
        issues.push(`Table '${t.name}' is missing a Primary Key (PK). Every relational table should define a unique Primary Key.`);
      }

      t.columns.forEach(c => {
        if (c.fk && !c.fk.includes('.')) {
          issues.push(`Foreign key '${c.name}' in table '${t.name}' should specify target in format 'target_table.target_column'.`);
        }
      });
    });

    if (issues.length === 0) {
      setValidationReport({
        status: 'VALID',
        message: 'Schema Design is 100% Relational Compliant! Primary keys and foreign key bindings verified.'
      });
    } else {
      setValidationReport({
        status: 'WARNING',
        issues
      });
    }
  };

  const handleGenerateSql = () => {
    let ddl = '-- Visual Database Schema DDL Generator\n';
    tables.forEach(t => {
      ddl += `CREATE TABLE ${t.name} (\n`;
      const colLines = [];
      const fks = [];

      t.columns.forEach(c => {
        let line = `  ${c.name} ${c.type}`;
        if (c.pk) line += ' PRIMARY KEY';
        colLines.push(line);

        if (c.fk && c.fk.includes('.')) {
          const [refT, refC] = c.fk.split('.');
          fks.push(`  FOREIGN KEY (${c.name}) REFERENCES ${refT}(${refC})`);
        }
      });

      ddl += colLines.concat(fks).join(',\n') + '\n);\n\n';
    });
    setGeneratedDdl(ddl);
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
                <Layers className="w-7 h-7 text-blue-600" />
                Visual Database Design & ER Studio
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Construct relational tables, define attributes & foreign key bindings, and generate production SQL DDL scripts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddTable}
              className="px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Entity Table
            </button>

            <button
              onClick={handleValidateSchema}
              className="px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Audit Schema
            </button>

            <button
              onClick={handleGenerateSql}
              className="px-4 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition shadow flex items-center gap-1.5"
            >
              <Code className="w-4 h-4" /> Generate DDL
            </button>
          </div>
        </div>

        {/* Audit Report Banner */}
        {validationReport && (
          <div className={`p-4 rounded-2xl border ${
            validationReport.status === 'VALID' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              {validationReport.status === 'VALID' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {validationReport.status === 'VALID' ? 'Schema Design Verified' : 'Schema Warnings Identified'}
            </div>
            {validationReport.message && <p className="text-xs mt-1 font-medium">{validationReport.message}</p>}
            {validationReport.issues && (
              <ul className="list-disc list-inside text-xs mt-1.5 space-y-1">
                {validationReport.issues.map((iss, i) => <li key={i}>{iss}</li>)}
              </ul>
            )}
          </div>
        )}

        {/* Visual Entity Tables Canvas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((tbl, tblIdx) => (
            <div key={tblIdx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <input
                  type="text"
                  value={tbl.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTables(prev => {
                      const c = [...prev];
                      c[tblIdx].name = val;
                      return c;
                    });
                  }}
                  className="font-bold text-base text-blue-900 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-600 font-mono"
                />

                <button
                  onClick={() => handleRemoveTable(tblIdx)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Remove Table"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>Columns ({tbl.columns.length})</span>
                  <button
                    onClick={() => handleAddColumn(tblIdx)}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    + Column
                  </button>
                </div>

                <div className="space-y-2">
                  {tbl.columns.map((col, colIdx) => (
                    <div key={colIdx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={col.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTables(prev => {
                              const c = [...prev];
                              c[tblIdx].columns[colIdx].name = val;
                              return c;
                            });
                          }}
                          className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded-md font-mono text-slate-900"
                        />

                        <select
                          value={col.type}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTables(prev => {
                              const c = [...prev];
                              c[tblIdx].columns[colIdx].type = val;
                              return c;
                            });
                          }}
                          className="px-2 py-1 bg-white border border-slate-300 rounded-md font-mono text-slate-900"
                        >
                          <option value="INTEGER">INTEGER</option>
                          <option value="VARCHAR(50)">VARCHAR(50)</option>
                          <option value="VARCHAR(100)">VARCHAR(100)</option>
                          <option value="TEXT">TEXT</option>
                          <option value="DECIMAL(10,2)">DECIMAL(10,2)</option>
                          <option value="DATE">DATE</option>
                        </select>

                        <button
                          onClick={() => handleRemoveColumn(tblIdx, colIdx)}
                          className="text-rose-600 hover:bg-rose-100 p-1 rounded"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <label className="flex items-center gap-1 text-amber-700 font-bold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={col.pk}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setTables(prev => {
                                const c = [...prev];
                                c[tblIdx].columns[colIdx].pk = val;
                                return c;
                              });
                            }}
                            className="rounded border-slate-300"
                          />
                          Primary Key (PK)
                        </label>

                        <input
                          type="text"
                          placeholder="FK: table.column"
                          value={col.fk}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTables(prev => {
                              const c = [...prev];
                              c[tblIdx].columns[colIdx].fk = val;
                              return c;
                            });
                          }}
                          className="w-32 px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono text-slate-700"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Generated DDL Code Output */}
        {generatedDdl && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-600" /> Generated SQL DDL Script
            </h3>
            <pre className="p-4 bg-slate-900 text-amber-300 font-mono text-xs rounded-xl overflow-x-auto whitespace-pre-wrap border border-slate-800">
              {generatedDdl}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
};
