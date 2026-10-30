import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Check, ClipboardList, Coins, Copy, Droplets, Gem, Gift, House, Leaf, LockKeyhole, Mail, Plus, Settings, ShoppingBasket, Sprout, Star, Sun, Users, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import world from '@/assets/farm-meadow.jpg';
import { BED_CAPACITY, fillBed, plantedSlots } from '@/lib/farm-planting';
import tito from '@/assets/tito.png';
import carrot from '@/assets/carrot.png';
import watering from '@/assets/watering.png';
import scarecrow from '@/assets/scarecrow.png';
import well from '@/assets/well.png';
import woodTexture from '@/assets/kawaii-wood.jpg';
import plantedCarrot from '@/assets/planted-carrot.png';
import plantingBed from '@/assets/planting-bed.png';

type Plot = { crop: 'carrot'; state: 'ready' | 'water' | 'empty' | 'growing'; end?: number; start?: number; locked?: string | undefined; slots?: number[] };
type Game = { now: number; carrots: number; coins: number; water: number; fertilizer: number; plots: Plot[]; harvested: number; watered: number; invited: number; bought: string[]; bonus: boolean; spins: number; chestAt: number; discount: boolean; ads: number; toast: (message: string) => void; harvest: (index: number) => void; plant: (index: number, slot?: number) => void; buy: (name: string, price: number) => void; collect: () => void; invite: () => void; claim: () => void; ad: (reason: string, reward: () => void) => void; spin: () => string; openChest: () => void; buyFertilizer: () => void; unlockDiscount: () => void; earn: (n: number) => void; addWater: (n: number) => void; addFertilizer: (n: number) => void; addSpin: () => void; watchAdForResource: (type: 'carrot' | 'water') => void };
const GameContext = createContext<Game | null>(null);
function useGame() { const game = useContext(GameContext); if (!game) throw new Error('Farm provider missing'); return game; }
const cropImages = { carrot: plantedCarrot };
export const farmMeta = (title: string, description: string) => ({ meta: [{ title: `${title} · Mi Finquita del Conejo` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} · Mi Finquita del Conejo` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] });
export const dayEvents = ['Domingo de feria · ventas x1.5', 'Lunes de lluvia · todo crece x2', 'Martes tranquilo', 'Miércoles de plaga · protege con espantapájaros', 'Jueves soleado', 'Viernes de cosecha', 'Sábado de mercado'];
const UPGRADED = 'Regadera mejorada';

export function FarmProvider({ children }: { children: ReactNode }) {
  const [carrots, setCarrots] = useState(1234);
  const [coins, setCoins] = useState(2560);
  const [water, setWater] = useState(3);
  const [fertilizer, setFertilizer] = useState(0);
  const [plots, setPlots] = useState<Plot[]>([{ crop: 'carrot', state: 'ready' }, { crop: 'carrot', state: 'ready' }, { crop: 'carrot', state: 'water' }, { crop: 'carrot', state: 'empty' }, { crop: 'carrot', state: 'empty', locked: 'Nivel 6' }, { crop: 'carrot', state: 'empty', locked: 'Invita 1 amigo' }, { crop: 'carrot', state: 'empty', locked: 'Nivel 8' }, { crop: 'carrot', state: 'empty', locked: 'Invita 3 amigos' }, { crop: 'carrot', state: 'empty', locked: 'Nivel 10' }]);
  const [now, setNow] = useState(Date.now());
  const [harvested, setHarvested] = useState(0);
  const [watered, setWatered] = useState(0);
  const [invited, setInvited] = useState(0);
  const [bought, setBought] = useState<string[]>([]);
  const [bonus, setBonus] = useState(false);
  const [spins, setSpins] = useState(1);
  const [chestAt, setChestAt] = useState(0);
  const [discount, setDiscount] = useState(false);
  const [ads, setAds] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => { if (!message) return; const timer = setTimeout(() => setMessage(''), 3400); return () => clearTimeout(timer); }, [message]);
  useEffect(() => { const timer = setInterval(() => { setNow(Date.now()); setPlots(current => current.map(p => p.state === 'growing' && p.end && p.end <= Date.now() ? { ...p, state: 'ready' } : p)); }, 1000); return () => clearInterval(timer); }, []);
  
  const rain = new Date().getDay() === 1;

  // Lógica de Anuncios Libres para minería/conversión
  const watchAdForResource = (type: 'carrot' | 'water') => {
    if (typeof window !== 'undefined' && (window as any).showGiga) {
      (window as any).showGiga()
        .then(() => {
          setAds(v => v + 1);
          if (type === 'carrot') {
            setCarrots(v => v + 500); 
            setMessage('¡Anuncio completado! +500 zanahorias añadidas.');
          } else {
            setWater(v => Math.min(3, v + 1));
            setMessage('¡Anuncio completado! +1 balde de agua.');
          }
        })
        .catch((e: any) => {
          console.error("Anuncio no completado", e);
          setMessage('El anuncio fue cerrado antes de finalizar.');
        });
    } else {
      // Simulación local
      setAds(v => v + 1);
      if (type === 'carrot') {
        setCarrots(v => v + 500);
        setMessage('(Simulación) +500 zanahorias por anuncio');
      } else {
        setWater(v => Math.min(3, v + 1));
        setMessage('(Simulación) +1 balde de agua por anuncio');
      }
    }
  };

  const harvest = (index: number) => {
    const plot = plots[index]; if (!plot) return;
    if (plot.locked) { setMessage(`Surco bloqueado · ${plot.locked}. ¡Sigue jugando para abrirlo!`); return; }
    if (plot.state === 'ready') { const gain = bought.includes(UPGRADED) ? 44 : 40; setCarrots(v => v + gain); setCoins(v => v + 25); setHarvested(v => v + 1); setPlots(v => v.map((p, i) => i === index ? { ...p, state: 'empty', slots: [] } : p)); setMessage(`¡Buena cosecha! +${gain} zanahorias y +25 monedas`); }
    else if (plot.state === 'empty') plant(index);
    else if (plot.state === 'water') {
      if (water === 0) { setMessage('No quedan baldes. Visita el pozo o mira un anuncio.'); return; }
      let secs = rain ? 15 : 30; const useFert = fertilizer > 0; if (useFert) { secs = Math.ceil(secs / 2); setFertilizer(v => v - 1); }
      const double = bought.includes(UPGRADED);
      const targets = double ? [index, plots.findIndex((p, i) => i !== index && p.state === 'water')].filter(i => i >= 0) : [index];
      setWater(v => v - 1); setWatered(v => v + targets.length);
      setPlots(v => v.map((p, i) => targets.includes(i) ? { ...p, state: 'growing', start: Date.now(), end: Date.now() + secs * 1000 } : p));
      setMessage(`¡${targets.length > 1 ? '2 surcos regados' : 'Cultivo regado'}! Listo en ${secs} s${useFert ? ' (fertilizante)' : ''}.`);
    }
    else setMessage('Tu cultivo está creciendo. ¡Tito lo está cuidando!');
  };
  const plant = (index: number, slot?: number) => {
    setPlots(current => current.map((p, i) => {
      if (i !== index || p.locked || (p.state !== 'empty' && p.state !== 'water')) return p;
      return { ...p, crop: 'carrot', state: 'water', slots: fillBed(plantedSlots(p.state, p.slots), slot) };
    }));
  };
  const buy = (name: string, price: number) => { if (bought.includes(name)) return; if (carrots < price) { setMessage('No tienes suficientes zanahorias.'); return; } setCarrots(v => v - price); setBought(v => [...v, name]); setMessage(`${name} añadido a tu finca.`); };
  const ad = (reason: string, reward: () => void) => { setAds(v => v + 1); reward(); setMessage(`Anuncio de prueba visto · ${reason}`); };
  const prizes = [{ label: '10 zanahorias', run: () => setCarrots(v => v + 10) }, { label: '50 zanahorias', run: () => setCarrots(v => v + 50) }, { label: '1 balde de agua', run: () => setWater(v => v + 1) }, { label: '1 fertilizante', run: () => setFertilizer(v => v + 1) }, { label: 'Gracias por jugar', run: () => {} }];
  const spin = () => { if (spins < 1) return ''; setSpins(v => v - 1); const p = prizes[Math.floor(Math.random() * prizes.length)] ?? prizes[4]; if (!p) return ''; p.run(); setMessage(`Ruleta: ${p.label}`); return p.label; };
  
  return <GameContext.Provider value={{ now, carrots, coins, water, fertilizer, plots, harvested, watered, invited, bought, bonus, spins, chestAt, discount, ads, toast: setMessage, harvest, plant, buy, ad, spin,
    collect: () => { setWater(3); setMessage('¡Tus 3 baldes de agua están listos!'); },
    invite: () => { setInvited(1); setPlots(v => v.map(p => p.locked === 'Invita 1 amigo' ? { ...p, locked: undefined } : p)); setMessage('Invitación de prueba preparada. ¡Un surco se ha desbloqueado!'); },
    claim: () => { if (harvested < 2 || watered < 3 || invited < 1 || bonus) return; setBonus(true); setCarrots(v => v + 100); setMessage('¡Bono recogido! +100 zanahorias'); },
    openChest: () => { if (chestAt > Date.now()) return; ad('Cofre abierto: +60 zanahorias', () => setCarrots(v => v + 60)); setChestAt(Date.now() + 6 * 3600 * 1000); },
    buyFertilizer: () => { if (carrots < 200) { setMessage('No tienes suficientes zanahorias.'); return; } setCarrots(v => v - 200); setFertilizer(v => v + 1); setMessage('+1 fertilizante: crece en la mitad de tiempo.'); },
    unlockDiscount: () => ad('Oferta 50% en la regadera desbloqueada', () => setDiscount(true)),
    earn: n => setCarrots(v => v + n), addWater: n => setWater(v => v + n), addFertilizer: n => setFertilizer(v => v + n), addSpin: () => setSpins(v => v + 1),
    watchAdForResource }}>{children}{message && <div role="status" className="toast-game">{message}</div>}</GameContext.Provider>;
}

const navItems = [{ path: '/' as const, label: 'Finca', icon: House }, { path: '/tienda' as const, label: 'Tienda', icon: ShoppingBasket }, { path: '/misiones' as const, label: 'Misiones', icon: ClipboardList }, { path: '/amigos' as const, label: 'Amigos', icon: Users }, { path: '/mercado' as const, label: 'Mercado', icon: Coins }];
export function FarmShell({ children, active }: { children: ReactNode; active: string }) {
  const game = useGame(); const [settings, setSettings] = useState(false); const [sound, setSound] = useState(false);
  return <div className="game-shell"><header className="topbar"><img className="wood-surface" src={woodTexture} alt="" /><div className="topbar-inner"><Link to="/" className="brand"><img src={tito} alt="" /><div><h1>Mi Finquita<br />del Conejo</h1><small>Un pequeño mundo, tu gran aventura</small></div></Link><div className="top-divider" /><div className="level"><Star className="level-star" /><div>Nivel<b>5 · Granjero</b></div></div><div className="resources"><div className="resource resource-carrots" title="Zanahorias"><img src={carrot} alt="Zanahorias" /><span>{game.carrots.toLocaleString('en-US')}</span></div><div className="resource resource-water" title="Agua"><Droplets /><span>{game.water}/3</span></div><div className="resource" title="Monedas"><Coins className="coin" size={25} /><span>{game.coins.toLocaleString('en-US')}</span></div><div className="resource" title="Diamantes"><Gem className="gem" size={24} /><span>48</span></div></div><Button variant="tool" className="top-settings" aria-label="Ajustes" title="Ajustes" onClick={() => setSettings(true)}><Settings /></Button></div></header><main className="content-wrap">{children}</main><nav className="bottom-nav" aria-label="Navegación principal"><img className="wood-surface" src={woodTexture} alt="" />{navItems.map(({ path, label, icon: Icon }) => <Button key={path} asChild variant="navigation" data-active={active === path}><Link to={path}><Icon /><span>{label}</span></Link></Button>)}</nav>{settings && <div className="modal-backdrop" onClick={() => setSettings(false)}><section className="settings-modal" role="dialog" aria-modal="true" aria-label="Ajustes" onClick={e => e.stopPropagation()}><h3>Ajustes de la finca</h3><div className="setting-row"><span>Sonido</span><Button variant="tool" aria-label={sound ? 'Desactivar sonido' : 'Activar sonido'} onClick={() => { setSound(v => !v); game.toast('El sonido no está disponible en esta vista de prueba.'); }}>{sound ? <Volume2 /> : <VolumeX />}</Button></div><div className="setting-row"><span>Idioma</span><b>Español</b></div><p className="notice">Vista de prueba. El progreso se reinicia al recargar.</p><Button variant="wood" onClick={() => setSettings(false)}>Cerrar</Button></section></div>}</div>;
}
function MissionRows({ large = false }: { large?: boolean }) {
 const game = useGame(); const rows = [{ name: 'Cosecha 2 veces', value: game.harvested, total: 2, reward: 20, image: carrot }, { name: 'Riega 3 veces', value: game.watered, total: 3, reward: 30, image: watering }, { name: 'Invita a un amigo', value: game.invited, total: 1, reward: 100, image: tito }];
 return <div className={large ? 'large-missions' : ''}>{rows.map(row => <div className="mission-item" key={row.name}><div className="mission-icon"><img src={row.image} alt="" /></div><div><b>{row.name}</b><small>{Math.min(row.value, row.total)} de {row.total} completados</small></div><span className="mission-reward">{row.value >= row.total ? <Check size={20} /> : `+${row.reward}`}</span></div>)}</div>;
}
function PlantingBed({ plot, index }: { plot: Plot; index: number }) {
 const game = useGame();
 const slots = plantedSlots(plot.state, plot.slots);
 const pct = plot.state === 'ready' ? 100 : plot.state === 'growing' && plot.start && plot.end ? Math.min(99, Math.max(1, Math.round((game.now - plot.start) / (plot.end - plot.start) * 100))) : 0;
 const left = plot.end ? Math.max(0, Math.ceil((plot.end - game.now) / 1000)) : 0;
 const stage = plot.state === 'ready' ? 4 : pct >= 50 ? 3 : pct >= 25 ? 2 : 1;
 if (plot.locked) return <Button variant="plot" className="furrow furrow-locked" aria-label={`Surco bloqueado: ${plot.locked}`} onClick={() => game.toast(`Surco bloqueado · ${plot.locked}`)}><img className="bed-ground" src={plantingBed} alt="" /><LockKeyhole className="lock-icon" /><span className="plot-caption">{plot.locked}</span></Button>;
 const canPlant = plot.state === 'empty' || plot.state === 'water';
 return <div className={`furrow furrow-user${plot.state === 'water' ? ' furrow-moist' : ''}`} role="group" aria-label={`Parcela ${index + 1}`}>
   <img className="bed-ground" src={plantingBed} alt="" />
   <span className="bed-count">{slots.length}/{BED_CAPACITY}</span>
   <div className={`bed-slots stage-${stage}`}>
    {Array.from({ length: BED_CAPACITY }, (_, slot) => {
     const occupied = slots.includes(slot);
     return <Button key={slot} variant="ghost" className="carrot-slot" aria-label={`${occupied ? 'Zanahoria' : 'Sembrar zanahoria'} ${slot + 1} en parcela ${index + 1}`} title={occupied ? 'Zanahoria sembrada' : 'Sembrar zanahoria'} disabled={occupied || !canPlant} onClick={() => game.plant(index, slot)}>{occupied ? <img src={cropImages[plot.crop]} alt="" /> : canPlant ? <Plus /> : null}</Button>;
    })}
   </div>
   {plot.state === 'growing' && <div className="plot-progress"><span style={{ width: `${pct}%` }} /></div>}
   <div className="bed-actions">
    {canPlant && slots.length < BED_CAPACITY && <Button variant="wood" className="bed-command" aria-label={`Sembrar todas en parcela ${index + 1}`} onClick={() => game.plant(index)}><Sprout /><span>Sembrar 9</span></Button>}
    {plot.state !== 'empty' && <Button variant={plot.state === 'ready' ? 'farm' : 'wood'} className="bed-command" disabled={plot.state === 'growing'} aria-label={`${plot.state === 'ready' ? 'Cosechar' : 'Regar'} parcela ${index + 1}`} onClick={() => game.harvest(index)}>{plot.state === 'ready' ? <><Sprout /><span>Cosechar</span></> : plot.state === 'water' ? <><Droplets /><span>Regar</span></> : <span>{left}s</span>}</Button>}
   </div>
 </div>;
}

export function FarmHome() {
 const game = useGame();
 return <FarmShell active="/"><div className="page-heading"><div><h2>¡Qué bueno verte, granjero!</h2><p>Un nuevo día para hacer crecer tu finquita.</p></div><span className="day-badge"><Sun size={20} /> Día soleado · 24°</span></div><div className="farm-layout"><div><section className="farm-scene" aria-label="Tu finca"><img className="world-image" src={world} alt="Finca ilustrada con una casita, un pozo y colinas verdes" /><span className="scene-label"><Leaf size={14} /> La finca de Tito · Nivel 5</span><div className="scene-tools"><Button variant="tool" asChild aria-label="Ir al pozo" title="Ir al pozo"><Link to="/pozo"><Droplets /></Link></Button><Button variant="tool" aria-label="Mensajes" title="Mensajes" onClick={() => game.toast('Tito: ¡Me alegra tenerte de vuelta en la finca!')}><Mail /></Button></div><img src={tito} alt="Tito, tu compañero granjero" className="tito-character" /><div className="tito-speech"><b>¡Hola, soy Tito!</b>Las zanahorias ya están listas. ¡Vamos a cosechar!</div><div className="plots-wrap"><div className="plots-counter"><Sprout size={15} /> Surcos: {game.plots.filter(p => !p.locked).length}/9 desbloqueados</div><div className="plots plots-iso">{game.plots.map((plot, index) => <PlantingBed key={index} plot={plot} index={index} />)}</div></div></section><div className="farm-bottom-note"><span><Sprout size={15} /> Hecho con cariño, cultivado por ti.</span><span><Droplets size={15} /> {game.water}/3 cubos de agua</span></div></div><aside className="farm-sidebar"><h3 className="sidebar-title"><Leaf size={19} /> Tu compañero de finca</h3><div className="companion"><img src={tito} alt="" /><div><b>Tito está de buen humor</b><p>¡Hoy será un gran día!</p></div></div><h3 className="sidebar-title"><Star size={19} /> Misiones del día</h3><MissionRows /><Button variant="wood" asChild className="mission-link"><Link to="/misiones">Ver misiones <ArrowLeft className="rotate-180" /></Link></Button><div className="well-preview"><img src={well} alt="Pozo de agua" /><div><h3>Un poquito de agua</h3><p>{game.water}/3 cubos disponibles</p><Button variant="farm" asChild><Link to="/pozo"><Droplets /> Visitar pozo</Link></Button></div></div></aside></div></FarmShell>;
}
function Heading({ title, subtitle }: { title: string; subtitle: string }) { return <div className="sub-heading"><Button variant="tool" asChild aria-label="Volver a la finca"><Link to="/"><ArrowLeft /></Link></Button><div><h2>{title}</h2><p>{subtitle}</p></div></div>; }
export function ShopScreen() {
 const game = useGame(); const items = [{ name: 'Regadera estrella', price: 120, image: watering, text: 'Una compañera para tus cultivos.' }, { name: 'Espantapájaros', price: 200, image: scarecrow, text: 'Un nuevo vecino para la finquita.' }, { name: 'Semillas de zanahoria', price: 40, image: carrot, text: 'El cultivo favorito de Tito.' }, { name: 'Semillas gigantes de zanahoria', price: 90, image: carrot, text: 'Zanahorias extra grandes para tu huerto.' }, { name: 'Pozo rústico', price: 350, image: well, text: 'Una pieza especial para tu colección.' }];
 return <FarmShell active="/tienda"><div className="sub-page"><Heading title="La tienda de Tito" subtitle={`${game.carrots.toLocaleString('en-US')} zanahorias · ${game.bought.length} objetos en tu mochila de prueba`} /><div className="shop-grid">{items.map(item => <article key={item.name} className="shop-item"><h3>{item.name}</h3><img src={item.image} alt={item.name} /><p>{item.text}</p><div className="price"><img src={carrot} alt="Zanahorias" /> {item.price}</div><Button variant="farm" disabled={game.bought.includes(item.name)} onClick={() => game.buy(item.name, item.price)}>{game.bought.includes(item.name) ? <><Check /> En tu mochila</> : <><ShoppingBasket /> Comprar</>}</Button></article>)}</div></div></FarmShell>;
}
export function MissionsScreen() { const game = useGame(); const completed = [game.harvested >= 2, game.watered >= 3, game.invited >= 1].filter(Boolean).length; return <FarmShell active="/misiones"><div className="sub-page"><Heading title="Misiones del día" subtitle={`${completed} de 3 misiones completadas`} /><MissionRows large /><div className="bonus-band"><div><h3><Gift className="inline" /> Un extra de cariño</h3><p>Completa las 3 misiones · +100 zanahorias</p></div><Button variant="farm" disabled={completed < 3 || game.bonus} onClick={game.claim}>{game.bonus ? 'Recogido' : completed < 3 ? <><LockKeyhole /> {completed}/3</> : 'Recoger bono'}</Button></div></div></FarmShell>; }
export function FriendsScreen() { const game = useGame(); const copy = async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/?invita=tito`); game.toast('Enlace de prueba copiado. Las invitaciones aún no están conectadas.'); } catch { game.toast('No se pudo copiar el enlace en este navegador.'); } }; return <FarmShell active="/amigos"><div className="sub-page"><Heading title="La finca es mejor juntos" subtitle="Un lugar para compartir con tus amigos." /><div className="friends-feature"><img src={tito} alt="Tito te da la bienvenida" /><div><h3>¡Que crezca la amistad!</h3><p>Una pequeña invitación para una gran aventura.</p><Button variant="farm" onClick={copy}><Copy /> Copiar enlace de prueba</Button></div></div><div className="friend-list"><h3 className="sidebar-title"><Users size={22} /> Tus amigos</h3><p className="friend-empty">Todavía no hay amigos en tu finca.</p><p className="notice">Las invitaciones reales no están conectadas. Puedes probar la misión sin enviar ningún mensaje.</p><Button variant="wood" onClick={game.invite}><Plus /> Probar invitación</Button></div></div></FarmShell>; }

