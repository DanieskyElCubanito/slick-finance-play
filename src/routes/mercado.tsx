import { createFileRoute } from '@tanstack/react-router';
import { MarketScreen, farmMeta } from '@/components/farm-game';
export const Route = createFileRoute('/mercado')({ head: () => farmMeta('Mercado de la cosecha', 'Consulta tus zanahorias ganadas y el estado de los servicios de retiro de tu finca.'), component: MarketScreen });