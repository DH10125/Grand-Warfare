'use client';

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
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
  const [players, setPlayers] = useState<{ player1?: any; player2?: any }>({});

  // Initialize socket connection when entering online mode
  useEffect(() => {
    if (appState === 'online-lobby' && !socket) {
      const socketInstance = io({
        path: '/api/socket',
      });

      socketInstance.on('connect', () => {
        console.log('Connected to server from main app');
        setSocket(socketInstance);
      });

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from server');
        setSocket(null);
      });
    }

    // Cleanup when leaving online modes
    return () => {
      if (appState === 'mode-select' && socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, [appState]);

  const handleModeSelect = (mode: GameMode) => {
    if (mode === 'local') {
      setAppState('local-game');
    } else {
      setAppState('online-lobby');
    }
  };

  const handleOnlineGameStart = (socketInstance: Socket, gameRoomId: string, slot: 'player1' | 'player2', playersData: { player1?: any; player2?: any }) => {
    setSocket(socketInstance);
    setRoomId(gameRoomId);
    setPlayerSlot(slot);
    setPlayers(playersData);
    setAppState('multiplayer-game');
  };

  const handleBackToMenu = () => {
    setAppState('mode-select');
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setRoomId('');
    setPlayers({});
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
        socket={socket}
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
        players={players}
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
