import React from 'react';
import Image from 'next/image';
import { Fortress as FortressType } from '@/types/game';

interface FortressProps {
  fortress: FortressType;
  side: 'left' | 'right';
  isAttackable?: boolean;
  onClick?: () => void;
}

const Fortress: React.FC<FortressProps> = ({ fortress, side, isAttackable = false, onClick }) => {
  const hpPercentage = (fortress.hitPoints / fortress.maxHitPoints) * 100;
  
  // Determine which fortress image to use based on current HP
  const getFortressImage = () => {
    const maxHP = fortress.maxHitPoints;
    const currentHP = fortress.hitPoints;
    
    if (currentHP <= 0) return '/fortress/fortress-destroyed.svg';
    if (currentHP <= maxHP * 0.16) return '/fortress/fortress-critical.svg';
    if (currentHP <= maxHP * 0.33) return '/fortress/fortress-heavy.svg';
    if (currentHP <= maxHP * 0.50) return '/fortress/fortress-damaged.svg';
    if (currentHP <= maxHP * 0.66) return '/fortress/fortress-moderate.svg';
    if (currentHP <= maxHP * 0.83) return '/fortress/fortress-light.svg';
    if (currentHP < maxHP) return '/fortress/fortress-minor.svg';
    return '/fortress/fortress-pristine.svg';
  };
  
  const fortressImage = getFortressImage();
  
  return (
    <div 
      className={`flex flex-col items-center justify-center p-4 min-w-[200px] ${
        isAttackable ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {/* Player Label - Moved to top */}
      <div className="mb-2 text-lg font-bold text-white">
        {fortress.owner === 'player1' ? 'Player 1' : 'Player 2'}
      </div>
      
      {/* Fortress Visual */}
      <div className={`relative w-40 h-56 flex items-center justify-center ${
        isAttackable ? 'animate-pulse border-4 border-red-500 rounded-lg' : ''
      }`}>
        {/* Fortress Image */}
        <div className="w-32 h-40 relative">
          <Image
            src={fortressImage}
            alt="Fortress"
            width={128}
            height={160}
            className="object-contain"
          />
        </div>
      </div>
      
      {/* HP Bar - Below fortress */}
      <div className="mt-2 w-40">
        <div className="bg-gray-300 h-6 rounded-full overflow-hidden border-2 border-gray-600">
          <div 
            className={`h-full transition-all duration-300 ${
              hpPercentage > 50 ? 'bg-green-500' : hpPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.max(0, hpPercentage)}%` }}
          ></div>
        </div>
        <div className="text-center font-bold text-sm mt-1 text-white">
          {Math.max(0, fortress.hitPoints)} / {fortress.maxHitPoints} HP
        </div>
      </div>
    </div>
  );
};

export default Fortress;
