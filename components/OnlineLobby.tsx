'use client';

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { PlayerInfo } from '@/types/game';

interface OnlineLobbyProps {
  onGameStart: (socket: Socket, roomId: string, playerSlot: 'player1' | 'player2') => void;
  onBack: () => void;
}

interface JoinGameResponse {
  success: boolean;
  gameCode?: string;
  roomId?: string;
  playerSlot?: 'player1' | 'player2';
  players?: {
    player1?: PlayerInfo;
    player2?: PlayerInfo;
  };
  error?: string;
}

const OnlineLobby: React.FC<OnlineLobbyProps> = ({ onGameStart, onBack }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'waiting'>('menu');
  const [playerName, setPlayerName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [roomId, setRoomId] = useState('');
  const [playerSlot, setPlayerSlot] = useState<'player1' | 'player2'>('player1');
  const [players, setPlayers] = useState<{
    player1?: PlayerInfo;
    player2?: PlayerInfo;
  }>({});
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
      path: '/api/socket',
    });

    socketInstance.on('connect', () => {
      console.log('Connected to server');
      setSocket(socketInstance);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setSocket(null);
    });

    socketInstance.on('player-joined', (data: { player: PlayerInfo; playerSlot: 'player1' | 'player2' }) => {
      setPlayers(prev => ({
        ...prev,
        [data.playerSlot]: data.player,
      }));
    });

    socketInstance.on('player-ready-updated', (data: { playerSlot: 'player1' | 'player2'; isReady: boolean; players: any }) => {
      setPlayers(data.players);
    });

    socketInstance.on('game-started', (data: { gameCode: string; players: any }) => {
      console.log('Game started!', data);
      onGameStart(socketInstance, roomId, playerSlot);
    });

    socketInstance.on('player-disconnected', (data: { playerSlot: 'player1' | 'player2' }) => {
      setPlayers(prev => ({
        ...prev,
        [data.playerSlot]: prev[data.playerSlot] ? { ...prev[data.playerSlot]!, isConnected: false } : undefined,
      }));
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const createGame = () => {
    if (!socket || !playerName.trim()) return;
    
    setIsConnecting(true);
    setError('');
    
    socket.emit('create-game', playerName.trim(), (response: JoinGameResponse) => {
      setIsConnecting(false);
      if (response.success) {
        setGameCode(response.gameCode!);
        setRoomId(response.roomId!);
        setPlayerSlot(response.playerSlot!);
        setPlayers({
          [response.playerSlot!]: {
            id: socket.id!,
            name: playerName.trim(),
            isConnected: true,
            isReady: false,
          }
        });
        setMode('waiting');
      } else {
        setError(response.error || 'Failed to create game');
      }
    });
  };

  const joinGame = () => {
    if (!socket || !playerName.trim() || !joinCode.trim()) return;
    
    setIsConnecting(true);
    setError('');
    
    socket.emit('join-game', joinCode.trim().toUpperCase(), playerName.trim(), (response: JoinGameResponse) => {
      setIsConnecting(false);
      if (response.success) {
        setGameCode(response.gameCode!);
        setRoomId(response.roomId!);
        setPlayerSlot(response.playerSlot!);
        setPlayers(response.players!);
        setMode('waiting');
      } else {
        setError(response.error || 'Failed to join game');
      }
    });
  };

  const toggleReady = () => {
    if (!socket || !roomId) return;
    
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    socket.emit('player-ready', roomId, newReadyState);
  };

  const copyGameCode = () => {
    navigator.clipboard.writeText(gameCode);
    // Could add a toast notification here
  };

  if (!socket) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/90 rounded-3xl p-8 shadow-2xl max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (mode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/90 rounded-3xl p-8 shadow-2xl max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">🌐 Online Play</h2>
            <p className="text-gray-600">Connect with friends worldwide</p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={20}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => setMode('create')}
              disabled={!playerName.trim() || isConnecting}
              className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg transform hover:scale-105 transition-all disabled:transform-none"
            >
              🎮 Create New Game
            </button>
            
            <button
              onClick={() => setMode('join')}
              disabled={!playerName.trim() || isConnecting}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg transform hover:scale-105 transition-all disabled:transform-none"
            >
              🔗 Join Game
            </button>
          </div>

          <button
            onClick={onBack}
            className="w-full mt-4 bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-lg font-medium"
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/90 rounded-3xl p-8 shadow-2xl max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">🎮 Create Game</h2>
            <p className="text-gray-600">Generate a code for your friend to join</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={createGame}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg transform hover:scale-105 transition-all disabled:transform-none"
            >
              {isConnecting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creating...
                </div>
              ) : (
                '✨ Create Game Room'
              )}
            </button>

            <button
              onClick={() => setMode('menu')}
              disabled={isConnecting}
              className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white p-3 rounded-lg font-medium"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/90 rounded-3xl p-8 shadow-2xl max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">🔗 Join Game</h2>
            <p className="text-gray-600">Enter your friend's game code</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Game Code</label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase text-center text-lg font-mono"
              maxLength={6}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={joinGame}
              disabled={!joinCode.trim() || joinCode.length !== 6 || isConnecting}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-600 text-white p-4 rounded-xl font-bold text-lg shadow-lg transform hover:scale-105 transition-all disabled:transform-none"
            >
              {isConnecting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Joining...
                </div>
              ) : (
                '🚀 Join Game'
              )}
            </button>

            <button
              onClick={() => setMode('menu')}
              disabled={isConnecting}
              className="w-full bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white p-3 rounded-lg font-medium"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white/90 rounded-3xl p-8 shadow-2xl max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">🎮 Game Lobby</h2>
            <p className="text-gray-600">Waiting for players...</p>
          </div>

          {/* Game Code Display */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-xl mb-6 text-center">
            <p className="text-sm font-medium text-gray-700 mb-1">Game Code</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold font-mono text-purple-700">{gameCode}</span>
              <button
                onClick={copyGameCode}
                className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg transition-colors"
                title="Copy code"
              >
                📋
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">Share this code with your friend</p>
          </div>

          {/* Players Status */}
          <div className="space-y-3 mb-6">
            {/* Player 1 */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {players.player1?.name || 'Waiting...'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {players.player1?.isConnected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
              </div>
              {players.player1 && (
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  players.player1.isReady ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                }`}>
                  {players.player1.isReady ? 'Ready' : 'Not Ready'}
                </div>
              )}
            </div>

            {/* Player 2 */}
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {players.player2?.name || 'Waiting for player...'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {players.player2?.isConnected ? 'Connected' : 'Waiting...'}
                  </p>
                </div>
              </div>
              {players.player2 && (
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  players.player2.isReady ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                }`}>
                  {players.player2.isReady ? 'Ready' : 'Not Ready'}
                </div>
              )}
            </div>
          </div>

          {/* Ready Button */}
          {players.player2 && (
            <button
              onClick={toggleReady}
              className={`w-full p-4 rounded-xl font-bold text-lg shadow-lg transform hover:scale-105 transition-all ${
                isReady 
                  ? 'bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white'
                  : 'bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white'
              }`}
            >
              {isReady ? '❌ Not Ready' : '✅ Ready to Play'}
            </button>
          )}

          {/* Back Button */}
          <button
            onClick={() => {
              setMode('menu');
              setGameCode('');
              setRoomId('');
              setPlayers({});
              setIsReady(false);
            }}
            className="w-full mt-4 bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-lg font-medium"
          >
            ← Leave Lobby
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default OnlineLobby;