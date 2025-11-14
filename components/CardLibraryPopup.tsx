'use client';

import React from 'react';
import Image from 'next/image';
import { CARD_TEMPLATES } from '@/utils/cardTemplates';

interface CardLibraryPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CardLibraryPopup: React.FC<CardLibraryPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-2xl border-8 border-amber-600 overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 h-4"></div>
        <div className="bg-gradient-to-r from-amber-700 to-amber-800 px-6 py-4 border-b-4 border-amber-900 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">📚 Card Library</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-300 text-3xl font-bold transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-amber-900 text-lg mb-6 text-center font-semibold">
            All available cards in Grand Warfare
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CARD_TEMPLATES.map((template, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg border-4 border-amber-400 overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-4 py-2 border-b-2 border-amber-800">
                  <h3 className="text-xl font-bold text-white text-center">{template.name}</h3>
                </div>

                {/* Card Image */}
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 flex items-center justify-center">
                  <div className="relative w-32 h-32 bg-white rounded-lg border-4 border-amber-400 shadow-inner flex items-center justify-center overflow-hidden">
                    <Image 
                      src={template.imageUrl} 
                      alt={template.name}
                      width={120}
                      height={120}
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Card Stats */}
                <div className="p-4 space-y-2">
                  {/* HP */}
                  <div className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2 border-2 border-red-300">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">❤️</span>
                      <span className="font-bold text-gray-700 text-sm">HP:</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      {template.hitPoints}
                    </span>
                  </div>

                  {/* Speed */}
                  <div className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2 border-2 border-blue-300">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🏃</span>
                      <span className="font-bold text-gray-700 text-sm">Speed:</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {template.speed}
                    </span>
                  </div>

                  {/* Range */}
                  <div className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-2 border-2 border-purple-300">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎯</span>
                      <span className="font-bold text-gray-700 text-sm">Range:</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">
                      {template.range}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 h-4"></div>
      </div>
    </div>
  );
};

export default CardLibraryPopup;
