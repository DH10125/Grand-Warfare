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
import CardDetailPopup from './CardDetailPopup';

const CORRIDOR_LENGTH = 10;
const CORRIDOR_WIDTH = 4;

interface GameProps {
  initialGameState?: GameState | null;
  onGameStateChange?: (newState: GameState) => void;
  onPlayerAction?: (actionType: string, payload: any) => boolean;
  playerSlot?: 'player1' | 'player2';
  isMultiplayer?: boolean;
  isMyTurn?: boolean;
}

const Game: React.FC<GameProps> = ({
  initialGameState = null,
  onGameStateChange,
  onPlayerAction,
  playerSlot,
  isMultiplayer = false,
  isMyTurn = true,
}) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [highlightedMoveHexes, setHighlightedMoveHexes] = useState<HexPosition[]>([]);
  const [highlightedAttackHexes, setHighlightedAttackHexes] = useState<HexPosition[]>([]);
  const [highlightedSpawnHexes, setHighlightedSpawnHexes] = useState<HexPosition[]>([]);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [hoverAction, setHoverAction] = useState<'move' | 'attack' | 'fortress-attack' | null>(null);
  const [notification, setNotification] = useState<string>('');
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [cardDetailView, setCardDetailView] = useState<CardType | null>(null);
  const [cardDetailPopup, setCardDetailPopup] = useState<CardType | null>(null);
  const [hasShownWelcome, setHasShownWelcome] = useState<boolean>(false);
  const [selectedHexPosition, setSelectedHexPosition] = useState<HexPosition | null>(null);
  const [turnCount, setTurnCount] = useState<number>(0);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [lastClickedCardId, setLastClickedCardId] = useState<string | null>(null);

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
    // If we have an initial game state (multiplayer), use it
    if (initialGameState) {
      setGameState(initialGameState);
      return;
    }
    
    // Otherwise, initialize a new local game
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
      gameMode: isMultiplayer ? 'online' : 'local',
    };
    
    setGameState(initialState);
    
    // Show welcome help popup on first load (only for local games)
    if (!isMultiplayer) {
      setShowHelp(true);
      setHasShownWelcome(true);
    }
  }, [initialGameState, isMultiplayer]);

  // Helper function to update game state and sync with multiplayer if needed
  const updateGameState = (newState: GameState) => {
    setGameState(newState);
    if (onGameStateChange) {
      onGameStateChange(newState);
    }
  };

  // Helper function to send multiplayer action
  const sendMultiplayerAction = (actionType: string, payload: any): boolean => {
    if (onPlayerAction) {
      return onPlayerAction(actionType, payload);
    }
    return true; // Allow action for local games
  };

  // Check if current player can perform actions
  const canPerformAction = (): boolean => {
    if (!gameState) return false;
    if (isMultiplayer) {
      // In multiplayer, check if it's our turn and we can perform actions
      return isMyTurn && gameState.currentPlayer === playerSlot;
    }
    // In local games, always allow actions
    return true;
  };

  // Auto-switch turns when no moves are available
  useEffect(() => {
    if (!gameState || gameState.winner) return;
    
    // Small delay to prevent immediate switching during game state updates
    const timeoutId = setTimeout(() => {
      if (!hasAvailableMoves()) {
        endTurn();
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [gameState?.cards, gameState?.currentPlayer]);



  const placeCard = (card: CardType, position: HexPosition) => {
    if (!gameState || !canPerformAction()) return;
    
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
    
    // Send multiplayer action first
    if (!sendMultiplayerAction('PLACE_CARD', { cardId: card.id, position })) return;
    
    const updatedCards = gameState.cards.map(c => 
      c.id === card.id ? { ...c, position, ap: 0 } : c // Units cannot act on turn they're placed
    );
    
    // Find the next card in hand to auto-select
    const currentPlayerHandCards = gameState.cards.filter(c => 
      c.owner === gameState.currentPlayer && !c.position && c.id !== card.id
    );
    
    let nextSelectedCard = null;
    if (currentPlayerHandCards.length > 0) {
      // Select the first available card in hand
      nextSelectedCard = currentPlayerHandCards[0];
    }
    
    updateGameState({
      ...gameState,
      cards: updatedCards,
      selectedCard: nextSelectedCard,
    });
    
    // If we selected a next card, highlight spawn hexes for it
    if (nextSelectedCard) {
      const spawnEdge = nextSelectedCard.owner === 'player1' 
        ? gameState.leftSpawnEdge 
        : gameState.rightSpawnEdge;
      
      // Filter out occupied spawn hexes
      const availableSpawnHexes = spawnEdge.filter(hex => 
        !updatedCards.some(c => c.position && hexEqual(c.position, hex))
      );
      
      setHighlightedSpawnHexes(availableSpawnHexes);
    } else {
      setHighlightedSpawnHexes([]);
    }
  };

  const selectCard = (card: CardType) => {
    if (!gameState) return;
    
    // In multiplayer, only allow selecting own cards on own turn
    if (isMultiplayer && (!canPerformAction() || card.owner !== playerSlot)) return;
    
    // In local games, only allow selecting current player's cards
    if (!isMultiplayer && card.owner !== gameState.currentPlayer) return;
    
    // If card is in hand (no position), automatically prepare it for placement
    if (!card.position) {
      // Close any open popup
      setCardDetailPopup(null);
      
      // Send multiplayer action
      sendMultiplayerAction('SELECT_CARD', { cardId: card.id });
      
      // Select the card for placement
      updateGameState({
        ...gameState,
        selectedCard: card,
      });
      
      // Highlight spawn hexes
      const spawnEdge = card.owner === 'player1' 
        ? gameState.leftSpawnEdge 
        : gameState.rightSpawnEdge;
      
      // Filter out occupied spawn hexes
      const availableSpawnHexes = spawnEdge.filter(hex => 
        !gameState.cards.some(c => c.position && hexEqual(c.position, hex))
      );
      
      setHighlightedSpawnHexes(availableSpawnHexes);
      return;
    }
    
    const newSelectedCard = card.id === gameState.selectedCard?.id ? null : card;
    
    // Send multiplayer action
    sendMultiplayerAction('SELECT_CARD', { cardId: newSelectedCard?.id || null });
    
    updateGameState({
      ...gameState,
      selectedCard: newSelectedCard,
    });
    
    // Show available actions for units on the board (but not card detail)
    if (newSelectedCard && newSelectedCard.position) {
      setSelectedHexPosition(newSelectedCard.position);
      showAvailableActions(newSelectedCard);
    } else {
      setSelectedHexPosition(null);
      setHighlightedMoveHexes([]);
      setHighlightedAttackHexes([]);
    }
    
    // Clear spawn hexes since this is a unit on board
    setHighlightedSpawnHexes([]);
  };

  const handleCardDoubleClick = (card: CardType) => {
    if (!gameState || card.owner !== gameState.currentPlayer || !card.position) return;
    
    // Show card detail view only on double click
    setCardDetailView(card);
  };

  const handleCardClick = (card: CardType, event?: React.MouseEvent) => {
    if (!card.position) {
      // Cards in hand still work with single click
      selectCard(card);
      return;
    }

    // For cards on board, handle double-click detection
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime;
    
    if (lastClickedCardId === card.id && timeDiff < 300) {
      // Double click detected
      handleCardDoubleClick(card);
    } else {
      // Single click - just select the card
      selectCard(card);
    }
    
    setLastClickTime(currentTime);
    setLastClickedCardId(card.id);
  };

  // New function to handle placing cards from the detail popup
  const handlePlaceCardFromPopup = (card: CardType) => {
    if (!gameState || card.position) return;
    
    // Close the popup
    setCardDetailPopup(null);
    
    // Select the card for placement
    setGameState({
      ...gameState,
      selectedCard: card,
    });
    
    // Highlight spawn hexes
    const spawnEdge = card.owner === 'player1' 
      ? gameState.leftSpawnEdge 
      : gameState.rightSpawnEdge;
    
    // Filter out occupied spawn hexes
    const availableSpawnHexes = spawnEdge.filter(hex => 
      !gameState.cards.some(c => c.position && hexEqual(c.position, hex))
    );
    
    setHighlightedSpawnHexes(availableSpawnHexes);
  };

  // New function to show available actions when a unit is selected
  const showAvailableActions = (card: CardType) => {
    if (!card.position || card.ap <= 0) {
      setHighlightedMoveHexes([]);
      setHighlightedAttackHexes([]);
      return;
    }

    // Calculate movement options
    const moveHexes: HexPosition[] = [];
    gameState!.hexagons.forEach(hex => {
      const distance = hexDistance(card.position!, hex);
      const isOccupied = gameState!.cards.some(c => c.position && hexEqual(c.position, hex));
      
      if (distance <= card.speed && distance > 0 && !isOccupied) {
        moveHexes.push(hex);
      }
    });

    // Calculate attack options
    const attackHexes: HexPosition[] = [];
    gameState!.hexagons.forEach(hex => {
      const distance = hexDistance(card.position!, hex);
      
      if (distance <= card.range && distance > 0) {
        // Check if there's an enemy unit on this hex
        const cardOnHex = gameState!.cards.find(c => c.position && hexEqual(c.position, hex));
        const isEnemyUnit = cardOnHex && cardOnHex.owner !== card.owner;
        
        if (isEnemyUnit) {
          attackHexes.push(hex);
        }
      }
    });

    setHighlightedMoveHexes(moveHexes);
    setHighlightedAttackHexes(attackHexes);
  };

  const executeMove = (targetHex: HexPosition) => {
    if (!gameState?.selectedCard || !canPerformAction()) return;
    if (gameState.selectedCard.ap <= 0) return; // Check AP
    
    // Send multiplayer action first
    if (!sendMultiplayerAction('MOVE_UNIT', { 
      cardId: gameState.selectedCard.id, 
      targetPosition: targetHex 
    })) return;
    
    // Find the hex tile
    const hexTile = gameState.hexagons.find(h => hexEqual(h, targetHex));
    
    // Check if moving to enemy spawn zone
    const isEnemySpawnZone = (gameState.selectedCard.owner === 'player1' && 
                             gameState.rightSpawnEdge.some(hex => hexEqual(hex, targetHex))) ||
                            (gameState.selectedCard.owner === 'player2' && 
                             gameState.leftSpawnEdge.some(hex => hexEqual(hex, targetHex)));
    
    let updatedCards = gameState.cards;
    let updatedFortresses = { ...gameState.fortresses };
    let spawnZoneMessage = '';
    
    if (isEnemySpawnZone) {
      // Unit reached enemy spawn zone - deal fortress damage and remove unit
      const enemyOwner = gameState.selectedCard.owner === 'player1' ? 'player2' : 'player1';
      const unitHP = gameState.selectedCard.hitPoints;
      
      updatedFortresses[enemyOwner].hitPoints -= unitHP;
      updatedCards = gameState.cards.filter(c => c.id !== gameState.selectedCard!.id);
      
      spawnZoneMessage = `🏰 Your unit reached enemy spawn zone! Enemy fortress takes ${unitHP} damage! Unit disappears.`;
    } else {
      // Normal movement
      updatedCards = gameState.cards.map(c =>
        c.id === gameState.selectedCard!.id ? { ...c, position: targetHex, ap: 0 } : c
      );
    }
    
    // Reveal and collect hex reward if available (only for normal movement)
    let updatedHexagons = gameState.hexagons;
    let newCards = updatedCards;
    let rewardMessage = '';
    
    if (!isEnemySpawnZone) {
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
    }
    
    // Check for winner
    let winner = null;
    if (updatedFortresses.player1.hitPoints <= 0 && updatedFortresses.player2.hitPoints <= 0) {
      // Both fortresses destroyed - player with higher remaining fortress HP wins, or current player if tied
      if (updatedFortresses.player1.hitPoints === updatedFortresses.player2.hitPoints) {
        winner = gameState.currentPlayer; // Current player wins in case of perfect tie
      } else {
        winner = updatedFortresses.player1.hitPoints > updatedFortresses.player2.hitPoints ? 'player1' : 'player2';
      }
    } else if (updatedFortresses.player1.hitPoints <= 0) {
      winner = 'player2';
    } else if (updatedFortresses.player2.hitPoints <= 0) {
      winner = 'player1';
    }
    
    updateGameState({
      ...gameState,
      hexagons: updatedHexagons,
      cards: newCards,
      fortresses: updatedFortresses,
      selectedCard: null,
      winner: winner as 'player1' | 'player2' | null,
    });
    setHighlightedMoveHexes([]);
    setHighlightedAttackHexes([]);
    setHighlightedSpawnHexes([]);
    setCardDetailView(null);
    setSelectedHexPosition(null);
    
    // Show appropriate notification
    const finalMessage = spawnZoneMessage || rewardMessage;
    if (finalMessage) {
      setNotification(finalMessage);
      setTimeout(() => setNotification(''), 4000);
    }
  };

  const executeAttack = (targetHex: HexPosition) => {
    if (!gameState?.selectedCard) return;
    if (gameState.selectedCard.ap <= 0) return; // Check AP
    
    // Find target card at hex
    const targetCard = gameState.cards.find(c => c.position && hexEqual(c.position, targetHex));
    
    // If there's no enemy unit at the target hex, don't execute the attack
    if (!targetCard || targetCard.owner === gameState.selectedCard.owner) {
      return;
    }
    
    let updatedCards = gameState.cards;
    let updatedFortresses = { ...gameState.fortresses };
    const attackerHP = gameState.selectedCard.hitPoints;
    const defenderHP = targetCard.hitPoints;
    const attackerPosition = gameState.selectedCard.position!;
    const defenderPosition = targetCard.position!;
    
    // New HP-based combat system with fortress damage (only victim's fortress takes damage)
    if (attackerHP > defenderHP) {
      // Attacker wins - defender is eliminated, attacker advances to defender's hex
      // Attacker takes damage equal to defender's HP
      const attackerNewHP = attackerHP - defenderHP;
      
      // Apply fortress damage equal to defeated unit's HP (only defender's fortress)
      const defenderFortress = updatedFortresses[targetCard.owner];
      defenderFortress.hitPoints -= defenderHP;
      
      updatedCards = gameState.cards
        .filter(c => c.id !== targetCard.id) // Remove defeated unit
        .map(c => c.id === gameState.selectedCard!.id 
          ? { ...c, hitPoints: attackerNewHP, position: defenderPosition, ap: 0 } // Advance to defender's hex
          : c
        );
      
      setNotification(`⚔️ Victory! Enemy defeated! Your unit advances and takes ${defenderHP} damage. Enemy fortress takes ${defenderHP} damage!`);
      
    } else if (defenderHP > attackerHP) {
      // Defender wins - attacker is eliminated, defender advances to attacker's hex
      // Defender takes damage equal to attacker's HP
      const defenderNewHP = defenderHP - attackerHP;
      
      // Apply fortress damage equal to defeated unit's HP (only attacker's fortress)
      const attackerFortress = updatedFortresses[gameState.selectedCard.owner];
      attackerFortress.hitPoints -= attackerHP;
      
      updatedCards = gameState.cards
        .filter(c => c.id !== gameState.selectedCard!.id) // Remove defeated unit
        .map(c => c.id === targetCard.id 
          ? { ...c, hitPoints: defenderNewHP, position: attackerPosition } // Advance to attacker's hex
          : c
        );
      
      setNotification(`💔 Defeat! Your unit was eliminated! Enemy advances and takes ${attackerHP} damage. Your fortress takes ${attackerHP} damage!`);
      
    } else {
      // Equal HP - both units are destroyed, defender's fortress takes damage
      // Apply fortress damage equal to defeated defender's HP (defender always takes fortress damage)
      const defenderFortress = updatedFortresses[targetCard.owner];
      defenderFortress.hitPoints -= defenderHP;
      
      updatedCards = gameState.cards.filter(c => 
        c.id !== targetCard.id && c.id !== gameState.selectedCard!.id
      );
      setNotification(`💥 Equal strength! Both units destroyed in combat! Defender's fortress takes ${defenderHP} damage.`);
    }
    
    // Check for winner
    let winner = null;
    if (updatedFortresses.player1.hitPoints <= 0 && updatedFortresses.player2.hitPoints <= 0) {
      // Both fortresses destroyed - player with higher remaining fortress HP wins, or current player if tied
      if (updatedFortresses.player1.hitPoints === updatedFortresses.player2.hitPoints) {
        winner = gameState.currentPlayer; // Current player wins in case of perfect tie
      } else {
        winner = updatedFortresses.player1.hitPoints > updatedFortresses.player2.hitPoints ? 'player1' : 'player2';
      }
    } else if (updatedFortresses.player1.hitPoints <= 0) {
      winner = 'player2';
    } else if (updatedFortresses.player2.hitPoints <= 0) {
      winner = 'player1';
    }
    
    // Show notification for 3 seconds
    setTimeout(() => setNotification(''), 4000); // Longer duration for more text
    
    // Check for additional victory condition (no units and no cards)
    if (!winner) {
      winner = checkVictoryCondition(updatedCards);
      if (winner) {
        const winnerName = winner === 'player1' ? 'Player 1 (Blue)' : 'Player 2 (Red)';
        setNotification(`🎉 ${winnerName} wins! The opponent has no units on the board and no cards in hand.`);
      }
    }
    
    setGameState({
      ...gameState,
      cards: updatedCards,
      fortresses: updatedFortresses,
      selectedCard: null,
      winner: winner as 'player1' | 'player2' | null,
    });
    setHighlightedMoveHexes([]);
    setHighlightedAttackHexes([]);
    setHighlightedSpawnHexes([]);
    setCardDetailView(null);
    setSelectedHexPosition(null);
  };

  const attackFortress = (fortressOwner: 'player1' | 'player2') => {
    if (!gameState?.selectedCard) return;
    if (gameState.selectedCard.owner === fortressOwner) return;
    if (gameState.selectedCard.ap <= 0) return; // Check AP
    
    const updatedFortresses = { ...gameState.fortresses };
    const targetFortress = updatedFortresses[fortressOwner];
    // Use the unit's HP as the damage dealt to fortress
    targetFortress.hitPoints -= gameState.selectedCard.hitPoints;
    
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
    setHighlightedMoveHexes([]);
    setHighlightedAttackHexes([]);
    setHighlightedSpawnHexes([]);
    setCardDetailView(null);
    setSelectedHexPosition(null);
  };

  // Check if current player has any possible moves
  const hasAvailableMoves = (): boolean => {
    if (!gameState) return false;
    
    // First, check if player can place any cards from hand
    const cardsInHand = gameState.cards.filter(card => 
      card.owner === gameState.currentPlayer && !card.position
    );
    
    if (cardsInHand.length > 0) {
      const spawnEdge = gameState.currentPlayer === 'player1' 
        ? gameState.leftSpawnEdge 
        : gameState.rightSpawnEdge;
      
      // Check if any spawn hex is available
      const hasAvailableSpawn = spawnEdge.some(hex => 
        !gameState.cards.some(c => c.position && hexEqual(c.position, hex))
      );
      
      if (hasAvailableSpawn) return true;
    }
    
    // Then check all units belonging to current player that are on the board
    const currentPlayerUnits = gameState.cards.filter(card => 
      card.owner === gameState.currentPlayer && 
      card.position && 
      card.ap > 0
    );
    
    // Check if any unit can move or attack
    for (const unit of currentPlayerUnits) {
      // Check if unit can move to any valid position
      const canMove = gameState.hexagons.some(hex => {
        const distance = hexDistance(unit.position!, hex);
        const isOccupied = gameState.cards.some(c => c.position && hexEqual(c.position, hex));
        return distance <= unit.speed && distance > 0 && !isOccupied;
      });
      
      if (canMove) return true;
      
      // Check if unit can attack any enemy
      const canAttack = gameState.hexagons.some(hex => {
        const distance = hexDistance(unit.position!, hex);
        if (distance <= unit.range && distance > 0) {
          const cardOnHex = gameState.cards.find(c => c.position && hexEqual(c.position, hex));
          return cardOnHex && cardOnHex.owner !== unit.owner;
        }
        return false;
      });
      
      if (canAttack) return true;
    }
    
    return false;
  };

  // Check if a player has lost (no units on board and no cards in hand)
  const checkVictoryCondition = (cards: CardType[]): 'player1' | 'player2' | null => {
    const player1UnitsOnBoard = cards.filter(c => c.owner === 'player1' && c.position).length;
    const player1CardsInHand = cards.filter(c => c.owner === 'player1' && !c.position).length;
    
    const player2UnitsOnBoard = cards.filter(c => c.owner === 'player2' && c.position).length;
    const player2CardsInHand = cards.filter(c => c.owner === 'player2' && !c.position).length;
    
    // Player 1 wins if Player 2 has no units on board and no cards in hand
    if (player2UnitsOnBoard === 0 && player2CardsInHand === 0) {
      return 'player1';
    }
    
    // Player 2 wins if Player 1 has no units on board and no cards in hand
    if (player1UnitsOnBoard === 0 && player1CardsInHand === 0) {
      return 'player2';
    }
    
    return null; // No victory yet
  };

  const endTurn = () => {
    if (!gameState || !canPerformAction()) return;
    
    // Send multiplayer action first
    if (!sendMultiplayerAction('END_TURN', {})) return;
    
    const nextPlayer = gameState.currentPlayer === 'player1' ? 'player2' : 'player1';
    const newTurnCount = turnCount + 1;
    
    // Reset AP for all cards owned by the next player
    const updatedCards = gameState.cards.map(c => 
      c.owner === nextPlayer && c.position ? { ...c, ap: 1 } : c
    );

    // Check for victory condition after updating cards
    const winner = checkVictoryCondition(updatedCards);
    if (winner) {
      const winnerName = winner === 'player1' ? 'Player 1 (Blue)' : 'Player 2 (Red)';
      setNotification(`🎉 ${winnerName} wins! The opponent has no units on the board and no cards in hand.`);
      return; // Don't continue the turn if someone has won
    }
    
    // Respawn rewards on empty hexes every 3 turns (to avoid flooding the board)
    let updatedHexagons = gameState.hexagons;
    let rewardsAdded = 0;
    
    if (newTurnCount % 3 === 0) {
      const respawnResult = respawnRewards(gameState.hexagons, updatedCards);
      updatedHexagons = respawnResult.updatedHexagons;
      rewardsAdded = respawnResult.rewardsAdded;
    }
    
    updateGameState({
      ...gameState,
      cards: updatedCards,
      hexagons: updatedHexagons,
      currentPlayer: nextPlayer,
      selectedCard: null,
    });
    setTurnCount(newTurnCount);
    setHighlightedMoveHexes([]);
    setHighlightedAttackHexes([]);
    setHighlightedSpawnHexes([]);
    setCardDetailView(null);
    setSelectedHexPosition(null);
    
    // Show notification if rewards were added
    if (rewardsAdded > 0) {
      setNotification(`✨ ${rewardsAdded} new reward${rewardsAdded > 1 ? 's' : ''} appeared on the battlefield!`);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  // Function to respawn rewards on previously visited empty hexes
  const respawnRewards = (hexagons: HexTile[], cards: CardType[]): { updatedHexagons: HexTile[], rewardsAdded: number } => {
    // Find eligible hexes: revealed, no current reward, not occupied, not spawn edges
    const eligibleHexes = hexagons.filter(hex => {
      const isOccupied = cards.some(c => c.position && hexEqual(c.position, hex));
      const isSpawnEdge = gameState!.leftSpawnEdge.some(spawn => hexEqual(spawn, hex)) ||
                         gameState!.rightSpawnEdge.some(spawn => hexEqual(spawn, hex));
      
      return hex.isRevealed && 
             !hex.reward && 
             !isOccupied && 
             !isSpawnEdge; // Include all revealed empty hexes, not just previously collected ones
    });
    
    // If we have at least 2 eligible hexes, randomly select 2 for new rewards
    if (eligibleHexes.length >= 2) {
      const selectedHexes: HexTile[] = [];
      const availableHexes = [...eligibleHexes];
      
      // Randomly select 2 hexes
      for (let i = 0; i < 2 && availableHexes.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableHexes.length);
        selectedHexes.push(availableHexes[randomIndex]);
        availableHexes.splice(randomIndex, 1);
      }
      
      // Add rewards to selected hexes
      const updatedHexagons = hexagons.map(hex => {
        const isSelected = selectedHexes.some(selected => hexEqual(selected, hex));
        if (isSelected) {
          // Randomly select a reward card template
          const randomCardIndex = Math.floor(Math.random() * CARD_TEMPLATES.length);
          const newReward = CARD_TEMPLATES[randomCardIndex];
          
          return {
            ...hex,
            reward: newReward,
            isCollected: false, // Reset collection status
          };
        }
        return hex;
      });
      
      return { updatedHexagons, rewardsAdded: selectedHexes.length };
    }
    
    return { updatedHexagons: hexagons, rewardsAdded: 0 };
  };

  const handleHexClick = (hex: HexPosition) => {
    if (!gameState?.selectedCard) return;
    
    // Check if this is a move or attack action
    const isMoveTarget = highlightedMoveHexes.some(h => hexEqual(h, hex));
    const isAttackTarget = highlightedAttackHexes.some(h => hexEqual(h, hex));
    const isSpawnTarget = highlightedSpawnHexes.some(h => hexEqual(h, hex));
    
    if (isMoveTarget) {
      executeMove(hex);
    } else if (isAttackTarget) {
      executeAttack(hex);
    } else if (isSpawnTarget && !gameState.selectedCard.position) {
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
    if (!gameState?.selectedCard) return false;
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
    <div 
      className="min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 p-2 sm:p-4"
      onMouseMove={(e) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      }}
    >
      {/* Help Popup */}
      <HelpPopup isOpen={showHelp} onClose={() => setShowHelp(false)} />
      
      {/* Card Detail Popup */}
      <CardDetailPopup 
        card={cardDetailPopup} 
        onClose={() => setCardDetailPopup(null)}
        onPlaceCard={handlePlaceCardFromPopup}
      />
      
      {/* Reward Notification */}
      {notification && (
        <div 
          className="fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 px-4 sm:px-8 py-2 sm:py-4 rounded-lg shadow-2xl z-50 text-lg sm:text-xl font-bold animate-bounce max-w-[90vw] text-center border-2 border-gray-300"
          style={{ backgroundColor: 'white', opacity: 1 }}
        >
          {notification}
        </div>
      )}
      
      {/* Winner Banner */}
      {gameState.winner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-lg text-center max-w-sm w-full">
            <h2 className="text-2xl sm:text-4xl font-bold mb-4">
              {gameState.winner === 'player1' ? 'Player 1' : 'Player 2'} Wins!
            </h2>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded font-bold text-lg touch-manipulation"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
      
      {/* Top Bar */}
      <div className="bg-white/90 rounded-lg p-3 sm:p-4 mb-2 sm:mb-4 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 mb-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-lg sm:text-2xl font-bold text-center">
              Current Turn: <span className={gameState.currentPlayer === 'player1' ? 'text-blue-600' : 'text-red-600'}>
                {gameState.currentPlayer === 'player1' ? 'Player 1' : 'Player 2'}
              </span>
              {isMultiplayer && (
                <span className="text-sm font-normal ml-2">
                  {playerSlot === gameState.currentPlayer ? '(You)' : '(Opponent)'}
                </span>
              )}
            </div>
            {/* Turn Counter */}
            <div className="text-sm sm:text-base bg-purple-100 px-2 sm:px-3 py-1 rounded-lg border-2 border-purple-300">
              <span className="font-bold text-purple-700">Turn {turnCount + 1}</span>
              {(turnCount + 1) % 3 === 0 && (
                <span className="text-xs text-purple-600 block">✨ Rewards may spawn!</span>
              )}
            </div>
            {/* Help Button */}
            <button
              onClick={() => setShowHelp(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold text-lg sm:text-xl px-4 sm:px-5 py-2 rounded-full shadow-lg transform hover:scale-110 transition-all touch-manipulation"
              title="Show game instructions and tips"
            >
              ❓
            </button>
          </div>
          <button
            onClick={endTurn}
            disabled={!canPerformAction()}
            className={`px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-bold text-lg sm:text-xl shadow-lg transform transition-all touch-manipulation w-full sm:w-auto ${
              canPerformAction() 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 text-white'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            End Turn ➡️
          </button>
        </div>
        <div className="text-sm sm:text-base text-gray-700 font-semibold text-center sm:text-left">
          {!gameState.selectedCard && '📝 Select a card from your hand below to place it on the board'}
          {gameState.selectedCard && !gameState.selectedCard.position && '📍 Click a highlighted blue spawn hex (P1) or red spawn hex (P2) to place your unit'}
          {gameState.selectedCard && gameState.selectedCard.position && gameState.selectedCard.ap > 0 && '⚡ Unit selected! Blue highlights show movement options, red highlights show attack targets. Click any highlighted hex to perform that action!'}
          {gameState.selectedCard && gameState.selectedCard.position && gameState.selectedCard.ap === 0 && '⏸️ This unit has already acted this turn - select another unit or end your turn'}
        </div>
      </div>

      {/* Fortress Section - Both fortresses side by side at top */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-2 sm:mb-4">
        <div className="flex-1">
          <Fortress 
            fortress={gameState.fortresses.player1} 
            side="left"
            isAttackable={canAttackFortress('player1')}
            onClick={() => canAttackFortress('player1') && attackFortress('player1')}
          />
        </div>
        <div className="flex-1">
          <Fortress 
            fortress={gameState.fortresses.player2} 
            side="right"
            isAttackable={canAttackFortress('player2')}
            onClick={() => canAttackFortress('player2') && attackFortress('player2')}
          />
        </div>
      </div>

      {/* Card Detail Section - Full width when shown */}
      {cardDetailView && (
        <div className="mb-2 sm:mb-4">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border-4 sm:border-8 border-amber-600 overflow-hidden bg-opacity-95 w-full">
            {/* Card Frame - Top Ornamental Border */}
            <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 h-2 sm:h-4"></div>
            
            {/* Card Header */}
            <div className="bg-gradient-to-r from-amber-700 to-amber-800 px-2 sm:px-4 py-2 sm:py-3 border-b-2 sm:border-b-4 border-amber-900">
              <h2 className="text-lg sm:text-2xl font-bold text-center text-white drop-shadow-lg">
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
        </div>
      )}

      {/* Main Game Area */}
      <div className="flex flex-col gap-2 sm:gap-4 mb-2 sm:mb-4">

        {/* Game Board - Full Width */}
        <div className="w-full bg-white/10 rounded-lg p-2 sm:p-4 flex items-center justify-center min-h-[300px] sm:min-h-[500px] relative">
          <div className="w-full max-w-full overflow-auto">
            <svg
              width={width}
              height={height}
              viewBox={`${minX} ${minY} ${width} ${height}`}
              className="mx-auto w-full h-auto min-h-[300px] sm:min-h-[400px] touch-manipulation"
              style={{ 
                maxWidth: '100%',
                height: 'auto',
                minHeight: '300px'
              }}
            >
            {/* Render hexagons */}
            {gameState.hexagons.map((hexTile, index) => {
              const hasCard = cardsOnBoard.some(c => c.position && hexEqual(c.position, hexTile));
              const isSpawnTarget = highlightedSpawnHexes.some(h => hexEqual(h, hexTile));
              const isMoveTarget = highlightedMoveHexes.some(h => hexEqual(h, hexTile));
              const isAttackTarget = highlightedAttackHexes.some(h => hexEqual(h, hexTile));
              const isLeftSpawn = gameState.leftSpawnEdge.some(h => hexEqual(h, hexTile));
              const isRightSpawn = gameState.rightSpawnEdge.some(h => hexEqual(h, hexTile));
              const isSpawnEdge = isLeftSpawn || isRightSpawn;
              
              return (
                <g key={`${hexTile.q}-${hexTile.r}`}>
                  <Hexagon
                    tile={hexTile}
                    isHighlighted={isSpawnTarget || isMoveTarget}
                    isAttackable={isAttackTarget}
                    onClick={() => handleHexClick(hexTile)}
                    onMouseEnter={() => {
                      if (isMoveTarget) {
                        // Check if this is an enemy spawn zone
                        const isEnemySpawn = (gameState.selectedCard?.owner === 'player1' && isRightSpawn) ||
                                           (gameState.selectedCard?.owner === 'player2' && isLeftSpawn);
                        setHoverAction(isEnemySpawn ? 'fortress-attack' : 'move');
                      } else if (isAttackTarget) {
                        setHoverAction('attack');
                      } else {
                        setHoverAction(null);
                      }
                    }}
                    onMouseLeave={() => setHoverAction(null)}
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
              const isAttackTarget = highlightedAttackHexes.some(h => hexEqual(h, card.position!));
              const isOwnUnit = card.owner === gameState.currentPlayer;
              
              return (
                <g 
                  key={card.id} 
                  transform={`translate(${x}, ${y})`}
                  onClick={(e) => {
                    // Only stop propagation for own units, let enemy units pass through to hex
                    if (isOwnUnit) {
                      e.stopPropagation();
                      handleCardClick(card);
                    }
                  }}
                  style={{ 
                    cursor: isOwnUnit ? 'pointer' : 'default',
                    pointerEvents: isAttackTarget ? 'none' : 'auto'
                  }}
                  className="touch-manipulation"
                >
                  {/* Unit circle background */}
                  <circle
                    cx="0"
                    cy="0"
                    r="30"
                    fill={card.owner === 'player1' ? '#60A5FA' : '#F87171'}
                    opacity="0.9"
                    stroke={isSelected ? '#FFD700' : '#000'}
                    strokeWidth={isSelected ? '4' : '2'}
                    style={{ pointerEvents: isAttackTarget ? 'none' : 'auto' }}
                  />
                  {/* Unit image */}
                  <image
                    href={card.imageUrl}
                    x="-20"
                    y="-20"
                    width="40"
                    height="40"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ pointerEvents: 'none' }}
                  />
                  {/* HP bar */}
                  <text
                    x="0"
                    y="40"
                    textAnchor="middle"
                    fill="white"
                    fontSize="11"
                    fontWeight="bold"
                    stroke="#000"
                    strokeWidth="0.5"
                    style={{ pointerEvents: 'none' }}
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
                        style={{ pointerEvents: 'none' }}
                      />
                      <text
                        x="22"
                        y="-18"
                        textAnchor="middle"
                        fill="white"
                        fontSize="12"
                        fontWeight="bold"
                        style={{ pointerEvents: 'none' }}
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
                        HP:{card.hitPoints} SPD:{card.speed} RNG:{card.range}
                      </text>
                    </>
                  )}
                </g>
              );
            })}
            
          </svg>
          </div>
        </div>
      </div>

      {/* Player Hands - Side by side horizontally */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-4 mb-2 sm:mb-4">
        {/* Player 1 Hand */}
        <div className="bg-gradient-to-br from-blue-500/40 to-blue-700/40 rounded-xl p-3 sm:p-4 shadow-xl border-2 sm:border-4 border-blue-400">
          <h3 className="text-white font-bold text-lg sm:text-xl mb-2 sm:mb-3 text-center">🔵 Player 1 Hand</h3>
          <div className="flex gap-2 sm:gap-4 flex-wrap justify-center">
            {player1Hand.map(card => (
              <div key={card.id} className="touch-manipulation">
                <Card
                  card={card}
                  isSelected={gameState.selectedCard?.id === card.id}
                  onClick={() => selectCard(card)}
                  showActions={false}
                />
              </div>
            ))}
            {player1Hand.length === 0 && (
              <p className="text-white/70 text-center w-full py-3 sm:py-4 text-sm sm:text-base">No cards in hand</p>
            )}
          </div>
        </div>

        {/* Player 2 Hand */}
        <div className="bg-gradient-to-br from-red-500/40 to-red-700/40 rounded-xl p-3 sm:p-4 shadow-xl border-2 sm:border-4 border-red-400">
          <h3 className="text-white font-bold text-lg sm:text-xl mb-2 sm:mb-3 text-center">🔴 Player 2 Hand</h3>
          <div className="flex gap-2 sm:gap-4 flex-wrap justify-center">
            {player2Hand.map(card => (
              <div key={card.id} className="touch-manipulation">
                <Card
                  card={card}
                  isSelected={gameState.selectedCard?.id === card.id}
                  onClick={() => selectCard(card)}
                  showActions={false}
                />
              </div>
            ))}
            {player2Hand.length === 0 && (
              <p className="text-white/70 text-center w-full py-3 sm:py-4 text-sm sm:text-base">No cards in hand</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Action Tooltip */}
      {hoverAction && mousePosition && (
        <div
          className="fixed pointer-events-none z-50 px-3 py-1 rounded-lg text-white font-bold text-sm shadow-lg"
          style={{
            left: mousePosition.x + 10,
            top: mousePosition.y - 30,
            backgroundColor: hoverAction === 'move' ? '#10B981' : 
                           hoverAction === 'fortress-attack' ? '#8B5CF6' : '#EF4444',
          }}
        >
          {hoverAction === 'move' ? '🏃 Move' : 
           hoverAction === 'fortress-attack' ? '🏰 Attack Fortress' : '⚔️ Attack'}
        </div>
      )}
    </div>
  );
};

export default Game;
