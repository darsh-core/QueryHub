import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { BTreeVisualizer } from '../components/visualizers/BTreeVisualizer';
import { SqlJoinVisualizer } from '../components/visualizers/SqlJoinVisualizer';
import { NormalizationVisualizer } from '../components/visualizers/NormalizationVisualizer';
import { AcidLockVisualizer } from '../components/visualizers/AcidLockVisualizer';
import { ChevronLeft, Layers, Database, Sparkles, ShieldCheck, Filter } from 'lucide-react';

export const VisualizersPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('btree');

  return (
    <div className="min-h-screen bg-edwin-bg flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-edwin-navy hover:text-edwin-midnight transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Main Dashboard
          </button>

          <span className="text-xs font-mono font-bold text-edwin-midnight bg-edwin-dawn/40 px-3 py-1 rounded-xl border border-edwin-border">
            Edwin Visualizer Suite v2.0
          </span>
        </div>

        {/* Page Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-edwin-dawn text-edwin-midnight rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Interactive Algorithm & System Visualizers
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-edwin-midnight tracking-tight">
            DBMS Interactive Visualizer Suite
          </h1>

          <p className="text-xs sm:text-sm text-edwin-navy leading-relaxed max-w-3xl">
            Inspired by Edwin Visualizers. Test B+ Tree index insertions, SQL Join tuple matching, BCNF decomposition, and 2-Phase Locking (2PL) concurrency step-by-step.
          </p>
        </div>

        {/* Visualizer Selector Tabs */}
        <div className="flex flex-wrap border-b border-edwin-border gap-2">
          <button
            onClick={() => setActiveTab('btree')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'btree'
                ? 'border-edwin-midnight text-edwin-midnight bg-edwin-surface rounded-t-xl'
                : 'border-transparent text-edwin-navy hover:text-edwin-midnight'
            }`}
          >
            <Database className="w-4 h-4 text-edwin-navy" />
            1. B+ Tree Indexing
          </button>

          <button
            onClick={() => setActiveTab('join')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'join'
                ? 'border-edwin-midnight text-edwin-midnight bg-edwin-surface rounded-t-xl'
                : 'border-transparent text-edwin-navy hover:text-edwin-midnight'
            }`}
          >
            <Filter className="w-4 h-4 text-edwin-navy" />
            2. SQL Joins & Venn Sets
          </button>

          <button
            onClick={() => setActiveTab('normalization')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'normalization'
                ? 'border-edwin-midnight text-edwin-midnight bg-edwin-surface rounded-t-xl'
                : 'border-transparent text-edwin-navy hover:text-edwin-midnight'
            }`}
          >
            <Layers className="w-4 h-4 text-edwin-navy" />
            3. Normalization (BCNF)
          </button>

          <button
            onClick={() => setActiveTab('acid')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'acid'
                ? 'border-edwin-midnight text-edwin-midnight bg-edwin-surface rounded-t-xl'
                : 'border-transparent text-edwin-navy hover:text-edwin-midnight'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-edwin-navy" />
            4. ACID & 2PL Concurrency
          </button>
        </div>

        {/* Selected Visualizer Output */}
        <div className="pt-2">
          {activeTab === 'btree' && <BTreeVisualizer />}
          {activeTab === 'join' && <SqlJoinVisualizer />}
          {activeTab === 'normalization' && <NormalizationVisualizer />}
          {activeTab === 'acid' && <AcidLockVisualizer />}
        </div>
      </main>
    </div>
  );
};
