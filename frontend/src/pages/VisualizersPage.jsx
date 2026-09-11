import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { BTreeVisualizer } from '../components/visualizers/BTreeVisualizer';
import { SqlJoinVisualizer } from '../components/visualizers/SqlJoinVisualizer';
import { NormalizationVisualizer } from '../components/visualizers/NormalizationVisualizer';
import { AcidLockVisualizer } from '../components/visualizers/AcidLockVisualizer';
import { DsaBstVisualizer } from '../components/visualizers/DsaBstVisualizer';
import { DsaSortingVisualizer } from '../components/visualizers/DsaSortingVisualizer';
import { DsaStackQueueVisualizer } from '../components/visualizers/DsaStackQueueVisualizer';
import { DsaGraphVisualizer } from '../components/visualizers/DsaGraphVisualizer';
import { ChevronLeft, Layers, Database, Sparkles, ShieldCheck, Filter, Network, BarChart2, Cpu } from 'lucide-react';

export const VisualizersPage = () => {
  const navigate = useNavigate();
  const [courseCategory, setCourseCategory] = useState('dbms'); // 'dbms' or 'dsa'
  const [activeTab, setActiveTab] = useState('btree');

  const handleCategorySwitch = (cat) => {
    setCourseCategory(cat);
    if (cat === 'dbms') {
      setActiveTab('btree');
    } else {
      setActiveTab('bst');
    }
  };

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
            Qwen Visualizer Suite v2.0
          </span>
        </div>

        {/* Page Title & Course Category Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-edwin-dawn text-edwin-midnight rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Algorithm & System Visualizers
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-edwin-midnight tracking-tight">
              {courseCategory === 'dbms' ? 'DBMS Interactive Visualizer Suite' : 'Data Structures & Algorithms Visualizer Suite'}
            </h1>

            <p className="text-xs sm:text-sm text-edwin-navy leading-relaxed max-w-2xl">
              {courseCategory === 'dbms' 
                ? 'Powered by Qwen Visualizers. Test B+ Tree index insertions, SQL Join tuple matching, BCNF decomposition, and 2-Phase Locking (2PL) concurrency step-by-step.'
                : 'Powered by Qwen Visualizers. Test Binary Search Trees (BST), Sorting algorithms, Stack & Queue memory, and Graph BFS/DFS traversals.'}
            </p>
          </div>

          {/* Top Level Category Selector */}
          <div className="flex items-center gap-2 p-1.5 bg-edwin-surface rounded-2xl border border-edwin-border shrink-0 self-start md:self-center shadow-xs">
            <button
              onClick={() => handleCategorySwitch('dbms')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                courseCategory === 'dbms'
                  ? 'bg-edwin-midnight text-white shadow-md'
                  : 'text-edwin-navy hover:text-edwin-midnight'
              }`}
            >
              <Database className="w-4 h-4" /> DBMS (CS-501)
            </button>

            <button
              onClick={() => handleCategorySwitch('dsa')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                courseCategory === 'dsa'
                  ? 'bg-edwin-midnight text-white shadow-md'
                  : 'text-edwin-navy hover:text-edwin-midnight'
              }`}
            >
              <Cpu className="w-4 h-4" /> Data Structures (CS-502)
            </button>
          </div>
        </div>

        {/* Visualizer Selector Tabs */}
        {courseCategory === 'dbms' ? (
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
        ) : (
          <div className="flex flex-wrap border-b border-edwin-border gap-2">
            <button
              onClick={() => setActiveTab('bst')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'bst'
                  ? 'border-edwin-midnight text-edwin-midnight bg-edwin-surface rounded-t-xl'
                  : 'border-transparent text-edwin-navy hover:text-edwin-midnight'
              }`}
            >
              <Network className="w-4 h-4 text-edwin-navy" />
              1. Binary Search Tree (BST)
            </button>

            <button
              onClick={() => setActiveTab('sorting')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'sorting'
                  ? 'border-edwin-midnight text-edwin-midnight bg-edwin-surface rounded-t-xl'
                  : 'border-transparent text-edwin-navy hover:text-edwin-midnight'
              }`}
            >
              <BarChart2 className="w-4 h-4 text-edwin-navy" />
              2. Sorting Algorithms
            </button>

            <button
              onClick={() => setActiveTab('stackqueue')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'stackqueue'
                  ? 'border-edwin-midnight text-edwin-midnight bg-edwin-surface rounded-t-xl'
                  : 'border-transparent text-edwin-navy hover:text-edwin-midnight'
              }`}
            >
              <Layers className="w-4 h-4 text-edwin-navy" />
              3. Stacks & Queues (LIFO/FIFO)
            </button>

            <button
              onClick={() => setActiveTab('graph')}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'graph'
                  ? 'border-edwin-midnight text-edwin-midnight bg-edwin-surface rounded-t-xl'
                  : 'border-transparent text-edwin-navy hover:text-edwin-midnight'
              }`}
            >
              <Cpu className="w-4 h-4 text-edwin-navy" />
              4. Graph BFS & DFS Traversals
            </button>
          </div>
        )}

        {/* Selected Visualizer Output */}
        <div className="pt-2">
          {courseCategory === 'dbms' && (
            <>
              {activeTab === 'btree' && <BTreeVisualizer />}
              {activeTab === 'join' && <SqlJoinVisualizer />}
              {activeTab === 'normalization' && <NormalizationVisualizer />}
              {activeTab === 'acid' && <AcidLockVisualizer />}
            </>
          )}

          {courseCategory === 'dsa' && (
            <>
              {activeTab === 'bst' && <DsaBstVisualizer />}
              {activeTab === 'sorting' && <DsaSortingVisualizer />}
              {activeTab === 'stackqueue' && <DsaStackQueueVisualizer />}
              {activeTab === 'graph' && <DsaGraphVisualizer />}
            </>
          )}
        </div>
      </main>
    </div>
  );
};
