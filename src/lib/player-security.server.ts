import { getCookie, getRequest, setResponseHeader } from '@tanstack/react-start/server';
import { hashToken } from './admin-security.server';
export const PLAYER_COOKIE = 'tito_player_session';
export function checkPlayerOrigin() {
  const request = getRequest();
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) throw new Error('Solicitud no autorizada.');
  if (request.headers.get('sec-fetch-site') === 'cross-site') throw new Error('Solicitud no autorizada.');
}
export async function requirePlayer() {
  setResponseHeader('Cache-Control', 'no-store');
  const token = getCookie(PLAYER_COOKIE);
  if (!token) throw new Error('Abre tu finca desde Telegram.');
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data, error } = await supabaseAdmin.from('player_sessions').select('telegram_id, expires_at').eq('token_hash', hashToken(token)).maybeSingle();
  if (error || !data || Date.parse(data.expires_at) <= Date.now()) throw new Error('Sesión caducada. Abre de nuevo tu finca desde Telegram.');
  return { supabaseAdmin, telegramId: data.telegram_id };
}