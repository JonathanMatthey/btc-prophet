import { NextRequest, NextResponse } from 'next/server';
import { resolveGuess, clearGuess, getPlayer } from '@/lib/db';
import { getBTCPrice } from '@/lib/price';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerId } = body;

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID required' }, { status: 400 });
    }

    const priceData = await getBTCPrice();
    const result = await resolveGuess(playerId, priceData.price);

    if (!result) {
      return NextResponse.json({ resolved: false });
    }

    const player = await getPlayer(playerId);
    return NextResponse.json({
      resolved: true,
      guess: result.guess,
      scoreChange: result.scoreChange,
      player,
    });
  } catch (error) {
    console.error('Resolve API error:', error);
    return NextResponse.json(
      { error: 'Failed to resolve guess', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const playerId = request.nextUrl.searchParams.get('playerId');

  if (!playerId) {
    return NextResponse.json({ error: 'Player ID required' }, { status: 400 });
  }

  try {
    await clearGuess(playerId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear guess API error:', error);
    return NextResponse.json(
      { error: 'Failed to clear guess', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