export function WellScreen() { 
 const game = useGame(); 
 return <FarmShell active="/">
   <div className="sub-page">
     <Heading title="El pozo de la finca" subtitle="Agua fresca y recursos para tus pequeños cultivos." />
     <div className="water-screen">
       <img className="water-illustration" src={well} alt="Pozo de madera y piedra con agua fresca" />
       <h3>{game.water} de 3 cubos disponibles</h3>
       <div className="water-count">{[0,1,2].map(i => <Droplets key={i} className={i >= game.water ? 'used' : ''} />)}</div>
       <p>Tito ha preparado agua para el huerto.</p>
       
       <Button variant="farm" disabled={game.water === 3} onClick={game.collect}>
         <Droplets /> {game.water === 3 ? 'Tus cubos están llenos' : 'Rellenar cubos gratuitos'}
       </Button>

       <div className="mt-6 p-4 bg-black/20 rounded-xl space-y-3 border border-white/10">
         <h4 className="font-bold text-white">📺 Ver anuncios sin límite</h4>
         <p className="text-xs text-gray-300">Gana recursos extra apoyando la granja</p>
         
         <div className="flex gap-2">
           <Button variant="wood" className="flex-1" onClick={() => game.watchAdForResource('water')}>
             Ver anuncio (+1 Agua)
           </Button>
           <Button variant="wood" className="flex-1" onClick={() => game.watchAdForResource('carrot')}>
             Ver anuncio (+500 Zanahorias)
           </Button>
         </div>
       </div>

       <p className="notice">Puedes ver todos los anuncios que quieras para acelerar tu progreso.</p>
     </div>
   </div>
 </FarmShell>; 
}

