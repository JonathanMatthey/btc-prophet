'use client';

import type { Guess, Timer } from '@/lib/types';

interface PendingStateProps {
  activeGuess: Guess;
  timer: Timer;
}

export function PendingState({ activeGuess, timer }: PendingStateProps) {
  const formatPrice = (p: number) => p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const timerProgress = (timer.elapsed / timer.total) * 100;
  const timerRemaining = Math.max(0, Math.ceil((timer.total - timer.elapsed) / 1000));

  return (
    <div className="text-center" aria-live="polite" aria-label="Prediction in progress">
      <h2 className="text-xl font-semibold mb-4">Prediction Active</h2>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className={`px-4 py-2 rounded-lg font-mono text-xl font-bold ${
            activeGuess.direction === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            {activeGuess.direction.toUpperCase()}
          </span>
          <span className="text-slate-500 font-mono" aria-label={`Guessed at ${formatPrice(activeGuess.priceAtGuess)} dollars`}>
            at ${formatPrice(activeGuess.priceAtGuess)}
          </span>
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.max(0, Math.min(100, 100 - timerProgress))}>
            <div
              className="h-full bg-gradient-to-r from-epilot-blue to-epilot-cyan rounded-full transition-all duration-1000"
              style={{ width: `${100 - timerProgress}%` }}
            />
          </div>
          <span className="text-sm text-slate-500 font-mono" aria-label={`Time remaining ${timerRemaining}s`}>
            {timerRemaining > 0 ? `${timerRemaining}s remaining` : 'Resolving...'}
          </span>
        </div>
      </div>
    </div>
  );
}
