import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { loadPlayerGame, performGameAction, playerLogin } from '@/lib/player.functions';
import { newSavedGame, type SavedGame, type GameAction } from '@/lib/saved-game';
import { ArrowLeft, Check, ClipboardList, Coins, Copy, Droplets, Gem, Gift, House, Leaf, LockKeyhole, Mail, Plus, Settings, ShoppingBasket, Sprout, Star, Sun, Users, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import world from '@/assets/farm-meadow.jpg';
import { BED_CAPACITY, fillBed, plantedSlots } from '@/lib/farm-planting';
import { ECONOMY, STAR_WATERING_CAN, SCARECROW, acceleratePlot, advancePlot, carrotUsd, durationLabel, fertilizePlot, growthDuration, isRainDay, missionReward, referralReward, wateringTargets, type EconomyPlot } from '@/lib/farm-economy';
import tito from '@/assets/tito.png';
import carrot from '@/assets/carrot.png';
import watering from '@/assets/watering.png';
import scarecrow from '@/assets/scarecrow.png';
import well from '@/assets/well.png';
import woodTexture from '@/assets/kawaii-wood.jpg';
import plantedCarrot from '@/assets/planted-carrot.png';
import plantingBed from '@/assets/planting-bed.png';

type Plot = EconomyPlot;
type Game = { authenticated: boolean; busy: boolean; sessionError: string; login: () => void; now: number; carrots: number; coins: number; water: number; fertilizer: number; plots: Plot[]; harvested: number; watered: number; invited: number; bought: string[]; bonus: boolean; spins: number; chestAt: number; discount: boolean; ads: number; adPending: boolean; claimedMissions: number[]; rain: boolean; toast: (message: string) => void; harvest: (index: number) => void; plant: (index: number, slot?: number) => void; buy: (name: string, price: number) => void; collect: () => void; invite: () => void; claim: () => void; claimMission: (index: number, multiplied: boolean) => void; ad: (reason: string, reward: () => void) => void; accelerate: () => void; fertilize: (index: number) => void; spin: () => string; openChest: () => void; buyFertilizer: () => void; unlockDiscount: () => void; earn: (n: number) => void; addWater: (n: number) => void; addFertilizer: (n: number) => void; addSpin: () => void; watchAdForResource: (type: 'carrot' | 'water') => void };
const GameContext = createContext<Game | null>(null);
function useGame() { const game = useContext(GameContext); if (!game) throw new Error('Farm provider missing'); return game; }
const cropImages = { carrot: plantedCarrot };
export const farmMeta = (title: string, description: string) => ({ meta: [{ title: `${title} · Mi Finquita del Conejo` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} · Mi Finquita del Conejo` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] });
const missionDefinitions = [{ name: 'Cosecha 2 veces', total: 2, reward: 20, image: carrot }, { name: 'Riega 3 veces', total: 3, reward: 30, image: watering }, { name: 'Invita a un amigo activo', total: 1, reward: 100, image: tito }];

export function FarmProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<SavedGame>(() => newSavedGame(0));
  const [now, setNow] = useState(0);
  const [authenticated, setAuthenticated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sessionError, setSessionError] = useState('');
  const [message, setMessage] = useState('');
  const pending = useRef(false);
  const load = useServerFn(loadPlayerGame), loginFn = useServerFn(playerLogin), actionFn = useServerFn(performGameAction);
  const blocked = () => setMessage('Esta función requiere un servicio verificado y todavía no está disponible.');
  async function refresh() {
    const result = await load(); setSaved(result.state); setNow(result.now); setAuthenticated(true); setSessionError('');
  }
  async function login() {
    if (pending.current) return;
    pending.current = true; setBusy(true); setSessionError('');
    try {
      const initData = (window as Window & { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp?.initData;
      if (!initData) throw new Error('Abre tu finca desde Telegram para guardar tu progreso.');
      await loginFn({ data: { initData } }); await refresh();
    } catch (e) { setSessionError(e instanceof Error ? e.message : 'No se pudo abrir tu finca.'); }
    finally { pending.current = false; setBusy(false); }
  }
  useEffect(() => {
    let cancelled = false;
    void load().then(result => { if (!cancelled) { setSaved(result.state); setNow(result.now); setAuthenticated(true); } }).catch(() => { if (!cancelled) setSessionError('Abre tu finca desde Telegram para guardar tu progreso.'); });
    return () => { cancelled = true; };
  }, [load]);
  useEffect(() => {
    const timer = setInterval(() => setNow(v => v + 1000), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!authenticated) return;
    const timer = setInterval(() => { if (!pending.current) void refresh().catch(() => setSessionError('No se pudo actualizar la finca. Vuelve a abrirla desde Telegram.')); }, 15000);
    return () => clearInterval(timer);
  }, [authenticated, load]);
  useEffect(() => { if (!message) return; const timer = setTimeout(() => setMessage(''), 3400); return () => clearTimeout(timer); }, [message]);
  async function act(action: GameAction) {
    if (!authenticated) { setMessage('Verifica tu cuenta de Telegram antes de jugar.'); return; }
    if (pending.current) return;
    pending.current = true; setBusy(true);
    try { const result = await actionFn({ data: { event: crypto.randomUUID(), action } }); setSaved(result.state); setNow(result.now); setMessage(result.message); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'No se pudo guardar.'); try { await refresh(); } catch { setAuthenticated(false); } }
    finally { pending.current = false; setBusy(false); }
  }
  return <GameContext.Provider value={{ ...saved, now, authenticated, busy, sessionError, login: () => void login(), rain: isRainDay(now), adPending: busy, toast: setMessage,
    harvest: index => void act({ type: 'harvest', index }), plant: (index, slot) => void act({ type: 'plant', index, slot }),
    fertilize: index => void act({ type: 'fertilize', index }),
    buy: name => { if (name === SCARECROW || name === STAR_WATERING_CAN) void act({ type: 'buy', name }); },
    buyFertilizer: () => void act({ type: 'buy', name: 'Fertilizante ×5' }), collect: () => void act({ type: 'collect' }),
    claimMission: (index, multiplied) => { if (multiplied) blocked(); else void act({ type: 'mission', index }); }, claim: () => void act({ type: 'bonus' }),
    ad: blocked, invite: blocked, accelerate: blocked, spin: () => { blocked(); return ''; }, openChest: blocked, unlockDiscount: blocked,
    earn: blocked, addWater: blocked, addFertilizer: blocked, addSpin: blocked, watchAdForResource: blocked,
  }}>{children}{message && <div role="status" className="toast-game">{message}</div>}</GameContext.Provider>;
}

const navItems = [{ path: '/' as const, label: 'Finca', icon: House }, { path: '/tienda' as const, label: 'Tienda', icon: ShoppingBasket }, { path: '/misiones' as const, label: 'Misiones', icon: ClipboardList }, { path: '/amigos' as const, label: 'Amigos', icon: Users }, { path: '/mercado' as const, label: 'Mercado', icon: Coins }];
export function FarmShell({ children, active }: { children: ReactNode; active: string }) {
  const game = useGame(); const [settings, setSettings] = useState(false); const [sound, setSound] = useState(false);
  return <div className="game-shell"><header className="topbar"><img className="wood-surface" src={woodTexture} alt="" /><div className="topbar-inner"><Link to="/" className="brand"><img src={tito} alt="" /><div><h1>Mi Finquita<br />del Conejo</h1><small>Un pequeño mundo, tu gran aventura</small></div></Link><div className="top-divider" /><div className="level"><Star className="level-star" /><div>Nivel<b>{Math.min(10, 1 + Math.floor(game.coins / 500))} · Granjero</b></div></div><div className="resources"><div className="resource resource-carrots" title="Zanahorias"><img src={carrot} alt="Zanahorias" /><span>{game.carrots.toLocaleString('en-US')}</span></div><div className="resource resource-water" title="Agua"><Droplets /><span>{game.water}/3</span></div><div className="resource" title="Monedas"><Coins className="coin" size={25} /><span>{game.coins.toLocaleString('en-US')}</span></div><div className="resource" title="Diamantes"><Gem className="gem" size={24} /><span>0</span></div></div><Button variant="tool" className="top-settings" aria-label="Ajustes" title="Ajustes" onClick={() => setSettings(true)}><Settings /></Button></div></header><main className="content-wrap">{!game.authenticated && <section className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-4"><div><b>Tu finca personal</b><p>{game.sessionError || 'Comprobando tu partida…'}</p></div><div className="flex flex-wrap gap-2"><Button variant="farm" disabled={game.busy} onClick={game.login}>{game.busy ? 'Verificando…' : 'Verificar con Telegram'}</Button><Button variant="wood" asChild><a href="https://t.me/VFarmerBunny_bot/game">Abrir en Telegram</a></Button></div></section>}{game.authenticated && <p role="status" className="py-2 text-sm text-primary">{game.busy ? 'Guardando…' : 'Partida conectada · zanahorias ganadas'}</p>}{children}</main><nav className="bottom-nav" aria-label="Navegación principal"><img className="wood-surface" src={woodTexture} alt="" />{navItems.map(({ path, label, icon: Icon }) => <Button key={path} asChild variant="navigation" data-active={active === path}><Link to={path}><Icon /><span>{label}</span></Link></Button>)}</nav>{settings && <div className="modal-backdrop" onClick={() => setSettings(false)}><section className="settings-modal" role="dialog" aria-modal="true" aria-label="Ajustes" onClick={e => e.stopPropagation()}><h3>Ajustes de la finca</h3><div className="setting-row"><span>Sonido</span><Button variant="tool" aria-label={sound ? 'Desactivar sonido' : 'Activar sonido'} onClick={() => { setSound(v => !v); game.toast('El sonido no está disponible en esta vista de prueba.'); }}>{sound ? <Volume2 /> : <VolumeX />}</Button></div><div className="setting-row"><span>Idioma</span><b>Español</b></div><p className="notice">{game.authenticated ? 'Tu partida se guarda en tu cuenta de Telegram.' : 'Verifica Telegram para abrir tu partida guardada.'}</p><Button variant="wood" asChild><Link to="/admin">Panel del propietario</Link></Button><Button variant="wood" onClick={() => setSettings(false)}>Cerrar</Button></section></div>}</div>;
}
function MissionRows({ large = false }: { large?: boolean }) {
 const game = useGame();
 const progress = [game.harvested, game.watered, game.invited];
 return <div className={large ? 'large-missions' : ''}>{missionDefinitions.map((row, index) => {
   const complete = (progress[index] ?? 0) >= row.total;
   const claimed = game.claimedMissions.includes(index);
   return <div className="mission-item" key={row.name}><div className="mission-icon"><img src={row.image} alt="" /></div><div><b>{row.name}</b><small>{Math.min(progress[index] ?? 0, row.total)} de {row.total} completados · +{row.reward}</small>{large && complete && !claimed && <div className="flex flex-wrap gap-2 mt-2"><Button variant="farm" disabled={game.adPending} onClick={() => game.claimMission(index, false)}>Recoger +{row.reward}</Button><Button variant="wood" disabled onClick={() => game.claimMission(index, true)}>Anuncio ×3 no disponible</Button></div>}</div><span className="mission-reward">{claimed ? <Check size={20} /> : `+${row.reward}`}</span></div>;
 })}</div>;
}

function PlantingBed({ plot, index }: { plot: Plot; index: number }) {
 const game = useGame();
 const slots = plantedSlots(plot.state, plot.slots);
 const pct = plot.state === 'ready' ? 100 : plot.state === 'growing' && plot.start && plot.end ? Math.min(99, Math.max(1, Math.round((game.now - plot.start) / (plot.end - plot.start) * 100))) : 0;
 const left = plot.end ? durationLabel(plot.end - game.now) : '∞';
 const stage = plot.state === 'ready' ? 4 : pct >= 50 ? 3 : pct >= 25 ? 2 : 1;
 if (plot.locked) return <Button variant="plot" className="furrow furrow-locked" aria-label={`Surco bloqueado: ${plot.locked}`} onClick={() => game.toast(`Surco bloqueado · ${plot.locked}`)}><img className="bed-ground" src={plantingBed} alt="" /><LockKeyhole className="lock-icon" /><span className="plot-caption">{plot.locked}</span></Button>;
 const canPlant = plot.state === 'empty' || plot.state === 'water';
 return <div className={`furrow furrow-user${plot.state === 'water' ? ' furrow-moist' : ''}`} role="group" aria-label={`Parcela ${index + 1}`}>
   <img className="bed-ground" src={plantingBed} alt="" />
   <span className="bed-count">{slots.length}/{BED_CAPACITY}</span>
   <div className={`bed-slots stage-${stage}`}>
    {Array.from({ length: BED_CAPACITY }, (_, slot) => {
     const occupied = slots.includes(slot);
     return <Button key={slot} variant="ghost" className="carrot-slot" aria-label={`${occupied ? 'Zanahoria' : 'Sembrar zanahoria'} ${slot + 1} en parcela ${index + 1}`} title={occupied ? 'Zanahoria sembrada' : 'Sembrar zanahoria'} disabled={occupied || !canPlant || !game.authenticated || game.busy} onClick={() => game.plant(index, slot)}>{occupied ? <img src={cropImages[plot.crop]} alt="" /> : canPlant ? <Plus /> : null}</Button>;
    })}
   </div>
   {plot.state === 'growing' && <div className="plot-progress"><span style={{ width: `${pct}%` }} /></div>}
   <div className="bed-actions">
    {canPlant && slots.length < BED_CAPACITY && <Button variant="wood" className="bed-command" disabled={!game.authenticated || game.busy} aria-label={`Sembrar todas en parcela ${index + 1}`} onClick={() => game.plant(index)}><Sprout /><span>Sembrar 9</span></Button>}
    {plot.state !== 'empty' && <Button variant={plot.state === 'ready' ? 'farm' : 'wood'} className="bed-command" disabled={plot.state === 'growing' || !game.authenticated || game.busy} aria-label={`${plot.state === 'ready' ? 'Cosechar' : 'Regar'} parcela ${index + 1}`} onClick={() => game.harvest(index)}>{plot.state === 'ready' ? <><Sprout /><span>Cosechar</span></> : plot.state === 'water' ? <><Droplets /><span>Regar</span></> : <span>{left}</span>}</Button>}
   </div>
   {plot.state === 'growing' && !plot.fertilized && !plot.rainGrown && game.fertilizer > 0 && <Button variant="tool" className="bed-fertilizer" aria-label={`Fertilizar parcela ${index + 1}`} title="Fertilizar: ciclo de 2 horas" onClick={() => game.fertilize(index)}><Leaf /></Button>}
 </div>;
}

export function FarmHome() {
 const game = useGame();
 return <FarmShell active="/"><div className="page-heading"><div><h2>¡Qué bueno verte, granjero!</h2><p>Un nuevo día para hacer crecer tu finquita.</p></div><span className="day-badge"><Sun size={20} /> {game.rain ? 'Lluvia · ciclo de 2h' : 'Ciclo de cultivo · 4h'}</span></div><div className="farm-layout"><div><section className="farm-scene" aria-label="Tu finca"><img className="world-image" src={world} alt="Finca ilustrada con una casita, un pozo y colinas verdes" /><span className="scene-label"><Leaf size={14} /> La finca de Tito</span><div className="scene-tools"><Button variant="tool" asChild aria-label="Ir al pozo" title="Ir al pozo"><Link to="/pozo"><Droplets /></Link></Button><Button variant="tool" aria-label="Mensajes" title="Mensajes" onClick={() => game.toast('Tito: ¡Me alegra tenerte de vuelta en la finca!')}><Mail /></Button></div><img src={tito} alt="Tito, tu compañero granjero" className="tito-character" /><div className="tito-speech"><b>¡Hola, soy Tito!</b>¡Vamos a cultivar zanahorias en tu finca!</div><div className="plots-wrap"><div className="plots-counter"><Sprout size={15} /> Surcos: {game.plots.filter(p => !p.locked).length}/9 desbloqueados</div><div className="plots plots-iso">{game.plots.map((plot, index) => <PlantingBed key={index} plot={plot} index={index} />)}</div></div></section><div className="farm-bottom-note"><span><Sprout size={15} /> Hecho con cariño, cultivado por ti.</span><span><Droplets size={15} /> {game.water}/3 cubos de agua</span></div></div><aside className="farm-sidebar"><Button variant="wood" className="w-full mb-4" disabled onClick={game.accelerate}><Sun /> Anuncios pendientes · −1h</Button><h3 className="sidebar-title"><Leaf size={19} /> Tu compañero de finca</h3><div className="companion"><img src={tito} alt="" /><div><b>Tito está de buen humor</b><p>¡Hoy será un gran día!</p></div></div><h3 className="sidebar-title"><Star size={19} /> Misiones del día</h3><MissionRows /><Button variant="wood" asChild className="mission-link"><Link to="/misiones">Ver misiones <ArrowLeft className="rotate-180" /></Link></Button><div className="well-preview"><img src={well} alt="Pozo de agua" /><div><h3>Un poquito de agua</h3><p>{game.water}/3 cubos disponibles</p><Button variant="farm" asChild><Link to="/pozo"><Droplets /> Visitar pozo</Link></Button></div></div></aside></div></FarmShell>;
}
function Heading({ title, subtitle }: { title: string; subtitle: string }) { return <div className="sub-heading"><Button variant="tool" asChild aria-label="Volver a la finca"><Link to="/"><ArrowLeft /></Link></Button><div><h2>{title}</h2><p>{subtitle}</p></div></div>; }
export function ShopScreen() {
 const game = useGame(); const items = [
   { name: 'Fertilizante ×5', price: ECONOMY.fertilizerPrice, image: carrot, text: '5 usos · ciclo de cosecha de 2 horas.', consumable: true },
   { name: SCARECROW, price: ECONOMY.scarecrowPrice, image: scarecrow, text: 'Permanente · protege las siembras sin agua de marchitarse.', consumable: false },
   { name: STAR_WATERING_CAN, price: ECONOMY.wateringCanPrice, image: watering, text: 'Permanente · riega 2 surcos con 1 balde.', consumable: false },
 ];
 return <FarmShell active="/tienda"><div className="sub-page"><Heading title="La tienda de Tito" subtitle={`${game.carrots.toLocaleString('en-US')} zanahorias · ${game.fertilizer} fertilizantes`} /><div className="shop-grid">{items.map(item => <article key={item.name} className="shop-item"><h3>{item.name}</h3><img src={item.image} alt={item.name} /><p>{item.text}</p><div className="price"><img src={carrot} alt="Zanahorias" /> {item.price.toLocaleString('en-US')}</div><Button variant="farm" disabled={!game.authenticated || game.busy || (!item.consumable && game.bought.includes(item.name))} onClick={() => item.consumable ? game.buyFertilizer() : game.buy(item.name, item.price)}>{game.bought.includes(item.name) ? <><Check /> Comprado</> : <><ShoppingBasket /> Comprar</>}</Button></article>)}{[{ name: 'Pozo de Oro', price: ECONOMY.goldenWellTon, image: well, text: 'Agua infinita · mejora VIP pendiente.' }, { name: 'Tractor Autónomo', price: ECONOMY.tractorTon, image: plantingBed, text: 'Siembra, riega y cosecha los 9 surcos incluso con el juego cerrado · pendiente.' }].map(item => <article className="shop-item" key={item.name}><h3>{item.name}</h3><img src={item.image} alt={item.name} /><p>{item.text}</p><div className="price">{item.price} TON</div><Button variant="wood" disabled><LockKeyhole /> Próximamente</Button></article>)}</div><p className="notice">Compras con zanahorias ganadas y guardadas. Pagos TON y tractor autónomo pendientes de conexión.</p></div></FarmShell>;
}

export function MissionsScreen() { const game = useGame(); const completed = [game.harvested >= 2, game.watered >= 3, game.invited >= 1].filter(Boolean).length; return <FarmShell active="/misiones"><div className="sub-page"><Heading title="Misiones del día" subtitle={`${completed} de 3 misiones completadas`} /><MissionRows large /><div className="bonus-band"><div><h3><Gift className="inline" /> Un extra de cariño</h3><p>Completa las 3 misiones · +100 zanahorias</p></div><Button variant="farm" disabled={completed < 3 || game.bonus} onClick={game.claim}>{game.bonus ? 'Recogido' : completed < 3 ? <><LockKeyhole /> {completed}/3</> : 'Recoger bono'}</Button></div></div></FarmShell>; }

export function FriendsScreen() {
  const game = useGame();
  return <FarmShell active="/amigos"><div className="sub-page"><Heading title="La finca es mejor juntos" subtitle="Recompensas por amigos activos" /><div className="friends-feature"><img src={tito} alt="Tito te da la bienvenida" /><div><h3>+{ECONOMY.referralBonus} zanahorias</h3><p>Cuando tu amigo complete su primera cosecha, no solo al entrar.</p><Button variant="farm" disabled><Copy /> Enlace no disponible</Button></div></div><div className="friend-list"><h3 className="sidebar-title"><Users size={22} /> Tus amigos referidos</h3><p>{game.invited ? `${game.invited} amigos activos` : 'Sin amigos activos'}</p><p>Cashback: 5% de las zanahorias que gasten en la tienda.</p><p>Comisión TON: 1% de cada compra premium verificada.</p><p className="notice">Referidos y comisiones pendientes de verificación. No se conceden recompensas por invitaciones simuladas.</p></div></div></FarmShell>;
}

export function WellScreen() {
  const game = useGame();
  return <FarmShell active="/"><div className="sub-page"><Heading title="El pozo de la finca" subtitle="Agua fresca para tus pequeños cultivos." /><div className="water-screen"><img className="water-illustration" src={well} alt="Pozo de madera y piedra con agua fresca" /><h3>{game.water} de 3 cubos disponibles</h3><div className="water-count">{[0,1,2].map(i => <Droplets key={i} className={i >= game.water ? 'used' : ''} />)}</div><Button variant="farm" disabled={game.water >= 3 || !game.authenticated || game.busy} onClick={game.collect}><Droplets /> {game.water >= 3 ? 'Tus cubos están llenos' : 'Rellenar cubos'}</Button><Button variant="wood" className="mt-4" disabled onClick={() => game.watchAdForResource('water')}><Droplets /> {game.adPending ? 'Esperando anuncio…' : 'Anuncio +1 balde no disponible'}</Button><p className="notice">Gigapub pendiente de verificación de recompensas. No se entregan premios simulados.</p></div></div></FarmShell>;
}

export function MarketScreen() {
  const game = useGame();
  const usd = carrotUsd(game.carrots);
  return <FarmShell active="/mercado"><div className="sub-page"><Heading title="El mercado de la cosecha" subtitle="Tu cosecha y su conversión prevista" /><div className="market-balance"><img src={carrot} alt="Zanahorias cosechadas" /><div><p>Zanahorias ganadas</p><strong>{game.carrots.toLocaleString('en-US')}</strong><p>zanahorias</p></div></div><div className="mt-4 p-4 text-center"><span className="text-muted-foreground font-bold">Conversión prevista</span><div className="text-3xl font-extrabold text-foreground mt-1 mb-1">${usd.toFixed(2)} USD</div><small className="text-muted-foreground">100,000 zanahorias = $1.00 USD</small></div><div className="mt-4 p-4 text-center"><h3>Retiros</h3><p>Mínimo: $5.00 USD · 500,000 zanahorias</p><p>Comisiones TON verificadas: no disponibles</p><Button variant="farm" className="w-full mt-4" disabled><LockKeyhole /> Retiros no disponibles</Button>{usd < ECONOMY.minimumUsd && <p className="mt-2">Faltan {(500000 - game.carrots).toLocaleString('en-US')} zanahorias para el mínimo previsto.</p>}</div><p className="notice">Las zanahorias son recursos guardados del juego, no TON disponibles. La billetera de fondos y los retiros todavía no están conectados.</p><Button variant="wood" asChild className="w-full mt-2"><Link to="/"><Sprout /> Volver a cultivar</Link></Button></div></FarmShell>;
}
