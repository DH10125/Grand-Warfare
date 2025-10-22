'use client';

import React, { useState } from 'react';
import { GameMode } from '@/types/game';

interface GameModeSelectProps {
  onModeSelect: (mode: GameMode) => void;
}

const GameModeSelect: React.FC<GameModeSelectProps> = ({ onModeSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white/90 rounded-3xl p-8 shadow-2xl max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">⚔️ Grand Warfare</h1>
          <p className="text-lg text-gray-600">Choose your game mode</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => onModeSelect('local')}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white p-6 rounded-xl font-bold text-xl shadow-lg transform hover:scale-105 transition-all"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">🏠</span>
              <div className="text-left">
                <div>Local 2-Player</div>
                <div className="text-sm font-normal opacity-90">Play on the same device</div>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => onModeSelect('online')}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white p-6 rounded-xl font-bold text-xl shadow-lg transform hover:scale-105 transition-all"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">🌐</span>
              <div className="text-left">
                <div>Online Multiplayer</div>
                <div className="text-sm font-normal opacity-90">Play with friends online</div>
              </div>
            </div>
          </button>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>🎮 Experience epic hex-based tactical warfare!</p>
        </div>
      </div>
    </div>
  );
};

export default GameModeSelect;