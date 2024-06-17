import {WebGLInstance} from './WebGLInstance.js';
import {RendererInstance} from "./RendererInstance.js";

/**
 * @typedef {Object} ImageEffectRendererOptions
 * @property {boolean} loop - Determines if the renderer should loop. Defaults to false.
 * @property {boolean} autoResize - Determines if the renderer should automatically resize. Defaults to true.
 * @property {number} pixelRatio - The pixel ratio of the renderer. Defaults to window.devicePixelRatio.
 * @property {boolean} useSharedContext - Determines if the renderer should use a shared WebGL context. Defaults to false.
 * @property {boolean} asyncCompile - Determines if the renderer should compile shaders asynchronously. Defaults to true.
 */
export type ImageEffectRendererOptions = {
  loop: boolean;
  autoResize: boolean;
  pixelRatio: number;
  useSharedContext: boolean;
  asyncCompile: boolean;
}

const defaultOptions: ImageEffectRendererOptions = {
  loop:             false,
  autoResize:       true,
  pixelRatio:       typeof window !== 'undefined' ? window.devicePixelRatio : 1,
  useSharedContext: false,
  asyncCompile:     true,
};

const poolInUse: RendererInstance[] = [];
const poolWebGLInstance: WebGLInstance[] = [];
let sharedInstance: WebGLInstance;
let sharedTime: number = -1;

export default class ImageEffectRenderer {
  constructor() {
    throw new Error('Use ImageEffectRenderer.createTemporary to create an ImageEffectRenderer');
  }

  /**
   * Create a temporary ImageEffectRenderer instance for use.
   *
   * @param container - The HTML element to contain the WebGL canvas.
   * @param shader - The shader used for rendering.
   * @param options - Custom configuration for renderer creation.
   * @returns RendererInstance - The created Renderer instance
   */
  public static createTemporary(container: HTMLElement, shader: string, options: Partial<ImageEffectRendererOptions> = {}): RendererInstance {
    const instOptions = {...defaultOptions, ...options};

    if (instOptions.useSharedContext) {
      if (!sharedInstance) {
        sharedInstance = new WebGLInstance();
        this.drawInstances(0);
      }
      const instance = new RendererInstance(sharedInstance, container, shader, instOptions);
      poolInUse.push(instance);
      return instance;
    } else {
      const gl = poolWebGLInstance.pop() || new WebGLInstance();
      return new RendererInstance(gl, container, shader, instOptions);
    }
  }

  /**
   * Clean up a temporary ImageEffectRenderer instance.
   *
   * @param ier - RendererInstance to be cleaned up and released.
   */
  public static releaseTemporary(ier: RendererInstance): void {
    if (!ier.options.useSharedContext) {
      poolWebGLInstance.push(ier.gl);
    }

    ier.stop();
    ier.destruct();

    const index = poolInUse.indexOf(ier);
    if (index > -1) {
      poolInUse.splice(index, 1);
    }
  }

  private static drawInstances(time: number = 0): void {
    window.requestAnimationFrame(time => this.drawInstances(time));

    time /= 1000;

    const dt = sharedTime < 0 ? 1 / 60 : time - sharedTime;
    sharedTime = time;

    const canvas = sharedInstance.canvas;
    const gl = sharedInstance.context;
    const pool = poolInUse;

    let maxWidth = 0, maxHeight = 0;

    pool.forEach(ier => {
      ier.update(dt);
    });

    pool.forEach(ier => {
      if (ier.drawThisFrame) {
        maxWidth = Math.max(maxWidth, ier.width);
        maxHeight = Math.max(maxHeight, ier.height);
      }
    });

    if (maxWidth > canvas.width || maxHeight > canvas.height) {
      canvas.width = maxWidth;
      canvas.height = maxHeight;
    }

    gl.clear(gl.COLOR_BUFFER_BIT);

    pool.forEach(ier => {
      if (ier.drawThisFrame) {
        ier.drawInstance(dt);
        ier.copyCanvas();
      }
    });
  }
}
