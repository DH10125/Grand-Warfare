# Grand Warfare

A hexagonal grid strategy card game built with Next.js and TypeScript.

## Game Features

- **Hexagonal Grid Board**: Play on a dynamic 40-tile hexagonal grid with multiple pathways
- **Two Fortresses**: Each player has a fortress with 3000 HP
- **Hidden Card Rewards**: Unrevealed hexes (marked with ?) contain hidden card rewards
  - Move your units onto these hexes to reveal and collect cards
  - Cards are automatically added to your hand when collected
  - Revealed hexes show a 🎴 icon if they have uncollected rewards
  - Collected hexes are marked with a ✓ checkmark
- **Strategic Pathways**: Multiple routes allow players to:
  - Dodge enemy units
  - Plan optimal paths to collect better rewards
  - Balance between advancing and collecting resources
- **Three Card Types**:
  - **Man**: 200 HP, 40 ATK, 2 SPD, 1 RNG
  - **Patch of grass**: 300 HP, 80 ATK, 1 SPD, 1 RNG
  - **Mouse**: 30 HP, 5 ATK, 2 SPD, 1 RNG
- **Card Actions**: Each card can move or attack once per turn
- **Turn-Based Gameplay**: Players alternate turns
- **Win Condition**: Reduce opponent's fortress to 0 HP

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to play the game.

## How to Play

### Starting the Game
- Each player is automatically dealt 3 random cards at the start of the game
- Players alternate turns starting with Player 1

### Placing Units
1. **Select a card** from your hand by clicking on it
2. **Click on a highlighted spawn hex** to place your unit:
   - Player 1 spawns on the **left blue edge** (marked with "P1")
   - Player 2 spawns on the **right red edge** (marked with "P2")
3. Units **cannot act on the turn they're placed** - they need to wait until your next turn

### Moving Units
1. **Wait for your turn** - Units get 1 Action Point (AP) at the start of their owner's turn (shown as a green circle with "1")
2. **Click on a unit** with AP to select it
3. **Click the "Move" button** - This will highlight all hexes within the unit's movement range
4. **Click on a highlighted hex** to move there
   - **Collect Cards**: Moving onto unrevealed hexes (marked with ?) reveals and collects hidden card rewards!
   - The collected card is automatically added to your hand
   - **Strategy**: Balance between advancing toward the enemy fortress and collecting powerful cards

### Attacking
1. **Select a unit** with AP (green circle with "1")
2. **Click the "Attack" button** - This will highlight all tiles within the unit's attack range
3. **Click on a target** to attack:
   - Click on an **enemy unit** to damage it
   - Click on the **enemy fortress** (if in range) to damage it
4. Units are destroyed when their HP reaches 0

### Winning
- **Reduce your opponent's fortress to 0 HP or below** to win the game!
- Each fortress starts with 3000 HP

### End Turn
- Click "End Turn" when you're done with your actions
- Your units will regain AP at the start of your next turn

### Card Collection System

- **Unrevealed Hexes**: Show a "?" and may contain hidden card rewards
- **Collect Cards**: Move your units onto unrevealed hexes to reveal and collect rewards
- **Automatic Collection**: Cards are automatically added to your hand when collected
- **Collected Hexes**: Show a ✓ checkmark after rewards are collected
- **Reward Quality**: Cards found further from spawn edges tend to be more powerful
- **Strategic Depth**: Choose your path carefully to maximize card collection while maintaining tactical position

## Deploying to Vercel

This project is configured for easy deployment to Vercel:

1. Push your code to a GitHub repository
2. Import your repository to Vercel
3. Vercel will automatically detect Next.js and deploy your game
4. Your game will be live at `your-project.vercel.app`

**Important**: Make sure your Vercel project settings are configured correctly:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (default)
- **Output Directory**: Leave empty (Next.js manages this automatically)
- **Node.js Version**: 18.x or higher (automatically detected from `.node-version`)

If you encounter 404 errors after deployment:
1. Check that the build succeeded in the Vercel deployment logs
2. Clear the deployment cache and redeploy
3. Ensure no custom Vercel project settings override the defaults

Alternatively, you can deploy using the Vercel CLI:

```bash
npm install -g vercel
vercel
```

## Technology Stack

- **Next.js 15**: React framework for production
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **SVG Graphics**: Custom kawaii-style card illustrations

## Contributing

Please feel free to contribute to this project.

## License

This project is licensed under the MIT License.