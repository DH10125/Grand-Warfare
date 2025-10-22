import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { GameState, MultiplayerGameRoom, PlayerInfo, GameAction } from '@/types/game';
import { Socket } from 'net';

export const config = {
  api: {
    bodyParser: false,
  },
}

interface SocketServerWithIO extends NetServer {
  io?: SocketIOServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: Socket & {
    server: SocketServerWithIO;
  };
}

// In-memory storage for game rooms (in production, use Redis or similar)
const gameRooms = new Map<string, MultiplayerGameRoom>();

// Generate a random 6-character game code
function generateGameCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Find room by game code
function findRoomByCode(gameCode: string): MultiplayerGameRoom | undefined {
  for (const room of gameRooms.values()) {
    if (room.gameCode === gameCode) {
      return room;
    }
  }
  return undefined;
}

export default function SocketHandler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socket',
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      // Create new game room
      socket.on('create-game', (playerName: string, callback) => {
        const gameCode = generateGameCode();
        const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const playerInfo: PlayerInfo = {
          id: socket.id,
          name: playerName || 'Player 1',
          isConnected: true,
          isReady: false,
        };

        const room: MultiplayerGameRoom = {
          id: roomId,
          gameCode,
          gameState: {} as GameState, // Will be initialized when game starts
          players: {
            player1: playerInfo,
          },
          createdAt: new Date(),
          isActive: false,
        };

        gameRooms.set(roomId, room);
        socket.join(roomId);

        console.log(`Game created with code: ${gameCode}, Room ID: ${roomId}`);
        
        callback({
          success: true,
          gameCode,
          roomId,
          playerSlot: 'player1',
        });
      });

      // Join existing game room
      socket.on('join-game', (gameCode: string, playerName: string, callback) => {
        const room = findRoomByCode(gameCode.toUpperCase());
        
        if (!room) {
          callback({
            success: false,
            error: 'Game not found',
          });
          return;
        }

        if (room.players.player2) {
          callback({
            success: false,
            error: 'Game is full',
          });
          return;
        }

        const playerInfo: PlayerInfo = {
          id: socket.id,
          name: playerName || 'Player 2',
          isConnected: true,
          isReady: false,
        };

        room.players.player2 = playerInfo;
        socket.join(room.id);

        console.log(`Player joined game: ${gameCode}, Room ID: ${room.id}`);

        // Notify other players
        socket.to(room.id).emit('player-joined', {
          player: playerInfo,
          playerSlot: 'player2',
        });

        callback({
          success: true,
          gameCode,
          roomId: room.id,
          playerSlot: 'player2',
          players: room.players,
        });
      });

      // Player ready state
      socket.on('player-ready', (roomId: string, isReady: boolean) => {
        const room = gameRooms.get(roomId);
        if (!room) return;

        // Find which player this socket belongs to
        let playerSlot: 'player1' | 'player2' | null = null;
        if (room.players.player1?.id === socket.id) {
          playerSlot = 'player1';
          room.players.player1.isReady = isReady;
        } else if (room.players.player2?.id === socket.id) {
          playerSlot = 'player2';
          room.players.player2.isReady = isReady;
        }

        if (playerSlot) {
          io.to(roomId).emit('player-ready-updated', {
            playerSlot,
            isReady,
            players: room.players,
          });

          // Check if both players are ready to start the game
          if (room.players.player1?.isReady && room.players.player2?.isReady) {
            // Initialize game state and start the game
            startGame(room, io);
          }
        }
      });

      // Game action from player
      socket.on('game-action', (roomId: string, action: GameAction) => {
        const room = gameRooms.get(roomId);
        if (!room || !room.isActive) return;

        // Verify the action is from the correct player
        const playerSlot = room.players.player1?.id === socket.id ? 'player1' : 
                          room.players.player2?.id === socket.id ? 'player2' : null;
        
        if (!playerSlot || room.gameState.currentPlayer !== playerSlot) {
          return; // Not this player's turn
        }

        // Broadcast the action to all players in the room
        io.to(roomId).emit('game-action', action);
      });

      // Sync game state
      socket.on('sync-game-state', (roomId: string, gameState: GameState) => {
        const room = gameRooms.get(roomId);
        if (!room) return;

        room.gameState = gameState;
        
        // Broadcast updated game state to other players
        socket.to(roomId).emit('game-state-updated', gameState);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Find and update player status in all rooms
        for (const [roomId, room] of gameRooms) {
          if (room.players.player1?.id === socket.id) {
            room.players.player1.isConnected = false;
            socket.to(roomId).emit('player-disconnected', { playerSlot: 'player1' });
          } else if (room.players.player2?.id === socket.id) {
            room.players.player2.isConnected = false;
            socket.to(roomId).emit('player-disconnected', { playerSlot: 'player2' });
          }
        }
      });
    });
  }
  res.end();
}

function startGame(room: MultiplayerGameRoom, io: SocketIOServer) {
  // Initialize the game state similar to the Game component
  const CORRIDOR_LENGTH = 10;
  const CORRIDOR_WIDTH = 4;
  
  // We'll let the frontend handle the full game initialization
  // and just sync the state
  room.isActive = true;
  
  io.to(room.id).emit('game-started', {
    gameCode: room.gameCode,
    players: room.players,
    corridorLength: CORRIDOR_LENGTH,
    corridorWidth: CORRIDOR_WIDTH,
  });
}