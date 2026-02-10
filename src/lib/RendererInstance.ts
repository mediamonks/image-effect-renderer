import {WebGLInstance} from "./WebGLInstance.js";
import type {ImageEffectRendererOptions} from "./ImageEffectRenderer.js";
import {type ImageOptions, type ImageSource, type CubeMapFaces, Renderer} from './Renderer.js';
import {type BufferOptions, RendererBuffer} from "./RendererBuffer.js";
import Program from "./Program.js";
import {bindMouseListener, getShadertoyMouse, getNormalizedMouse, clearMouseClick} from "./MouseListener.js";

export const BUFFER_0 = 0;
export const BUFFER_1 = 1;
export const BUFFER_2 = 2;
export const BUFFER_3 = 3;
export const BUFFER_4 = 4;
export const BUFFER_5 = 5;
export const BUFFER_6 = 6;
export const BUFFER_7 = 7;

export type BufferIndex =
  typeof BUFFER_0
  | typeof BUFFER_1
  | typeof BUFFER_2
  | typeof BUFFER_3
  | typeof BUFFER_4
  | typeof BUFFER_5
  | typeof BUFFER_6
  | typeof BUFFER_7;

export type ImagesData = {
  slotIndex: number,
  image: ImageSource & { bufferIndex?: BufferIndex },
  options?: Partial<ImageOptions>,
}[];

export type CubeMapsData = {
  slotIndex: number,
  faces: CubeMapFaces,
  options?: Partial<ImageOptions>,
}[];

export type BufferData = {
  index: BufferIndex,
  shader: string,
  options?: Partial<BufferOptions>,
  images?: ImagesData,
  cubemaps?: CubeMapsData,
}

export type RendererData = {
  shader: string,
  options?: Partial<BufferOptions>,
  images?: ImagesData,
  cubemaps?: CubeMapsData,
  buffers?: BufferData[],
}

export class RendererInstance extends Renderer {
  public canvas: HTMLCanvasElement;
  public buffers: RendererBuffer[] = [];
  public options: ImageEffectRendererOptions;
  public time: number = 0;

  private tickFuncs: ((dt: number) => void) [] = [];
  private readyFuncs: (() => void) [] = [];

  private startTime: number = -1;
  private drawOneFrame: boolean = false;
  private container: HTMLElement;

  private animationRequestId: number = 0;
  private resizeObserver: ResizeObserver;
  private _ready: boolean = false;

  constructor(glInstance: WebGLInstance, container: HTMLElement, shader: string, options: ImageEffectRendererOptions) {
    super(glInstance);

    this.options = {...options};
    this.container = container;
    this.main = this;

    if (this.options.useSharedContext) {
      this.canvas = document.createElement('canvas');
      const context = <CanvasRenderingContext2D>this.canvas.getContext('2d');
      context.fillStyle = '#00000000';
      context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      this.canvas = <HTMLCanvasElement>this.gl.canvas;
    }
    Object.assign(this.canvas.style, {
      inset: '0',
      width: '100%',
      height: '100%',
      margin: '0',
      display: 'block',
    });

    this.container.appendChild(this.canvas);

    this.program = new Program(this.gl, shader);

    this.resizeObserver = new ResizeObserver(() => {
      if (this.options.autoResize) {
        this.updateSize();
      }
    });
    this.resizeObserver.observe(container);

    if (!this.options.useSharedContext) {
      this.drawingLoop(0);
    }
  }

  public get drawThisFrame(): boolean {
    return (this.options.loop || this.drawOneFrame) && this.width > 0 && this.height > 0 && (!this.options.asyncCompile || this.allShadersCompiled);
  }

  public override get iMouseUsed(): boolean {
    return super.iMouseUsed || this.buffers.some(buffer => buffer && buffer.iMouseUsed);
  }

  private get allShadersCompiled(): boolean {
    return this.shaderCompiled && this.buffers.every(buffer => buffer && buffer.shaderCompiled);
  }

  /**
   * Commence or resume the rendering loop.
   */
  public play(): void {
    this.options.loop = true;
  }

  /**
   * Pause the rendering loop.
   */
  public stop(): void {
    this.options.loop = false;
  }

  /**
   * Create a new render buffer, replace existing buffer if index is the same.
   *
   * @param i - The index of the buffer to create/replace.
   * @param shader - The shader used for the buffer rendering.
   * @param options - Custom configuration for buffer creation.
   * @returns Renderer - the newly created or replaced buffer object.
   */
  public createBuffer(i: number, shader: string, options: Partial<BufferOptions> = {}): Renderer {
    const oldBuffer = this.buffers[i];
    if (oldBuffer) {
      oldBuffer.destruct();
    }
    const newBuffer = new RendererBuffer(this.gl, options);
    newBuffer.program = this.gl.compileShader(shader);
    newBuffer.main = this;
    return this.buffers[i] = newBuffer;
  }

  /**
   * Register a tick function to be called on every frame update.
   *
   * @param tick - The function to be called.
   */
  public tick(tick: (dt: number) => void) {
    this.tickFuncs.push(tick);
  }

  /**
   * Register a ready function to be called when the renderer instance is ready.
   *
   * @param ready - The function to be called.
   */
  public ready(ready: () => void) {
    this.readyFuncs.push(ready);
  }

