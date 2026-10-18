import { describe, expect, it } from 'vitest';
import { BED_CAPACITY, fillBed, plantedSlots } from '@/lib/farm-planting';

describe('Nine carrots per bed', () => {
  it('plants one carrot in exactly the chosen position', () => {
    expect(fillBed([], 4)).toEqual([4]);
    expect(fillBed([4], 7)).toEqual([4, 7]);
  });
  it('plants all nine positions together, including a partially planted bed', () => {
    expect(BED_CAPACITY).toBe(9);
    expect(fillBed([4])).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('cannot plant twice in a position or exceed nine positions', () => {
    expect(fillBed([4], 4)).toEqual([4]);
    expect(fillBed([4], 9)).toEqual([4]);
    expect(fillBed(fillBed([]), 0)).toHaveLength(9);
  });
  it('keeps harvested beds empty and existing planted beds full', () => {
    expect(plantedSlots('empty', [])).toEqual([]);
    expect(plantedSlots('ready')).toHaveLength(9);
  });
});