import { NextRequest, NextResponse } from 'next/server';
import { getPlayer, createPlayer, getActiveGuess } from '@/lib/db';

export async function GET(request: NextRequest) {
  const playerId = request.nextUrl.searchParams.get('id');

  if (!playerId) {
    return NextResponse.json({ error: 'Player ID required' }, { status: 400 });
  }

  let player = await getPlayer(playerId);
  if (!player) {
    player = await createPlayer(playerId);
  }

  const activeGuess = await getActiveGuess(playerId);

  return NextResponse.json({
    player,
    activeGuess: activeGuess || null,
  });
}

