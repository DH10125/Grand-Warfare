'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { GameState, Card as CardType, HexPosition, HexTile } from '@/types/game';
import { generateCorridorGridWithRewards, hexToPixel, hexDistance, hexEqual, HEX_SIZE, getSpawnEdges, hexDistanceToFortress } from '@/utils/hexUtils';
import { CARD_TEMPLATES } from '@/utils/cardTemplates';
import Hexagon from './Hexagon';
import Card from './Card';
import Fortress from './Fortress';
import HelpPopup from './HelpPopup';

const CORRIDOR_LENGTH = 10;
const CORRIDOR_WIDTH = 4;

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [actionMode, setActionMode] = useState<'move' | 'attack' | null>(null);
  const [highlightedHexes, setHighlightedHexes] = useState<HexPosition[]>([]);
  const [notification, setNotification] = useState<string>('');
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [cardDetailView, setCardDetailView] = useState<CardType | null>(null);
  const [hasShownWelcome, setHasShownWelcome] = useState<boolean>(false);
  const [selectedHexPosition, setSelectedHexPosition] = useState<HexPosition | null>(null);

  // Helper function to deal random cards to a player
  const dealRandomCards = (owner: 'player1' | 'player2', count: number): CardType[] => {
    const dealtCards: CardType[] = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * CARD_TEMPLATES.length);
      const template = CARD_TEMPLATES[randomIndex];
      const newCard: CardType = {
        ...template,
        id: `${owner}-initial-${i}-${Date.now()}-${Math.random()}`,
        owner,
        ap: 0, // Cards in hand have 0 AP until placed
      };
      dealtCards.push(newCard);
    }
    return dealtCards;
  };

  // Initialize game
  useEffect(() => {
    const hexagons = generateCorridorGridWithRewards(CORRIDOR_LENGTH, CORRIDOR_WIDTH);
    const { leftEdge, rightEdge } = getSpawnEdges(CORRIDOR_LENGTH, CORRIDOR_WIDTH);
    
    // Deal initial cards to both players (3 cards each)
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
      corridorLength: CORRIDOR_LENGTH,
      corridorWidth: CORRIDOR_WIDTH,
      leftSpawnEdge: leftEdge,
      rightSpawnEdge: rightEdge,
    };
    
    setGameState(initialState);
    
    // Show welcome help popup on first load
    setShowHelp(true);
    setHasShownWelcome(true);
  }, []);



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
    
    const newSelectedCard = card.id === gameState.selectedCard?.id ? null : card;
    
    setGameState({
      ...gameState,
      selectedCard: newSelectedCard,
    });
    setActionMode(null);
    
    // Show card detail on the side
    if (newSelectedCard) {
      setCardDetailView(newSelectedCard);
      if (newSelectedCard.position) {
        setSelectedHexPosition(newSelectedCard.position);
      } else {
        setSelectedHexPosition(null);
      }
    } else {
      setCardDetailView(null);
      setSelectedHexPosition(null);
    }
    
    // Highlight spawn hexes if card is in hand (no position)
    if (newSelectedCard && !newSelectedCard.position) {
      const spawnEdge = newSelectedCard.owner === 'player1' 
        ? gameState.leftSpawnEdge 
        : gameState.rightSpawnEdge;
      
      // Filter out occupied spawn hexes
      const availableSpawnHexes = spawnEdge.filter(hex => 
        !gameState.cards.some(c => c.position && hexEqual(c.position, hex))
      );
      
      setHighlightedHexes(availableSpawnHexes);
    } else {
      setHighlightedHexes([]);
    }
  };

  const handleCardClick = (card: CardType, event?: React.MouseEvent) => {
    selectCard(card);
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
    
    // Highlight hexes within attack range (including hexes with enemy units)
    const attackableHexes: HexPosition[] = [];
    gameState.hexagons.forEach(hex => {
      const distance = hexDistance(gameState.selectedCard!.position!, hex);
      
      if (distance <= gameState.selectedCard!.range && distance > 0) {
        // Check if there's an enemy unit on this hex
        const cardOnHex = gameState.cards.find(c => c.position && hexEqual(c.position, hex));
        const isEnemyUnit = cardOnHex && cardOnHex.owner !== gameState.selectedCard!.owner;
        
        // Include all hexes in range, but enemy units are valid targets
        attackableHexes.push(hex);
      }
    });
    
    setHighlightedHexes(attackableHexes);
  };

  const executeMove = (targetHex: HexPosition) => {
    if (!gameState?.selectedCard || actionMode !== 'move') return;
    if (gameState.selectedCard.ap <= 0) return; // Check AP
    
    // Find the hex tile
    const hexTile = gameState.hexagons.find(h => hexEqual(h, targetHex));
    
    // Update card position
    const updatedCards = gameState.cards.map(c =>
      c.id === gameState.selectedCard!.id ? { ...c, position: targetHex, ap: 0 } : c
    );
    
    // Reveal and collect hex reward if available
    let updatedHexagons = gameState.hexagons;
    let newCards = updatedCards;
    let rewardMessage = '';
    
    if (hexTile && !hexTile.isRevealed) {
      // Reveal the hex
      updatedHexagons = gameState.hexagons.map(h =>
        hexEqual(h, targetHex) ? { ...h, isRevealed: true } : h
      );
    }
    
    if (hexTile && hexTile.reward && !hexTile.isCollected) {
      // Collect the reward - add card to player's hand
      const rewardCard: CardType = {
        ...hexTile.reward,
        id: `reward-${gameState.currentPlayer}-${Date.now()}-${Math.random()}`,
        owner: gameState.currentPlayer,
        ap: 0,
      };
      
      newCards = [...newCards, rewardCard];
      
      // Mark hex as collected
      updatedHexagons = updatedHexagons.map(h =>
        hexEqual(h, targetHex) ? { ...h, isCollected: true } : h
      );
      
      rewardMessage = `🎉 Collected: ${hexTile.reward.name}!`;
    }
    
    setGameState({
      ...gameState,
      hexagons: updatedHexagons,
      cards: newCards,
      selectedCard: null,
    });
    setActionMode(null);
    setHighlightedHexes([]);
    setCardDetailView(null);
    setSelectedHexPosition(null);
    
    // Show reward notification
    if (rewardMessage) {
      setNotification(rewardMessage);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const executeAttack = (targetHex: HexPosition) => {
    if (!gameState?.selectedCard || actionMode !== 'attack') return;
    if (gameState.selectedCard.ap <= 0) return; // Check AP
    
    // Find target card at hex
    const targetCard = gameState.cards.find(c => c.position && hexEqual(c.position, targetHex));
    
    let updatedCards = gameState.cards;
    let updatedFortresses = gameState.fortresses;
    
    if (targetCard && targetCard.owner !== gameState.selectedCard.owner) {
      // Unit vs Unit combat - BOTH units take damage
      const attackerDamage = gameState.selectedCard.attackDamage;
      const defenderDamage = targetCard.attackDamage;
      
      // Calculate new HP for both units
      const targetNewHp = targetCard.hitPoints - attackerDamage;
      const attackerNewHp = gameState.selectedCard.hitPoints - defenderDamage;
      
      // Remove destroyed units or update HP
      if (targetNewHp <= 0 && attackerNewHp <= 0) {
        // Both units destroyed
        updatedCards = gameState.cards.filter(c => 
          c.id !== targetCard.id && c.id !== gameState.selectedCard!.id
        );
        setNotification('💥 Both units destroyed in combat!');
      } else if (targetNewHp <= 0) {
        // Only target destroyed, attacker survives but takes damage
        updatedCards = gameState.cards
          .filter(c => c.id !== targetCard.id)
          .map(c => c.id === gameState.selectedCard!.id 
            ? { ...c, hitPoints: attackerNewHp, ap: 0 } 
            : c
          );
        setNotification(`⚔️ Enemy unit destroyed! Your unit took ${defenderDamage} damage.`);
      } else if (attackerNewHp <= 0) {
        // Only attacker destroyed
        updatedCards = gameState.cards
          .filter(c => c.id !== gameState.selectedCard!.id)
          .map(c => c.id === targetCard.id 
            ? { ...c, hitPoints: targetNewHp } 
            : c
          );
        setNotification('💔 Your unit was destroyed in combat!');
      } else {
        // Both units survive with reduced HP
        updatedCards = gameState.cards.map(c => {
          if (c.id === targetCard.id) return { ...c, hitPoints: targetNewHp };
          if (c.id === gameState.selectedCard!.id) return { ...c, hitPoints: attackerNewHp, ap: 0 };
          return c;
        });
        setNotification(`⚔️ Both units damaged! Attacker: ${attackerNewHp}HP, Defender: ${targetNewHp}HP`);
      }
      
      // Show notification for 3 seconds
      setTimeout(() => setNotification(''), 3000);
    } else {
      // No valid target, just mark as used
      updatedCards = updatedCards.map(c =>
        c.id === gameState.selectedCard!.id ? { ...c, ap: 0 } : c
      );
    }
    
    setGameState({
      ...gameState,
      cards: updatedCards,
      fortresses: updatedFortresses,
      selectedCard: null,
    });
    setActionMode(null);
    setHighlightedHexes([]);
    setCardDetailView(null);
    setSelectedHexPosition(null);
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
    setCardDetailView(null);
    setSelectedHexPosition(null);
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
    setCardDetailView(null);
    setSelectedHexPosition(null);
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
      {/* Help Popup */}
      <HelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />
      
      {/* Reward Notification */}
      {notification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-8 py-4 rounded-lg shadow-lg z-50 text-xl font-bold animate-bounce">
          {notification}
        </div>
      )}
      
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
      <div className="bg-white/90 rounded-lg p-4 mb-4 shadow-xl">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold">
              Current Turn: <span className={gameState.currentPlayer === 'player1' ? 'text-blue-600' : 'text-red-600'}>
                {gameState.currentPlayer === 'player1' ? 'Player 1' : 'Player 2'}
              </span>
            </div>
            {/* Help Button */}
            <button
              onClick={() => setShowHelp(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold text-xl px-5 py-2 rounded-full shadow-lg transform hover:scale-110 transition-all"
              title="Show game instructions and tips"
            >
              ❓
            </button>
          </div>
          <button
            onClick={endTurn}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-bold text-xl shadow-lg transform hover:scale-105 transition-all"
          >
            End Turn ➡️
          </button>
        </div>
        <div className="text-base text-gray-700 font-semibold">
          {!gameState.selectedCard && '📝 Select a card from your hand below to place it on the board'}
          {gameState.selectedCard && !gameState.selectedCard.position && '📍 Click a highlighted blue spawn hex (P1) or red spawn hex (P2) to place your unit'}
          {gameState.selectedCard && gameState.selectedCard.position && gameState.selectedCard.ap > 0 && '⚡ Unit selected! Click "Move" or "Attack" above the unit to choose your action'}
          {gameState.selectedCard && gameState.selectedCard.position && gameState.selectedCard.ap === 0 && '⏸️ This unit has already acted this turn - select another unit or end your turn'}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex gap-4 mb-4">
        {/* Left Side - Player 1 Card Detail or Fortress */}
        <div className="flex-shrink-0 w-64">
          {cardDetailView && cardDetailView.owner === 'player1' ? (
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl shadow-2xl border-8 border-amber-600 overflow-hidden bg-opacity-95">
              {/* Card Frame - Top Ornamental Border */}
              <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 h-4"></div>
              
              {/* Card Header */}
              <div className="bg-gradient-to-r from-amber-700 to-amber-800 px-4 py-3 border-b-4 border-amber-900">
                <h2 className="text-2xl font-bold text-center text-white drop-shadow-lg">
                  {cardDetailView.name}
                </h2>
              </div>

              {/* Card Image Section */}
              <div className="bg-white p-4 flex items-center justify-center border-b-4 border-amber-600">
                <div className="relative w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-4 border-amber-400 shadow-inner flex items-center justify-center overflow-hidden">
                  <Image 
                    src={cardDetailView.imageUrl} 
                    alt={cardDetailView.name}
                    width={180}
                    height={180}
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Card Stats Section */}
              <div className="px-4 py-3 bg-amber-50">
                <h3 className="text-lg font-bold text-amber-900 mb-2 text-center border-b-2 border-amber-400 pb-1">
                  ⚔️ Unit Statistics
                </h3>
                
                <div className="space-y-2">
                  {/* HP */}
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow border-2 border-red-300">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">❤️</span>
                      <span className="font-bold text-gray-700 text-sm">HP:</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      {cardDetailView.hitPoints}/{cardDetailView.maxHitPoints}
                    </span>
                  </div>

                  {/* Attack Damage */}
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow border-2 border-orange-300">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⚔️</span>
                      <span className="font-bold text-gray-700 text-sm">Attack:</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600">
                      {cardDetailView.attackDamage}
                    </span>
                  </div>

                  {/* Speed */}
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow border-2 border-blue-300">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🏃</span>
                      <span className="font-bold text-gray-700 text-sm">Speed:</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {cardDetailView.speed}
                    </span>
                  </div>

                  {/* Range */}
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow border-2 border-purple-300">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎯</span>
                      <span className="font-bold text-gray-700 text-sm">Range:</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">
                      {cardDetailView.range}
                    </span>
                  </div>

                  {/* Action Points (if on board) */}
                  {cardDetailView.position && (
                    <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow border-2 border-green-300">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">⚡</span>
                        <span className="font-bold text-gray-700 text-sm">AP:</span>
                      </div>
                      <span className={`text-lg font-bold ${cardDetailView.ap > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        {cardDetailView.ap > 0 ? '✓ Ready' : '✗ Used'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Frame - Bottom Ornamental Border */}
              <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 h-4"></div>
            </div>
          ) : (
            <Fortress 
              fortress={gameState.fortresses.player1} 
              side="left"
              isAttackable={canAttackFortress('player1')}
              onClick={() => canAttackFortress('player1') && attackFortress('player1')}
            />
          )}
        </div>

        {/* Game Board */}
        <div className="flex-1 bg-white/10 rounded-lg p-4 flex items-center justify-center min-h-[500px] relative">
          <svg
            width={width}
            height={height}
            viewBox={`${minX} ${minY} ${width} ${height}`}
            className="mx-auto max-w-full h-auto"
          >
            {/* Render hexagons */}
            {gameState.hexagons.map((hexTile, index) => {
              const hasCard = cardsOnBoard.some(c => c.position && hexEqual(c.position, hexTile));
              const isPlacementTarget = !actionMode && gameState.selectedCard && !gameState.selectedCard.position && highlightedHexes.some(h => hexEqual(h, hexTile));
              const isHighlighted = Boolean((actionMode === 'move' || isPlacementTarget) && highlightedHexes.some(h => hexEqual(h, hexTile)));
              const isAttackable = Boolean(actionMode === 'attack' && highlightedHexes.some(h => hexEqual(h, hexTile)));
              const isLeftSpawn = gameState.leftSpawnEdge.some(h => hexEqual(h, hexTile));
              const isRightSpawn = gameState.rightSpawnEdge.some(h => hexEqual(h, hexTile));
              const isSpawnEdge = isLeftSpawn || isRightSpawn;
              
              return (
                <g key={`${hexTile.q}-${hexTile.r}`}>
                  <Hexagon
                    tile={hexTile}
                    isHighlighted={isHighlighted}
                    isAttackable={isAttackable}
                    onClick={() => handleHexClick(hexTile)}
                    hasCard={hasCard}
                    isSpawnEdge={isSpawnEdge}
                    spawnOwner={isLeftSpawn ? 'player1' : isRightSpawn ? 'player2' : undefined}
                  />
                  {/* Show spawn edge indicator */}
                  {isSpawnEdge && !hasCard && (
                    <g transform={`translate(${hexToPixel(hexTile).x}, ${hexToPixel(hexTile).y})`}>
                      <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        fill={isLeftSpawn ? '#1E3A8A' : '#991B1B'}
                        fontSize="12"
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
                    strokeWidth={isSelected ? '4' : '2'}
                  />
                  {/* Unit name */}
                  <text
                    x="0"
                    y="-8"
                    textAnchor="middle"
                    fill="white"
                    fontSize="16"
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
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {card.hitPoints}HP
                  </text>
                  {/* AP indicator */}
                  {card.ap > 0 && (
                    <>
                      <circle
                        cx="22"
                        cy="-22"
                        r="10"
                        fill="#10B981"
                        stroke="#000"
                        strokeWidth="2"
                      />
                      <text
                        x="22"
                        y="-18"
                        textAnchor="middle"
                        fill="white"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {card.ap}
                      </text>
                    </>
                  )}
                  {/* Stats badge when selected */}
                  {isSelected && (
                    <>
                      <text
                        x="0"
                        y="24"
                        textAnchor="middle"
                        fill="white"
                        fontSize="8"
                        fontWeight="bold"
                      >
                        ATK:{card.attackDamage} SPD:{card.speed} RNG:{card.range}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
            
            {/* Action buttons above selected hex */}
            {gameState.selectedCard && gameState.selectedCard.position && gameState.selectedCard.ap > 0 && selectedHexPosition && (
              <g transform={`translate(${hexToPixel(selectedHexPosition).x}, ${hexToPixel(selectedHexPosition).y - 80})`}>
                {/* Background for buttons */}
                <rect
                  x="-100"
                  y="-25"
                  width="200"
                  height="50"
                  rx="10"
                  fill="rgba(0, 0, 0, 0.8)"
                  stroke="#FFD700"
                  strokeWidth="2"
                />
                {/* Move button */}
                <g 
                  transform="translate(-50, 0)"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMove();
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x="-35"
                    y="-15"
                    width="70"
                    height="30"
                    rx="5"
                    fill="#10B981"
                    stroke="#059669"
                    strokeWidth="2"
                    className="hover:opacity-80"
                  />
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    🏃 Move
                  </text>
                </g>
                {/* Attack button */}
                <g 
                  transform="translate(50, 0)"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAttack();
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x="-35"
                    y="-15"
                    width="70"
                    height="30"
                    rx="5"
                    fill="#EF4444"
                    stroke="#DC2626"
                    strokeWidth="2"
                    className="hover:opacity-80"
                  />
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    ⚔️ Attack
                  </text>
                </g>
              </g>
            )}
          </svg>
        </div>

        {/* Right Side - Player 2 Card Detail or Fortress */}
        <div className="flex-shrink-0 w-64">
          {cardDetailView && cardDetailView.owner === 'player2' ? (
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl shadow-2xl border-8 border-amber-600 overflow-hidden bg-opacity-95">
              {/* Card Frame - Top Ornamental Border */}
              <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 h-4"></div>
              
              {/* Card Header */}
              <div className="bg-gradient-to-r from-amber-700 to-amber-800 px-4 py-3 border-b-4 border-amber-900">
                <h2 className="text-2xl font-bold text-center text-white drop-shadow-lg">
                  {cardDetailView.name}
                </h2>
              </div>

              {/* Card Image Section */}
              <div className="bg-white p-4 flex items-center justify-center border-b-4 border-amber-600">
                <div className="relative w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border-4 border-amber-400 shadow-inner flex items-center justify-center overflow-hidden">
                  <Image 
                    src={cardDetailView.imageUrl} 
                    alt={cardDetailView.name}
                    width={180}
                    height={180}
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Card Stats Section */}
              <div className="px-4 py-3 bg-amber-50">
                <h3 className="text-lg font-bold text-amber-900 mb-2 text-center border-b-2 border-amber-400 pb-1">
                  ⚔️ Unit Statistics
                </h3>
                
                <div className="space-y-2">
                  {/* HP */}
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow border-2 border-red-300">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">❤️</span>
                      <span className="font-bold text-gray-700 text-sm">HP:</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      {cardDetailView.hitPoints}/{cardDetailView.maxHitPoints}
                    </span>
                  </div>

                  {/* Attack Damage */}
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow border-2 border-orange-300">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">⚔️</span>
                      <span className="font-bold text-gray-700 text-sm">Attack:</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600">
                      {cardDetailView.attackDamage}
                    </span>
                  </div>

                  {/* Speed */}
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow border-2 border-blue-300">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🏃</span>
                      <span className="font-bold text-gray-700 text-sm">Speed:</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {cardDetailView.speed}
                    </span>
                  </div>

                  {/* Range */}
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow border-2 border-purple-300">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎯</span>
                      <span className="font-bold text-gray-700 text-sm">Range:</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">
                      {cardDetailView.range}
                    </span>
                  </div>

                  {/* Action Points (if on board) */}
                  {cardDetailView.position && (
                    <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow border-2 border-green-300">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">⚡</span>
                        <span className="font-bold text-gray-700 text-sm">AP:</span>
                      </div>
                      <span className={`text-lg font-bold ${cardDetailView.ap > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        {cardDetailView.ap > 0 ? '✓ Ready' : '✗ Used'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Frame - Bottom Ornamental Border */}
              <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 h-4"></div>
            </div>
          ) : (
            <Fortress 
              fortress={gameState.fortresses.player2} 
              side="right"
              isAttackable={canAttackFortress('player2')}
              onClick={() => canAttackFortress('player2') && attackFortress('player2')}
            />
          )}
        </div>
      </div>

      {/* Player Hands */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Player 1 Hand */}
        <div className="bg-gradient-to-br from-blue-500/40 to-blue-700/40 rounded-xl p-4 shadow-xl border-4 border-blue-400">
          <h3 className="text-white font-bold text-xl mb-3 text-center">🔵 Player 1 Hand</h3>
          <div className="flex gap-4 flex-wrap justify-center">
            {player1Hand.map(card => (
              <div key={card.id}>
                <Card
                  card={card}
                  isSelected={gameState.selectedCard?.id === card.id}
                  onClick={() => selectCard(card)}
                  onAttack={handleAttack}
                  onMove={handleMove}
                  showActions={false}
                />
              </div>
            ))}
            {player1Hand.length === 0 && (
              <p className="text-white/70 text-center w-full py-4">No cards in hand</p>
            )}
          </div>
        </div>

        {/* Player 2 Hand */}
        <div className="bg-gradient-to-br from-red-500/40 to-red-700/40 rounded-xl p-4 shadow-xl border-4 border-red-400">
          <h3 className="text-white font-bold text-xl mb-3 text-center">🔴 Player 2 Hand</h3>
          <div className="flex gap-4 flex-wrap justify-center">
            {player2Hand.map(card => (
              <div key={card.id}>
                <Card
                  card={card}
                  isSelected={gameState.selectedCard?.id === card.id}
                  onClick={() => selectCard(card)}
                  onAttack={handleAttack}
                  onMove={handleMove}
                  showActions={false}
                />
              </div>
            ))}
            {player2Hand.length === 0 && (
              <p className="text-white/70 text-center w-full py-4">No cards in hand</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
