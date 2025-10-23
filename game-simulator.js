// Grand Warfare Game Length Simulator
// Simulates multiple games to determine average rounds per game

const CARD_TEMPLATES = [
  { name: 'Man', hitPoints: 200, maxHitPoints: 200, speed: 2, range: 1 },
  { name: 'Grass', hitPoints: 300, maxHitPoints: 300, speed: 1, range: 1 },
  { name: 'Mouse', hitPoints: 30, maxHitPoints: 30, speed: 2, range: 1 },
];

class GameSimulator {
  constructor() {
    this.results = [];
  }

  createInitialGameState() {
    return {
      fortresses: {
        player1: { hitPoints: 3000, maxHitPoints: 3000, owner: 'player1' },
        player2: { hitPoints: 3000, maxHitPoints: 3000, owner: 'player2' }
      },
      currentPlayer: 'player1',
      winner: null,
      roundCount: 0,
      turnCount: 0,
      cards: {
        player1: this.generateStartingHand('player1'),
        player2: this.generateStartingHand('player2')
      },
      boardUnits: {
        player1: [],
        player2: []
      }
    };
  }

  generateStartingHand(player) {
    // Each player starts with 3 random cards
    const hand = [];
    for (let i = 0; i < 3; i++) {
      const template = CARD_TEMPLATES[Math.floor(Math.random() * CARD_TEMPLATES.length)];
      hand.push({
        ...template,
        id: `${player}_card_${i}`,
        owner: player,
        ap: 1
      });
    }
    return hand;
  }

  simulateTurn(gameState) {
    const currentPlayer = gameState.currentPlayer;
    const playerHand = gameState.cards[currentPlayer];
    const playerUnits = gameState.boardUnits[currentPlayer];
    const opponentPlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
    
    // Simulate player actions during their turn
    let actionsThisTurn = 0;
    const maxActionsPerTurn = 5; // Prevent infinite loops

    // Phase 1: Play cards from hand
    if (playerHand.length > 0 && actionsThisTurn < maxActionsPerTurn) {
      const cardToPlay = playerHand[Math.floor(Math.random() * playerHand.length)];
      playerUnits.push(cardToPlay);
      gameState.cards[currentPlayer] = playerHand.filter(c => c.id !== cardToPlay.id);
      actionsThisTurn++;
    }

    // Phase 2: Move and attack with existing units
    playerUnits.forEach(unit => {
      if (unit.ap > 0 && actionsThisTurn < maxActionsPerTurn) {
        // 70% chance to attack, 30% chance to move
        if (Math.random() < 0.7) {
          this.simulateAttack(gameState, unit, opponentPlayer);
        } else {
          this.simulateMove(gameState, unit);
        }
        unit.ap = 0; // Unit has acted
        actionsThisTurn++;
      }
    });

    // Reset AP for all units at end of turn
    playerUnits.forEach(unit => unit.ap = 1);

    // Add new random card to hand (simulating board collection)
    if (Math.random() < 0.6) { // 60% chance to gain a card each turn
      const template = CARD_TEMPLATES[Math.floor(Math.random() * CARD_TEMPLATES.length)];
      gameState.cards[currentPlayer].push({
        ...template,
        id: `${currentPlayer}_card_${Date.now()}_${Math.random()}`,
        owner: currentPlayer,
        ap: 1
      });
    }

    // Switch players
    gameState.currentPlayer = opponentPlayer;
    gameState.turnCount++;

    // Count rounds (both players have had a turn)
    if (gameState.turnCount % 2 === 0) {
      gameState.roundCount++;
    }
  }

  simulateAttack(gameState, attacker, opponentPlayer) {
    const opponentUnits = gameState.boardUnits[opponentPlayer];
    
    // 40% chance to attack fortress directly, 60% chance to attack units
    if (opponentUnits.length === 0 || Math.random() < 0.4) {
      // Attack fortress
      const damage = Math.floor(attacker.hitPoints * (0.3 + Math.random() * 0.4)); // 30-70% of unit HP as damage
      gameState.fortresses[opponentPlayer].hitPoints -= damage;
      gameState.fortresses[opponentPlayer].hitPoints = Math.max(0, gameState.fortresses[opponentPlayer].hitPoints);
    } else {
      // Attack enemy unit
      const target = opponentUnits[Math.floor(Math.random() * opponentUnits.length)];
      const damage = Math.floor(attacker.hitPoints * (0.5 + Math.random() * 0.5)); // 50-100% of attacker HP as damage
      target.hitPoints -= damage;
      
      // Remove dead units
      if (target.hitPoints <= 0) {
        gameState.boardUnits[opponentPlayer] = opponentUnits.filter(u => u.id !== target.id);
      }
      
      // Attacker might take counter damage
      if (Math.random() < 0.6) {
        const counterDamage = Math.floor(target.hitPoints * (0.2 + Math.random() * 0.3));
        attacker.hitPoints -= counterDamage;
        attacker.hitPoints = Math.max(0, attacker.hitPoints);
      }
    }
  }