  /**
   * Draw a frame manually.
   *
   * @param time - Time of the frame to draw. Defaults to 0 if not specified.
   */
  public drawFrame(time: number = 0): void {
    this.time = time / 1000;
    this.drawOneFrame = true;
  }

  /**
   * Apply data to the renderer instance, including buffers and images.
   * Buffers are created first, then images are set for both the main renderer and buffers.
   *
   * @param data - Data object containing buffers and images setup.
   */
  public setData(data: RendererData): void {
    // first create buffers
    data.buffers && this.setBuffersData(data.buffers);
    // then set images and cubemaps
    data.images && this.setImagesData(data.images);
    data.cubemaps && this.setCubeMapsData(data.cubemaps);
  }

  /**
   * Set multiple images to slots for rendering.
   * Possible images can be image elements, video elements, canvas elements, or buffers.
   * Images can reference buffers using the bufferIndex property.
   *
   * @param images - Array of image configurations to set.
   * @param target - The renderer to set images on (defaults to this renderer instance).
   */
  public setImagesData(images: ImagesData, target: Renderer | undefined = this): void {
    images.forEach(image => {
      if (image.image.bufferIndex !== undefined) {
        target?.setImage(image.slotIndex, this.buffers[image.image.bufferIndex] as RendererBuffer, image.options);
      } else {
        target?.setImage(image.slotIndex, image.image, image.options);
      }
    });
  }

  /**
   * Create multiple buffers with their respective shaders and images from buffer data.
   * Buffers are created in two passes: first all buffers are initialized,
   * then images are assigned to ensure buffer dependencies are available.
   *
   * @param buffers - Array of buffer data configurations to create.
   */
  public setBuffersData(buffers: BufferData[]): void {
    buffers.forEach(buffer => {
      this.createBuffer(buffer.index, buffer.shader, buffer.options);
    });
    // set images and cubemaps for buffers
    buffers.forEach(buffer => {
      buffer.images && this.setImagesData(buffer.images, this.buffers[buffer.index]);
      buffer.cubemaps && this.setCubeMapsData(buffer.cubemaps, this.buffers[buffer.index]);
    });
  }

  /**
   * Set multiple cubemaps to slots for rendering.
   *
   * @param cubemaps - Array of cubemap configurations to set.
   * @param target - The renderer to set cubemaps on (defaults to this renderer instance).
   */
  public setCubeMapsData(cubemaps: CubeMapsData, target: Renderer | undefined = this): void {
    cubemaps.forEach(cubemap => {
      target?.setCubeMap(cubemap.slotIndex, cubemap.faces, cubemap.options);
    });
  }

  public drawInstance(dt: number): void {
    const context = this.gl.context;

    if (!this.drawOneFrame) {
      this.time += dt;
    }

    this.tickFuncs.forEach(func => func(dt));

    if (this.iMouseUsed) {
      const rect = this.container.getBoundingClientRect();
      this.mouse = getShadertoyMouse(rect);
      this.mouseNormalized = getNormalizedMouse(rect);
      clearMouseClick();
    }

    // update buffers
    this.buffers.forEach(buffer => {
      if (buffer) {
        context.viewport(0, 0, this.width, this.height);
        buffer.draw(this.time, this.canvas.width, this.canvas.height);
      }
    });

    context.viewport(0, 0, this.width, this.height);
    context.clear(context.COLOR_BUFFER_BIT);
    this.draw(this.time, this.canvas.width, this.canvas.height);

    this.drawOneFrame = false;
  }

  public update(dt: number) {
    if (this.allShadersCompiled) {
      if (!this._ready) {
        this._ready = true;
        this.readyFuncs.forEach(func => func());
        this.readyFuncs = [];

        if (this.iMouseUsed) {
          bindMouseListener(document.body);
        }
      }
    }
  }

  public override destruct() {
    cancelAnimationFrame(this.animationRequestId);

    super.destruct();

    this.resizeObserver.disconnect();
    this.container.removeChild(this.canvas);
    this.canvas.replaceWith(this.canvas.cloneNode(true));

    this.buffers.forEach(buffer => {
      buffer.destruct();
    });
    this.buffers = [];
    this.tickFuncs = [];
  }

  public copyCanvas() {
    const srcCanvas = this.gl.canvas;
    const dstCanvas = this.canvas;
    const context = <CanvasRenderingContext2D>dstCanvas.getContext('2d');
    context.clearRect(0, 0, this.width, this.height);
    context.drawImage(srcCanvas, 0, srcCanvas.height - this.height, this.width, this.height, 0, 0, this.width, this.height);
  }

  private updateSize(): void {
    this.width = (this.container.offsetWidth * this.options.pixelRatio) | 0;
    this.height = (this.container.offsetHeight * this.options.pixelRatio) | 0;

    if (this.width !== this.canvas.width || this.height !== this.canvas.height) {
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.drawOneFrame = true;
    }
  }

  private drawingLoop(time: number = 0) {
    this.animationRequestId = window.requestAnimationFrame(time => this.drawingLoop(time));

    time /= 1000;

    const dt = this.startTime < 0 ? 1 / 60 : time - this.startTime;
    this.startTime = time > 0 ? time : -1;

    this.update(dt);

    if (this.drawThisFrame) {
      this.drawInstance(dt);
    }
  }
}
