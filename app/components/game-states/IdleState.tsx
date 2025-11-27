'use client';

interface IdleStateProps {
  makeGuess: (direction: 'up' | 'down') => void;
}

export function IdleState({ makeGuess }: IdleStateProps) {
  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-2">Make Your Prediction</h2>
      <p className="text-slate-500 mb-6">Will BTC be higher or lower in 60 seconds?</p>
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => makeGuess('up')}
          className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-emerald-500 rounded-xl bg-emerald-50 text-slate-800 font-semibold transition-all hover:bg-emerald-200 hover:border-emerald-600 hover:scale-105 shadow-epilot-sm active:scale-95 cursor-pointer"
          aria-label="Guess price will go up"
        >
          <span className="text-3xl font-bold">↑</span>
          <span>UP</span>
        </button>
        <button
          onClick={() => makeGuess('down')}
          className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-red-500 rounded-xl bg-red-50 text-slate-800 font-semibold transition-all hover:bg-red-200 hover:border-red-600 hover:scale-105 shadow-epilot-sm active:scale-95 cursor-pointer"
          aria-label="Guess price will go down"
        >
          <span className="text-3xl font-bold">↓</span>
          <span>DOWN</span>
        </button>
      </div>
    </div>
  );
}

