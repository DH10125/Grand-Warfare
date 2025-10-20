import React from 'react';
import { Fortress as FortressType } from '@/types/game';

interface FortressProps {
  fortress: FortressType;
  side: 'left' | 'right';
  isAttackable?: boolean;
  onClick?: () => void;
}

const Fortress: React.FC<FortressProps> = ({ fortress, side, isAttackable = false, onClick }) => {
  const hpPercentage = (fortress.hitPoints / fortress.maxHitPoints) * 100;
  
  return (
    <div 
      className={`flex flex-col items-center justify-center p-4 ${
        isAttackable ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {/* Fortress Visual */}
      <div className={`relative w-32 h-48 bg-gradient-to-b from-gray-600 to-gray-800 rounded-t-lg border-4 ${
        isAttackable ? 'border-red-500 animate-pulse' : 'border-gray-900'
      }`}>
        {/* Castle towers */}
        <div className="absolute -top-6 left-2 w-6 h-10 bg-gray-700 border-2 border-gray-900"></div>
        <div className="absolute -top-6 right-2 w-6 h-10 bg-gray-700 border-2 border-gray-900"></div>
        
        {/* Castle gate */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-16 bg-gray-900 rounded-t-lg"></div>
        
        {/* Windows */}
        <div className="absolute top-8 left-4 w-4 h-4 bg-yellow-300"></div>
        <div className="absolute top-8 right-4 w-4 h-4 bg-yellow-300"></div>
        <div className="absolute top-16 left-4 w-4 h-4 bg-yellow-300"></div>
        <div className="absolute top-16 right-4 w-4 h-4 bg-yellow-300"></div>
        
        {/* HP Bar */}
        <div className="absolute -bottom-8 left-0 right-0">
          <div className="bg-gray-300 h-4 rounded-full overflow-hidden border-2 border-gray-600">
            <div 
              className={`h-full transition-all duration-300 ${
                hpPercentage > 50 ? 'bg-green-500' : hpPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${hpPercentage}%` }}
            ></div>
          </div>
          <div className="text-center font-bold text-sm mt-1">
            {fortress.hitPoints} / {fortress.maxHitPoints}
          </div>
        </div>
      </div>
      
      {/* Player Label */}
      <div className="mt-12 text-lg font-bold">
        {fortress.owner === 'player1' ? 'Player 1' : 'Player 2'}
      </div>
    </div>
  );
};

export default Fortress;
