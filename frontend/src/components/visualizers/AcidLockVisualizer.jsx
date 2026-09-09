import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Lock, Unlock, ShieldCheck, Play, RotateCcw } from 'lucide-react';

export const AcidLockVisualizer = () => {
  const [step, setStep] = useState(0);

  const timelineSteps = [
    {
      t1: "BEGIN TRANSACTION T1",
      t2: "BEGIN TRANSACTION T2",
      lockState: "No locks held.",
      status: "Initial State"
    },
    {
      t1: "Acquire Shared Lock S(A) -> Read Account A",
      t2: "Waiting...",
      lockState: "T1 holds S-Lock on Account A.",
      status: "Growing Phase (T1)"
    },
    {
      t1: "Acquire Exclusive Lock X(B) -> Write Account B",
      t2: "Acquire Shared Lock S(A) -> Read Account A",
      lockState: "T1 holds S(A), X(B). T2 holds S(A) [Shared Lock Allowed].",
      status: "Concurrent Execution"
    },
    {
      t1: "COMMIT & Release Locks (Shrinking Phase)",
      t2: "Acquire Exclusive Lock X(B) -> Wait for T1 release...",
      lockState: "T1 releases all locks. T2 acquires X(B).",
      status: "Lock Release & Serialized Execution"
    },
    {
      t1: "COMPLETED",
      t2: "COMMIT T2",
      lockState: "All locks released.",
      status: "Serializability Guaranteed"
    }
  ];

  const current = timelineSteps[step];

  return (
    <Card 
      title="Interactive ACID & Concurrency Control Visualizer (Strict 2PL)" 
      subtitle="Step-by-step simulation of Two-Phase Locking (2PL), Shared/Exclusive locks, and serializability"
      className="border-edwin-border shadow-md"
    >
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between p-4 bg-edwin-surface rounded-2xl border border-edwin-border">
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              icon={Play}
              disabled={step >= timelineSteps.length - 1}
              onClick={() => setStep(prev => prev + 1)}
            >
              Advance Step ({step + 1} / {timelineSteps.length})
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              icon={RotateCcw}
              onClick={() => setStep(0)}
            >
              Reset Simulation
            </Button>
          </div>

          <Badge variant="sand">{current.status}</Badge>
        </div>

        {/* Timeline Visualization Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Transaction 1 */}
          <div className="p-4 bg-edwin-midnight text-white rounded-2xl border border-edwin-dawn/30 space-y-3">
            <div className="flex items-center justify-between border-b border-edwin-dawn/20 pb-2">
              <span className="text-xs font-bold text-edwin-dawn flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Transaction T1 (Transfer $500)
              </span>
              <span className="text-[10px] bg-edwin-navy px-2 py-0.5 rounded font-mono text-edwin-dawn">Active</span>
            </div>
            <p className="text-xs font-mono text-white bg-edwin-navy/80 p-3 rounded-xl border border-edwin-dawn/20">
              {current.t1}
            </p>
          </div>

          {/* Transaction 2 */}
          <div className="p-4 bg-edwin-midnight text-white rounded-2xl border border-edwin-dawn/30 space-y-3">
            <div className="flex items-center justify-between border-b border-edwin-dawn/20 pb-2">
              <span className="text-xs font-bold text-edwin-dawn flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Transaction T2 (Audit Balance)
              </span>
              <span className="text-[10px] bg-edwin-navy px-2 py-0.5 rounded font-mono text-edwin-dawn">Active</span>
            </div>
            <p className="text-xs font-mono text-white bg-edwin-navy/80 p-3 rounded-xl border border-edwin-dawn/20">
              {current.t2}
            </p>
          </div>
        </div>

        {/* Global Lock Manager State */}
        <div className="p-4 bg-edwin-surface border border-edwin-border rounded-2xl space-y-1">
          <span className="text-xs font-bold text-edwin-midnight flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Lock Manager State:
          </span>
          <p className="text-xs font-mono text-edwin-midnight">{current.lockState}</p>
        </div>
      </div>
    </Card>
  );
};
