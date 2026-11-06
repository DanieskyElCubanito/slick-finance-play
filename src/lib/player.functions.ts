import { createServerFn } from '@tanstack/react-start';
import { setCookie, setResponseHeader } from '@tanstack/react-start/server';
import { z } from 'zod';
import { gameActionSchema, newSavedGame, settleGame, transitionGame, type SavedGame } from './saved-game';

export const playerLogin = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => z.object({ initData: z.string().min(1).max(10000) }).parse(input))
  .handler(async ({ data }) => {
    const { checkPlayerOrigin, PLAYER_COOKIE, requirePlayer } = await import('./player-security.server');
    checkPlayerOrigin(); setResponseHeader('Cache-Control', 'no-store');
    const botToken = process.env['TELEGRAM_BOT_TOKEN'];
    if (!botToken) throw new Error('Falta configurar Telegram.');
    const { verifyTelegram, hashToken } = await import('./admin-security.server');
    const telegramId = verifyTelegram(data.initData, botToken);
    try { const existing = await requirePlayer(); if (existing.telegramId === telegramId) return { ok: true }; } catch { /* new session requires fresh signed proof */ }
    const user = z.object({ first_name: z.string().max(100), last_name: z.string().max(100).optional(), username: z.string().max(100).optional(), photo_url: z.string().url().optional() }).parse(JSON.parse(new URLSearchParams(data.initData).get('user') ?? '{}'));
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error: profileError } = await supabaseAdmin.from('player_profiles').upsert({ telegram_id: telegramId, display_name: `${user.first_name} ${user.last_name ?? ''}`.trim(), username: user.username ?? null, photo_url: user.photo_url ?? null });
    if (profileError) throw new Error('No se pudo guardar tu perfil.');
    const initial = newSavedGame(Date.now());
    const { error: gameError } = await supabaseAdmin.from('player_games').upsert({ telegram_id: telegramId, state: JSON.parse(JSON.stringify(initial)) }, { onConflict: 'telegram_id', ignoreDuplicates: true });
    if (gameError) throw new Error('No se pudo abrir tu finca.');
    const token = crypto.randomUUID() + crypto.randomUUID();
    const { error } = await supabaseAdmin.from('player_sessions').insert({ telegram_id: telegramId, token_hash: hashToken(token), login_hash: hashToken(data.initData), expires_at: new Date(Date.now() + 86400000).toISOString() });
    if (error) throw new Error('Cierra y abre de nuevo el juego desde Telegram para renovar el acceso.');
    setCookie(PLAYER_COOKIE, token, { httpOnly: true, secure: process.env['NODE_ENV'] === 'production', sameSite: 'strict', path: '/', maxAge: 86400 });
    return { ok: true };
  });

export const loadPlayerGame = createServerFn({ method: 'GET' }).handler(async () => {
  const { requirePlayer } = await import('./player-security.server');
  const { supabaseAdmin, telegramId } = await requirePlayer();
  const { data, error } = await supabaseAdmin.from('player_games').select('state,version').eq('telegram_id', telegramId).single();
  if (error || !data) throw new Error('No se pudo cargar la finca.');
  const now = Date.now();
  return { state: settleGame(data.state as unknown as SavedGame, now), now };
});

export const performGameAction = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => z.object({ event: z.string().uuid(), action: gameActionSchema }).parse(input))
  .handler(async ({ data }) => {
    const { requirePlayer, checkPlayerOrigin } = await import('./player-security.server');
    checkPlayerOrigin();
    const { supabaseAdmin, telegramId } = await requirePlayer();
    const { data: previous, error: eventError } = await supabaseAdmin.from('game_events').select('id').eq('id', data.event).eq('telegram_id', telegramId).maybeSingle();
    if (eventError) throw new Error('No se pudo verificar la acción.');
    if (previous) throw new Error('Esta acción ya fue guardada. Actualiza tu finca.');
    const { data: row, error } = await supabaseAdmin.from('player_games').select('state,version').eq('telegram_id', telegramId).single();
    if (error || !row) throw new Error('No se pudo cargar la finca.');
    const saved = row.state as unknown as SavedGame, now = Date.now();
    const result = transitionGame(saved, data.action, now);
    const { data: committed, error: commitError } = await supabaseAdmin.rpc('commit_game_action', { p_player: telegramId, p_version: row.version, p_state: JSON.parse(JSON.stringify(result.state)), p_event: data.event, p_action: data.action.type, p_carrots: result.state.carrots - saved.carrots, p_coins: result.state.coins - saved.coins });
    if (commitError || !committed) throw new Error('La finca cambió en otra ventana. Actualiza antes de continuar.');
    return { ...result, now };
  });