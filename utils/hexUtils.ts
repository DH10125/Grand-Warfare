import { HexPosition } from '@/types/game';

export const HEX_SIZE = 40;

// Convert hex coordinates to pixel coordinates
export function hexToPixel(hex: HexPosition): { x: number; y: number } {
  const x = HEX_SIZE * (3 / 2 * hex.q);
  const y = HEX_SIZE * (Math.sqrt(3) / 2 * hex.q + Math.sqrt(3) * hex.r);
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

// Check if two hex positions are equal
export function hexEqual(a: HexPosition, b: HexPosition): boolean {
  return a.q === b.q && a.r === b.r;
}
