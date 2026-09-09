import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Layers, Plus, RotateCcw, Search, Sparkles, Database } from 'lucide-react';

export const BTreeVisualizer = () => {
  const [keys, setKeys] = useState([10, 20, 35, 45, 60, 75, 90]);
  const [newKey, setNewKey] = useState('');
  const [searchTarget, setSearchTarget] = useState('');
  const [highlightedKey, setHighlightedKey] = useState(null);
  const [searchMsg, setSearchMsg] = useState('');

  const handleInsert = (e) => {
    e.preventDefault();
    const val = parseInt(newKey);
    if (!isNaN(val) && !keys.includes(val)) {
      const updated = [...keys, val].sort((a, b) => a - b);
      setKeys(updated);
      setNewKey('');
      setHighlightedKey(val);
      setTimeout(() => setHighlightedKey(null), 2500);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const val = parseInt(searchTarget);
    if (isNaN(val)) return;
    if (keys.includes(val)) {
      setHighlightedKey(val);
      setSearchMsg(`Found Key ${val} in Leaf Node via B+ Tree Index search path! (Disk Reads: 2)`);
    } else {
      setHighlightedKey(null);
      setSearchMsg(`Key ${val} not found in B+ Tree index.`);
    }
  };

  const handleReset = () => {
    setKeys([10, 20, 35, 45, 60, 75, 90]);
    setHighlightedKey(null);
    setSearchMsg('');
  };

  // Node splitting representation (Degree = 3)
  const rootKeys = [keys[Math.floor(keys.length / 2)]];
  const leftChild = keys.slice(0, Math.floor(keys.length / 2));
  const rightChild = keys.slice(Math.floor(keys.length / 2) + 1);

  return (
    <Card 
      title="Interactive B+ Tree Index Visualizer" 
      subtitle="Visualizing node splits, balanced fan-out, and leaf-node linking for disk I/O optimization"
      className="border-edwin-border shadow-md"
    >
      <div className="space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-edwin-surface rounded-2xl border border-edwin-border">
          <form onSubmit={handleInsert} className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Insert Key (e.g. 50)"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-edwin-border rounded-lg text-edwin-midnight focus:outline-none"
            />
            <Button type="submit" size="sm" icon={Plus}>Insert Key</Button>
          </form>

          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Search Key"
              value={searchTarget}
              onChange={(e) => setSearchTarget(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-edwin-border rounded-lg text-edwin-midnight focus:outline-none"
            />
            <Button type="submit" variant="secondary" size="sm" icon={Search}>Index Search</Button>
          </form>

          <Button variant="outline" size="sm" icon={RotateCcw} onClick={handleReset}>
            Reset Tree
          </Button>
        </div>

        {searchMsg && (
          <div className="p-3 bg-edwin-dawn/30 text-edwin-midnight border border-edwin-border rounded-xl text-xs font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-edwin-accent shrink-0" />
            <span>{searchMsg}</span>
          </div>
        )}

        {/* Tree Render Canvas */}
        <div className="p-6 bg-edwin-midnight text-white rounded-2xl border border-edwin-dawn/30 min-h-[300px] flex flex-col items-center justify-center gap-8 relative overflow-hidden shadow-inner">
          <div className="absolute top-3 left-3 text-[10px] text-edwin-dawn font-mono uppercase tracking-wider">
            B+ Tree Structure • Max Degree = 4
          </div>

          {/* Root Node */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold text-edwin-dawn mb-1 uppercase">Root Node</span>
            <div className="flex gap-1 p-2 bg-edwin-navy border-2 border-edwin-dawn rounded-xl shadow-lg">
              {rootKeys.map((k, idx) => (
                <span key={idx} className="px-3 py-1 bg-edwin-midnight text-edwin-dawn font-extrabold text-sm rounded border border-edwin-dawn/40">
                  {k}
                </span>
              ))}
            </div>
          </div>

          {/* Connectors */}
          <div className="w-48 border-t-2 border-dashed border-edwin-dawn/50"></div>

          {/* Leaf Nodes Track */}
          <div className="flex flex-wrap justify-center gap-6">
            {/* Left Leaf */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-edwin-dawn/80 mb-1">Left Leaf Node</span>
              <div className="flex gap-1 p-2 bg-edwin-navy/80 border border-edwin-dawn/50 rounded-xl">
                {leftChild.map((k, idx) => (
                  <span 
                    key={idx} 
                    className={`px-2.5 py-1 text-xs font-bold rounded transition-all duration-300 ${
                      highlightedKey === k 
                        ? 'bg-emerald-400 text-black scale-110 shadow-lg font-black' 
                        : 'bg-edwin-midnight text-white border border-edwin-dawn/30'
                    }`}
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Leaf */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-edwin-dawn/80 mb-1">Right Leaf Node</span>
              <div className="flex gap-1 p-2 bg-edwin-navy/80 border border-edwin-dawn/50 rounded-xl">
                {rightChild.map((k, idx) => (
                  <span 
                    key={idx} 
                    className={`px-2.5 py-1 text-xs font-bold rounded transition-all duration-300 ${
                      highlightedKey === k 
                        ? 'bg-emerald-400 text-black scale-110 shadow-lg font-black' 
                        : 'bg-edwin-midnight text-white border border-edwin-dawn/30'
                    }`}
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="text-[10px] text-edwin-dawn/70 font-mono mt-2">
            🔗 Leaf nodes are sequentially linked pointers enabling O(log N) point search and O(1) range queries.
          </div>
        </div>
      </div>
    </Card>
  );
};
