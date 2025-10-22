'use client';

import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { GameState, Card as CardType, HexPosition, GameAction } from '@/types/game';
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame';
import { generateCorridorGridWithRewards, getSpawnEdges } from '@/utils/hexUtils';
import { CARD_TEMPLATES } from '@/utils/cardTemplates';
import Game from './Game';

interface MultiplayerGameProps {
  socket: Socket;
  roomId: string;
  playerSlot: 'player1' | 'player2';
  onDisconnect: () => void;
}

const MultiplayerGame: React.FC<MultiplayerGameProps> = ({
  socket,
  roomId,
  playerSlot,
  onDisconnect,
}) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [connectionError, setConnectionError] = useState<string>('');

  // Initialize game immediately for testing
  useEffect(() => {
    if (!gameState) {
      initializeGameState(10, 4); // Default corridor dimensions
    }
  }, []);

  const {
    sendGameAction,
    syncGameState,
    isMyTurn,
    canPerformAction,
    isConnected,
  } = useMultiplayerGame({
    socket,
    roomId,
    playerSlot,
    gameState,
    setGameState,
  });

  // Handle socket events
  useEffect(() => {
    if (!socket) return;

    const handleGameStarted = (data: { gameCode: string; players: any; corridorLength: number; corridorWidth: number }) => {
      console.log('Game started event received:', data);
      // Initialize a fresh game state
      initializeGameState(data.corridorLength, data.corridorWidth);
    };

    const handleGameAction = (action: GameAction) => {
      console.log('Received multiplayer action:', action);
      // Process the action based on type
      handleRemoteAction(action);
    };

    const handlePlayerDisconnected = (data: { playerSlot: 'player1' | 'player2' }) => {
      setConnectionError(`${data.playerSlot === 'player1' ? 'Player 1' : 'Player 2'} disconnected`);
    };

    const handleDisconnect = () => {
      setConnectionError('Connection lost');
    };

    socket.on('game-started', handleGameStarted);
    socket.on('game-action', handleGameAction);
    socket.on('player-disconnected', handlePlayerDisconnected);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('game-started', handleGameStarted);
      socket.off('game-action', handleGameAction);
      socket.off('player-disconnected', handlePlayerDisconnected);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  // Initialize game state for multiplayer
  const initializeGameState = (corridorLength: number, corridorWidth: number) => {
    const hexagons = generateCorridorGridWithRewards(corridorLength, corridorWidth);
    const { leftEdge, rightEdge } = getSpawnEdges(corridorLength, corridorWidth);
    
    // Deal initial cards to both players (3 cards each)
    const dealRandomCards = (owner: 'player1' | 'player2', count: number) => {
      const dealtCards = [];
      for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * CARD_TEMPLATES.length);
        const template = CARD_TEMPLATES[randomIndex];
        const newCard = {
          ...template,
          id: `${owner}-initial-${i}-${Date.now()}-${Math.random()}`,
          owner,
          ap: 0,
        };
        dealtCards.push(newCard);
      }
      return dealtCards;
    };
    
    const player1InitialCards = dealRandomCards('player1', 3);
    const player2InitialCards = dealRandomCards('player2', 3);
    
    const initialState: GameState = {
      hexagons,
      cards: [...player1InitialCards, ...player2InitialCards],
      fortresses: {
        player1: {
          hitPoints: 3000,
          maxHitPoints: 3000,
          owner: 'player1',
        },
        player2: {
          hitPoints: 3000,
          maxHitPoints: 3000,
          owner: 'player2',
        },
      },
      currentPlayer: 'player1',
      selectedCard: null,
      winner: null,
      corridorLength,
      corridorWidth,
      leftSpawnEdge: leftEdge,
      rightSpawnEdge: rightEdge,
      gameMode: 'online',
      roomId,
    };
    
    setGameState(initialState);
  };

  // Handle remote actions from other players
  const handleRemoteAction = (action: GameAction) => {
    if (!gameState) return;

    // Only process actions from the opponent
    const isOpponentAction = action.playerId !== socket.id;
    if (!isOpponentAction) return;

    // Create a new game state based on the action
    let newGameState = { ...gameState };

    switch (action.type) {
      case 'PLACE_CARD':
        newGameState = handlePlaceCardAction(newGameState, action.payload);
        break;
      case 'MOVE_UNIT':
        newGameState = handleMoveUnitAction(newGameState, action.payload);
        break;
      case 'ATTACK_UNIT':
        newGameState = handleAttackUnitAction(newGameState, action.payload);
        break;
      case 'ATTACK_FORTRESS':
        newGameState = handleAttackFortressAction(newGameState, action.payload);
        break;
      case 'END_TURN':
        newGameState = handleEndTurnAction(newGameState);
        break;
      case 'SELECT_CARD':
        newGameState = handleSelectCardAction(newGameState, action.payload);
        break;
    }

    setGameState(newGameState);
  };

  // Action handlers for remote actions
  const handlePlaceCardAction = (state: GameState, payload: { cardId: string; position: HexPosition }) => {
    const { cardId, position } = payload;
    const updatedCards = state.cards.map(c => 
      c.id === cardId ? { ...c, position, ap: 0 } : c
    );
    return { ...state, cards: updatedCards, selectedCard: null };
  };

  const handleMoveUnitAction = (state: GameState, payload: { cardId: string; targetPosition: HexPosition }) => {
    const { cardId, targetPosition } = payload;
    const updatedCards = state.cards.map(c =>
      c.id === cardId ? { ...c, position: targetPosition, ap: 0 } : c
    );
    return { ...state, cards: updatedCards, selectedCard: null };
  };

  const handleAttackUnitAction = (state: GameState, payload: { attackerId: string; targetPosition: HexPosition; result: any }) => {
    // Handle combat result from remote player
    const { result } = payload;
    return { ...state, ...result, selectedCard: null };
  };

  const handleAttackFortressAction = (state: GameState, payload: { attackerId: string; targetFortress: 'player1' | 'player2'; damage: number }) => {
    const { targetFortress, damage } = payload;
    const updatedFortresses = { ...state.fortresses };
    updatedFortresses[targetFortress].hitPoints -= damage;
    
    const updatedCards = state.cards.map(c =>
      c.id === payload.attackerId ? { ...c, ap: 0 } : c
    );

    return { ...state, fortresses: updatedFortresses, cards: updatedCards, selectedCard: null };
  };

  const handleEndTurnAction = (state: GameState) => {
    const nextPlayer: 'player1' | 'player2' = state.currentPlayer === 'player1' ? 'player2' : 'player1';
    const updatedCards = state.cards.map(c => 
      c.owner === nextPlayer && c.position ? { ...c, ap: 1 } : c
    );
    return { ...state, currentPlayer: nextPlayer, cards: updatedCards, selectedCard: null };
  };

  const handleSelectCardAction = (state: GameState, payload: { cardId: string | null }) => {
    const selectedCard = payload.cardId ? state.cards.find(c => c.id === payload.cardId) || null : null;
    return { ...state, selectedCard };
  };

  // Wrapper functions to intercept and sync game actions
  const handleGameStateChange = (newState: GameState) => {
    setGameState(newState);
    
    // Only sync if it's our turn and we're connected
    if (canPerformAction()) {
      syncGameState(newState);
    }
  };

  const handlePlayerAction = (actionType: string, payload: any) => {
    // Only allow actions if it's our turn
    if (!canPerformAction()) {
      console.log('Not your turn or not connected');
      return false;
    }

    // Send the action to other players
    sendGameAction(actionType, payload);
    return true;
  };

  // Show connection error overlay
  if (connectionError) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-lg text-center max-w-sm w-full">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Connection Issue</h2>
          <p className="mb-4">{connectionError}</p>
          <button
            onClick={onDisconnect}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded font-bold"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  // Show loading if no game state yet
  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 flex items-center justify-center">
        <div className="bg-white/90 rounded-3xl p-8 shadow-2xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Starting game...</p>
          <p className="text-sm text-gray-600 mt-2">
            You are {playerSlot === 'player1' ? 'Player 1 (Blue)' : 'Player 2 (Red)'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Connection status indicator */}
      <div className="fixed top-4 right-4 z-40">
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isConnected ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
        }`}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </div>
      </div>

      {/* Turn indicator for multiplayer */}
      <div className="fixed top-16 right-4 z-40">
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isMyTurn() ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'
        }`}>
          {isMyTurn() ? '🎮 Your Turn' : '⏳ Opponent\'s Turn'}
        </div>
      </div>

      {/* Overlay for opponent's turn */}
      {!isMyTurn() && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-30 pointer-events-none">
          <div className="bg-white/90 px-6 py-3 rounded-full shadow-lg">
            <p className="font-bold text-gray-800">Waiting for opponent...</p>
          </div>
        </div>
      )}

      {/* Pass the modified props to the original Game component */}
      <Game
        initialGameState={gameState}
        onGameStateChange={handleGameStateChange}
        onPlayerAction={handlePlayerAction}
        playerSlot={playerSlot}
        isMultiplayer={true}
        isMyTurn={isMyTurn()}
      />
    </div>
  );
};

export default MultiplayerGame;