  simulateMove(gameState, unit) {
    // Moving doesn't change game state significantly for our simulation
    // Just mark that the unit moved (already handled by AP reset)
  }

  checkWinCondition(gameState) {
    if (gameState.fortresses.player1.hitPoints <= 0) {
      gameState.winner = 'player2';
      return true;
    }
    if (gameState.fortresses.player2.hitPoints <= 0) {
      gameState.winner = 'player1';
      return true;
    }

    // Stalemate condition: game goes on too long
    if (gameState.roundCount >= 100) { // Max 100 rounds
      gameState.winner = gameState.fortresses.player1.hitPoints > gameState.fortresses.player2.hitPoints ? 'player1' : 'player2';
      return true;
    }

    return false;
  }

  simulateGame() {
    const gameState = this.createInitialGameState();
    
    while (!this.checkWinCondition(gameState)) {
      this.simulateTurn(gameState);
    }

    return {
      rounds: gameState.roundCount,
      turns: gameState.turnCount,
      winner: gameState.winner,
      finalFortressHP: {
        player1: gameState.fortresses.player1.hitPoints,
        player2: gameState.fortresses.player2.hitPoints
      }
    };
  }

  runSimulation(numberOfGames = 1000) {
    console.log(`🎮 Running ${numberOfGames} Grand Warfare game simulations...\\n`);
    
    this.results = [];
    
    for (let i = 0; i < numberOfGames; i++) {
      if (i % 100 === 0) {
        console.log(`Progress: ${i}/${numberOfGames} games completed`);
      }
      
      const result = this.simulateGame();
      this.results.push(result);
    }

    this.analyzeResults();
  }

  analyzeResults() {
    const totalRounds = this.results.reduce((sum, game) => sum + game.rounds, 0);
    const totalTurns = this.results.reduce((sum, game) => sum + game.turns, 0);
    const averageRounds = totalRounds / this.results.length;
    const averageTurns = totalTurns / this.results.length;

    const roundCounts = this.results.map(r => r.rounds).sort((a, b) => a - b);
    const medianRounds = roundCounts[Math.floor(roundCounts.length / 2)];
    const minRounds = Math.min(...roundCounts);
    const maxRounds = Math.max(...roundCounts);

    const player1Wins = this.results.filter(r => r.winner === 'player1').length;
    const player2Wins = this.results.filter(r => r.winner === 'player2').length;

    // Time estimation (assuming each turn takes 30-60 seconds)
    const avgTurnTime = 45; // seconds
    const avgGameTimeMinutes = (averageTurns * avgTurnTime) / 60;

    console.log('\\n📊 SIMULATION RESULTS:');
    console.log('========================');
    console.log(`Total games simulated: ${this.results.length}`);
    console.log(`\\n🔢 ROUNDS PER GAME:`);
    console.log(`Average rounds: ${averageRounds.toFixed(1)}`);
    console.log(`Median rounds: ${medianRounds}`);
    console.log(`Range: ${minRounds} - ${maxRounds} rounds`);
    console.log(`\\n⏰ ESTIMATED GAME TIME:`);
    console.log(`Average turns per game: ${averageTurns.toFixed(1)}`);
    console.log(`Estimated average game time: ${avgGameTimeMinutes.toFixed(1)} minutes`);
    console.log(`Estimated time range: ${((minRounds * 2 * avgTurnTime) / 60).toFixed(1)} - ${((maxRounds * 2 * avgTurnTime) / 60).toFixed(1)} minutes`);
    console.log(`\\n🏆 WIN DISTRIBUTION:`);
    console.log(`Player 1 wins: ${player1Wins} (${((player1Wins/this.results.length)*100).toFixed(1)}%)`);
    console.log(`Player 2 wins: ${player2Wins} (${((player2Wins/this.results.length)*100).toFixed(1)}%)`);

    // Round distribution
    console.log(`\\n📈 ROUND DISTRIBUTION:`);
    const buckets = {};
    this.results.forEach(game => {
      const bucket = Math.floor(game.rounds / 5) * 5; // Group by 5s
      buckets[bucket] = (buckets[bucket] || 0) + 1;
    });

    Object.keys(buckets).sort((a, b) => parseInt(a) - parseInt(b)).forEach(bucket => {
      const percentage = ((buckets[bucket] / this.results.length) * 100).toFixed(1);
      console.log(`${bucket}-${parseInt(bucket) + 4} rounds: ${buckets[bucket]} games (${percentage}%)`);
    });

    return {
      averageRounds: averageRounds.toFixed(1),
      medianRounds,
      avgGameTimeMinutes: avgGameTimeMinutes.toFixed(1),
      winRate: {
        player1: ((player1Wins/this.results.length)*100).toFixed(1),
        player2: ((player2Wins/this.results.length)*100).toFixed(1)
      }
    };
  }
}

// Run the simulation
const simulator = new GameSimulator();
simulator.runSimulation(1000); // Simulate 1000 games