# BTC Prophet

A Bitcoin price prediction game built with Next.js.

## How to Play

1. View the current BTC/USD price
2. Predict if the price will go UP or DOWN in the next 60 seconds
3. Wait for the timer to complete
4. See if your prediction was correct!
5. Track your score across sessions

## Tech Stack

- Next.js 16 with App Router
- React 19
- Tailwind CSS
- DynamoDB (with in-memory fallback for local dev)
- TypeScript

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

For production with DynamoDB:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_DYNAMODB_PLAYERS_TABLE=btc-game-players
AWS_DYNAMODB_GUESSES_TABLE=btc-game-guesses
```

Without AWS credentials, the app falls back to in-memory storage.
