import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Network, Play, RotateCcw, Sparkles } from 'lucide-react';

export const DsaGraphVisualizer = () => {
  const nodes = ['A', 'B', 'C', 'D', 'E', 'F'];
  const edges = [
    { from: 'A', to: 'B' },
    { from: 'A', to: 'C' },
    { from: 'B', to: 'D' },
    { from: 'C', to: 'E' },
    { from: 'D', to: 'F' },
    { from: 'E', to: 'F' }
  ];

  const [activeNode, setActiveNode] = useState(null);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [traversalLog, setTraversalLog] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const runBFS = async () => {
    setIsRunning(true);
    setVisitedNodes([]);
    setTraversalLog('Starting Breadth-First Search (BFS) from Node A...');

    const order = ['A', 'B', 'C', 'D', 'E', 'F'];
    const visited = [];

    for (let node of order) {
      setActiveNode(node);
      visited.push(node);
      setVisitedNodes([...visited]);
      setTraversalLog(`BFS Visited Node [ ${node} ] • Queue Level Order`);
      await new Promise((r) => setTimeout(r, 800));
    }

    setActiveNode(null);
    setIsRunning(false);
    setTraversalLog('BFS Traversal Completed: A -> B -> C -> D -> E -> F');
  };

  const runDFS = async () => {
    setIsRunning(true);
    setVisitedNodes([]);
    setTraversalLog('Starting Depth-First Search (DFS) from Node A...');

    const order = ['A', 'B', 'D', 'F', 'E', 'C'];
    const visited = [];

    for (let node of order) {
      setActiveNode(node);
      visited.push(node);
      setVisitedNodes([...visited]);
      setTraversalLog(`DFS Explored Node [ ${node} ] • Stack Recursion Depth`);
      await new Promise((r) => setTimeout(r, 800));
    }

    setActiveNode(null);
    setIsRunning(false);
    setTraversalLog('DFS Traversal Completed: A -> B -> D -> F -> E -> C');
  };

  const handleReset = () => {
    setActiveNode(null);
    setVisitedNodes([]);
    setTraversalLog('');
    setIsRunning(false);
  };

  return (
    <Card 
      title="Interactive Graph Traversals Visualizer (BFS & DFS)"
      subtitle="Step-by-step level-order Breadth-First Search (Queue) and depth Depth-First Search (Stack)"
      className="border-edwin-border shadow-md"
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-edwin-surface rounded-2xl border border-edwin-border">
          <div className="flex items-center gap-2">
            <Button size="sm" icon={Play} disabled={isRunning} onClick={runBFS}>
              Run BFS (Level-Order)
            </Button>
            <Button size="sm" variant="secondary" icon={Play} disabled={isRunning} onClick={runDFS}>
              Run DFS (Deep Path)
            </Button>
          </div>

          <Button variant="outline" size="sm" icon={RotateCcw} disabled={isRunning} onClick={handleReset}>
            Reset Graph
          </Button>
        </div>

        {traversalLog && (
          <div className="p-3 bg-edwin-dawn/30 text-edwin-midnight border border-edwin-border rounded-xl text-xs font-mono font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-700 shrink-0" />
              <span>{traversalLog}</span>
            </div>
            <Badge variant="sand">Visited: {visitedNodes.length}/{nodes.length}</Badge>
          </div>
        )}

        {/* Node Layout Canvas */}
        <div className="p-8 bg-edwin-midnight text-white rounded-2xl border border-edwin-dawn/30 min-h-[300px] flex flex-col items-center justify-center gap-8 relative shadow-inner">
          <div className="absolute top-3 left-3 text-[10px] text-edwin-dawn font-mono uppercase tracking-wider">
            Graph Topology • 6 Vertices, 6 Undirected Edges
          </div>

          {/* Graph Nodes Representation */}
          <div className="grid grid-cols-3 gap-12 max-w-md w-full text-center">
            {nodes.map((n) => {
              const isVisited = visitedNodes.includes(n);
              const isActive = activeNode === n;

              return (
                <div key={n} className="flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-sm font-extrabold transition-all duration-300 shadow-md ${
                    isActive 
                      ? 'bg-emerald-400 text-black border-white scale-125 shadow-emerald-400/50' 
                      : isVisited 
                      ? 'bg-blue-600 text-white border-edwin-dawn' 
                      : 'bg-edwin-navy text-edwin-dawn border-edwin-dawn/30'
                  }`}>
                    {n}
                  </div>
                  <span className="text-[10px] text-edwin-dawn/70 mt-1 font-mono">
                    {isActive ? 'ACTIVE' : isVisited ? 'VISITED' : 'UNVISITED'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};
