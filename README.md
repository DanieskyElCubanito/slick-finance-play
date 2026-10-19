# Mi Finquita del Conejo

Juego de finca ilustrada en español con Tito, nueve parcelas y nueve posiciones por parcela.

## Estado actual

El progreso vive en memoria y se reinicia al recargar. No hay base de datos, cuentas, anuncios reales, pagos ni retiros conectados. Publicar en Vercel no cambia estas limitaciones.

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

- Abre `/`, cosecha, siembra una posición, completa las nueve y riega.
- Recarga directamente `/tienda`, `/misiones`, `/amigos`, `/pozo` y `/mercado`: deben aparecer sus páginas, no un 404.
- Comprueba las imágenes y que los botones funcionan.
- Recargar reinicia el progreso hasta implementar guardado real.

Si falla la compilación, consulta **Build Logs**. Si una página falla, consulta los registros de funciones de Vercel. El despliegue externo todavía debe verificarse en tu cuenta; estas instrucciones no representan una publicación ya realizada.

## 3. Tu Supabase

Conéctalo primero en **Lovable → Ajustes → General → External Supabase → Connect**. El propietario realiza esa conexión desde la interfaz.

Conectarlo no guarda partidas automáticamente: después hay que implementar identidad de jugadores, tablas, permisos por jugador y lectura/escritura del progreso. No se incluyen tablas vacías ni guardado ficticio en esta preparación.

Cuando se implemente la integración:

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
