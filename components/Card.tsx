import React from 'react';
import { Card as CardType } from '@/types/game';
import Image from 'next/image';

interface CardProps {
  card: CardType;
  isSelected?: boolean;
  onClick?: () => void;
  onAttack?: () => void;
  onMove?: () => void;
  showActions?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  card, 
  isSelected = false, 
  onClick, 
  onAttack,
  onMove,
  showActions = false
}) => {
  return (
    <div className="relative">
      <div
        className={`w-40 h-56 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg shadow-lg border-4 cursor-pointer transition-all ${
          isSelected ? 'border-blue-500 scale-105' : 'border-amber-400 hover:scale-102'
        } ${card.hasActed ? 'opacity-50' : ''}`}
        onClick={onClick}
      >
        {/* Card Title - Top Left */}
        <div className="absolute top-1 left-1 bg-white/90 px-2 py-1 rounded text-xs font-bold text-gray-800">
          {card.name}
        </div>
        
        {/* Hit Points - Top Right */}
        <div className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded font-bold text-xs">
          {card.hitPoints}/{card.maxHitPoints}
        </div>
        
        {/* Card Image - Center */}
        <div className="flex items-center justify-center h-full">
          <Image 
            src={card.imageUrl} 
            alt={card.name}
            width={120}
            height={120}
            className="object-contain"
          />
        </div>
        
        {/* Attack Damage - Bottom Left */}
        <div className="absolute bottom-1 left-1 bg-orange-500 text-white px-2 py-1 rounded font-bold text-xs flex items-center gap-1">
          <span>⚔️</span>
          {card.attackDamage}
        </div>
        
        {/* Speed - Bottom Right */}
        <div className="absolute bottom-1 right-1 bg-blue-500 text-white px-2 py-1 rounded font-bold text-xs flex items-center gap-1">
          <span>🏃</span>
          {card.speed}
        </div>
        
        {/* Range indicator - shows in a badge */}
        <div className="absolute top-1/2 right-1 transform -translate-y-1/2 bg-purple-500 text-white px-2 py-1 rounded-full font-bold text-xs">
          R:{card.range}
        </div>
      </div>
      
      {/* Action Buttons */}
      {showActions && !card.hasActed && (
        <div className="absolute -bottom-16 left-0 right-0 flex gap-2 justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAttack?.();
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold text-sm"
          >
            Attack
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove?.();
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-bold text-sm"
          >
            Move
          </button>
        </div>
      )}
    </div>
  );
};

export default Card;
