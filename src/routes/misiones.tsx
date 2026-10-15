import { createFileRoute } from '@tanstack/react-router';
import { MissionsScreen, farmMeta } from '@/components/farm-game';
export const Route = createFileRoute('/misiones')({ head: () => farmMeta('Misiones del día', 'Cosecha, riega y completa las misiones diarias junto a Tito.'), component: MissionsScreen });