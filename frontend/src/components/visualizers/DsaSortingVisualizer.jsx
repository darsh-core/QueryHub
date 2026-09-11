import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Play, RotateCcw, BarChart2, Sparkles } from 'lucide-react';

export const DsaSortingVisualizer = () => {
  const initialArray = [45, 12, 89, 34, 67, 23, 90, 56, 11, 78];
  const [array, setArray] = useState(initialArray);
  const [activeAlgo, setActiveAlgo] = useState('bubble');
  const [isSorting, setIsSorting] = useState(false);
  const [currentIndices, setCurrentIndices] = useState([]);
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0 });

  const resetArray = () => {
    setArray([45, 12, 89, 34, 67, 23, 90, 56, 11, 78]);
    setIsSorting(false);
    setCurrentIndices([]);
    setStats({ comparisons: 0, swaps: 0 });
  };

  const runBubbleSort = async () => {
    setIsSorting(true);
    let arr = [...array];
    let comps = 0;
    let swaps = 0;

    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        setCurrentIndices([j, j + 1]);
        comps++;
        setStats({ comparisons: comps, swaps });
        await new Promise((r) => setTimeout(r, 200));

        if (arr[j] > arr[j + 1]) {
          let temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          swaps++;
          setArray([...arr]);
          setStats({ comparisons: comps, swaps });
          await new Promise((r) => setTimeout(r, 200));
        }
      }
    }
    setCurrentIndices([]);
    setIsSorting(false);
  };

  return (
    <Card 
      title="Interactive Sorting Algorithms Visualizer"
      subtitle="Step-by-step array bar height animations, comparisons, and swaps tracking"
      className="border-edwin-border shadow-md"
    >
      <div className="space-y-6">
        {/* Control Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-edwin-surface rounded-2xl border border-edwin-border">
          <div className="flex items-center gap-2">
            <Button
              variant={activeAlgo === 'bubble' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveAlgo('bubble')}
            >
              Bubble Sort (O(N²))
            </Button>
            <Button
              variant={activeAlgo === 'quick' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveAlgo('quick')}
            >
              QuickSort (O(N log N))
            </Button>
            <Button
              variant={activeAlgo === 'merge' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveAlgo('merge')}
            >
              Merge Sort (O(N log N))
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              icon={Play} 
              disabled={isSorting}
              onClick={runBubbleSort}
            >
              Start Sort Animation
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              icon={RotateCcw} 
              onClick={resetArray}
              disabled={isSorting}
            >
              Reset Array
            </Button>
          </div>
        </div>

        {/* Realtime Stats */}
        <div className="flex items-center justify-around p-3 bg-edwin-dawn/30 text-edwin-midnight rounded-xl text-xs font-bold border border-edwin-border">
          <div className="flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-edwin-midnight" />
            <span>Algorithm: <span className="uppercase text-blue-700">{activeAlgo} Sort</span></span>
          </div>
          <div>Comparisons: <span className="font-mono text-emerald-700">{stats.comparisons}</span></div>
          <div>Swaps / Shifts: <span className="font-mono text-amber-700">{stats.swaps}</span></div>
        </div>

        {/* Visual Bar Chart */}
        <div className="p-8 bg-edwin-midnight rounded-2xl border border-edwin-dawn/30 h-64 flex items-end justify-center gap-3 relative shadow-inner">
          <div className="absolute top-3 left-3 text-[10px] text-edwin-dawn font-mono uppercase tracking-wider">
            Array Heights • Elements: {array.length}
          </div>

          {array.map((val, idx) => {
            const isComparing = currentIndices.includes(idx);
            return (
              <div key={idx} className="flex flex-col items-center gap-2 flex-1 max-w-[40px]">
                <span className={`text-[10px] font-mono font-bold ${isComparing ? 'text-emerald-400' : 'text-edwin-dawn/80'}`}>
                  {val}
                </span>
                <div 
                  className={`w-full rounded-t-lg transition-all duration-150 ${
                    isComparing 
                      ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' 
                      : 'bg-edwin-navy border border-edwin-dawn/30 hover:bg-edwin-dawn/40'
                  }`}
                  style={{ height: `${val * 1.8}px` }}
                ></div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
