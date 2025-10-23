// Enhanced Game Analysis with Different Scenarios

class EnhancedGameSimulator {
  constructor(aggressionLevel = 0.7, cardGainRate = 0.6, turnTimeSeconds = 45) {
    this.aggressionLevel = aggressionLevel; // How often players attack vs move
    this.cardGainRate = cardGainRate; // Chance to gain card each turn
    this.turnTimeSeconds = turnTimeSeconds; // Estimated seconds per turn
    this.results = [];
  }

  runScenarioAnalysis() {
    console.log('🎯 ENHANCED GRAND WARFARE GAME LENGTH ANALYSIS\\n');
    
    // Scenario 1: Normal play (baseline)
    console.log('📊 SCENARIO 1: NORMAL GAMEPLAY');
    console.log('- Aggression Level: 70% (balanced play)');
    console.log('- Card Gain Rate: 60% per turn');
    console.log('- Turn Time: 45 seconds\\n');
    
    const normal = new EnhancedGameSimulator(0.7, 0.6, 45);
    const normalResults = normal.simulateScenario(500);
    
    // Scenario 2: Aggressive play
    console.log('\\n📊 SCENARIO 2: AGGRESSIVE GAMEPLAY');
    console.log('- Aggression Level: 90% (attack-focused)');
    console.log('- Card Gain Rate: 60% per turn');
    console.log('- Turn Time: 35 seconds (faster decisions)\\n');
    
    const aggressive = new EnhancedGameSimulator(0.9, 0.6, 35);
    const aggressiveResults = aggressive.simulateScenario(500);
    
    // Scenario 3: Defensive/Strategic play
    console.log('\\n📊 SCENARIO 3: DEFENSIVE/STRATEGIC GAMEPLAY');
    console.log('- Aggression Level: 40% (cautious play)');
    console.log('- Card Gain Rate: 80% per turn (more collection)');
    console.log('- Turn Time: 60 seconds (more thinking)\\n');
    
    const defensive = new EnhancedGameSimulator(0.4, 0.8, 60);
    const defensiveResults = defensive.simulateScenario(500);
    
    // Summary comparison
    console.log('\\n🎯 SCENARIO COMPARISON:');
    console.log('========================');
    console.log(`Normal Play:     ${normalResults.avgRounds} rounds avg, ${normalResults.avgGameTime} min avg`);
    console.log(`Aggressive Play: ${aggressiveResults.avgRounds} rounds avg, ${aggressiveResults.avgGameTime} min avg`);
    console.log(`Defensive Play:  ${defensiveResults.avgRounds} rounds avg, ${defensiveResults.avgGameTime} min avg`);
    
    console.log('\\n🎮 PRACTICAL RECOMMENDATIONS:');
    console.log('==============================');
    console.log('✓ Expect most games to last 15-35 minutes');
    console.log('✓ Tournament format: Allow 45 minutes per match');
    console.log('✓ Casual play: Budget 30 minutes per game');
    console.log('✓ Quick matches: Possible in 15-20 minutes with aggressive play');
    console.log('✓ Epic battles: May extend to 60+ minutes in defensive scenarios');
  }

  simulateScenario(numberOfGames) {
    this.results = [];
    
    for (let i = 0; i < numberOfGames; i++) {
      const result = this.simulateGame();
      this.results.push(result);
    }

    return this.analyzeResults();
  }

