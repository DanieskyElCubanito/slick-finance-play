import { createFileRoute } from '@tanstack/react-router';
import { ShopScreen, farmMeta } from '@/components/farm-game';
export const Route = createFileRoute('/tienda')({ head: () => farmMeta('La tienda de Tito', 'Descubre semillas y objetos ilustrados para tu pequeña finca.'), component: ShopScreen });