'use client';

import React from 'react';
import { Card as CardType } from '@/types/game';
import Image from 'next/image';

interface CardDetailPopupProps {
  card: CardType | null;
  onClose: () => void;
  onPlaceCard?: (card: CardType) => void;
}

const CardDetailPopup: React.FC<CardDetailPopupProps> = ({ card, onClose, onPlaceCard }) => {
  if (!card) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl shadow-2xl max-w-md w-full border-8 border-amber-600 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card Frame - Top Ornamental Border */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 h-4"></div>
        
        {/* Card Header */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-800 px-6 py-4 border-b-4 border-amber-900">
          <h2 className="text-3xl font-bold text-center text-white drop-shadow-lg">
            {card.name}
          </h2>
        </div>

        {/* Card Image Section */}
        <div className="bg-white p-6 flex items-center justify-center border-b-4 border-amber-600">
          <div className="relative w-64 h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-4 border-amber-400 shadow-inner flex items-center justify-center overflow-hidden">
            <Image 
              src={card.imageUrl} 
              alt={card.name}
              width={240}
              height={240}
              className="object-contain"
            />
          </div>
        </div>

        {/* Card Stats Section */}
        <div className="px-6 py-5 bg-amber-50">
          <h3 className="text-xl font-bold text-amber-900 mb-3 text-center border-b-2 border-amber-400 pb-2">
            ⚔️ Unit Statistics
          </h3>
          
          <div className="space-y-3">
            {/* HP */}
            <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow border-2 border-red-300">
              <div className="flex items-center gap-2">
                <span className="text-2xl">❤️</span>
                <span className="font-bold text-gray-700">Hit Points:</span>
              </div>
              <span className="text-xl font-bold text-red-600">
                {card.hitPoints} / {card.maxHitPoints}
              </span>
            </div>

            {/* Speed */}
            <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow border-2 border-blue-300">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏃</span>
                <span className="font-bold text-gray-700">Movement Speed:</span>
              </div>
              <span className="text-xl font-bold text-blue-600">
                {card.speed} hexes
              </span>
            </div>

            {/* Range */}
            <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow border-2 border-purple-300">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <span className="font-bold text-gray-700">Attack Range:</span>
              </div>
              <span className="text-xl font-bold text-purple-600">
                {card.range} hexes
              </span>
            </div>

            {/* Action Points (if on board) */}
            {card.position && (
              <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow border-2 border-green-300">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <span className="font-bold text-gray-700">Action Points:</span>
                </div>
                <span className={`text-xl font-bold ${card.ap > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  {card.ap > 0 ? '✓ Ready' : '✗ Used'}
                </span>
              </div>
            )}
          </div>

          {/* Owner Indicator */}
          <div className="mt-4 text-center">
            <span className={`inline-block px-6 py-2 rounded-full font-bold text-white shadow-lg ${
              card.owner === 'player1' ? 'bg-blue-500' : 'bg-red-500'
            }`}>
              {card.owner === 'player1' ? '🔵 Player 1' : '🔴 Player 2'}
            </span>
          </div>
        </div>

        {/* Card Frame - Bottom Ornamental Border */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 h-4"></div>

        {/* Close Instruction */}
        <div className="bg-amber-800 text-amber-100 text-center py-3 text-sm">
          Click anywhere outside to close
        </div>
      </div>
    </div>
  );
};

export default CardDetailPopup;
