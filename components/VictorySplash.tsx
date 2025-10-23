import React, { useEffect, useState } from 'react';

interface VictorySplashProps {
  winner: 'player1' | 'player2';
  playerNames?: {
    player1?: string;
    player2?: string;
  };
  onComplete: () => void;
}

const VictorySplash: React.FC<VictorySplashProps> = ({ winner, playerNames, onComplete }) => {
  const [videoEnded, setVideoEnded] = useState(false);

  const handleVideoEnd = () => {
    setVideoEnded(true);
    // Small delay before allowing dismissal
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  const handleVideoError = () => {
    // If video fails to load, show victory screen without video
    setTimeout(() => {
      onComplete();
    }, 3000);
  };

  const handleSkip = () => {
    onComplete();
  };

  const getWinnerName = () => {
    if (playerNames && playerNames[winner]) {
      return playerNames[winner];
    }
    return winner === 'player1' ? 'Player 1' : 'Player 2';
  };

  const getWinnerColor = () => {
    return winner === 'player1' ? 'from-blue-600 to-blue-800' : 'from-red-600 to-red-800';
  };

  const getBannerTitle = () => {
    return '🏆 VICTORY! 🏆';
  };

  const getBannerSubtitle = () => {
    return 'You Conquered the Battlefield!';
  };

  const getBannerColor = () => {
    return 'rgba(34, 197, 94, 0.95)'; // Green for victory
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
      {/* Video Background */}
      <div 
        className="absolute inset-0 w-full h-full flex items-center justify-center"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
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
          onEnded={handleVideoEnd}
          onError={handleVideoError}
        >
          <source src="/splash-video.mp4" type="video/mp4" />
          <source src="/splash-video.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Victory Banner Overlay */}
      <div 
        className="absolute inset-0 flex items-center justify-center z-10"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          pointerEvents: 'none'
        }}
      >
        {/* Victory Banner */}
        <div 
          className={`bg-gradient-to-r text-white px-12 py-8 rounded-2xl shadow-2xl transform animate-pulse border-4 border-yellow-400`}
          style={{
            backgroundColor: getBannerColor(),
            backdropFilter: 'blur(10px)',
            border: '4px solid #facc15',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
            textAlign: 'center',
            minWidth: '300px',
            maxWidth: '600px',
            margin: '0 20px'
          }}
        >
          <div className="text-center">
            <h1 
              className="text-4xl sm:text-6xl font-bold mb-4 text-yellow-300 drop-shadow-lg"
              style={{
                fontSize: 'clamp(2rem, 8vw, 4rem)',
                fontWeight: 'bold',
                color: '#fde047',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                marginBottom: '1rem'
              }}
            >
              {getBannerTitle()}
            </h1>
            <h2 
              className="text-2xl sm:text-4xl font-bold text-white mb-2"
              style={{
                fontSize: 'clamp(1.5rem, 6vw, 2.5rem)',
                fontWeight: 'bold',
                color: '#ffffff',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                marginBottom: '0.5rem'
              }}
            >
              {getWinnerName()}
            </h2>
            <p 
              className="text-lg sm:text-xl text-yellow-200"
              style={{
                fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                color: '#fef08a',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
              }}
            >
              {getBannerSubtitle()}
            </p>
          </div>
        </div>
      </div>

      {/* Skip/Continue Button */}
      <button
        onClick={handleSkip}
        className="absolute bottom-8 right-8 z-20"
        style={{
          position: 'absolute',
          bottom: '2rem',
          right: '2rem',
          zIndex: 20,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: '#ffffff',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          border: '2px solid #facc15',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {videoEnded ? 'Return to Menu ➡️' : 'Skip ⏭️'}
      </button>
    </div>
  );
};

export default VictorySplash;