# Splash Screen Video Setup

## Adding Your Video

1. **Place your 6-second video file in the `/public` directory with one of these names:**
   - `splash-video.mp4` (recommended)
   - `splash-video.webm` (optional, for better browser compatibility)

2. **Recommended video specifications:**
   - Duration: 6 seconds
   - Format: MP4 (H.264 codec) for best compatibility
   - Resolution: 1920x1080 or 1280x720
   - File size: Keep under 10MB for fast loading

## How It Works

- The splash screen automatically plays when users first visit your website
- After the video ends (or 6 seconds), it automatically transitions to the game mode select screen
- Users can skip the video at any time using the "Skip" button in the top-right corner
- If the video fails to load, it automatically skips to the game after 2 seconds

## File Structure
```
public/
├── splash-video.mp4    ← Place your video here
├── splash-video.webm   ← Optional: WebM version for better compression
├── backgrounds/
├── cards/
└── fortress/
```

## Testing
Once you add your video file, the splash screen will automatically work on your next deployment to Railway.