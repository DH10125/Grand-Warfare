import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    
    // Pause at exactly 5 seconds
    if (video.currentTime >= 5 && !videoPaused && !videoEnded) {
      video.pause();
      setVideoPaused(true);
      
      // Wait 3 seconds, then advance to game mode select
      setTimeout(() => {
        onComplete();
      }, 3000);
    }
  };

  const handleVideoEnd = () => {
    setVideoEnded(true);
    // Small delay before transitioning to game mode select
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const handleVideoError = () => {
    // If video fails to load, skip to game mode select after 2 seconds
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }}
    >
      {/* Video Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
          padding: 0
        }}
      >
        <video
          className=""
          style={{
            width: '100vw',
            height: 'auto',
            minHeight: '100vh',
            objectFit: 'cover',
            display: 'block',
            margin: 0,
            padding: 0,
            border: 'none',
            outline: 'none',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1
          }}
          autoPlay
          muted
          playsInline
          onTimeUpdate={handleVideoTimeUpdate}
          onEnded={handleVideoEnd}
          onError={handleVideoError}
          ref={setVideoRef}
        >
          <source src="/splash-video.mp4" type="video/mp4" />
          <source src="/splash-video.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default SplashScreen;