# Mi Finquita del Conejo

Juego de finca ilustrada en español con Tito, nueve parcelas y nueve posiciones por parcela.

## Estado actual

Supabase externo está conectado. El panel privado guarda sesiones administrativas y propuestas de IA. Las partidas personales usan identidad firmada de Telegram y guardado en Supabase. Siembra, riego, cosecha, compras y misiones base se calculan en el servidor y se registran atómicamente con control de versión. Las partidas nuevas no heredan saldos de prueba. La prueba completa con una identidad real dentro de Telegram sigue pendiente; pagos y retiros no están activos.

### Panel de economía con IA

En Ajustes → Panel del propietario (o `/admin`), abre el juego como Mini App desde el bot de Telegram configurado. Solo la identidad firmada de Telegram con rol de propietario puede entrar. No se acepta escribir un ID. Las pruebas firmadas caducan en cinco minutos, no pueden reutilizarse y la sesión privada dura una hora.

El propietario puede describir un objetivo, generar una propuesta de precios, tiempos y recompensas, comparar valores actuales y propuestos, consultar el historial privado y descargar el borrador. Ninguna propuesta se aplica automáticamente. Si falla la IA, se conserva la solicitud sin reintentos automáticos.

Para abrir la Mini App configura en BotFather la URL publicada del juego para el bot cuyo token guardaste. La comprobación completa con la cuenta real del propietario debe hacerse dentro de Telegram.

En Vercel añade las variables privadas `TELEGRAM_BOT_TOKEN`, `LOVABLE_API_KEY`, `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`, además de las variables públicas generadas de Supabase. Copia sus valores desde sus ajustes seguros, nunca al repositorio. Las migraciones del panel ya fueron aplicadas al proyecto Supabase conectado.

### Economía y servicios pendientes

- Solo zanahorias: cultivo regado de 4 horas; fertilizante o lluvia semanal de 2 horas. Las siembras nuevas sin agua se pierden a las 24 horas salvo protección del espantapájaros.
- Fertilizante x5: 1,000 zanahorias; Espantapájaros permanente: 10,000; Regadera Estrella permanente: 25,000 (2 surcos por balde).
- Recompensas de anuncios desactivadas hasta disponer de comprobación independiente del proveedor. Gigapub placement 8567 y `window.showGiga()` están identificados, pero una promesa del navegador no es prueba válida para acreditar premios. No se concede ninguna recompensa simulada.
- Pozo de Oro (1.5 TON) y Tractor Autónomo (3 TON) están desactivados. No hay automatización con el juego cerrado.
- Referidos, cashback del 5% y comisión TON del 1% aún no conectados. Se eliminaron las invitaciones simuladas y los créditos arbitrarios del navegador.
- Conversión prevista: 100,000 zanahorias por USD; mínimo previsto de USD 5 (500,000 zanahorias). No representa dinero disponible y no permite solicitar retiros.
- Las reglas puras y los cambios de partida tienen pruebas en `src/test/farm-economy.test.ts` y `src/test/saved-game.test.ts`. Los tiempos guardados permiten resolver crecimiento y marchitamiento al volver; no hay tractor automático.
- El propietario elige TON y comunica disponer de 10000 TON. No se ha verificado ni conectado una tesorería. Hace falta su dirección pública, comprobar fondos en cadena y diseñar transferencias con aprobación desde su propia billetera; nunca guardar la frase semilla.
- Mini App: https://t.me/VFarmerBunny_bot/game. En BotFather debe apuntar al despliegue vigente y usar el mismo bot que el token privado configurado.

## 1. GitHub

En Lovable abre **Ajustes del proyecto → Git** y revisa la conexión y la rama sincronizada. Si ya está conectado, comprueba allí que los cambios llegaron al repositorio. Si no está conectado, conecta GitHub desde esa pantalla: crea un repositorio privado nuevo, no permite seleccionar uno existente.

No desconectes una conexión existente para actualizarla: reconectar crea otro repositorio. Conserva `bun.lock` y todas las imágenes de `src/assets`.

**Seguridad:** no subas archivos `.env`, contraseñas o claves privadas. Antes de trabajar localmente, añade `.env`, `.env.*` y `.vercel/` a tu `.gitignore` (ese archivo está administrado y no se pudo modificar desde esta preparación). Configura credenciales en los ajustes de cada servicio.

## 2. Vercel

1. Elige **Add New → Project** e importa el repositorio sincronizado.
2. Usa la raíz del repositorio como **Root Directory**.
3. Selecciona **Other** como framework y **Node.js 22.x**.
4. `vercel.json` establece `bun install --frozen-lockfile` y `bun run build`.
5. Deja **Output Directory** sin sobrescribir: Nitro genera `.vercel/output` con la API de salida de Vercel. No uses `dist` ni una redirección global a `index.html`.
6. Pulsa **Deploy**. Los cambios posteriores de la rama de producción se publican mediante la integración Git de Vercel.

Se mantiene TanStack Start con renderizado de servidor. `vite.config.ts` selecciona Vercel fuera de Lovable; las publicaciones administradas por Lovable conservan su destino propio.

### Comprobar la publicación

- Abre el juego desde Telegram, verifica tu cuenta, siembra una posición, completa las nueve y riega.
- Recarga directamente `/tienda`, `/misiones`, `/amigos`, `/pozo` y `/mercado`: deben aparecer sus páginas, no un 404.
- Comprueba las imágenes y que los botones funcionan.
- Recarga y confirma que la partida se conserva. Repite desde otra cuenta de Telegram para comprobar separación de partidas.

Si falla la compilación, consulta **Build Logs**. Si una página falla, consulta los registros de funciones de Vercel. El despliegue externo todavía debe verificarse en tu cuenta; estas instrucciones no representan una publicación ya realizada.

## 3. Tu Supabase

El proyecto externo ya está conectado mediante la integración generada de Lovable.

Las tablas privadas `player_profiles`, `player_sessions`, `player_games` y `game_events` guardan perfiles, sesiones, partidas y movimientos. El navegador no tiene acceso directo: cada función valida la cookie de una identidad de Telegram verificada. El panel del propietario mantiene su autorización separada.

Para desplegar la integración:

- Copia los nombres exactos de las variables utilizadas por la integración generada a **Vercel → Project Settings → Environment Variables**, en Production y Preview según corresponda, y vuelve a desplegar.
- Solo la URL y la clave pública/publicable pueden usar `VITE_`. Una clave privada o `service_role` nunca debe tener ese prefijo ni subirse a GitHub.
- Si se añade inicio de sesión, configura la **Site URL** de Supabase Auth con el dominio final y las **Redirect URLs** con las páginas públicas de retorno realmente implementadas.
- Aplica las migraciones al Supabase conectado; GitHub y Vercel no las ejecutan automáticamente.
- Verifica con un jugador real que sembrar, recargar y volver a entrar recupera su propia partida sin acceso a partidas ajenas.

## Desarrollo local

Requisitos: Node.js 22.x y Bun.

```sh
bun install --frozen-lockfile
bun run dev
bun run test
```

Compilación externa con destino Vercel: `bun run build`.

Editor: https://lovable.dev/projects/00f26d58-4243-4729-b621-9c5785e7bea1
