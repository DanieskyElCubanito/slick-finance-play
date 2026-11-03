import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { getCookie, setResponseHeader } from '@tanstack/react-start/server';
import { z } from 'zod';

export const ADMIN_COOKIE = 'tito_admin_session';
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export function verifyTelegram(data: string, botToken: string, now = Date.now()) {
  const params = new URLSearchParams(data);
  if (new Set(params.keys()).size !== [...params.keys()].length) throw new Error('Acceso inválido.');
  const hash = params.get('hash') ?? '';
  params.delete('hash');
  const authDate = Number(params.get('auth_date'));
  if (!Number.isFinite(authDate) || now / 1000 - authDate > 300 || authDate > now / 1000 + 30) throw new Error('Acceso caducado. Abre de nuevo el juego desde Telegram.');
  const check = [...params.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const expected = createHmac('sha256', secret).update(check).digest();
  const actual = Buffer.from(hash, 'hex');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error('Telegram no pudo verificar tu identidad.');
  return z.object({ id: z.number().int().positive() }).parse(JSON.parse(params.get('user') ?? '{}')).id;
}

export async function requireAdmin() {
  setResponseHeader('Cache-Control', 'no-store');
  const token = getCookie(ADMIN_COOKIE);
  if (!token) throw new Error('Inicia sesión desde Telegram.');
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data: session, error } = await supabaseAdmin.from('admin_sessions').select('telegram_id, expires_at').eq('token_hash', hashToken(token)).maybeSingle();
  if (error || !session || Date.parse(session.expires_at) <= Date.now()) throw new Error('Sesión caducada. Abre el juego desde Telegram.');
  const { data: role } = await supabaseAdmin.from('telegram_admin_roles').select('role').eq('telegram_id', session.telegram_id).maybeSingle();
  if (role?.role !== 'owner') throw new Error('Acceso reservado al propietario.');
  return { supabaseAdmin, telegramId: session.telegram_id };
}