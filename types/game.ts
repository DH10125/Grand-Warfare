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
  ap: number; // Action points (0 or 1)
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
  corridorLength: number; // Number of columns (q-axis)
  corridorWidth: number;  // Number of rows (r-axis)
  leftSpawnEdge: HexPosition[];
  rightSpawnEdge: HexPosition[];
}

export type CardTemplate = Omit<Card, 'id' | 'owner' | 'position' | 'ap'>;
