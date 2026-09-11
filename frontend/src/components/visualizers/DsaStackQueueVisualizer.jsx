import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ArrowDown, ArrowUp, Plus, RotateCcw, Layers, Zap } from 'lucide-react';

export const DsaStackQueueVisualizer = () => {
  const [mode, setMode] = useState('stack'); // 'stack' or 'queue'
  const [items, setItems] = useState([10, 20, 30]);
  const [inputVal, setInputVal] = useState('');
  const [log, setLog] = useState('Initialized with items: 10, 20, 30');

  const handlePushEnqueue = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const val = inputVal.trim();
    if (mode === 'stack') {
      setItems([val, ...items]);
      setLog(`PUSHED '${val}' onto STACK (TOP)`);
    } else {
      setItems([...items, val]);
      setLog(`ENQUEUED '${val}' into QUEUE (REAR)`);
    }
    setInputVal('');
  };

  const handlePopDequeue = () => {
    if (items.length === 0) {
      setLog(`Underflow Exception: ${mode.toUpperCase()} is empty!`);
      return;
    }
    if (mode === 'stack') {
      const popped = items[0];
      setItems(items.slice(1));
      setLog(`POPPED '${popped}' from STACK (TOP)`);
    } else {
      const dequeued = items[0];
      setItems(items.slice(1));
      setLog(`DEQUEUED '${dequeued}' from QUEUE (FRONT)`);
    }
  };

  const handleReset = () => {
    setItems([10, 20, 30]);
    setLog('Reset to default items: 10, 20, 30');
  };

  return (
    <Card 
      title="Interactive Stack & Queue Memory Visualizer"
      subtitle="Compare LIFO (Last-In, First-Out) Stack vs FIFO (First-In, First-Out) Queue operations"
      className="border-edwin-border shadow-md"
    >
      <div className="space-y-6">
        {/* Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-edwin-surface rounded-2xl border border-edwin-border">
          <div className="flex items-center gap-2">
            <Button
              variant={mode === 'stack' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => { setMode('stack'); setItems([10, 20, 30]); setLog('Switched to STACK (LIFO)'); }}
            >
              <Layers className="w-3.5 h-3.5 mr-1" /> Stack (LIFO)
            </Button>
            <Button
              variant={mode === 'queue' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => { setMode('queue'); setItems([10, 20, 30]); setLog('Switched to QUEUE (FIFO)'); }}
            >
              <Zap className="w-3.5 h-3.5 mr-1" /> Queue (FIFO)
            </Button>
          </div>

          <form onSubmit={handlePushEnqueue} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={mode === 'stack' ? "Element to Push" : "Element to Enqueue"}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-edwin-border rounded-lg text-edwin-midnight focus:outline-none"
            />
            <Button type="submit" size="sm" icon={Plus}>
              {mode === 'stack' ? 'Push (O(1))' : 'Enqueue (O(1))'}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={handlePopDequeue}>
              {mode === 'stack' ? 'Pop (O(1))' : 'Dequeue (O(1))'}
            </Button>
            <Button type="button" variant="outline" size="sm" icon={RotateCcw} onClick={handleReset}>
              Reset
            </Button>
          </form>
        </div>

        {/* Operation Log */}
        <div className="p-3 bg-edwin-dawn/30 text-edwin-midnight border border-edwin-border rounded-xl text-xs font-mono font-bold flex items-center justify-between">
          <span>{log}</span>
          <Badge variant="sand">Size: {items.length}</Badge>
        </div>

        {/* Dynamic Display Canvas */}
        <div className="p-8 bg-edwin-midnight text-white rounded-2xl border border-edwin-dawn/30 min-h-[250px] flex items-center justify-center relative overflow-hidden shadow-inner">
          <div className="absolute top-3 left-3 text-[10px] text-edwin-dawn font-mono uppercase tracking-wider">
            {mode === 'stack' ? 'STACK CONTAINER (TOP AT TOP)' : 'QUEUE LINE (FRONT AT LEFT, REAR AT RIGHT)'}
          </div>

          {items.length === 0 ? (
            <span className="text-xs text-edwin-dawn font-mono opacity-60">Container is empty</span>
          ) : mode === 'stack' ? (
            /* Vertical Stack */
            <div className="flex flex-col gap-2 w-48 border-2 border-dashed border-edwin-dawn/40 p-4 rounded-xl bg-edwin-navy/50">
              {items.map((val, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-lg text-center font-extrabold text-xs transition-all shadow ${
                    idx === 0 
                      ? 'bg-emerald-400 text-black border-2 border-white scale-105' 
                      : 'bg-edwin-midnight text-white border border-edwin-dawn/30'
                  }`}
                >
                  {val} {idx === 0 && <span className="text-[9px] font-black uppercase ml-2">[ TOP ]</span>}
                </div>
              ))}
            </div>
          ) : (
            /* Horizontal Queue */
            <div className="flex items-center gap-3 border-2 border-dashed border-edwin-dawn/40 p-4 rounded-xl bg-edwin-navy/50 overflow-x-auto max-w-full">
              {items.map((val, idx) => (
                <div 
                  key={idx}
                  className={`px-5 py-3 rounded-xl text-center font-extrabold text-xs shrink-0 transition-all shadow ${
                    idx === 0 
                      ? 'bg-emerald-400 text-black border-2 border-white scale-105' 
                      : idx === items.length - 1
                      ? 'bg-amber-400 text-black border-2 border-white'
                      : 'bg-edwin-midnight text-white border border-edwin-dawn/30'
                  }`}
                >
                  {val}
                  <div className="text-[8px] font-mono mt-0.5 uppercase">
                    {idx === 0 ? 'FRONT' : idx === items.length - 1 ? 'REAR' : `POS ${idx}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
