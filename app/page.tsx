'use client';

import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import { GameMode } from '@/types/game';
import GameModeSelect from '@/components/GameModeSelect';
import OnlineLobby from '@/components/OnlineLobby';
import Game from '@/components/Game';
import MultiplayerGame from '@/components/MultiplayerGame';

type AppState = 'mode-select' | 'online-lobby' | 'local-game' | 'multiplayer-game';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('mode-select');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState<string>('');
  const [playerSlot, setPlayerSlot] = useState<'player1' | 'player2'>('player1');

  const handleModeSelect = (mode: GameMode) => {
    if (mode === 'local') {
      setAppState('local-game');
    } else {
      setAppState('online-lobby');
    }
  };

  const handleOnlineGameStart = (socketInstance: Socket, gameRoomId: string, slot: 'player1' | 'player2') => {
    setSocket(socketInstance);
    setRoomId(gameRoomId);
    setPlayerSlot(slot);
    setAppState('multiplayer-game');
  };

  const handleBackToMenu = () => {
    setAppState('mode-select');
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setRoomId('');
  };

  const handleDisconnect = () => {
    setAppState('online-lobby');
  };

  if (appState === 'mode-select') {
    return <GameModeSelect onModeSelect={handleModeSelect} />;
  }

  if (appState === 'online-lobby') {
    return (
      <OnlineLobby 
        onGameStart={handleOnlineGameStart}
        onBack={handleBackToMenu}
      />
    );
  }

  if (appState === 'local-game') {
    return (
      <div>
        {/* Back button for local games */}
        <button
          onClick={handleBackToMenu}
          className="fixed top-4 left-4 z-50 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg"
        >
          ← Back to Menu
        </button>
        <Game />
      </div>
    );
  }

  if (appState === 'multiplayer-game' && socket) {
    return (
      <MultiplayerGame
        socket={socket}
        roomId={roomId}
        playerSlot={playerSlot}
        onDisconnect={handleDisconnect}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-4xl font-bold mb-4">Loading...</h1>
      </div>
    </div>
  );
}
