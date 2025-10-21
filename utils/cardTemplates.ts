import { CardTemplate } from '@/types/game';

export const CARD_TEMPLATES: CardTemplate[] = [
  {
    name: 'Man',
    hitPoints: 200,
    maxHitPoints: 200,
    speed: 2,
    range: 1,
    imageUrl: '/cards/man.svg',
  },
  {
    name: 'Grass',
    hitPoints: 300,
    maxHitPoints: 300,
    speed: 1,
    range: 1,
    imageUrl: '/cards/grass.svg',
  },
  {
    name: 'Mouse',
    hitPoints: 30,
    maxHitPoints: 30,
    speed: 2,
    range: 1,
    imageUrl: '/cards/mouse.svg',
  },
];
