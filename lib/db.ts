import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import type { Player, Guess } from './types';

export type { Player, Guess };

const PLAYERS_TABLE = process.env.AWS_DYNAMODB_PLAYERS_TABLE?.trim() || 'btc-game-players';
const GUESSES_TABLE = process.env.AWS_DYNAMODB_GUESSES_TABLE?.trim() || 'btc-game-guesses';

let client: DynamoDBDocumentClient | null = null;
let useDynamoDB = true;

class MemoryStore {
  private players = new Map<string, Player>();
  private guesses = new Map<string, Guess[]>();

  reset() { this.players.clear(); this.guesses.clear(); }
  savePlayer(player: Player) { this.players.set(player.id, player); return player; }
  getPlayer(id: string) { return this.players.get(id) || null; }
  saveGuess(guess: Guess) {
    const existing = this.guesses.get(guess.playerId) || [];
    const filtered = existing.filter((g) => g.timestamp !== guess.timestamp);
    this.guesses.set(guess.playerId, [...filtered, guess]);
    return guess;
  }
  getGuesses(playerId: string) { return this.guesses.get(playerId) || []; }
  deleteGuess(playerId: string, timestamp: number) {
    const existing = this.guesses.get(playerId) || [];
    this.guesses.set(playerId, existing.filter((g) => g.timestamp !== timestamp));
  }
}

const memory = new MemoryStore();

function getClient(): DynamoDBDocumentClient | null {
  if (!useDynamoDB) return null;
  if (client) return client;
  const region = process.env.AWS_REGION?.trim();
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  if (!region || !accessKeyId || !secretAccessKey) { useDynamoDB = false; return null; }
  const dynamoClient = new DynamoDBClient({ region, credentials: { accessKeyId, secretAccessKey } });
  client = DynamoDBDocumentClient.from(dynamoClient);
  return client;
}

function isDynamoNotFoundError(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'name' in e && e.name === 'ResourceNotFoundException';
}

async function withFallback<T>(dynamoOp: (db: DynamoDBDocumentClient) => Promise<T>, memoryFallback: () => T): Promise<T> {
  const db = getClient();
  if (db) {
    try { return await dynamoOp(db); }
    catch (error: unknown) {
      if (isDynamoNotFoundError(error)) { console.warn('DynamoDB table not found, falling back to in-memory'); useDynamoDB = false; }
      else console.error('DynamoDB error:', error);
    }
  }
  return memoryFallback();
}

export async function getPlayer(id: string): Promise<Player | null> {
  return withFallback(async (db) => {
    const result = await db.send(new GetCommand({ TableName: PLAYERS_TABLE, Key: { id } }));
    return (result.Item as Player) || null;
  }, () => memory.getPlayer(id));
}

export async function createPlayer(id: string): Promise<Player> {
  const player: Player = { id, score: 0, createdAt: Date.now() };
  return withFallback(async (db) => {
    await db.send(new PutCommand({ TableName: PLAYERS_TABLE, Item: player }));
    return player;
  }, () => memory.savePlayer(player));
}

export async function updatePlayerScore(id: string, delta: number): Promise<Player | null> {
  const player = await getPlayer(id);
  if (!player) return null;
  const updatedPlayer: Player = { ...player, score: player.score + delta };
  return withFallback(async (db) => {
    await db.send(new PutCommand({ TableName: PLAYERS_TABLE, Item: updatedPlayer }));
    return updatedPlayer;
  }, () => memory.savePlayer(updatedPlayer));
}

export async function getActiveGuess(playerId: string): Promise<Guess | null> {
  return withFallback(async (db) => {
    const result = await db.send(new QueryCommand({
      TableName: GUESSES_TABLE, KeyConditionExpression: 'playerId = :playerId',
      FilterExpression: 'resolved = :resolved',
      ExpressionAttributeValues: { ':playerId': playerId, ':resolved': false },
      ScanIndexForward: false, Limit: 1,
    }));
    return (result.Items?.[0] as Guess) || null;
  }, () => {
    const guesses = memory.getGuesses(playerId).filter((g) => !g.resolved).sort((a, b) => b.timestamp - a.timestamp);
    return guesses[0] || null;
  });
}

export async function createGuess(playerId: string, direction: 'up' | 'down', currentPrice: number): Promise<Guess> {
  const guess: Guess = { playerId, direction, priceAtGuess: currentPrice, timestamp: Date.now(), resolved: false };
  return withFallback(async (db) => {
    await db.send(new PutCommand({ TableName: GUESSES_TABLE, Item: guess }));
    return guess;
  }, () => memory.saveGuess(guess));
}

export async function resolveGuess(playerId: string, currentPrice: number): Promise<{ guess: Guess; scoreChange: number } | null> {
  const activeGuess = await getActiveGuess(playerId);
  if (!activeGuess || activeGuess.resolved) return null;
  const timeElapsed = Date.now() - activeGuess.timestamp;
  if (timeElapsed < 60000 || currentPrice === activeGuess.priceAtGuess) return null;
  const priceWentUp = currentPrice > activeGuess.priceAtGuess;
  const isCorrect = priceWentUp === (activeGuess.direction === 'up');
  const scoreChange = isCorrect ? 1 : -1;
  const resolvedGuess: Guess = { ...activeGuess, resolved: true, result: isCorrect ? 'win' : 'lose', resolvedPrice: currentPrice, resolvedAt: Date.now() };
  await withFallback(async (db) => { await db.send(new PutCommand({ TableName: GUESSES_TABLE, Item: resolvedGuess })); return resolvedGuess; }, () => memory.saveGuess(resolvedGuess));
  await updatePlayerScore(playerId, scoreChange);
  return { guess: resolvedGuess, scoreChange };
}

export async function clearGuess(playerId: string): Promise<void> {
  const guess = await getActiveGuess(playerId);
  if (!guess) return;
  await withFallback<void>(async (db) => { await db.send(new DeleteCommand({ TableName: GUESSES_TABLE, Key: { playerId: guess.playerId, timestamp: guess.timestamp } })); }, () => memory.deleteGuess(playerId, guess.timestamp));
}

export const __testing = { forceInMemory() { useDynamoDB = false; client = null; memory.reset(); }, resetMemory() { memory.reset(); } };
