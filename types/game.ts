export interface Card {
  id: string;
  name: string;
  hitPoints: number;
  maxHitPoints: number;
  attackDamage: number;
  speed: number;
  range: number;
  imageUrl: string;
  owner: 'player1' | 'player2';
  position?: HexPosition;
  hasActed?: boolean;
}

export interface HexPosition {
  q: number;
  r: number;
}

export interface Fortress {
  hitPoints: number;
  maxHitPoints: number;
  owner: 'player1' | 'player2';
}

export interface GameState {
  hexagons: HexPosition[];
  cards: Card[];
  fortresses: {
    player1: Fortress;
    player2: Fortress;
  };
  currentPlayer: 'player1' | 'player2';
  selectedCard: Card | null;
  winner: 'player1' | 'player2' | null;
}

export type CardTemplate = Omit<Card, 'id' | 'owner' | 'position' | 'hasActed'>;
