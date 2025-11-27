'use client';

import { useGame } from '@/lib/hooks/useGame';
import { Header } from './components/Header';
import { PriceCard } from './components/PriceCard';
import { ScoreCard } from './components/ScoreCard';
import { GameControls } from './components/GameControls';
import { Footer } from './components/Footer';

export default function Game() {
  const { price, previousPrice, score, activeGuess, lastResult, timer, makeGuess, continueGame, isLoading } = useGame();

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-500">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <Header />

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-[1fr_auto] gap-4 max-sm:grid-cols-1">
            <PriceCard price={price} previousPrice={previousPrice} />
            <ScoreCard score={score} />
          </div>

          <GameControls
            activeGuess={activeGuess}
            lastResult={lastResult}
            timer={timer}
            makeGuess={makeGuess}
            continueGame={continueGame}
          />
        </div>

        <Footer />
      </div>
    </main>
  );
}

