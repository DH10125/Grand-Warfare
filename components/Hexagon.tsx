import React from 'react';
import { HexTile } from '@/types/game';
import { hexToPixel, HEX_SIZE } from '@/utils/hexUtils';

interface HexagonProps {
  tile: HexTile; // Changed from position to tile
  isHighlighted?: boolean;
  isAttackable?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  hasCard?: boolean;
  isSpawnEdge?: boolean;
  spawnOwner?: 'player1' | 'player2';
}

const Hexagon: React.FC<HexagonProps> = ({ 
  tile, // Changed from position
  isHighlighted = false, 
  isAttackable = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  hasCard = false,
  isSpawnEdge = false,
  spawnOwner
}) => {
  const { x, y } = hexToPixel(tile);
  
  // Generate tooltip text
  let tooltipText = '';
  if (!tile.isRevealed && !isSpawnEdge && !hasCard) {
    tooltipText = 'Unrevealed hex - may contain a card reward';
    if (tile.terrainType === 'slow') {
      tooltipText += ' (Difficult Terrain: costs extra movement)';
    } else if (tile.terrainType === 'dangerous') {
      tooltipText += ' (Dangerous: small damage on entry)';
    }
  } else if (tile.isRevealed && tile.reward && !tile.isCollected && !hasCard) {
    tooltipText = `Card reward: ${tile.reward.name}`;
  } else if (tile.isCollected) {
    tooltipText = 'Reward already collected';
  }
  
  // Create hexagon path for pointy-topped hexes
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // Rotate by 30 degrees for pointy-top
    const px = HEX_SIZE * Math.cos(angle);
    const py = HEX_SIZE * Math.sin(angle);
    points.push(`${px},${py}`);
  }
  const pathData = points.join(' ');
  
  let fillColor = '#90EE90';
  let strokeColor = '#228B22';
  
  if (isAttackable) {
    fillColor = '#FF6B6B';
    strokeColor = '#CC0000';
  } else if (isHighlighted) {
    fillColor = '#87CEEB';
    strokeColor = '#4682B4';
  } else if (hasCard) {
    fillColor = '#FFE4B5';
    strokeColor = '#DEB887';
  } else if (!tile.isRevealed && !isSpawnEdge) {
    // Unrevealed hexes have a darker, mysterious appearance
    fillColor = '#A8A8A8';
    strokeColor = '#696969';
    
    // Tint based on terrain type (subtle hint)
    if (tile.terrainType === 'slow') {
      fillColor = '#9B8B7E'; // Brownish tint
    } else if (tile.terrainType === 'dangerous') {
      fillColor = '#A88888'; // Reddish tint
    }
  } else if (tile.isCollected) {
    // Collected hexes appear depleted
    fillColor = '#D3D3D3';
    strokeColor = '#A9A9A9';
  } else if (tile.reward && tile.isRevealed) {
    // Revealed hexes with rewards have a golden glow
    fillColor = '#FFD700';
    strokeColor = '#DAA520';
  } else if (isSpawnEdge && spawnOwner === 'player1') {
    fillColor = '#B3D9FF';
    strokeColor = '#4A90E2';
  } else if (isSpawnEdge && spawnOwner === 'player2') {
    fillColor = '#FFB3BA';
    strokeColor = '#F87171';
  }
  
  return (
    <g 
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      className="touch-manipulation"
    >
      {tooltipText && (
        <title>{tooltipText}</title>
      )}
      {/* Invisible larger hit area for better touch targeting */}
      {onClick && (
        <circle
          cx="0"
          cy="0"
          r={HEX_SIZE + 10}
          fill="transparent"
          stroke="none"
          style={{ cursor: 'pointer' }}
        />
      )}
      <polygon
        points={pathData}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="2"
        opacity="0.7"
      />
      {(isHighlighted || isAttackable) && (
        <polygon
          points={pathData}
          fill="none"
          stroke={isAttackable ? '#FF0000' : '#0000FF'}
          strokeWidth="4"
          opacity="0.9"
        />
      )}
      {/* Show question mark for unrevealed hexes */}
      {!tile.isRevealed && !isSpawnEdge && !hasCard && (
        <text
          x="0"
          y="5"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="24"
          fontWeight="bold"
        >
          ?
        </text>
      )}
      {/* Show card icon for revealed hexes with uncollected rewards */}
      {tile.isRevealed && tile.reward && !tile.isCollected && !hasCard && (
        <text
          x="0"
          y="5"
          textAnchor="middle"
          fill="#000000"
          fontSize="18"
          fontWeight="bold"
        >
          🎴
        </text>
      )}
      {/* Show checkmark for collected hexes */}
      {tile.isCollected && !hasCard && (
        <text
          x="0"
          y="5"
          textAnchor="middle"
          fill="#4CAF50"
          fontSize="20"
          fontWeight="bold"
        >
          ✓
        </text>
      )}
      {/* Show terrain indicator for revealed special terrain */}
      {tile.isRevealed && tile.terrainType === 'slow' && !tile.reward && !tile.isCollected && !hasCard && (
        <text
          x="0"
          y="5"
          textAnchor="middle"
          fill="#8B4513"
          fontSize="16"
          fontWeight="bold"
        >
          🪨
        </text>
      )}
      {tile.isRevealed && tile.terrainType === 'dangerous' && !tile.reward && !tile.isCollected && !hasCard && (
        <text
          x="0"
          y="5"
          textAnchor="middle"
          fill="#FF4500"
          fontSize="16"
          fontWeight="bold"
        >
          ⚠️
        </text>
      )}
    </g>
  );
};

export default Hexagon;
