import { createFileRoute } from '@tanstack/react-router';
import { FarmHome, farmMeta } from '@/components/farm-game';
export const Route = createFileRoute('/')({
  head: () => farmMeta('Tu finca', 'Cultiva un pequeño mundo junto a Tito: una finca ilustrada llena de zanahorias, amistad y aventuras.'),
  component: FarmHome,
});
