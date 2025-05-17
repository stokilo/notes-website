import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const YouTubeShorts = ({ videoId, width = '100%', height = '100%' }) => {
  const playerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Load the YouTube IFrame Player API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
        },
        events: {
          onReady: (event) => {
            // Player is ready
          },
          onStateChange: (event) => {
            // Handle state changes if needed
          },
        },
      });
    };

    return () => {
      // Cleanup
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId]);

  const toggleFullscreen = () => {
    const player = playerRef.current;
    if (!player) return;

    if (!isFullscreen) {
      const iframe = document.getElementById('youtube-player');
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      } else if (iframe.webkitRequestFullscreen) {
        iframe.webkitRequestFullscreen();
      } else if (iframe.msRequestFullscreen) {
        iframe.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const containerStyle = {
    position: 'relative',
    width: width,
    height: height,
    maxWidth: '100%',
    margin: '0 auto',
  };

  const playerStyle = {
    width: '100%',
    height: '100%',
    aspectRatio: '9/16', // YouTube Shorts aspect ratio
  };

  const fullscreenButtonStyle = {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    zIndex: 1000,
    padding: '8px 16px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  };

  return (
    <div style={containerStyle}>
      <div id="youtube-player" style={playerStyle}></div>
      <button
        onClick={toggleFullscreen}
        style={fullscreenButtonStyle}
      >
        {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      </button>
    </div>
  );
};

YouTubeShorts.propTypes = {
  videoId: PropTypes.string.isRequired,
  width: PropTypes.string,
  height: PropTypes.string,
};

export default YouTubeShorts; 