export function MarketScreen() { 
  const game = useGame(); 
  const CONVERSION_RATE = 100000; 
  const usdValue = (game.carrots / CONVERSION_RATE).toFixed(2);
  const minWithdrawUSD = 5.00; 
  const currentUSDNum = game.carrots / CONVERSION_RATE;

  const handleWithdrawRequest = () => {
    if (currentUSDNum < minWithdrawUSD) {
      game.toast(`Necesitas al menos $${minWithdrawUSD} USD (${(minWithdrawUSD * CONVERSION_RATE).toLocaleString()} zanahorias) para solicitar un retiro.`);
      return;
    }
    game.toast('¡Solicitud de retiro registrada con éxito! Procesando pago...');
  };

  return (
    <FarmShell active="/mercado">
      <div className="sub-page">
        <Heading title="El mercado de la cosecha" subtitle="Convierte tus zanahorias de esfuerzo en dinero real." />
        
        <div className="market-balance bg-black/30 p-6 rounded-2xl border border-cyan-500/30 text-center space-y-2">
          <img src={carrot} alt="Zanahorias cosechadas" className="w-16 h-16 mx-auto" />
          <p className="text-gray-300">Tu balance actual</p>
          <strong className="text-3xl text-cyan-400">{game.carrots.toLocaleString('en-US')}</strong>
          <p className="text-sm text-gray-400">zanahorias</p>
          <div className="mt-4 pt-4 border-t border-white/10">
            <span className="text-xs text-pink-400 uppercase tracking-wider font-bold">Valor Estimado en USD</span>
            <div className="text-2xl font-extrabold text-white">${usdValue} USD</div>
            <small className="text-gray-400">Tasa oficial: 100,000 Zanahorias = $1.00 USD</small>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white/5 rounded-xl space-y-3">
          <h4 className="font-bold text-white">💰 Sistema de Retiros</h4>
          <p className="text-xs text-gray-300">Mínimo para retirar: <strong>$5.00 USD</strong> (500,000 zanahorias). Sigue viendo anuncios y cultivando para alcanzar la meta.</p>
          
          <Button 
            variant="farm" 
            className="w-full" 
            onClick={handleWithdrawRequest}
          >
            {currentUSDNum >= minWithdrawUSD ? '🚀 Solicitar Retiro Real' : `Faltan $${(minWithdrawUSD - currentUSDNum).toFixed(2)} para retirar`}
          </Button>
        </div>

        <div className="mt-4 flex gap-3">
          <Button variant="wood" asChild className="flex-1">
            <Link to="/"><Sprout /> Volver a cultivar</Link>
          </Button>
        </div>
      </div>
    </FarmShell>
  ); 
}
