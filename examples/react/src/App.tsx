import React, {useCallback, useRef, useState} from 'react';
import {
  ImageEffectRendererComponent,
  type ImageEffectRendererComponentRef
} from '../../../src/react';
import glitchShader from './shaders/glitch.glsl?raw';
import './App.css';

// Load and cache the image once at module level
const paddoImage = new Image();
paddoImage.crossOrigin = 'anonymous';
paddoImage.src = '/paddo.jpg';

export default function App() {
  const rendererRef = useRef<ImageEffectRendererComponentRef>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const handleTogglePlay = useCallback(() => {
    const renderer = rendererRef.current?.renderer;
    if (!renderer) {
      return;
    }

    if (isPlaying) {
      renderer.stop();
      setIsPlaying(false);
    } else {
      renderer.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  return (
    <div className="app">
      <header className="header">
        <h1>ImageEffectRenderer</h1>
        <p>
          React example with WebGL fragment shaders
        </p>
      </header>

      <main className="content">
        <div className="renderer-wrapper">
          <div className="renderer-container">
            <ImageEffectRendererComponent
              ref={rendererRef}
              shader={glitchShader}
              loop={true}
              images={[
                {slotIndex: 0, image: paddoImage, options: {flipY: true}}
              ]}
              style={{width: '100%', height: '100%'}}
            />
          </div>

          <div className="controls">
            <button
              onClick={handleTogglePlay}
              className="btn"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
