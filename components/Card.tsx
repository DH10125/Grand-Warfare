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
  // Determine if this card is in hand (no position) or on board (has position)
  const isInHand = !card.position;
  
  return (
    <div className="relative">
      <div
        className={`w-32 sm:w-40 h-44 sm:h-56 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg shadow-lg border-2 sm:border-4 cursor-pointer transition-all touch-manipulation ${
          isSelected ? 'border-blue-500 scale-105' : 'border-amber-400 hover:scale-102'
        } ${card.ap === 0 && !isInHand ? 'opacity-50' : ''}`}
        onClick={onClick}
      >
        {/* Card Title - Always shown */}
        <div className="absolute top-1 left-1 bg-white/90 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-bold text-gray-800 max-w-[80%] truncate">
          {card.name}
        </div>
        
        {/* Statistics - Only shown when card is on board (has position) */}
        {!isInHand && (
          <>
            {/* Hit Points - Top Right */}
            <div className="absolute top-1 right-1 bg-red-500 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded font-bold text-xs">
              {card.hitPoints}/{card.maxHitPoints}
            </div>
            
            {/* Speed - Bottom Right */}
            <div className="absolute bottom-1 right-1 bg-blue-500 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded font-bold text-xs flex items-center gap-1">
              <span>🏃</span>
              {card.speed}
            </div>
            
            {/* Range indicator - shows in a badge */}
            <div className="absolute top-1/2 right-1 transform -translate-y-1/2 bg-purple-500 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded-full font-bold text-xs">
              R:{card.range}
            </div>
            
            {/* AP indicator - shows in a badge on the left side */}
            <div className="absolute top-1/2 left-1 transform -translate-y-1/2 bg-green-500 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded-full font-bold text-xs">
              AP:{card.ap}
            </div>
          </>
        )}
        
        {/* Card Image - Center, larger when in hand */}
        <div className={`flex items-center justify-center h-full px-2 ${isInHand ? 'pt-6' : ''}`}>
          <Image 
            src={card.imageUrl} 
            alt={card.name}
            width={isInHand ? 100 : 80}
            height={isInHand ? 100 : 80}
            className={`object-contain ${isInHand ? 'sm:w-[140px] sm:h-[140px]' : 'sm:w-[120px] sm:h-[120px]'}`}
          />
        </div>
      </div>
      
      {/* Action Buttons */}
      {showActions && card.ap > 0 && (
        <div className="absolute -bottom-12 sm:-bottom-16 left-0 right-0 flex gap-1 sm:gap-2 justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAttack?.();
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded font-bold text-xs sm:text-sm touch-manipulation"
          >
            Attack
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMove?.();
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded font-bold text-xs sm:text-sm touch-manipulation"
          >
            Move
          </button>
        </div>
      )}
    </div>
  );
};

export default Card;
