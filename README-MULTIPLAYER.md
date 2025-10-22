# 🎮 Grand Warfare - Multiplayer Edition

An epic hex-based tactical warfare game with **online multiplayer** support! Battle friends across the internet in real-time strategic combat.

## 🌟 Features

### 🏠 **Local 2-Player Mode**
- Play on the same device
- Pass-and-play turn-based gameplay
- Perfect for in-person gaming sessions

### 🌐 **Online Multiplayer Mode**
- Real-time multiplayer across the internet
- Generate 6-character game codes to share with friends
- Join friends' games from anywhere in the world
- Live connection status and turn indicators
- Seamless game state synchronization

## 🚀 How to Play Online

### Creating a Game:
1. Select **"Online Multiplayer"** from the main menu
2. Choose **"Create New Game"**
3. Enter your player name
4. Share the generated 6-character game code with your friend
5. Wait for them to join and mark ready
6. Game starts automatically when both players are ready!

### Joining a Game:
1. Select **"Online Multiplayer"** from the main menu
2. Choose **"Join Game"**
3. Enter your player name
4. Input your friend's 6-character game code
5. Mark yourself as ready
6. Battle begins when both players are ready!

## 🎯 Gameplay Features

- **Strategic hex-based combat** with movement and attack ranges
- **Fortress warfare** - reach the enemy spawn zone to damage their fortress
- **Card collection system** with discoverable rewards on the battlefield
- **Action Point system** for balanced turn-based gameplay
- **Real-time synchronization** in multiplayer mode
- **Connection resilience** with automatic reconnection handling

## 🛠 Technical Features

- **Next.js 15** with App Router
- **Socket.io** for real-time communication
- **TypeScript** for type safety
- **Tailwind CSS** for responsive design
- **Vercel** deployment ready
- **Mobile-friendly** responsive interface

## 🔧 Development

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

## 🌍 Deployment

This multiplayer version is optimized for Vercel deployment with:
- Socket.io server configuration
- WebSocket support
- Serverless function optimization
- Environment variable configuration

## 🎮 Game Rules

1. **Objective**: Destroy the enemy fortress by dealing 3000 damage
2. **Movement**: Units can move up to their Speed value in hexes
3. **Combat**: Units attack within their Range, dealing damage equal to their HP
4. **Fortress Assault**: Reach enemy spawn zones to deal direct fortress damage
5. **Card Collection**: Discover new units by moving to reward hexes
6. **Turn Management**: Each unit gets 1 Action Point per turn

## 🤝 Multiplayer Architecture

- **Real-time communication** via WebSockets
- **Server-side validation** for secure gameplay
- **Game room management** with unique codes
- **State synchronization** between all connected players
- **Graceful disconnection handling**

---

**Ready to command your forces in epic online battles? Deploy and start your campaign today!** ⚔️