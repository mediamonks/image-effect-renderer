import React, {forwardRef, useEffect, useImperativeHandle, useRef} from 'react';
import {
  useImageEffectRenderer,
  type UseImageEffectRendererOptions
} from './useImageEffectRenderer.js';
import type {RendererInstance} from '../lib/RendererInstance.js';

export interface ImageEffectRendererComponentProps extends UseImageEffectRendererOptions {
  className?: string;
  style?: React.CSSProperties;
  onReady?: (renderer: RendererInstance) => void;
}

export interface ImageEffectRendererComponentRef {
  renderer: RendererInstance | null;
  container: HTMLDivElement | null;
}

export const ImageEffectRendererComponent = forwardRef<
  ImageEffectRendererComponentRef,
  ImageEffectRendererComponentProps
>(function ImageEffectRendererComponent(props, ref) {
  const {className, style, onReady, ...rendererOptions} = props;

  const {ref: containerRef, renderer, isReady} = useImageEffectRenderer(rendererOptions);
  const onReadyCalledForRenderer = useRef<RendererInstance | null>(null);

  useImperativeHandle(ref, () => ({
    renderer,
    container: containerRef.current,
  }), [renderer]);

  useEffect(() => {
    // Only call onReady once per renderer instance
    if (isReady && renderer && onReady && onReadyCalledForRenderer.current !== renderer) {
      onReadyCalledForRenderer.current = renderer;
      onReady(renderer);
    }
  }, [isReady, renderer, onReady]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        ...style,
      }}
    />
  );
});
