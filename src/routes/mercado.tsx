import { createFileRoute } from '@tanstack/react-router';
import { MarketScreen, farmMeta } from '@/components/farm-game';
export const Route = createFileRoute('/mercado')({ head: () => farmMeta('Mercado de la cosecha', 'Consulta tus zanahorias en el mercado de prueba de la finca.'), component: MarketScreen });