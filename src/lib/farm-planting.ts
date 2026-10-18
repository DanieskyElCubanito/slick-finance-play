export const BED_CAPACITY = 9;

export function plantedSlots(state: string, slots?: number[]): number[] {
  return slots ?? (state === 'empty' ? [] : Array.from({ length: BED_CAPACITY }, (_, i) => i));
}

export function fillBed(current: number[], slot?: number): number[] {
  if (slot === undefined) return Array.from({ length: BED_CAPACITY }, (_, i) => i);
  if (!Number.isInteger(slot) || slot < 0 || slot >= BED_CAPACITY || current.includes(slot)) return current;
  return [...current, slot].sort((a, b) => a - b);
}