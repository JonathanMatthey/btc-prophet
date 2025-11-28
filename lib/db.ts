import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import type { Player, Guess } from './types';

export type { Player, Guess };

const PLAYERS_TABLE = process.env.AWS_DYNAMODB_PLAYERS_TABLE?.trim() || 'btc-game-players';
const GUESSES_TABLE = process.env.AWS_DYNAMODB_GUESSES_TABLE?.trim() || 'btc-game-guesses';

let client: DynamoDBDocumentClient | null = null;
let useDynamoDB = true;

// fallback storage when dynamo isn't configured
const players = new Map<string, Player>();
const guesses = new Map<string, Guess[]>();

function getClient(): DynamoDBDocumentClient | null {
  if (!useDynamoDB) return null;
  if (client) return client;

  const region = process.env.AWS_REGION?.trim();
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();

  if (!region || !accessKeyId || !secretAccessKey) {
    useDynamoDB = false;
    return null;
  }

  client = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region, credentials: { accessKeyId, secretAccessKey } })
  );
  return client;
}

function isDynamoNotFound(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'name' in e && e.name === 'ResourceNotFoundException';
}

async function withFallback<T>(
  dynamoOp: (db: DynamoDBDocumentClient) => Promise<T>,
  fallback: () => T
): Promise<T> {
  const db = getClient();

  if (db) {
    try {
      return await dynamoOp(db);
    } catch (err) {
      if (isDynamoNotFound(err)) {
        console.warn('DynamoDB table not found, using in-memory storage');
        useDynamoDB = false;
      } else {
        console.error('DynamoDB error:', err);
      }
    }
  }

  return fallback();
}

export async function getPlayer(id: string): Promise<Player | null> {
  return withFallback(
    async (db) => {
      const { Item } = await db.send(new GetCommand({ TableName: PLAYERS_TABLE, Key: { id } }));
      return (Item as Player) || null;
    },
    () => players.get(id) || null
  );
}

export async function createPlayer(id: string): Promise<Player> {
  const player: Player = { id, score: 0, createdAt: Date.now() };

  return withFallback(
    async (db) => {
      await db.send(new PutCommand({ TableName: PLAYERS_TABLE, Item: player }));
      return player;
    },
    () => {
      players.set(id, player);
      return player;
    }
  );
}

export async function updatePlayerScore(id: string, delta: number): Promise<Player | null> {
  const player = await getPlayer(id);
  if (!player) return null;

  const updated = { ...player, score: player.score + delta };

  return withFallback(
    async (db) => {
      await db.send(new PutCommand({ TableName: PLAYERS_TABLE, Item: updated }));
      return updated;
    },
    () => {
      players.set(id, updated);
      return updated;
    }
  );
}

export async function getActiveGuess(playerId: string): Promise<Guess | null> {
  return withFallback(
    async (db) => {
      const { Items } = await db.send(
        new QueryCommand({
          TableName: GUESSES_TABLE,
          KeyConditionExpression: 'playerId = :pid',
          FilterExpression: 'resolved = :r',
          ExpressionAttributeValues: { ':pid': playerId, ':r': false },
          ScanIndexForward: false,
          Limit: 1,
        })
      );
      return (Items?.[0] as Guess) || null;
    },
    () => {
      const list = guesses.get(playerId) || [];
      const active = list.filter((g) => !g.resolved).sort((a, b) => b.timestamp - a.timestamp);
      return active[0] || null;
    }
  );
}

export async function createGuess(
  playerId: string,
  direction: 'up' | 'down',
  priceAtGuess: number
): Promise<Guess> {
  const guess: Guess = {
    playerId,
    direction,
    priceAtGuess,
    timestamp: Date.now(),
    resolved: false,
  };

  return withFallback(
    async (db) => {
      await db.send(new PutCommand({ TableName: GUESSES_TABLE, Item: guess }));
      return guess;
    },
    () => {
      const list = guesses.get(playerId) || [];
      guesses.set(playerId, [...list, guess]);
      return guess;
    }
  );
}

export async function resolveGuess(
  playerId: string,
  currentPrice: number
): Promise<{ guess: Guess; scoreChange: number } | null> {
  const active = await getActiveGuess(playerId);
  if (!active || active.resolved) return null;

  // must wait 60s and price must have changed
  const elapsed = Date.now() - active.timestamp;
  if (elapsed < 60000 || currentPrice === active.priceAtGuess) return null;

  const wentUp = currentPrice > active.priceAtGuess;
  const correct = wentUp === (active.direction === 'up');
  const scoreChange = correct ? 1 : -1;

  const resolved: Guess = {
    ...active,
    resolved: true,
    result: correct ? 'win' : 'lose',
    resolvedPrice: currentPrice,
    resolvedAt: Date.now(),
  };

  await withFallback(
    async (db) => {
      await db.send(new PutCommand({ TableName: GUESSES_TABLE, Item: resolved }));
      return resolved;
    },
    () => {
      const list = guesses.get(playerId) || [];
      const filtered = list.filter((g) => g.timestamp !== resolved.timestamp);
      guesses.set(playerId, [...filtered, resolved]);
      return resolved;
    }
  );

  await updatePlayerScore(playerId, scoreChange);
  return { guess: resolved, scoreChange };
}

export async function clearGuess(playerId: string): Promise<void> {
  const guess = await getActiveGuess(playerId);
  if (!guess) return;

  await withFallback<void>(
    async (db) => {
      await db.send(
        new DeleteCommand({
          TableName: GUESSES_TABLE,
          Key: { playerId: guess.playerId, timestamp: guess.timestamp },
        })
      );
    },
    () => {
      const list = guesses.get(playerId) || [];
      guesses.set(playerId, list.filter((g) => g.timestamp !== guess.timestamp));
    }
  );
}

// for tests
export const __testing = {
  reset() {
    useDynamoDB = false;
    client = null;
    players.clear();
    guesses.clear();
  },
  forceInMemory() {
    this.reset();
  },
  resetMemory() {
    players.clear();
    guesses.clear();
  },
};
