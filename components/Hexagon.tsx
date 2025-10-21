import React from 'react';
import { HexTile } from '@/types/game';
import { hexToPixel, HEX_SIZE } from '@/utils/hexUtils';

interface HexagonProps {
  tile: HexTile; // Changed from position to tile
  isHighlighted?: boolean;
  isAttackable?: boolean;
  onClick?: () => void;
  hasCard?: boolean;
  isSpawnEdge?: boolean;
  spawnOwner?: 'player1' | 'player2';
}

const Hexagon: React.FC<HexagonProps> = ({ 
  tile, // Changed from position
  isHighlighted = false, 
  isAttackable = false,
  onClick,
  hasCard = false,
  isSpawnEdge = false,
  spawnOwner
}) => {
  const { x, y } = hexToPixel(tile);
  
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
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
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
          strokeWidth="3"
          opacity="0.8"
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
    </g>
  );
};

export default Hexagon;
