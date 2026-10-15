import { createFileRoute } from '@tanstack/react-router';
import { WellScreen, farmMeta } from '@/components/farm-game';
export const Route = createFileRoute('/pozo')({ head: () => farmMeta('El pozo de la finca', 'Recoge agua fresca para cuidar los cultivos de tu finquita.'), component: WellScreen });