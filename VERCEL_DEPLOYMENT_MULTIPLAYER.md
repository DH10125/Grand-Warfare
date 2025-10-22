# 🚀 Vercel Deployment Guide - Multiplayer Edition

This guide covers deploying the **Grand Warfare Multiplayer Edition** to Vercel with Socket.io support.

## ⚠️ Important: Socket.io Limitations on Vercel

**Note**: Socket.io requires persistent connections, which can be challenging on Vercel's serverless platform. For the best multiplayer experience, consider these alternatives:

1. **Development/Testing**: Vercel deployment works for testing but may have connection limitations
2. **Production**: Consider platforms like Railway, Render, or Heroku for better WebSocket support
3. **Hybrid Approach**: Deploy to Vercel but use a dedicated WebSocket service

## 📋 Prerequisites

- GitHub repository with `multiplayer-online` branch
- Vercel account
- Node.js 18.18+ installed locally

## 🔧 Deployment Steps

### 1. Deploy the Multiplayer Branch

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. **Important**: Select the `multiplayer-online` branch
5. Vercel should detect Next.js automatically
6. Click "Deploy"

### 2. Configure Environment Variables (Optional)

In your Vercel project dashboard under Settings → Environment Variables:

```
NODE_ENV=production
```

### 3. Verify Deployment Settings

Ensure these settings in your Vercel project:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build`
- **Node.js Version**: 18.x or higher

## 🌐 Socket.io Configuration

The multiplayer version includes special Vercel configuration in `vercel.json`:

```json
{
  "framework": "nextjs",
  "functions": {
    "pages/api/socket.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 🧪 Testing the Deployment

### 1. Access Your Deployed Site

Visit your Vercel deployment URL (e.g., `grand-warfare-multiplayer.vercel.app`)

### 2. Test Game Modes

1. **Local Mode**: Should work perfectly on any deployment
2. **Online Mode**: 
   - Create a game and note the game code
   - Open another browser/incognito window
   - Join using the game code
   - Test real-time functionality

### 3. Monitor Connection Status

Watch for the connection indicators:
- 🟢 Connected - Socket.io is working
- 🔴 Disconnected - Connection issues

## 🐛 Troubleshooting

### Socket.io Connection Issues

**Symptoms**: 
- Can't connect to multiplayer
- "Connection lost" messages
- Games don't sync between players

**Solutions**:

1. **Check Browser Console**: Look for WebSocket connection errors
2. **Try Different Browsers**: Some browsers block WebSocket connections
3. **Network Issues**: Corporate firewalls may block WebSocket traffic
4. **Vercel Limitations**: Serverless functions have time limits

### Alternative Deployment Options

If Socket.io doesn't work reliably on Vercel:

#### Option 1: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Option 2: Render
1. Connect your GitHub repository
2. Select the `multiplayer-online` branch
3. Use Node.js environment
4. Deploy

#### Option 3: Heroku
```bash
# Install Heroku CLI and login
heroku create your-app-name
git push heroku multiplayer-online:main
```

## 🎯 Production Recommendations

### For Serious Multiplayer Gaming:

1. **Use a dedicated server platform** (Railway, Render, DigitalOcean App Platform)
2. **Add Redis for session storage** for better scalability
3. **Implement authentication** for user accounts
4. **Add game analytics** for monitoring usage
5. **Set up monitoring** for connection health

### For Development/Demo:

1. **Vercel deployment** works fine for testing
2. **Local development** with `npm run dev`
3. **Share deployment URL** for remote testing

## 📱 Mobile Considerations

The game is mobile-friendly, but for multiplayer:

- **Touch interactions** work on mobile devices
- **Portrait mode** is supported
- **Connection stability** may vary on mobile networks
- **Battery usage** can be higher due to persistent connections

## 🔍 Monitoring and Analytics

### Check Connection Health:

1. Monitor Vercel function logs in the dashboard
2. Watch for timeout errors in Socket.io connections
3. Test from different locations/networks

### Performance Metrics:

- Connection establishment time
- Message latency between players
- Reconnection success rate
- Game state synchronization accuracy

## 🆘 Getting Help

### If Multiplayer Doesn't Work on Vercel:

1. **Check Vercel Function Logs**: Look for Socket.io errors
2. **Test Locally**: Ensure it works with `npm run dev`
3. **Try Alternative Platforms**: Railway, Render, or Heroku
4. **Community Support**: Share logs in GitHub issues

### Fallback Strategy:

- Keep the local 2-player mode working
- Display a message if online mode fails
- Provide alternative deployment links

## ✅ Success Checklist

- [ ] Site deploys successfully
- [ ] Local 2-player mode works
- [ ] Can create online games
- [ ] Can join games with codes
- [ ] Real-time synchronization works
- [ ] Connection indicators show proper status
- [ ] Mobile devices can connect and play

---

**Ready to deploy your multiplayer battlefield? Choose your deployment strategy and engage!** ⚔️🌐