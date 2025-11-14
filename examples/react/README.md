# Image Effect Renderer - React Example

This is a TypeScript React example demonstrating how to use the `@mediamonks/image-effect-renderer`
package
with React components and hooks.

## Features

- TypeScript support for type safety
- Demonstrates the ImageEffectRendererComponent usage
- Shows a glitch effect using WebGL fragment shaders
- Declarative image configuration
- Modern React with hooks and functional components

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## Project Structure

- `src/App.tsx` - Main application component
- `src/main.tsx` - Application entry point
- `src/shaders/glitch.glsl` - WebGL fragment shader for the glitch effect
- `public/paddo.jpg` - Sample image

## Usage

The example demonstrates how to use the `ImageEffectRendererComponent` with play/pause controls:

```tsx
import { useCallback, useRef, useState } from 'react';
import { 
  ImageEffectRendererComponent,
  type ImageEffectRendererComponentRef 
} from '@mediamonks/image-effect-renderer/react';
import glitchShader from './shaders/glitch.glsl?raw';

// Load image at module level
const myImage = new Image();
myImage.crossOrigin = 'anonymous';
myImage.src = '/my-image.jpg';

function App() {
  const rendererRef = useRef<ImageEffectRendererComponentRef>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const handleTogglePlay = useCallback(() => {
    const renderer = rendererRef.current?.renderer;
    if (!renderer) return;

    if (isPlaying) {
      renderer.stop();
      setIsPlaying(false);
    } else {
      renderer.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  return (
    <>
      <ImageEffectRendererComponent
        ref={rendererRef}
        shader={glitchShader}
        loop={true}
        images={[
          { slotIndex: 0, image: myImage, options: { flipY: true } }
        ]}
        style={{ width: '100%', height: '100%' }}
      />
      <button onClick={handleTogglePlay}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </>
  );
}
```

## Learn More

- [Image Effect Renderer Documentation](https://github.com/mediamonks/image-effect-renderer)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
