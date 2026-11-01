import { createFileRoute } from '@tanstack/react-router';
import { ShopScreen, farmMeta } from '@/components/farm-game';
export const Route = createFileRoute('/tienda')({ head: () => farmMeta('La tienda de Tito', 'Fertilizantes, espantapájaros y regadera estrella para cuidar las zanahorias de tu finquita.'), component: ShopScreen });