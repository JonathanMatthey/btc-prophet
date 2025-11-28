import { 
  getPlayer, 
  createPlayer, 
  updatePlayerScore, 
  getActiveGuess, 
  createGuess,
  clearGuess,
  __testing 
} from '../db';

describe('db (in-memory)', () => {
  beforeEach(() => {
    __testing.forceInMemory();
  });

  describe('player operations', () => {
    it('creates a new player', async () => {
      const player = await createPlayer('test-id');

      expect(player.id).toBe('test-id');
      expect(player.score).toBe(0);
      expect(player.createdAt).toBeDefined();
    });

    it('gets an existing player', async () => {
      await createPlayer('test-id');
      const player = await getPlayer('test-id');

      expect(player).not.toBeNull();
      expect(player?.id).toBe('test-id');
    });

    it('returns null for non-existent player', async () => {
      const player = await getPlayer('non-existent');

      expect(player).toBeNull();
    });

    it('updates player score', async () => {
      await createPlayer('test-id');
      const updated = await updatePlayerScore('test-id', 5);

      expect(updated?.score).toBe(5);
    });

    it('handles negative score updates', async () => {
      await createPlayer('test-id');
      await updatePlayerScore('test-id', 5);
      const updated = await updatePlayerScore('test-id', -3);

      expect(updated?.score).toBe(2);
    });
  });

  describe('guess operations', () => {
    beforeEach(async () => {
      await createPlayer('player-1');
    });

    it('creates a guess', async () => {
      const guess = await createGuess('player-1', 'up', 50000);

      expect(guess.playerId).toBe('player-1');
      expect(guess.direction).toBe('up');
      expect(guess.priceAtGuess).toBe(50000);
      expect(guess.resolved).toBe(false);
    });

    it('gets active guess', async () => {
      await createGuess('player-1', 'down', 45000);
      const active = await getActiveGuess('player-1');

      expect(active).not.toBeNull();
      expect(active?.direction).toBe('down');
    });

    it('returns null when no active guess', async () => {
      const active = await getActiveGuess('player-1');

      expect(active).toBeNull();
    });

    it('clears a guess', async () => {
      await createGuess('player-1', 'up', 50000);
      await clearGuess('player-1');
      const active = await getActiveGuess('player-1');

      expect(active).toBeNull();
    });
  });
});
