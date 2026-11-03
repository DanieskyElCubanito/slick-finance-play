import { z } from 'zod';
import { ECONOMY, HOUR } from './farm-economy';

export const balanceFields = [
  { key: 'growthHours', label: 'Crecimiento', unit: 'horas', current: ECONOMY.growthMs / HOUR },
  { key: 'fastGrowthHours', label: 'Crecimiento acelerado', unit: 'horas', current: ECONOMY.fastGrowthMs / HOUR },
  { key: 'wiltHours', label: 'Marchitar sin agua', unit: 'horas', current: ECONOMY.wiltMs / HOUR },
  { key: 'fertilizerPrice', label: 'Fertilizante ×5', unit: 'zanahorias', current: ECONOMY.fertilizerPrice },
  { key: 'scarecrowPrice', label: 'Espantapájaros', unit: 'zanahorias', current: ECONOMY.scarecrowPrice },
  { key: 'wateringCanPrice', label: 'Regadera Estrella', unit: 'zanahorias', current: ECONOMY.wateringCanPrice },
  { key: 'referralBonus', label: 'Primer cultivo referido', unit: 'zanahorias', current: ECONOMY.referralBonus },
  { key: 'missionMultiplier', label: 'Misión con anuncio voluntario', unit: '×', current: ECONOMY.missionMultiplier },
] as const;
export const proposalSchema = z.object({
  summary: z.string().min(1).max(2500),
  changes: z.array(z.object({ key: z.enum(['growthHours', 'fastGrowthHours', 'wiltHours', 'fertilizerPrice', 'scarecrowPrice', 'wateringCanPrice', 'referralBonus', 'missionMultiplier']), proposed: z.number().positive().max(100000000), reason: z.string().min(1).max(1500) })).min(1).max(8),
  risks: z.array(z.string().max(1500)).max(8),
  assumptions: z.array(z.string().max(1500)).max(8),
}).superRefine((proposal, ctx) => {
  if (new Set(proposal.changes.map(c => c.key)).size !== proposal.changes.length) ctx.addIssue({ code: 'custom', message: 'Cambios duplicados.' });
  const base = proposal.changes.find(c => c.key === 'growthHours')?.proposed ?? 4;
  const fast = proposal.changes.find(c => c.key === 'fastGrowthHours')?.proposed ?? 2;
  if (fast > base) ctx.addIssue({ code: 'custom', message: 'El crecimiento acelerado no puede ser más lento.' });
});
export type EconomyProposal = z.infer<typeof proposalSchema>;