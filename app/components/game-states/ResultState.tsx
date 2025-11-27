'use client';

import type { LastResult } from '@/lib/types';

interface ResultStateProps {
  lastResult: LastResult;
  continueGame: () => void;
}

export function ResultState({ lastResult, continueGame }: ResultStateProps) {
  const formatPrice = (p: number) => p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="text-center" aria-live="polite" aria-label={lastResult.won ? 'You won' : 'You lost'}>
      <h2 className="text-xl font-semibold mb-4">
        {lastResult.won ? '🎉 Correct!' : '😢 Wrong!'}
      </h2>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <div className={`flex items-center justify-center gap-3 text-2xl font-bold mb-4 ${lastResult.won ? 'text-emerald-600' : 'text-red-600'}`}>
          <span>{lastResult.won ? '✓' : '✗'}</span>
          <span>{lastResult.won ? 'You won!' : 'You lost!'}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 font-mono text-slate-500">
            <span>${formatPrice(lastResult.fromPrice)}</span>
            <span className="text-slate-400">→</span>
            <span>${formatPrice(lastResult.toPrice)}</span>
          </div>
          <span className={`text-xl font-bold font-mono ${lastResult.scoreChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {lastResult.scoreChange >= 0 ? '+' : ''}{lastResult.scoreChange}
          </span>
        </div>
      </div>
      <button onClick={continueGame} className="w-full flex items-center justify-center p-4 mt-6 bg-[#0066FF] border-2 border-[#0066FF] rounded-xl text-white font-semibold transition-all hover:bg-blue-600 cursor-pointer" aria-label="Continue playing">
        Continue Playing
      </button>
    </div>
  );
}
