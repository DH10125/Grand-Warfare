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
  
  // Determine damage state based on HP percentage
  const getDamageState = () => {
    if (hpPercentage > 75) return 'pristine';
    if (hpPercentage > 50) return 'damaged';
    if (hpPercentage > 25) return 'heavy';
    return 'critical';
  };
  
  const damageState = getDamageState();
  
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
      <div className={`relative w-40 h-56 bg-gradient-to-b ${
        damageState === 'pristine' ? 'from-gray-600 to-gray-800' :
        damageState === 'damaged' ? 'from-gray-700 to-gray-900' :
        damageState === 'heavy' ? 'from-red-900 to-gray-900' :
        'from-red-950 to-black'
      } rounded-t-lg border-4 ${
        isAttackable ? 'border-red-500 animate-pulse' : 'border-gray-900'
      }`}>
        {/* Castle towers - visibility based on damage */}
        {damageState !== 'critical' && (
          <>
            <div className={`absolute -top-6 left-2 w-6 h-10 bg-gray-700 border-2 border-gray-900 ${
              damageState === 'heavy' ? 'opacity-50' : ''
            }`}></div>
            <div className={`absolute -top-6 right-2 w-6 h-10 bg-gray-700 border-2 border-gray-900 ${
              damageState === 'heavy' ? 'opacity-50' : ''
            }`}></div>
          </>
        )}
        
        {/* Damage cracks */}
        {damageState !== 'pristine' && (
          <>
            <div className="absolute top-12 left-4 w-16 h-1 bg-red-900 rotate-45"></div>
            <div className="absolute top-20 right-6 w-12 h-1 bg-red-900 -rotate-45"></div>
          </>
        )}
        
        {damageState === 'heavy' && (
          <>
            <div className="absolute top-24 left-8 w-10 h-1 bg-red-900 rotate-12"></div>
            <div className="absolute top-32 right-4 w-14 h-1 bg-red-900 -rotate-12"></div>
          </>
        )}
        
        {damageState === 'critical' && (
          <>
            <div className="absolute top-8 left-2 w-20 h-2 bg-orange-600"></div>
            <div className="absolute top-28 right-2 w-16 h-2 bg-orange-600"></div>
            <div className="absolute top-40 left-4 w-12 h-2 bg-orange-600"></div>
          </>
        )}
        
        {/* Castle gate */}
        <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-16 ${
          damageState === 'critical' ? 'bg-red-900' : 'bg-gray-900'
        } rounded-t-lg`}></div>
        
        {/* Windows - fade out as damage increases */}
        {damageState !== 'critical' && (
          <>
            <div className={`absolute top-8 left-6 w-4 h-4 ${
              damageState === 'heavy' ? 'bg-orange-500' : 'bg-yellow-300'
            }`}></div>
            <div className={`absolute top-8 right-6 w-4 h-4 ${
              damageState === 'heavy' ? 'bg-orange-500' : 'bg-yellow-300'
            }`}></div>
          </>
        )}
        {damageState === 'pristine' && (
          <>
            <div className="absolute top-20 left-6 w-4 h-4 bg-yellow-300"></div>
            <div className="absolute top-20 right-6 w-4 h-4 bg-yellow-300"></div>
          </>
        )}
      </div>
      
      {/* HP Bar - Below fortress */}
      <div className="mt-2 w-40">
        <div className="bg-gray-300 h-6 rounded-full overflow-hidden border-2 border-gray-600">
          <div 
            className={`h-full transition-all duration-300 ${
              hpPercentage > 50 ? 'bg-green-500' : hpPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${hpPercentage}%` }}
          ></div>
        </div>
        <div className="text-center font-bold text-sm mt-1 text-white">
          {fortress.hitPoints} / {fortress.maxHitPoints} HP
        </div>
      </div>
    </div>
  );
};

export default Fortress;
