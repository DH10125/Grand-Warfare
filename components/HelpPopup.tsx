'use client';

import React from 'react';

interface HelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpPopup: React.FC<HelpPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 border-4 border-yellow-400"
        style={{ backgroundColor: 'white' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-gray-800">🎮 How to Play Grand Warfare</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-3xl font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Game Rules */}
        <div className="bg-white rounded-xl p-6 mb-4 shadow-lg">
          <h3 className="text-2xl font-bold text-purple-700 mb-4">📖 Game Rules</h3>
          <ul className="space-y-3 text-gray-800">
            <li className="flex items-start gap-3">
              <span className="text-2xl">🎴</span>
              <div>
                <strong className="text-lg">Starting the Game:</strong>
                <p className="text-sm">Each player begins with 3 random cards dealt to their hand. These cards are your units!</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <strong className="text-lg">Placing Units:</strong>
                <p className="text-sm">Click a card in your hand, then click a highlighted spawn hex (Player 1 = blue left edge, Player 2 = red right edge) to place your unit on the battlefield.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <strong className="text-lg">Action Points (AP):</strong>
                <p className="text-sm">Units get 1 AP at the start of their owner's turn. Units cannot act on the turn they're placed. Use AP to move or attack!</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🏃</span>
              <div>
                <strong className="text-lg">Moving:</strong>
                <p className="text-sm">Select a unit with AP to see blue highlighted movement options. Click any blue hex to move there. Units can move up to their Speed value.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">⚔️</span>
              <div>
                <strong className="text-lg">Attacking:</strong>
                <p className="text-sm">Select a unit with AP to see red highlighted attack targets. Click any red hex to attack that enemy unit OR their fortress. Units can attack up to their Range value.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">💥</span>
              <div>
                <strong className="text-lg">Unit vs Unit Combat:</strong>
                <p className="text-sm">Combat is HP-based! The unit with higher HP wins and advances to the loser's hex. The winner takes damage equal to the loser's HP. If both units have equal HP, both are destroyed! <strong className="text-red-600">NEW: When a unit is defeated, their HP is also dealt as damage to their fortress!</strong></p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🏰</span>
              <div>
                <strong className="text-lg">Fortress Assault:</strong>
                <p className="text-sm"><strong className="text-purple-600">NEW: Reach enemy spawn zone!</strong> Move a unit to the enemy's spawn edge (opposite side of the map) to deal that unit's remaining HP as fortress damage, then the unit disappears. This is a powerful way to pressure the enemy fortress!</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🎁</span>
              <div>
                <strong className="text-lg">Collecting Cards:</strong>
                <p className="text-sm">Move onto unrevealed hexes (marked with "?") to reveal and collect hidden card rewards. Build your army!</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <strong className="text-lg">Victory:</strong>
                <p className="text-sm">Reduce your opponent's fortress to 0 HP to win! There are multiple ways to damage fortresses: direct attacks, defeating enemy units, or reaching their spawn zone. The game is now much faster-paced!</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Strategy Tips */}
        <div className="bg-white rounded-xl p-6 mb-4 shadow-lg">
          <h3 className="text-2xl font-bold text-green-700 mb-4">💡 Strategy Tips</h3>
          <ul className="space-y-2 text-gray-800">
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">★</span>
              <p className="text-sm"><strong>Balance Your Approach:</strong> Don't rush straight to the enemy fortress! Collect cards from the map to strengthen your army.</p>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">★</span>
              <p className="text-sm"><strong>Protect Your Units:</strong> Remember that attacking enemy units damages your own units too. Sometimes it's better to go around!</p>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">★</span>
              <p className="text-sm"><strong>Use Range Wisely:</strong> Units with higher range can attack from safety. Position them carefully!</p>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">★</span>
              <p className="text-sm"><strong>Speed Matters:</strong> Faster units can cover more ground and collect more rewards.</p>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">★</span>
              <p className="text-sm"><strong>Click Cards for Details:</strong> Click any card (in hand or on board) to see its full stats and abilities!</p>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500">★</span>
              <p className="text-sm"><strong className="text-purple-600">NEW STRATEGY:</strong> Consider rushing enemy spawn zones with strong units for massive fortress damage, or focus on defeating weak enemy units to chip away at their fortress!</p>
            </li>
          </ul>
        </div>

        {/* Close Button */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold text-xl px-12 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all"
          >
            Let's Play! 🎮
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpPopup;
