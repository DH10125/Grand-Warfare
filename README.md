# Grand Warfare

A hexagonal grid strategy card game built with Next.js and TypeScript.

## Game Features

- **Hexagonal Grid Board**: Play on a dynamic 30-tile hexagonal grid
- **Two Fortresses**: Each player has a fortress with 3000 HP
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

1. **Add Cards**: Click on "Add Man", "Add Patch of grass", or "Add Mouse" to add cards to your hand
2. **Place Cards**: Click on a card in your hand, then click on a hexagon on the board to place it
3. **Move**: Select a card on the board and click "Move" to highlight reachable tiles, then click a tile to move
4. **Attack**: Select a card on the board and click "Attack" to highlight attackable tiles, then click a target
5. **End Turn**: Click "End Turn" when you're done with your actions
6. **Win**: Reduce your opponent's fortress to 0 HP or below!

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