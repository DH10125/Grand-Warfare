'use client';

import React, { useState, useEffect } from 'react';
import { GameState, Card as CardType, HexPosition } from '@/types/game';
import { generateCorridorGrid, hexToPixel, hexDistance, hexEqual, HEX_SIZE, getSpawnEdges, hexDistanceToFortress } from '@/utils/hexUtils';
import { CARD_TEMPLATES } from '@/utils/cardTemplates';
import Hexagon from './Hexagon';
import Card from './Card';
import Fortress from './Fortress';

const CORRIDOR_LENGTH = 10;
const CORRIDOR_WIDTH = 4;

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [actionMode, setActionMode] = useState<'move' | 'attack' | null>(null);
  const [highlightedHexes, setHighlightedHexes] = useState<HexPosition[]>([]);

  // Initialize game
  useEffect(() => {
    const hexagons = generateCorridorGrid(CORRIDOR_LENGTH, CORRIDOR_WIDTH);
    const { leftEdge, rightEdge } = getSpawnEdges(CORRIDOR_LENGTH, CORRIDOR_WIDTH);
    
    const initialState: GameState = {
      hexagons,
      cards: [],
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
      corridorLength: CORRIDOR_LENGTH,
      corridorWidth: CORRIDOR_WIDTH,
      leftSpawnEdge: leftEdge,
      rightSpawnEdge: rightEdge,
    };
    
    setGameState(initialState);
  }, []);

  const addCardToHand = (owner: 'player1' | 'player2', templateIndex: number) => {
    if (!gameState) return;
    
    const template = CARD_TEMPLATES[templateIndex];
    const newCard: CardType = {
      ...template,
      id: `${owner}-${Date.now()}-${Math.random()}`,
      owner,
      ap: 0, // Cards in hand have 0 AP until placed
    };
    
    setGameState({
      ...gameState,
      cards: [...gameState.cards, newCard],
    });
  };

  const placeCard = (card: CardType, position: HexPosition) => {
    if (!gameState) return;
    
    // Check if position is valid and not occupied
    const isValidHex = gameState.hexagons.some(hex => hexEqual(hex, position));
    const isOccupied = gameState.cards.some(c => c.position && hexEqual(c.position, position));
    
    if (!isValidHex || isOccupied) return;
    
    // Check spawn edge restrictions
    const isLeftEdge = gameState.leftSpawnEdge.some(hex => hexEqual(hex, position));
    const isRightEdge = gameState.rightSpawnEdge.some(hex => hexEqual(hex, position));
    
    // Player 1 can only place on left edge, Player 2 on right edge
    if (card.owner === 'player1' && !isLeftEdge) return;
    if (card.owner === 'player2' && !isRightEdge) return;
    
    const updatedCards = gameState.cards.map(c => 
      c.id === card.id ? { ...c, position, ap: 0 } : c // Units cannot act on turn they're placed
    );
    
    setGameState({
      ...gameState,
      cards: updatedCards,
      selectedCard: null,
    });
  };

  const selectCard = (card: CardType) => {
    if (!gameState || card.owner !== gameState.currentPlayer) return;
    
    setGameState({
      ...gameState,
      selectedCard: card.id === gameState.selectedCard?.id ? null : card,
    });
    setActionMode(null);
    setHighlightedHexes([]);
  };

  const handleMove = () => {
    if (!gameState?.selectedCard || !gameState.selectedCard.position) return;
    
    setActionMode('move');
    
    // Highlight hexes within movement range
    const reachableHexes: HexPosition[] = [];
    gameState.hexagons.forEach(hex => {
      const distance = hexDistance(gameState.selectedCard!.position!, hex);
      const isOccupied = gameState.cards.some(c => c.position && hexEqual(c.position, hex));
      
      if (distance <= gameState.selectedCard!.speed && distance > 0 && !isOccupied) {
        reachableHexes.push(hex);
      }
    });
    
    setHighlightedHexes(reachableHexes);
  };

  const handleAttack = () => {
    if (!gameState?.selectedCard || !gameState.selectedCard.position) return;
    
    setActionMode('attack');
    
    // Highlight hexes within attack range
    const attackableHexes: HexPosition[] = [];
    gameState.hexagons.forEach(hex => {
      const distance = hexDistance(gameState.selectedCard!.position!, hex);
      
      if (distance <= gameState.selectedCard!.range && distance > 0) {
        attackableHexes.push(hex);
      }
    });
    
    setHighlightedHexes(attackableHexes);
  };

  const executeMove = (targetHex: HexPosition) => {
    if (!gameState?.selectedCard || actionMode !== 'move') return;
    if (gameState.selectedCard.ap <= 0) return; // Check AP
    
    const updatedCards = gameState.cards.map(c =>
      c.id === gameState.selectedCard!.id ? { ...c, position: targetHex, ap: 0 } : c
    );
    
    setGameState({
      ...gameState,
      cards: updatedCards,
      selectedCard: null,
    });
    setActionMode(null);
    setHighlightedHexes([]);
  };

  const executeAttack = (targetHex: HexPosition) => {
    if (!gameState?.selectedCard || actionMode !== 'attack') return;
    if (gameState.selectedCard.ap <= 0) return; // Check AP
    
    // Find target card at hex
    const targetCard = gameState.cards.find(c => c.position && hexEqual(c.position, targetHex));
    
    let updatedCards = gameState.cards;
    let updatedFortresses = gameState.fortresses;
    
    if (targetCard && targetCard.owner !== gameState.selectedCard.owner) {
      // Attack card
      const newHp = targetCard.hitPoints - gameState.selectedCard.attackDamage;
      
      if (newHp <= 0) {
        // Remove card
        updatedCards = gameState.cards.filter(c => c.id !== targetCard.id);
      } else {
        // Update HP
        updatedCards = gameState.cards.map(c =>
          c.id === targetCard.id ? { ...c, hitPoints: newHp } : c
        );
      }
    }
    
    // Mark card as having used AP
    updatedCards = updatedCards.map(c =>
      c.id === gameState.selectedCard!.id ? { ...c, ap: 0 } : c
    );
    
    setGameState({
      ...gameState,
      cards: updatedCards,
      fortresses: updatedFortresses,
      selectedCard: null,
    });
    setActionMode(null);
    setHighlightedHexes([]);
  };

  const attackFortress = (fortressOwner: 'player1' | 'player2') => {
    if (!gameState?.selectedCard || actionMode !== 'attack') return;
    if (gameState.selectedCard.owner === fortressOwner) return;
    if (gameState.selectedCard.ap <= 0) return; // Check AP
    
    const updatedFortresses = { ...gameState.fortresses };
    const targetFortress = updatedFortresses[fortressOwner];
    targetFortress.hitPoints -= gameState.selectedCard.attackDamage;
    
    // Mark card as having used AP
    const updatedCards = gameState.cards.map(c =>
      c.id === gameState.selectedCard!.id ? { ...c, ap: 0 } : c
    );
    
    // Check for winner
    let winner = null;
    if (targetFortress.hitPoints <= 0) {
      winner = fortressOwner === 'player1' ? 'player2' : 'player1';
    }
    
    setGameState({
      ...gameState,
      cards: updatedCards,
      fortresses: updatedFortresses,
      selectedCard: null,
      winner: winner as 'player1' | 'player2' | null,
    });
    setActionMode(null);
    setHighlightedHexes([]);
  };

  const endTurn = () => {
    if (!gameState) return;
    
    const nextPlayer = gameState.currentPlayer === 'player1' ? 'player2' : 'player1';
    
    // Reset AP for all cards owned by the next player
    const updatedCards = gameState.cards.map(c => 
      c.owner === nextPlayer && c.position ? { ...c, ap: 1 } : c
    );
    
    setGameState({
      ...gameState,
      cards: updatedCards,
      currentPlayer: nextPlayer,
      selectedCard: null,
    });
    setActionMode(null);
    setHighlightedHexes([]);
  };

  const handleHexClick = (hex: HexPosition) => {
    if (!gameState?.selectedCard) return;
    
    if (actionMode === 'move') {
      const isHighlighted = highlightedHexes.some(h => hexEqual(h, hex));
      if (isHighlighted) {
        executeMove(hex);
      }
    } else if (actionMode === 'attack') {
      const isHighlighted = highlightedHexes.some(h => hexEqual(h, hex));
      if (isHighlighted) {
        executeAttack(hex);
      }
    } else if (!gameState.selectedCard.position) {
      // Place card
      placeCard(gameState.selectedCard, hex);
    }
  };

  if (!gameState) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Calculate SVG viewBox
  const minX = Math.min(...gameState.hexagons.map(h => hexToPixel(h).x)) - HEX_SIZE * 2;
  const maxX = Math.max(...gameState.hexagons.map(h => hexToPixel(h).x)) + HEX_SIZE * 2;
  const minY = Math.min(...gameState.hexagons.map(h => hexToPixel(h).y)) - HEX_SIZE * 2;
  const maxY = Math.max(...gameState.hexagons.map(h => hexToPixel(h).y)) + HEX_SIZE * 2;
  
  const width = maxX - minX;
  const height = maxY - minY;

  const player1Hand = gameState.cards.filter(c => c.owner === 'player1' && !c.position);
  const player2Hand = gameState.cards.filter(c => c.owner === 'player2' && !c.position);
  const cardsOnBoard = gameState.cards.filter(c => c.position);

  // Check if fortress can be attacked
  const canAttackFortress = (fortressOwner: 'player1' | 'player2'): boolean => {
    if (!gameState?.selectedCard || actionMode !== 'attack') return false;
    if (gameState.selectedCard.owner === fortressOwner) return false;
    if (!gameState.selectedCard.position) return false;
    if (gameState.selectedCard.ap <= 0) return false;
    
    // Check if unit is within range of the fortress
    const distance = hexDistanceToFortress(
      gameState.selectedCard.position,
      fortressOwner,
      gameState.corridorLength
    );
    
    return distance <= gameState.selectedCard.range;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 p-4">
      {/* Winner Banner */}
      {gameState.winner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2 className="text-4xl font-bold mb-4">
              {gameState.winner === 'player1' ? 'Player 1' : 'Player 2'} Wins!
            </h2>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded font-bold"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
      
      {/* Top Bar */}
      <div className="bg-white/90 rounded-lg p-4 mb-4 flex justify-between items-center">
        <div className="text-xl font-bold">
          Current Turn: {gameState.currentPlayer === 'player1' ? 'Player 1' : 'Player 2'}
        </div>
        <button
          onClick={endTurn}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-bold"
        >
          End Turn
        </button>
      </div>

      {/* Main Game Area */}
      <div className="flex gap-4">
        {/* Left Fortress */}
        <div className="flex-shrink-0">
          <Fortress 
            fortress={gameState.fortresses.player1} 
            side="left"
            isAttackable={canAttackFortress('player1')}
            onClick={() => canAttackFortress('player1') && attackFortress('player1')}
          />
        </div>

        {/* Game Board */}
        <div className="flex-1 bg-white/10 rounded-lg p-4 overflow-auto">
          <svg
            width={width}
            height={height}
            viewBox={`${minX} ${minY} ${width} ${height}`}
            className="mx-auto"
          >
            {/* Render hexagons */}
            {gameState.hexagons.map((hex, index) => {
              const hasCard = cardsOnBoard.some(c => c.position && hexEqual(c.position, hex));
              const isHighlighted = actionMode === 'move' && highlightedHexes.some(h => hexEqual(h, hex));
              const isAttackable = actionMode === 'attack' && highlightedHexes.some(h => hexEqual(h, hex));
              const isLeftSpawn = gameState.leftSpawnEdge.some(h => hexEqual(h, hex));
              const isRightSpawn = gameState.rightSpawnEdge.some(h => hexEqual(h, hex));
              const isSpawnEdge = isLeftSpawn || isRightSpawn;
              
              return (
                <g key={`${hex.q}-${hex.r}`}>
                  <Hexagon
                    position={hex}
                    isHighlighted={isHighlighted}
                    isAttackable={isAttackable}
                    onClick={() => handleHexClick(hex)}
                    hasCard={hasCard}
                  />
                  {/* Show spawn edge indicator */}
                  {isSpawnEdge && !hasCard && (
                    <g transform={`translate(${hexToPixel(hex).x}, ${hexToPixel(hex).y})`}>
                      <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        fill={isLeftSpawn ? '#4A90E2' : '#F87171'}
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {isLeftSpawn ? 'P1' : 'P2'}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
            
            {/* Render cards on board */}
            {cardsOnBoard.map(card => {
              if (!card.position) return null;
              const { x, y } = hexToPixel(card.position);
              const isSelected = gameState.selectedCard?.id === card.id;
              
              return (
                <g 
                  key={card.id} 
                  transform={`translate(${x}, ${y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectCard(card);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Unit circle */}
                  <circle
                    cx="0"
                    cy="0"
                    r="30"
                    fill={card.owner === 'player1' ? '#60A5FA' : '#F87171'}
                    opacity="0.9"
                    stroke={isSelected ? '#FFD700' : '#000'}
                    strokeWidth={isSelected ? '3' : '2'}
                  />
                  {/* Unit name */}
                  <text
                    x="0"
                    y="-5"
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {card.name[0]}
                  </text>
                  {/* HP bar */}
                  <text
                    x="0"
                    y="8"
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {card.hitPoints}HP
                  </text>
                  {/* AP indicator */}
                  {card.ap > 0 && (
                    <circle
                      cx="20"
                      cy="-20"
                      r="8"
                      fill="#10B981"
                      stroke="#000"
                      strokeWidth="1"
                    />
                  )}
                  {card.ap > 0 && (
                    <text
                      x="20"
                      y="-16"
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {card.ap}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right Fortress */}
        <div className="flex-shrink-0">
          <Fortress 
            fortress={gameState.fortresses.player2} 
            side="right"
            isAttackable={canAttackFortress('player2')}
            onClick={() => canAttackFortress('player2') && attackFortress('player2')}
          />
        </div>
      </div>

      {/* Card Selection Area */}
      <div className="mt-4 bg-white/90 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          {CARD_TEMPLATES.map((template, index) => (
            <button
              key={template.name}
              onClick={() => addCardToHand(gameState.currentPlayer, index)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-bold"
            >
              Add {template.name}
            </button>
          ))}
        </div>
      </div>

      {/* Player Hands */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        {/* Player 1 Hand */}
        <div className="bg-blue-500/30 rounded-lg p-4">
          <h3 className="text-white font-bold mb-2">Player 1 Hand</h3>
          <div className="flex gap-4 flex-wrap">
            {player1Hand.map(card => (
              <Card
                key={card.id}
                card={card}
                isSelected={gameState.selectedCard?.id === card.id}
                onClick={() => selectCard(card)}
                onAttack={handleAttack}
                onMove={handleMove}
                showActions={gameState.selectedCard?.id === card.id && card.position !== undefined}
              />
            ))}
          </div>
        </div>

        {/* Player 2 Hand */}
        <div className="bg-red-500/30 rounded-lg p-4">
          <h3 className="text-white font-bold mb-2">Player 2 Hand</h3>
          <div className="flex gap-4 flex-wrap">
            {player2Hand.map(card => (
              <Card
                key={card.id}
                card={card}
                isSelected={gameState.selectedCard?.id === card.id}
                onClick={() => selectCard(card)}
                onAttack={handleAttack}
                onMove={handleMove}
                showActions={gameState.selectedCard?.id === card.id && card.position !== undefined}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Selected Card Actions */}
      {gameState.selectedCard && gameState.selectedCard.position && gameState.selectedCard.ap > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-4 shadow-lg">
          <div className="flex gap-4">
            <button
              onClick={handleMove}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded font-bold"
            >
              Move (Speed: {gameState.selectedCard.speed})
            </button>
            <button
              onClick={handleAttack}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded font-bold"
            >
              Attack (Range: {gameState.selectedCard.range})
            </button>
            <button
              onClick={() => {
                setGameState({ ...gameState, selectedCard: null });
                setActionMode(null);
                setHighlightedHexes([]);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
