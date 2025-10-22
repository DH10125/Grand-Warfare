'use client';

import { useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { GameState, GameAction } from '@/types/game';

interface UseMultiplayerGameProps {
  socket: Socket | null;
  roomId: string;
  playerSlot: 'player1' | 'player2';
  gameState: GameState | null;
  setGameState: (state: GameState | null) => void;
  onGameStateUpdate?: (state: GameState) => void;
}

export const useMultiplayerGame = ({
  socket,
  roomId,
  playerSlot,
  gameState,
  setGameState,
  onGameStateUpdate,
}: UseMultiplayerGameProps) => {
  
  // Listen for game actions from other players
  useEffect(() => {
    if (!socket) return;

    const handleGameAction = (action: GameAction) => {
      console.log('Received game action:', action);
      // The action will be processed by the Game component
      // This is just for logging/debugging
    };

    const handleGameStateUpdate = (newGameState: GameState) => {
      console.log('Received game state update:', newGameState);
      setGameState(newGameState);
      if (onGameStateUpdate) {
        onGameStateUpdate(newGameState);
      }
    };

    socket.on('game-action', handleGameAction);
    socket.on('game-state-updated', handleGameStateUpdate);

    return () => {
      socket.off('game-action', handleGameAction);
      socket.off('game-state-updated', handleGameStateUpdate);
    };
  }, [socket, setGameState, onGameStateUpdate]);

  // Send game action to other players
  const sendGameAction = useCallback((actionType: string, payload: any) => {
    if (!socket || !roomId) return;

    const action: GameAction = {
      type: actionType as any,
      payload,
      playerId: socket.id!,
      timestamp: Date.now(),
    };

    socket.emit('game-action', roomId, action);
  }, [socket, roomId]);

  // Sync game state with other players
  const syncGameState = useCallback((state: GameState) => {
    if (!socket || !roomId) return;
    
    socket.emit('sync-game-state', roomId, state);
  }, [socket, roomId]);

  // Check if it's current player's turn
  const isMyTurn = useCallback(() => {
    if (!gameState) return false;
    return gameState.currentPlayer === playerSlot;
  }, [gameState, playerSlot]);

  // Check if player can perform actions
  const canPerformAction = useCallback(() => {
    return isMyTurn() && socket?.connected;
  }, [isMyTurn, socket]);

  return {
    sendGameAction,
    syncGameState,
    isMyTurn,
    canPerformAction,
    isConnected: socket?.connected || false,
  };
};