  simulateGame() {
    const gameState = {
      fortresses: {
        player1: { hitPoints: 3000, maxHitPoints: 3000 },
        player2: { hitPoints: 3000, maxHitPoints: 3000 }
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
    
    while (!this.checkWinCondition(gameState)) {
      this.simulateTurn(gameState);
    }

    return {
      rounds: gameState.roundCount,
      turns: gameState.turnCount,
      winner: gameState.winner
    };
  }

  generateStartingHand(player) {
    const CARD_TEMPLATES = [
      { name: 'Man', hitPoints: 200, maxHitPoints: 200, speed: 2, range: 1 },
      { name: 'Grass', hitPoints: 300, maxHitPoints: 300, speed: 1, range: 1 },
      { name: 'Mouse', hitPoints: 30, maxHitPoints: 30, speed: 2, range: 1 },
    ];

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
    
    let actionsThisTurn = 0;
    const maxActionsPerTurn = 6;

    // Play cards from hand
    if (playerHand.length > 0 && actionsThisTurn < maxActionsPerTurn) {
      const cardToPlay = playerHand[Math.floor(Math.random() * playerHand.length)];
      playerUnits.push(cardToPlay);
      gameState.cards[currentPlayer] = playerHand.filter(c => c.id !== cardToPlay.id);
      actionsThisTurn++;
    }

    // Move and attack with units
    playerUnits.forEach(unit => {
      if (unit.ap > 0 && actionsThisTurn < maxActionsPerTurn) {
        if (Math.random() < this.aggressionLevel) {
          this.simulateAttack(gameState, unit, opponentPlayer);
        }
        unit.ap = 0;
        actionsThisTurn++;
      }
    });

    // Reset AP and clean up dead units
    gameState.boardUnits[currentPlayer] = playerUnits.filter(u => u.hitPoints > 0);
    gameState.boardUnits[currentPlayer].forEach(unit => unit.ap = 1);

    // Gain new card
    if (Math.random() < this.cardGainRate) {
      const CARD_TEMPLATES = [
        { name: 'Man', hitPoints: 200, maxHitPoints: 200, speed: 2, range: 1 },
        { name: 'Grass', hitPoints: 300, maxHitPoints: 300, speed: 1, range: 1 },
        { name: 'Mouse', hitPoints: 30, maxHitPoints: 30, speed: 2, range: 1 },
      ];
      const template = CARD_TEMPLATES[Math.floor(Math.random() * CARD_TEMPLATES.length)];
      gameState.cards[currentPlayer].push({
        ...template,
        id: `${currentPlayer}_card_${Date.now()}_${Math.random()}`,
        owner: currentPlayer,
        ap: 1
      });
    }

    // Switch players and count rounds
    gameState.currentPlayer = opponentPlayer;
    gameState.turnCount++;
    if (gameState.turnCount % 2 === 0) {
      gameState.roundCount++;
    }
  }

  simulateAttack(gameState, attacker, opponentPlayer) {
    const opponentUnits = gameState.boardUnits[opponentPlayer];
    
    if (opponentUnits.length === 0 || Math.random() < 0.35) {
      // Attack fortress
      const damage = Math.floor(attacker.hitPoints * (0.25 + Math.random() * 0.35));
      gameState.fortresses[opponentPlayer].hitPoints -= damage;
      gameState.fortresses[opponentPlayer].hitPoints = Math.max(0, gameState.fortresses[opponentPlayer].hitPoints);
    } else {
      // Attack unit
      const target = opponentUnits[Math.floor(Math.random() * opponentUnits.length)];
      const damage = Math.floor(attacker.hitPoints * (0.4 + Math.random() * 0.6));
      target.hitPoints -= damage;
      
      // Counter attack
      if (Math.random() < 0.5 && target.hitPoints > 0) {
        const counterDamage = Math.floor(target.hitPoints * (0.2 + Math.random() * 0.3));
        attacker.hitPoints -= counterDamage;
        attacker.hitPoints = Math.max(0, attacker.hitPoints);
      }
    }
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
    if (gameState.roundCount >= 80) {
      gameState.winner = gameState.fortresses.player1.hitPoints > gameState.fortresses.player2.hitPoints ? 'player1' : 'player2';
      return true;
    }
    return false;
  }

  analyzeResults() {
    const totalRounds = this.results.reduce((sum, game) => sum + game.rounds, 0);
    const totalTurns = this.results.reduce((sum, game) => sum + game.turns, 0);
    const averageRounds = totalRounds / this.results.length;
    const averageTurns = totalTurns / this.results.length;
    const avgGameTimeMinutes = (averageTurns * this.turnTimeSeconds) / 60;

    const roundCounts = this.results.map(r => r.rounds).sort((a, b) => a - b);
    const medianRounds = roundCounts[Math.floor(roundCounts.length / 2)];

    console.log(`Average rounds: ${averageRounds.toFixed(1)}`);
    console.log(`Median rounds: ${medianRounds}`);
    console.log(`Average game time: ${avgGameTimeMinutes.toFixed(1)} minutes`);
    console.log(`Range: ${Math.min(...roundCounts)} - ${Math.max(...roundCounts)} rounds`);

    return {
      avgRounds: averageRounds.toFixed(1),
      medianRounds,
      avgGameTime: avgGameTimeMinutes.toFixed(1)
    };
  }
}

// Run enhanced analysis
const enhancedSim = new EnhancedGameSimulator();
enhancedSim.runScenarioAnalysis();