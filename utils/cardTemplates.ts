import { CardTemplate } from '@/types/game';

export const CARD_TEMPLATES: CardTemplate[] = [
  {
    name: 'Man',
    hitPoints: 200,
    maxHitPoints: 200,
    attackDamage: 40,
    speed: 2,
    range: 1,
    imageUrl: '/cards/man.svg',
  },
  {
    name: 'Patch of grass',
    hitPoints: 300,
    maxHitPoints: 300,
    attackDamage: 80,
    speed: 1,
    range: 1,
    imageUrl: '/cards/grass.svg',
  },
  {
    name: 'Mouse',
    hitPoints: 30,
    maxHitPoints: 30,
    attackDamage: 5,
    speed: 2,
    range: 1,
    imageUrl: '/cards/mouse.svg',
  },
];
