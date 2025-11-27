interface ScoreCardProps {
  score: number;
}

export function ScoreCard({ score }: ScoreCardProps) {
  return (
    <section
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-epilot-sm"
      role="status"
      aria-live="polite"
      aria-label="Your current score"
    >
      <div className="mb-4">
        <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Your Score</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold font-mono">{score}</span>
        <span className="text-base text-slate-500">points</span>
      </div>
    </section>
  );
}

