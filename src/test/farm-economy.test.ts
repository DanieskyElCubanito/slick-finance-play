import { describe, expect, it } from 'vitest';
import { ECONOMY, HOUR, acceleratePlot, advancePlot, carrotCashback, carrotUsd, fertilizePlot, growthDuration, isRainDay, meetsWithdrawalMinimum, missionReward, referralReward, tonCommission, wateringTargets, type EconomyPlot } from '@/lib/farm-economy';

const planted: EconomyPlot = { crop: 'carrot', state: 'water', slots: [0], plantedAt: 0 };
const growing: EconomyPlot = { ...planted, state: 'growing', start: 0, end: 4 * HOUR };
describe('Sustainable carrot economy', () => {
  it('grows a watered bed in exactly four hours', () => {
    expect(growthDuration()).toBe(4 * HOUR);
    expect(advancePlot(growing, 4 * HOUR - 1, false, false).state).toBe('growing');
    expect(advancePlot(growing, 4 * HOUR, false, false).state).toBe('ready');
  });
  it('fertilizer cuts a four-hour cycle to two hours without repeat use', () => {
    expect(growthDuration(true)).toBe(2 * HOUR);
    const fertilized = fertilizePlot(growing);
    expect(fertilized.end).toBe(2 * HOUR);
    expect(fertilizePlot(fertilized)).toBe(fertilized);
  });
  it('pauses dry crops and loses them at exactly 24 hours', () => {
    expect(advancePlot(planted, 24 * HOUR - 1, false, false).state).toBe('water');
    expect(advancePlot(planted, 24 * HOUR, false, false)).toMatchObject({ state: 'empty', slots: [] });
  });
  it('scarecrow prevents loss after 24 hours without water', () => {
    expect(advancePlot(planted, 25 * HOUR, true, false).state).toBe('water');
  });
  it('rain starts a two-hour cycle without a watering action', () => {
    expect(advancePlot(planted, HOUR, false, true)).toMatchObject({ state: 'growing', start: HOUR, end: 3 * HOUR });
    expect(growthDuration(false, true)).toBe(2 * HOUR);
  });
  it('chooses exactly one rain day per UTC week', () => {
    const monday = Date.UTC(2026, 10, 2);
    expect(Array.from({ length: 7 }, (_, i) => isRainDay(monday + i * 24 * HOUR)).filter(Boolean)).toHaveLength(1);
  });
  it('a time advertisement removes one hour from each growing bed, not dry beds', () => {
    expect(acceleratePlot(growing, 0).end).toBe(3 * HOUR);
    expect(acceleratePlot({ ...growing, end: HOUR / 2 }, 0).state).toBe('ready');
    expect(acceleratePlot(planted, 0)).toBe(planted);
  });
  it('one well advertisement grants one bucket', () => { expect(ECONOMY.adWater).toBe(1); });
  it('offers base mission carrots or triple reward', () => {
    expect(missionReward(20, false)).toBe(20);
    expect(missionReward(20, true)).toBe(60);
  });
  it('fertilizer pack costs 1000 carrots for five uses', () => {
    expect(ECONOMY.fertilizerPrice).toBe(1000);
    expect(ECONOMY.fertilizerPack).toBe(5);
  });
  it('permanent scarecrow costs 10000 carrots', () => { expect(ECONOMY.scarecrowPrice).toBe(10000); });
  it('star watering can costs 25000 and waters two unlocked beds per action', () => {
    expect(ECONOMY.wateringCanPrice).toBe(25000);
    expect(wateringTargets([planted, { ...planted, locked: 'Nivel 8' }, planted], 0, true)).toEqual([0, 2]);
    expect(wateringTargets([planted, planted], 0, false)).toEqual([0]);
  });
  it('golden well price is 1.5 TON', () => { expect(ECONOMY.goldenWellTon).toBe(1.5); });
  it('autonomous tractor price is 3 TON', () => { expect(ECONOMY.tractorTon).toBe(3); });
  it('referral awards 100 only after verified first harvest', () => {
    expect(referralReward(false)).toBe(0);
    expect(referralReward(true)).toBe(100);
  });
  it('internal referral cashback is five percent of carrot spend', () => { expect(carrotCashback(1000)).toBe(50); });
  it('verified premium referral commission is one percent of TON paid', () => { expect(tonCommission(1.5)).toBe(0.015); });
  it('converts 100000 carrots to one dollar', () => { expect(carrotUsd(100000)).toBe(1); });
  it('withdrawal minimum is five dollars or 500000 carrots', () => {
    expect(ECONOMY.minimumUsd).toBe(5);
    expect(meetsWithdrawalMinimum(499999)).toBe(false);
    expect(meetsWithdrawalMinimum(500000)).toBe(true);
  });
});