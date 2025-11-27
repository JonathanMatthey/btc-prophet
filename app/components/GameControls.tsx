'use client';

import { IdleState } from './game-states/IdleState';
import { PendingState } from './game-states/PendingState';
import { ResultState } from './game-states/ResultState';
import type { Guess, LastResult, Timer } from '@/lib/types';

interface GameControlsProps {
  activeGuess: Guess | null;
  lastResult: LastResult | null;
  timer: Timer;
  makeGuess: (direction: 'up' | 'down') => void;
  continueGame: () => void;
}

export function GameControls({ activeGuess, lastResult, timer, makeGuess, continueGame }: GameControlsProps) {
  const showIdle = !activeGuess && !lastResult;
  const showPending = Boolean(activeGuess) && !lastResult;
  const showResult = Boolean(lastResult);

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-epilot-lg" aria-live="polite">
      {showIdle && <IdleState makeGuess={makeGuess} />}
      {showPending && activeGuess && <PendingState activeGuess={activeGuess} timer={timer} />}
      {showResult && lastResult && <ResultState lastResult={lastResult} continueGame={continueGame} />}
    </section>
  );
}
