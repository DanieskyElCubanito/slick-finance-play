import { z } from 'zod';
import { ECONOMY, HOUR, SCARECROW, STAR_WATERING_CAN, advancePlot, fertilizePlot, growthDuration, isRainDay, wateringTargets, type EconomyPlot } from './farm-economy';
import { fillBed, plantedSlots } from './farm-planting';

export type SavedGame = { carrots: number; coins: number; water: number; fertilizer: number; plots: EconomyPlot[]; harvested: number; watered: number; invited: number; bought: string[]; bonus: boolean; claimedMissions: number[]; spins: number; chestAt: number; discount: boolean; ads: number; day: number; processedAt: number };
export const gameActionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('plant'), index: z.number().int().min(0).max(8), slot: z.number().int().min(0).max(8).optional() }),
  z.object({ type: z.literal('harvest'), index: z.number().int().min(0).max(8) }),
  z.object({ type: z.literal('fertilize'), index: z.number().int().min(0).max(8) }),
  z.object({ type: z.literal('buy'), name: z.enum([SCARECROW, STAR_WATERING_CAN, 'Fertilizante ×5']) }),
  z.object({ type: z.literal('mission'), index: z.number().int().min(0).max(2) }),
  z.object({ type: z.literal('bonus') }), z.object({ type: z.literal('collect') }),
]);
export type GameAction = z.infer<typeof gameActionSchema>;
export function newSavedGame(now: number): SavedGame {
  return { carrots: 0, coins: 0, water: 3, fertilizer: 0, plots: Array.from({ length: 9 }, (_, i) => ({ crop: 'carrot', state: 'empty', slots: [], ...(i >= 4 ? { locked: ['Nivel 6', 'Invita 1 amigo', 'Nivel 8', 'Invita 3 amigos', 'Nivel 10'][i - 4] } : {}) })), harvested: 0, watered: 0, invited: 0, bought: [], bonus: false, claimedMissions: [], spins: 0, chestAt: 0, discount: false, ads: 0, day: Math.floor(now / (24 * HOUR)), processedAt: now };
}
export function settleGame(saved: SavedGame, now: number): SavedGame {
  const state = structuredClone(saved);
  // Replay day boundaries so rain, readiness and wilting work after closing the app.
  let at = Math.max(state.processedAt, now - 8 * 24 * HOUR);
  while (at < now) {
    at = Math.min(now, (Math.floor(at / (24 * HOUR)) + 1) * 24 * HOUR);
    state.plots = state.plots.map(p => advancePlot(p, at, state.bought.includes(SCARECROW), isRainDay(at)));
  }
  state.plots = state.plots.map(p => advancePlot(p, now, state.bought.includes(SCARECROW), isRainDay(now)));
  const day = Math.floor(now / (24 * HOUR));
  if (state.day !== day) { state.day = day; state.harvested = 0; state.watered = 0; state.claimedMissions = []; state.bonus = false; }
  state.processedAt = now;
  return state;
}
export function transitionGame(saved: SavedGame, action: GameAction, now: number) {
  const state = settleGame(saved, now);
  let message = 'Partida guardada.';
  if (action.type === 'collect') { state.water = 3; message = 'Tus 3 baldes están llenos.'; }
  else if (action.type === 'buy') {
    const price = action.name === SCARECROW ? ECONOMY.scarecrowPrice : action.name === STAR_WATERING_CAN ? ECONOMY.wateringCanPrice : ECONOMY.fertilizerPrice;
    if (state.bought.includes(action.name)) throw new Error('Ya tienes esta mejora.');
    if (state.carrots < price) throw new Error('No tienes suficientes zanahorias.');
    state.carrots -= price;
    if (action.name === 'Fertilizante ×5') state.fertilizer += ECONOMY.fertilizerPack;
    else state.bought.push(action.name);
    message = `${action.name} comprado.`;
  } else if (action.type === 'mission' || action.type === 'bonus') {
    const progress = [state.harvested, state.watered, state.invited];
    const totals = [2, 3, 1], rewards = [20, 30, 100];
    if (action.type === 'mission') {
      if ((progress[action.index] ?? 0) < (totals[action.index] ?? Infinity) || state.claimedMissions.includes(action.index)) throw new Error('Misión no disponible.');
      state.claimedMissions.push(action.index); state.carrots += rewards[action.index] ?? 0;
    } else {
      if (state.bonus || !progress.every((p, i) => p >= (totals[i] ?? Infinity))) throw new Error('Bono no disponible.');
      state.bonus = true; state.carrots += 100;
    }
    message = 'Recompensa recogida y guardada.';
  } else {
    const plot = state.plots[action.index];
    if (!plot || plot.locked) throw new Error('Parcela bloqueada.');
    if (action.type === 'plant') {
      if (plot.state !== 'empty' && plot.state !== 'water') throw new Error('Esta parcela ya está creciendo.');
      const slots = fillBed(plantedSlots(plot.state, plot.slots), action.slot);
      if (slots.length === (plot.slots?.length ?? 0)) throw new Error('Este espacio ya está sembrado.');
      state.plots[action.index] = { ...plot, state: 'water', slots, plantedAt: plot.plantedAt ?? now };
      message = 'Zanahorias sembradas y guardadas.';
    } else if (action.type === 'fertilize') {
      const changed = fertilizePlot(plot);
      if (state.fertilizer < 1 || changed === plot) throw new Error('No se puede fertilizar esta parcela.');
      state.fertilizer--; state.plots[action.index] = advancePlot(changed, now, state.bought.includes(SCARECROW), isRainDay(now));
      message = 'Fertilizante aplicado.';
    } else if (plot.state === 'ready') {
      const count = plantedSlots(plot.state, plot.slots).length;
      const gain = Math.floor(40 * count / 9), coins = Math.floor(25 * count / 9);
      state.carrots += gain; state.coins += coins; state.harvested++;
      state.plots[action.index] = { crop: 'carrot', state: 'empty', slots: [] };
      message = `¡Cosecha guardada! +${gain} zanahorias y +${coins} monedas`;
    } else if (plot.state === 'water') {
      const rain = isRainDay(now);
      if (!rain && state.water < 1) throw new Error('No quedan baldes. Visita el pozo.');
      const targets = wateringTargets(state.plots, action.index, state.bought.includes(STAR_WATERING_CAN));
      if (!rain) state.water--;
      state.watered += targets.length;
      targets.forEach(i => { const p = state.plots[i]; if (p) state.plots[i] = { ...p, state: 'growing', start: now, end: now + growthDuration(false, rain), rainGrown: rain }; });
      message = 'Riego guardado. Tito cuida tus cultivos mientras no estás.';
    } else throw new Error('La parcela todavía no está lista.');
  }
  return { state, message };
}