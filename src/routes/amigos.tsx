import { createFileRoute } from '@tanstack/react-router';
import { FriendsScreen, farmMeta } from '@/components/farm-game';
export const Route = createFileRoute('/amigos')({ head: () => farmMeta('Amigos de la finca', 'Comparte la aventura de Mi Finquita del Conejo con tus amigos.'), component: FriendsScreen });