import type { PriceData } from './types';

export type { PriceData };

const COINBASE_API_URL = 'https://api.coinbase.com/v2/exchange-rates?currency=BTC';
const CACHE_DURATION = 10000;

interface CoinbaseResponse {
  data: {
    currency: string;
    rates: { USD: string };
  };
}

let cachedPrice: PriceData | null = null;

export async function getBTCPrice(): Promise<PriceData> {
  if (cachedPrice && Date.now() - cachedPrice.timestamp < CACHE_DURATION) {
    return cachedPrice;
  }

  try {
    const response = await fetch(COINBASE_API_URL);
    if (!response.ok) throw new Error(`Coinbase API error: ${response.status}`);

    const data: CoinbaseResponse = await response.json();
    if (!data.data?.rates?.USD) throw new Error('Invalid response from Coinbase API');

    const priceData: PriceData = {
      price: parseFloat(data.data.rates.USD),
      timestamp: Date.now(),
    };

    cachedPrice = priceData;
    return priceData;
  } catch (error) {
    console.error('getBTCPrice error:', error);
    if (cachedPrice) {
      console.warn('Using stale cached price');
      return cachedPrice;
    }
    throw error;
  }
}
