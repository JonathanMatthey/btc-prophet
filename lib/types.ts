export interface Player {
  id: string;
  score: number;
  createdAt: number;
}

export interface Guess {
  playerId: string;
  direction: 'up' | 'down';
  priceAtGuess: number;
  timestamp: number;
  resolved: boolean;
  result?: 'win' | 'lose';
  resolvedPrice?: number;
  resolvedAt?: number;
}

export interface PriceData {
  price: number;
  timestamp: number;
}

export interface LastResult {
  won: boolean;
  fromPrice: number;
  toPrice: number;
  scoreChange: number;
}

export interface Timer {
  elapsed: number;
  total: number;
}
