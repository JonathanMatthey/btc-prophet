import { NextResponse } from 'next/server';
import { getBTCPrice } from '@/lib/price';

export async function GET() {
  try {
    const priceData = await getBTCPrice();
    return NextResponse.json(priceData);
  } catch (error) {
    console.error('Price API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

