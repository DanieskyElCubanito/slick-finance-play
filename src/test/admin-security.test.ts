import { describe, it, expect, vi } from 'vitest';
import { createHmac } from 'node:crypto';
vi.mock('@tanstack/react-start/server', () => ({ getCookie: vi.fn(), setResponseHeader: vi.fn() }));
import { verifyTelegram } from '@/lib/admin-security.server';
import { proposalSchema } from '@/lib/economy-proposal';
function signed(id: number, time = 1000) {
  const data = new URLSearchParams({ auth_date: String(time), user: JSON.stringify({ id }) });
  const check = [...data.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k,v]) => `${k}=${v}`).join('\n');
  data.set('hash', createHmac('sha256', createHmac('sha256', 'WebAppData').update('test-token').digest()).update(check).digest('hex'));
  return data.toString();
}
describe('Telegram proof and proposals', () => {
  it('validates signed owner identity 8968109534', () => expect(verifyTelegram(signed(8968109534), 'test-token', 1000000)).toBe(8968109534));
  it('rejects a forged owner ID', () => expect(() => verifyTelegram(signed(123).replace('%3A123', '%3A8968109534'), 'test-token', 1000000)).toThrow());
  it('rejects Telegram proof older than five minutes', () => expect(() => verifyTelegram(signed(8968109534), 'test-token', 1301000)).toThrow());
  it('rejects faster growth taking longer than base four hours', () => expect(proposalSchema.safeParse({ summary: 'Test', changes: [{ key: 'fastGrowthHours', proposed: 5, reason: 'Test' }], risks: [], assumptions: [] }).success).toBe(false));
});