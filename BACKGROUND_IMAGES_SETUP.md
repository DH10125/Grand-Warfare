# Background Images Setup

## Instructions

To complete the background image setup, you need to manually save the three battle scene images:

1. Create the directory `public/backgrounds/` if it doesn't exist
2. Save the three battle scene images as:
   - `public/backgrounds/battle-scene-1.png` (for homepage/game mode select)
   - `public/backgrounds/battle-scene-2.png` (for multiplayer lobby pages)
   - `public/backgrounds/battle-scene-3.png` (for game lobby and actual gameplay)

## Image Usage

- **battle-scene-1.png**: Used on the main homepage/game mode selection screen
- **battle-scene-2.png**: Used on all multiplayer lobby screens (menu, create, join)
- **battle-scene-3.png**: Used on the waiting lobby and actual game screen

## Background Properties

The images are set up with:
- `background-size: cover` - Fills the entire screen while maintaining aspect ratio
- `background-position: center` - Centers the image
- `background-repeat: no-repeat` - Prevents tiling
- `background-attachment: fixed` - Keeps background fixed during scrolling
- Semi-transparent black overlay (30% opacity) for better text readability

## Files Modified

- `components/GameModeSelect.tsx` - Homepage background
- `components/OnlineLobby.tsx` - All lobby mode backgrounds
- `components/Game.tsx` - Game screen background