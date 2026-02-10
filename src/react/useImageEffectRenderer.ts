import {useEffect, useRef, useState} from 'react';
import {ImageEffectRenderer, type ImageEffectRendererOptions} from '../lib/ImageEffectRenderer.js';
import type {BufferData, ImagesData, CubeMapsData, RendererInstance} from '../lib/RendererInstance.js';

export interface UseImageEffectRendererOptions extends Partial<ImageEffectRendererOptions> {
  shader: string;
  autoInit?: boolean;
  buffers?: BufferData[];
  images?: ImagesData;
  cubemaps?: CubeMapsData;
}

export interface UseImageEffectRendererReturn {
  ref: React.RefObject<HTMLDivElement>;
  renderer: RendererInstance | null;
  isReady: boolean;
}

export function useImageEffectRenderer(
  options: UseImageEffectRendererOptions
): UseImageEffectRendererReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<RendererInstance | null>(null);
  const [isReady, setIsReady] = useState(false);

  const {shader, autoInit = true, buffers, images, cubemaps, ...rendererOptions} = options;

  useEffect(() => {
    if (!containerRef.current || !autoInit || !shader) {
      return;
    }

    const renderer = ImageEffectRenderer.createTemporary(
      containerRef.current,
      shader,
      rendererOptions
    );

    rendererRef.current = renderer;

    renderer.ready(() => {
      setIsReady(true);
    });

    return () => {
      if (rendererRef.current) {
        ImageEffectRenderer.releaseTemporary(rendererRef.current);
        rendererRef.current = null;
      }
      setIsReady(false);
    };
  }, [shader, autoInit]);

  // Set buffers first (before images, as images may reference buffers)
  useEffect(() => {
    if (rendererRef.current && buffers) {
      rendererRef.current.setBuffersData(buffers);
    }
  }, [rendererRef.current, buffers]);

  // Set images after buffers are ready
  useEffect(() => {
    if (rendererRef.current && images) {
      rendererRef.current.setImagesData(images);
    }
  }, [rendererRef.current, images]);

  // Set cubemaps after buffers are ready
  useEffect(() => {
    if (rendererRef.current && cubemaps) {
      rendererRef.current.setCubeMapsData(cubemaps);
    }
  }, [rendererRef.current, cubemaps]);

  return {
    ref: containerRef,
    renderer: rendererRef.current,
    isReady,
  };
}
