'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Guess, LastResult, Timer, PriceData } from '@/lib/types';

interface GameState {
  playerId: string;
  price: number | null;
  previousPrice: number | null;
  score: number;
  activeGuess: Guess | null;
  lastResult: LastResult | null;
  isLoading: boolean;
}

export function useGame() {
  const [state, setState] = useState<GameState>({
    playerId: '', price: null, previousPrice: null, score: 0, activeGuess: null, lastResult: null, isLoading: true,
  });
  const [timer, setTimer] = useState<Timer>({ elapsed: 0, total: 60000 });

  useEffect(() => {
    const stored = localStorage.getItem('btc-prophet-player-id');
    const id = stored || crypto.randomUUID();
    if (!stored) localStorage.setItem('btc-prophet-player-id', id);
    setState((s) => ({ ...s, playerId: id }));
  }, []);

  const fetchPrice = useCallback(async () => {
    try {
      const res = await fetch('/api/prices');
      const data: PriceData = await res.json();
      setState((s) => ({ ...s, previousPrice: s.price, price: data.price }));
    } catch (error) { console.error('Failed to fetch price:', error); }
  }, []);

  const fetchPlayer = useCallback(async (playerId: string) => {
    try {
      const res = await fetch(`/api/players?id=${playerId}`);
      const data = await res.json();
      setState((s) => ({ ...s, score: data.player.score, activeGuess: data.activeGuess, isLoading: false }));
    } catch (error) { console.error('Failed to fetch player:', error); setState((s) => ({ ...s, isLoading: false })); }
  }, []);

  const checkResolution = useCallback(async (playerId: string) => {
    try {
      const res = await fetch('/api/guesses/resolve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerId }) });
      const data = await res.json();
      if (data.resolved && data.guess) {
        setState((s) => ({ ...s, score: data.player.score, activeGuess: null, lastResult: { won: data.guess.result === 'win', fromPrice: data.guess.priceAtGuess, toPrice: data.guess.resolvedPrice, scoreChange: data.scoreChange } }));
      }
    } catch (error) { console.error('Failed to check resolution:', error); }
  }, []);

  const makeGuess = useCallback(async (direction: 'up' | 'down') => {
    try {
      const res = await fetch('/api/guesses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerId: state.playerId, direction }) });
      if (!res.ok) { const error = await res.json(); throw new Error(error.error || 'Failed to make guess'); }
      const data = await res.json();
      setState((s) => ({ ...s, activeGuess: data.guess }));
    } catch (error) { console.error('Failed to make guess:', error); alert(error instanceof Error ? error.message : 'Failed to make guess'); }
  }, [state.playerId]);

  const continueGame = useCallback(async () => {
    try {
      await fetch(`/api/guesses/resolve?playerId=${state.playerId}`, { method: 'DELETE' });
      setState((s) => ({ ...s, lastResult: null, activeGuess: null }));
    } catch (error) { console.error('Failed to clear guess:', error); }
  }, [state.playerId]);

  useEffect(() => {
    if (!state.activeGuess || state.lastResult) return;
    const updateTimer = () => { const elapsed = Date.now() - state.activeGuess!.timestamp; setTimer({ elapsed, total: 60000 }); };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [state.activeGuess, state.lastResult]);

  useEffect(() => { if (!state.playerId) return; fetchPlayer(state.playerId); fetchPrice(); }, [state.playerId, fetchPlayer, fetchPrice]);
  useEffect(() => { const priceInterval = setInterval(() => fetchPrice(), 5000); return () => clearInterval(priceInterval); }, [fetchPrice]);
  useEffect(() => {
    if (!state.activeGuess || state.lastResult) return;
    const resolveInterval = setInterval(() => { checkResolution(state.playerId); }, 3000);
    return () => clearInterval(resolveInterval);
  }, [state.activeGuess, state.lastResult, state.playerId, checkResolution]);

  return { ...state, timer, makeGuess, continueGame };
}
