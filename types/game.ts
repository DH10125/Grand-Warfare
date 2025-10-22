export interface Card {
  id: string;
  name: string;
  hitPoints: number;
  maxHitPoints: number;
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

export interface HexTile extends HexPosition {
  reward?: CardTemplate; // Hidden card reward
  isRevealed: boolean; // Has the player seen what's under this hex?
  isCollected: boolean; // Has the reward been collected?
  terrainType?: 'normal' | 'slow' | 'dangerous'; // Optional special terrain
}

export interface Fortress {
  hitPoints: number;
  maxHitPoints: number;
  owner: 'player1' | 'player2';
}

export interface GameState {
  hexagons: HexTile[]; // Changed from HexPosition[] to HexTile[]
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
  // Multiplayer specific fields
  gameMode?: 'local' | 'online';
  gameCode?: string;
  roomId?: string;
  players?: {
    player1?: PlayerInfo;
    player2?: PlayerInfo;
  };
}

export interface PlayerInfo {
  id: string;
  name?: string;
  isConnected: boolean;
  isReady: boolean;
}

export interface MultiplayerGameRoom {
  id: string;
  gameCode: string;
  gameState: GameState;
  players: {
    player1?: PlayerInfo;
    player2?: PlayerInfo;
  };
  createdAt: Date;
  isActive: boolean;
}

export type GameMode = 'local' | 'online';

export interface GameAction {
  type: 'PLACE_CARD' | 'MOVE_UNIT' | 'ATTACK_UNIT' | 'ATTACK_FORTRESS' | 'END_TURN' | 'SELECT_CARD';
  payload: any;
  playerId: string;
  timestamp: number;
}

export type CardTemplate = Omit<Card, 'id' | 'owner' | 'position' | 'ap'>;
