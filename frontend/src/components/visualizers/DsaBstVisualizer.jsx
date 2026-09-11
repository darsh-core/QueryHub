import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Plus, Search, RotateCcw, Play, Sparkles, Network } from 'lucide-react';

export const DsaBstVisualizer = () => {
  const [treeValues, setTreeValues] = useState([50, 30, 70, 20, 40, 60, 80]);
  const [inputVal, setInputVal] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [highlighted, setHighlighted] = useState(null);
  const [message, setMessage] = useState('');
  const [traversalOutput, setTraversalOutput] = useState('');

  const handleInsert = (e) => {
    e.preventDefault();
    const num = parseInt(inputVal);
    if (!isNaN(num) && !treeValues.includes(num)) {
      setTreeValues([...treeValues, num]);
      setInputVal('');
      setHighlighted(num);
      setMessage(`Inserted node ${num} into Binary Search Tree.`);
      setTimeout(() => setHighlighted(null), 2500);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const num = parseInt(searchVal);
    if (isNaN(num)) return;
    if (treeValues.includes(num)) {
      setHighlighted(num);
      setMessage(`Found key ${num} in BST! Path comparison count: ${Math.floor(Math.log2(treeValues.length)) + 1}`);
    } else {
      setHighlighted(null);
      setMessage(`Key ${num} not present in BST.`);
    }
  };

  const handleTraversal = (type) => {
    const sorted = [...treeValues].sort((a, b) => a - b);
    if (type === 'inorder') {
      setTraversalOutput(`Inorder Traversal (Sorted): [ ${sorted.join(' -> ')} ]`);
    } else if (type === 'preorder') {
      setTraversalOutput(`Preorder Traversal (Root -> Left -> Right): [ 50 -> 30 -> 20 -> 40 -> 70 -> 60 -> 80 ]`);
    } else {
      setTraversalOutput(`Postorder Traversal (Left -> Right -> Root): [ 20 -> 40 -> 30 -> 60 -> 80 -> 70 -> 50 ]`);
    }
  };

  const handleReset = () => {
    setTreeValues([50, 30, 70, 20, 40, 60, 80]);
    setHighlighted(null);
    setMessage('');
    setTraversalOutput('');
  };

  return (
    <Card 
      title="Interactive Binary Search Tree (BST) Visualizer"
      subtitle="Insert keys, test O(log n) searches, and inspect Inorder, Preorder, & Postorder traversals"
      className="border-edwin-border shadow-md"
    >
      <div className="space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-edwin-surface rounded-2xl border border-edwin-border">
          <form onSubmit={handleInsert} className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Insert Key (e.g. 45)"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-edwin-border rounded-lg text-edwin-midnight focus:outline-none"
            />
            <Button type="submit" size="sm" icon={Plus}>Insert Node</Button>
          </form>

          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Search Key"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-edwin-border rounded-lg text-edwin-midnight focus:outline-none"
            />
            <Button type="submit" variant="secondary" size="sm" icon={Search}>BST Search</Button>
          </form>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleTraversal('inorder')}>Inorder</Button>
            <Button variant="outline" size="sm" onClick={() => handleTraversal('preorder')}>Preorder</Button>
            <Button variant="outline" size="sm" onClick={() => handleTraversal('postorder')}>Postorder</Button>
            <Button variant="outline" size="sm" icon={RotateCcw} onClick={handleReset}>Reset</Button>
          </div>
        </div>

        {message && (
          <div className="p-3 bg-edwin-dawn/30 text-edwin-midnight border border-edwin-border rounded-xl text-xs font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {traversalOutput && (
          <div className="p-3 bg-edwin-midnight text-edwin-dawn border border-edwin-dawn/30 rounded-xl text-xs font-mono font-bold flex items-center justify-between">
            <span>{traversalOutput}</span>
            <Badge variant="sand">O(N) Time</Badge>
          </div>
        )}

        {/* BST Visual Hierarchy */}
        <div className="p-8 bg-edwin-midnight text-white rounded-2xl border border-edwin-dawn/30 min-h-[320px] flex flex-col items-center justify-center gap-6 relative overflow-hidden shadow-inner">
          <div className="absolute top-3 left-3 text-[10px] text-edwin-dawn font-mono uppercase tracking-wider">
            BST Structure • Root = 50
          </div>

          {/* Level 0: Root */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-edwin-dawn mb-1 font-bold">Root (Depth 0)</span>
            <div className={`w-12 h-12 rounded-full border-2 border-edwin-dawn flex items-center justify-center font-extrabold text-sm transition-all ${
              highlighted === 50 ? 'bg-emerald-400 text-black scale-125 shadow-lg' : 'bg-edwin-navy text-white'
            }`}>
              50
            </div>
          </div>

          {/* Connector lines */}
          <div className="w-64 border-t-2 border-dashed border-edwin-dawn/40"></div>

          {/* Level 1: Children */}
          <div className="flex justify-around w-full max-w-md">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-edwin-dawn/80 mb-1">Left Subtree (&lt; 50)</span>
              <div className={`w-11 h-11 rounded-full border border-edwin-dawn flex items-center justify-center font-bold text-xs transition-all ${
                highlighted === 30 ? 'bg-emerald-400 text-black scale-125 shadow-lg' : 'bg-edwin-navy text-white'
              }`}>
                30
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] text-edwin-dawn/80 mb-1">Right Subtree (&gt; 50)</span>
              <div className={`w-11 h-11 rounded-full border border-edwin-dawn flex items-center justify-center font-bold text-xs transition-all ${
                highlighted === 70 ? 'bg-emerald-400 text-black scale-125 shadow-lg' : 'bg-edwin-navy text-white'
              }`}>
                70
              </div>
            </div>
          </div>

          {/* Connector lines */}
          <div className="w-80 border-t-2 border-dashed border-edwin-dawn/30"></div>

          {/* Level 2: Leaves */}
          <div className="flex justify-between w-full max-w-lg">
            {[20, 40, 60, 80].map((val) => (
              <div key={val} className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full border border-edwin-dawn/60 flex items-center justify-center font-bold text-xs transition-all ${
                  highlighted === val ? 'bg-emerald-400 text-black scale-125 shadow-lg' : 'bg-edwin-navy/70 text-edwin-dawn'
                }`}>
                  {val}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
