import { HexPosition, HexTile, CardTemplate } from '@/types/game';
import { CARD_TEMPLATES } from './cardTemplates';

export const HEX_SIZE = 40;

// Convert hex coordinates to pixel coordinates (pointy-topped hexes)
export function hexToPixel(hex: HexPosition): { x: number; y: number } {
  const x = HEX_SIZE * (Math.sqrt(3) * hex.q + Math.sqrt(3) / 2 * hex.r);
  const y = HEX_SIZE * (3 / 2 * hex.r);
  return { x, y };
}

// Calculate distance between two hexagons
export function hexDistance(a: HexPosition, b: HexPosition): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}

// Get hexagons within range
export function getHexesInRange(center: HexPosition, range: number): HexPosition[] {
  const results: HexPosition[] = [];
  for (let q = -range; q <= range; q++) {
    for (let r = Math.max(-range, -q - range); r <= Math.min(range, -q + range); r++) {
      results.push({ q: center.q + q, r: center.r + r });
    }
  }
  return results;
}

// Generate a hexagonal grid
export function generateHexGrid(size: number): HexPosition[] {
  const hexes: HexPosition[] = [];
  const radius = Math.ceil(Math.sqrt(size / 3));
  
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      if (hexes.length < size) {
        hexes.push({ q, r });
      }
    }
  }
  
  return hexes.slice(0, size);
}

// Generate a corridor-style grid (rectangular, left-to-right)
export function generateCorridorGrid(length: number = 10, width: number = 4): HexPosition[] {
  const hexes: HexPosition[] = [];
  
  for (let q = 0; q < length; q++) {
    for (let r = 0; r < width; r++) {
      hexes.push({ q, r });
    }
  }
  
  return hexes;
}

// Generate corridor grid with hidden card rewards
export function generateCorridorGridWithRewards(length: number = 10, width: number = 4): HexTile[] {
  const hexes: HexTile[] = [];
  
  for (let q = 0; q < length; q++) {
    for (let r = 0; r < width; r++) {
      // Don't place rewards on spawn edges (first and last columns)
      const isSpawnEdge = q === 0 || q === length - 1;
      
      // Determine terrain type (10% chance of special terrain)
      let terrainType: 'normal' | 'slow' | 'dangerous' = 'normal';
      if (!isSpawnEdge && Math.random() < 0.1) {
        terrainType = Math.random() < 0.5 ? 'slow' : 'dangerous';
      }
      
      // Assign random card rewards to non-spawn hexes
      // Some hexes may have no reward (about 30% chance of no reward for variety)
      let reward: CardTemplate | undefined = undefined;
      if (!isSpawnEdge && Math.random() > 0.3) {
        // Better rewards are placed further from the spawn edges
        const distanceFromEdge = Math.min(q, length - 1 - q);
        const rewardQuality = Math.min(distanceFromEdge / (length / 2), 1);
        
        // Higher quality = more likely to get better cards
        if (rewardQuality > 0.6 && Math.random() > 0.5) {
          // Better cards (Patch of grass)
          reward = CARD_TEMPLATES[1];
        } else if (rewardQuality > 0.3 && Math.random() > 0.4) {
          // Medium cards (Man)
          reward = CARD_TEMPLATES[0];
        } else {
          // Weaker cards (Mouse)
          reward = CARD_TEMPLATES[2];
        }
      }
      
      hexes.push({
        q,
        r,
        reward,
        isRevealed: isSpawnEdge, // Spawn edges are always revealed
        isCollected: false,
        terrainType,
      });
    }
  }
  
  return hexes;
}

// Get spawn edge tiles for a corridor grid
export function getSpawnEdges(length: number, width: number) {
  const leftEdge: HexPosition[] = [];
  const rightEdge: HexPosition[] = [];
  
  for (let r = 0; r < width; r++) {
    leftEdge.push({ q: 0, r });
    rightEdge.push({ q: length - 1, r });
  }
  
  return { leftEdge, rightEdge };
}

// Check if two hex positions are equal
export function hexEqual(a: HexPosition, b: HexPosition): boolean {
  return a.q === b.q && a.r === b.r;
}

// Calculate distance from a hex to a fortress (at edge of corridor)
export function hexDistanceToFortress(
  hex: HexPosition,
  fortressOwner: 'player1' | 'player2',
  corridorLength: number
): number {
  // Player 1 fortress is at the left edge (q = -1), Player 2 at right edge (q = corridorLength)
  const fortressQ = fortressOwner === 'player1' ? -1 : corridorLength;
  
  // Calculate distance to the nearest point on the fortress edge
  // For simplicity, we calculate distance to a virtual hex at the fortress position
  // using the same r-coordinate as the unit
  return hexDistance(hex, { q: fortressQ, r: hex.r });
}
