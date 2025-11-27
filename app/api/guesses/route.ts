import { NextRequest, NextResponse } from 'next/server';
import { getPlayer, createGuess, getActiveGuess } from '@/lib/db';
import { getBTCPrice } from '@/lib/price';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { playerId, direction } = body;

  if (!playerId || !direction) {
    return NextResponse.json({ error: 'Player ID and direction required' }, { status: 400 });
  }

  if (direction !== 'up' && direction !== 'down') {
    return NextResponse.json({ error: 'Direction must be "up" or "down"' }, { status: 400 });
  }

  const player = await getPlayer(playerId);
  if (!player) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 });
  }

  const existingGuess = await getActiveGuess(playerId);
  if (existingGuess) {
    return NextResponse.json({ error: 'You already have an active guess' }, { status: 409 });
  }

  const priceData = await getBTCPrice();
  const guess = await createGuess(playerId, direction, priceData.price);

  return NextResponse.json({ guess });
}

