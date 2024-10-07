import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';

function VideoOverlay() {
  const [overlayText, setOverlayText] = useState('Drag me around!');
  const [imageSrc, setImageSrc] = useState('https://via.placeholder.com/100');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 100, y: 100 });
  const [textSize, setTextSize] = useState({ width: 150, height: 50 });
  const [imageSize, setImageSize] = useState({ width: 100, height: 100 });

  // Cloudinary configuration
  const cloudName = 'dxr5wgek0'; // Your Cloudinary cloud name
  const uploadPreset = 'jrv4ntu8'; // Your Cloudinary upload preset

  useEffect(() => {
    // Load Cloudinary upload widget script only once
    const script = document.createElement('script');
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleTextStop = (e, d) => {
    setTextPosition({ x: d.x, y: d.y });
  };

  const handleImageStop = (e, d) => {
    setImagePosition({ x: d.x, y: d.y });
  };

  const resetPositions = () => {
    setTextPosition({ x: 0, y: 0 });
    setImagePosition({ x: 100, y: 100 });
    setTextSize({ width: 150, height: 50 });
    setImageSize({ width: 100, height: 100 });
    setImageSrc('https://via.placeholder.com/100'); // Reset image source
  };

  const openWidget = () => {
    window.cloudinary.openUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        sources: ['local', 'url', 'camera'], // Enable multiple sources
        multiple: false,
        cropping: true // If you want cropping enabled
      },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          // Set the uploaded image URL to the component's state
          setImageSrc(result.info.secure_url);
        }
      }
    );
  };

  return (
    <div style={{ position: 'relative', width: '600px', height: '400px', border: '2px solid black', overflow: 'hidden' }}>
      <video controls width="600" style={{ display: 'block' }}>
        <source src="your_rtsp_url" type="application/x-rtsp" />
        Your browser does not support RTSP video playback.
      </video>

      {/* Resizable and draggable text overlay */}
      <Rnd
        bounds="parent"
        position={textPosition}
        size={textSize}
        onDragStop={handleTextStop}
        onResizeStop={(e, direction, ref, delta, position) => {
          setTextSize({ width: ref.offsetWidth, height: ref.offsetHeight });
          setTextPosition(position);
        }}
        style={{
          position: 'absolute',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          padding: '10px',
          cursor: 'move',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
        }}
      >
        {overlayText}
      </Rnd>

      {/* Resizable and draggable image overlay */}
      <Rnd
        bounds="parent"
        position={imagePosition}
        size={imageSize}
        onDragStop={handleImageStop}
        onResizeStop={(e, direction, ref, delta, position) => {
          setImageSize({ width: ref.offsetWidth, height: ref.offsetHeight });
          setImagePosition(position);
        }}
        style={{
          position: 'absolute',
          cursor: 'move',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
        }}
      >
        <img
          src={imageSrc}
          alt="Overlay"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '5px',
          }}
        />
      </Rnd>

      <div style={{ marginTop: '20px' }}>
        <label>
          Overlay Text:
          <input
            type="text"
            onChange={(e) => setOverlayText(e.target.value)}
            value={overlayText}
          />
        </label>

        <button onClick={openWidget} style={{ marginLeft: '10px' }}>
          Upload Image
        </button>

        <button onClick={resetPositions} style={{ marginLeft: '10px' }}>
          Reset Positions
        </button>
      </div>
    </div>
  );
}

export default VideoOverlay;
