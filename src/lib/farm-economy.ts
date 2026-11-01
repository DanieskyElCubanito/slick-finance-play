export const HOUR = 60 * 60 * 1000;
export const ECONOMY = {
  growthMs: 4 * HOUR,
  fastGrowthMs: 2 * HOUR,
  wiltMs: 24 * HOUR,
  adAccelerationMs: HOUR,
  adWater: 1,
  missionMultiplier: 3,
  fertilizerPrice: 1000,
  fertilizerPack: 5,
  scarecrowPrice: 10000,
  wateringCanPrice: 25000,
  goldenWellTon: 1.5,
  tractorTon: 3,
  referralBonus: 100,
  carrotCashbackRate: 0.05,
  tonCommissionRate: 0.01,
  carrotsPerUsd: 100000,
  minimumUsd: 5,
} as const;
export const STAR_WATERING_CAN = 'Regadera Estrella';
export const SCARECROW = 'Espantapájaros';
export type EconomyPlot = {
  crop: 'carrot'; state: 'ready' | 'water' | 'empty' | 'growing';
  end?: number; start?: number; plantedAt?: number;
  locked?: string; slots?: number[]; fertilized?: boolean; rainGrown?: boolean;
};

export function growthDuration(fertilized = false, raining = false) {
  return fertilized || raining ? ECONOMY.fastGrowthMs : ECONOMY.growthMs;
}

// Choose one full UTC day per week, varying by week; shared across the preview.
export function isRainDay(now: number) {
  const day = Math.floor(now / (24 * HOUR));
  const week = Math.floor((day + 3) / 7);
  const selectedDay = ((week * 1103515245 + 12345) >>> 0) % 7;
  return (day + 3) % 7 === selectedDay;
}

export function advancePlot(plot: EconomyPlot, now: number, protectedFromWilt: boolean, raining: boolean): EconomyPlot {
  if (plot.locked) return plot;
  if (plot.state === 'water') {
    if (!protectedFromWilt && plot.plantedAt !== undefined && now - plot.plantedAt >= ECONOMY.wiltMs) {
      return { ...plot, state: 'empty', slots: [], plantedAt: undefined, fertilized: false, rainGrown: false };
    }
    if (raining) return { ...plot, state: 'growing', start: now, end: now + growthDuration(false, true), rainGrown: true };
  }
  if (plot.state === 'growing' && plot.end !== undefined && plot.end <= now) return { ...plot, state: 'ready' };
  return plot;
}

export function wateringTargets(plots: EconomyPlot[], index: number, upgraded: boolean) {
  const target = plots[index];
  if (!target || target.locked || target.state !== 'water') return [];
  const second = plots.findIndex((plot, i) => i !== index && !plot.locked && plot.state === 'water');
  return upgraded && second >= 0 ? [index, second] : [index];
}

export function fertilizePlot(plot: EconomyPlot): EconomyPlot {
  if (plot.state !== 'growing' || plot.fertilized || plot.rainGrown || plot.start === undefined || plot.end === undefined) return plot;
  return { ...plot, fertilized: true, end: plot.start + ECONOMY.fastGrowthMs };
}

export function acceleratePlot(plot: EconomyPlot, now: number): EconomyPlot {
  if (plot.state !== 'growing' || plot.end === undefined || plot.locked) return plot;
  const end = Math.max(now, plot.end - ECONOMY.adAccelerationMs);
  return { ...plot, end, state: end <= now ? 'ready' : 'growing' };
}

export function missionReward(base: number, multiplied: boolean) { return base * (multiplied ? ECONOMY.missionMultiplier : 1); }
export function referralReward(firstHarvestVerified: boolean) { return firstHarvestVerified ? ECONOMY.referralBonus : 0; }
export function carrotCashback(spent: number) { return spent * ECONOMY.carrotCashbackRate; }
export function tonCommission(paid: number) { return paid * ECONOMY.tonCommissionRate; }
export function carrotUsd(carrots: number) { return carrots / ECONOMY.carrotsPerUsd; }
export function meetsWithdrawalMinimum(carrots: number) { return carrotUsd(carrots) >= ECONOMY.minimumUsd; }
export function durationLabel(ms: number) {
  const minutes = Math.max(0, Math.ceil(ms / 60000));
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
}