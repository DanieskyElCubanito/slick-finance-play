import { describe, it, expect } from 'vitest';
import { newSavedGame, transitionGame, gameActionSchema } from '@/lib/saved-game';
import { HOUR, isRainDay } from '@/lib/farm-economy';
const start = Date.UTC(2026, 10, 6, 1);
const dry = Array.from({ length: 7 }, (_, i) => start + i * 24 * HOUR).find(t => !isRainDay(t)) ?? start;
describe('Real saved game rules', () => {
  it('starts without the old simulated carrot and coin balances', () => {
    expect(newSavedGame(dry).carrots).toBe(0); expect(newSavedGame(dry).coins).toBe(0);
    expect(newSavedGame(dry).plots.filter(p => p.state === 'ready')).toHaveLength(0);
  });
  it('persists nine plantable positions and four-hour watered growth', () => {
    const planted = transitionGame(newSavedGame(dry), { type: 'plant', index: 0 }, dry).state;
    expect(planted.plots[0]?.slots).toHaveLength(9);
    const watered = transitionGame(planted, { type: 'harvest', index: 0 }, dry).state;
    expect(watered.water).toBe(2); expect(watered.plots[0]?.end).toBe(dry + 4 * HOUR);
    expect(() => transitionGame(watered, { type: 'harvest', index: 0 }, dry + HOUR)).toThrow();
    const harvested = transitionGame(watered, { type: 'harvest', index: 0 }, dry + 4 * HOUR).state;
    expect(harvested.carrots).toBe(40);
    expect(() => transitionGame(harvested, { type: 'harvest', index: 0 }, dry + 4 * HOUR)).toThrow();
  });
  it('does not allow client-supplied credits or ad/referral simulations', () => {
    expect(gameActionSchema.safeParse({ type: 'earn', amount: 1000000 }).success).toBe(false);
    expect(gameActionSchema.safeParse({ type: 'ad' }).success).toBe(false);
    expect(gameActionSchema.safeParse({ type: 'invite' }).success).toBe(false);
  });
  it('requires earned carrots for a 1000 carrot five-use fertilizer pack', () => {
    const saved = newSavedGame(dry);
    expect(() => transitionGame(saved, { type: 'buy', name: 'Fertilizante ×5' }, dry)).toThrow();
    saved.carrots = 1000;
    const bought = transitionGame(saved, { type: 'buy', name: 'Fertilizante ×5' }, dry).state;
    expect(bought.carrots).toBe(0); expect(bought.fertilizer).toBe(5);
  });
  it('allows daily mission rewards once, only after qualifying actions', () => {
    const saved = newSavedGame(dry);
    expect(() => transitionGame(saved, { type: 'mission', index: 0 }, dry)).toThrow();
    saved.harvested = 2;
    const claimed = transitionGame(saved, { type: 'mission', index: 0 }, dry).state;
    expect(claimed.carrots).toBe(20);
    expect(() => transitionGame(claimed, { type: 'mission', index: 0 }, dry)).toThrow();
  });
});