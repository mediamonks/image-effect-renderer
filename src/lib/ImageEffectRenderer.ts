import { ImageEffectRendererBuffer } from './ImageEffectRendererBuffer';
import { ImageEffectRendererWebGLInstance } from './ImageEffectRendererWebGLInstance';

// prettier-ignore
export default class ImageEffectRenderer {
  // (global) context resource management
  private static IERActive: ImageEffectRenderer[] = [];
  private static IERPool: ImageEffectRenderer[] = [];

  private static IEROWNActive: ImageEffectRenderer[] = [];
  private static IEROWNPool: ImageEffectRenderer[] = [];

  private static sharedInstance: ImageEffectRendererWebGLInstance;
  private static sharedTime: number = -1;

  // webgl
  private useOwnGLInstance: boolean = false;
  private glInstance: ImageEffectRendererWebGLInstance;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  private left: number = 0;
  private top: number = 0;
  private width: number = 0;
  private height: number = 0;
  private tickFunc: () => void | undefined = undefined;

  // control
  private time: number = 0;
  private animationLoop: boolean = true;
  private drawOneFrame: boolean = false;
  private animationRequestId: number = 0;
  private startTime: number = -1;

  private container: HTMLElement;
  private canvasScale: number = 1;

  private mainBuffer: ImageEffectRendererBuffer | undefined = undefined;
  private buffers: ImageEffectRendererBuffer[] = [];

  /**
   * Requires a HTMLCanvasElement and a shader program as a plain text string
   *
   * @param container
   * @param shader
   * @param _animationLoop
   * @param _useOwnGLContext
   */
  constructor(
    container: HTMLElement,
    animationLoop: boolean = false,
    useOwnGLInstance: boolean = false,
    createTemporaryUsed: boolean = false,
  ) {
    if (!createTemporaryUsed) {
      throw new Error('Use ImageEffectRenderer.createTemporary to create a ImageEffectRenderer');
    }

    this.container = container;
    this.animationLoop = animationLoop;
    this.useOwnGLInstance = useOwnGLInstance;

    if (!useOwnGLInstance && !ImageEffectRenderer.sharedInstance) {
      ImageEffectRenderer.sharedInstance = new ImageEffectRendererWebGLInstance();
      ImageEffectRenderer.drawInstances(0);
    }

    if (this.useOwnGLInstance) {
      this.glInstance = new ImageEffectRendererWebGLInstance();
      this.canvas = this.glInstance.canvas;
    } else {
      this.canvas = document.createElement('canvas');
      this.context = this.canvas.getContext('2d');
      this.context.fillStyle = 'rgba(0,0,0,0)';
      this.glInstance = ImageEffectRenderer.sharedInstance;
    }
  }

  /**
   * Create a GL canvas object and stores it in a Pool because we can't have unlimited gl contexts.
   *
   * @param container: HTMLElement and the wrapper of the canvas. Canvas will size based on this element
   * @param shader: Plain text shader that is applied
   * @param animationLoop: Boolean to automatically play the animationFrame to update the canvas
   * @param canvasScale: Number to scale up/down the real canvas size. Can be used to shrink the canvas and render
   * less pixels, which should result in faster rendering.
   */
  public static createTemporary(
    container: HTMLElement,
    shader: string,
    animationLoop: boolean = false,
    useOwnGLInstance: boolean = false,
    canvasScale: number = 1,
  ): ImageEffectRenderer {
    let ier: ImageEffectRenderer;

    if (!useOwnGLInstance && ImageEffectRenderer.IERPool.length > 0) {
      ier = ImageEffectRenderer.IERPool.pop();
    } else if (useOwnGLInstance && ImageEffectRenderer.IEROWNPool.length > 0) {
      ier = ImageEffectRenderer.IEROWNPool.pop();
    } else {
      ier = new ImageEffectRenderer(container, animationLoop, useOwnGLInstance, true);
    }

    ier.animationLoop = animationLoop;
    ier.drawOneFrame = true;
    ier.time = 0;
    ier.startTime = -1;
    ier.container = container;
    ier.canvasScale = canvasScale;

    container.appendChild(ier.canvas);
    ier.updateSize();

    if (!ier.mainBuffer) {
      ier.mainBuffer = new ImageEffectRendererBuffer(ier.glInstance);
    }
    ier.mainBuffer.setProgram(ier.glInstance.compileShader(shader));

    ier.width = ier.canvas.width;
    ier.height = ier.canvas.height;

    if (ier.useOwnGLInstance) {
      ImageEffectRenderer.IEROWNActive.push(ier);
      ier.drawingLoop(0);
    } else {
      ImageEffectRenderer.IERActive.push(ier);
      ImageEffectRenderer.IERActive.sort((a, b) => a.order() - b.order());
    }

    return ier;
  }

  private static drawInstances(time: number): void {
    window.requestAnimationFrame(time => this.drawInstances(time));

    const dt = ImageEffectRenderer.sharedTime < 0 ? 1 / 60 : time - ImageEffectRenderer.sharedTime;
    ImageEffectRenderer.sharedTime = time;

    const canvas = ImageEffectRenderer.sharedInstance.canvas;
    const gl = ImageEffectRenderer.sharedInstance.gl;
    const pool = ImageEffectRenderer.IERActive;
    let dim = { width: 0, height: 0, left: 0, top: 0 };

    for (let i = 0; i < pool.length; i++) {
      if (pool[i].animationLoop || pool[i].drawOneFrame) {
        dim = pool[i].calculateSheetPosition(dim.width, dim.height, dim.left, dim.top);
      }
    }

    if (dim.width > canvas.width || dim.height > canvas.height) {
      canvas.width = dim.width;
      canvas.height = dim.height;
    }

    gl.clear(gl.COLOR_BUFFER_BIT);

    for (let i = 0; i < pool.length; i++) {
      if (pool[i].animationLoop || pool[i].drawOneFrame) {
        pool[i].drawInstance(dt);
      }
    }

    for (let i = 0; i < pool.length; i++) {
      if (pool[i].animationLoop || pool[i].drawOneFrame) {
        pool[i].copyCanvas();
        pool[i].drawOneFrame = false;
      }
    }
  }

  private calculateSheetPosition(width: number, height: number, left: number, top: number) {
    // determine if screen has been resized. If so, adjust viewport
    if (this.canvas.width !== this.width || this.canvas.height !== this.height) {
      this.width = this.canvas.width;
      this.height = this.canvas.height;
    }
    // find position in stylesheet
    if (left < Math.max(2048 - this.width, width - this.width)) {
      this.left = left;
      this.top = top;
    } else {
      this.left = 0;
      this.top = height;
    }

    const newHeight = Math.max(height, this.top + this.height);
    const newWidth = Math.max(width, this.left + this.width);

    return { width: newWidth, height: newHeight, left: this.left + this.width, top: this.top };
  }

  private drawingLoop(time: number) {
    this.animationRequestId = window.requestAnimationFrame(time => this.drawingLoop(time));
    const dt = this.startTime < 0 ? 1 / 60 : time - this.startTime;
    this.startTime = time > 0 ? time : -1;

    if (this.animationLoop || this.drawOneFrame) {
      const gl = this.glInstance.gl;
      gl.clear(gl.COLOR_BUFFER_BIT);
      this.drawInstance(dt);
    }

    this.drawOneFrame = false;
  }

  // prettier-ignore
  private drawInstance(dt: number): void {
    const gl = this.glInstance.gl;
    if (!this.drawOneFrame) {
      this.time += dt / 1000;
    }
    if (this.tickFunc) {
      this.tickFunc();
    }

    // update buffers
    for (const k in this.buffers) {
      if (this.buffers[k]) {
        gl.viewport(0, 0, this.width, this.height);
        this.buffers[k].draw(this.time, this.canvas.width, this.canvas.height);
      }
    }

    if (this.mainBuffer) {
      gl.viewport(this.left, this.top, this.width, this.height);
      this.mainBuffer.draw(this.time, this.canvas.width, this.canvas.height);
    }
  }

  private copyCanvas(): void {
    const canvas = this.glInstance.canvas;
    this.context.clearRect(0, 0, canvas.width, canvas.height);
    this.context.drawImage(canvas, this.left, canvas.height - this.height - this.top, this.width, this.height, 0, 0, this.width, this.height);
  }

  private order(): number {
    return <number>this.mainBuffer.getProgram();
  }

  /**
   * Returns the WebGL Rendering Context
   */
  public getContext(): WebGLRenderingContext {
    return this.glInstance.gl;
  }

  /**
   * Returns the Canvas Element
   */
  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Play the animationFrame loop
   */
  public play(): void {
    this.animationLoop = true;
  }

  /**
   * Stop the animationFrame loop
   */
  public stop(): void {
    this.animationLoop = false;
  }

  /**
   * Returns the RenderTime for the shader
   */
  public get renderTime(): number {
    return this.time;
  }

  /**
   * Add a buffer, similar to the buffers in Shadertoy.
   *
   * @param i: Buffer index
   * @param shader: Plain text shader that is applied
   * @param type: Precision of buffer. Default is UNSIGNED_BYTE
   */
  public addBuffer(
    i: number,
    shader: string,
    type: number = WebGLRenderingContext.UNSIGNED_BYTE,
  ): ImageEffectRendererBuffer {
    if (this.buffers[i]) {
      this.buffers[i].destruct();
      this.buffers[i] = undefined;
    }
    this.buffers[i] = new ImageEffectRendererBuffer(this.glInstance, type);
    this.buffers[i].setProgram(this.glInstance.compileShader(shader));
    return this.buffers[i];
  }

  /**
   * Get buffer.
   *
   * @param i: Buffer index
   */
  public getBuffer(i: number): ImageEffectRendererBuffer {
    return this.buffers[i];
  }

  public getMainBuffer(): ImageEffectRendererBuffer {
    return this.mainBuffer;
  }

  public updateSize(): void {
    this.canvas.width = this.container.offsetWidth * this.canvasScale;
    this.canvas.height = this.container.offsetHeight * this.canvasScale;

    this.canvas.style.width = `${this.container.offsetWidth}px`;
    this.canvas.style.height = `${this.container.offsetHeight}px`;

    if (this.width !== this.canvas.width || this.height !== this.canvas.height) {
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.drawOneFrame = true;
    }
  }

  /**
   * Draw the new Canvas Frame, can be used to manually update the canvas when a Uniform has changed
   *
   * @param time
   */
  public draw(time: number = 0): void {
    this.time = time / 1000;
    this.drawOneFrame = true;
  }

  /**
   * Add image to slot
   *
   * @param image: Image element
   * @param slotIndex: Index used to bind the image. SlotIndex 0 is accessible as iChannel0, etc.
   * @param clampHorizontal: Clamp image horizontal
   * @param clampVertical: Clamp image vertical
   * @param flipY: Flip image vertical
   * @param useMipMap: Use mipmaps. You can only use mipmaps if the image size is a power of two.
   */
  public addImage(
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageEffectRendererBuffer,
    slotIndex: number,
    clampHorizontal: boolean = true,
    clampVertical: boolean = true,
    flipY: boolean = false,
    useMipMap: boolean = false,
    dynamic: boolean = false,
  ): void {
    this.mainBuffer.addImage(image, slotIndex, clampHorizontal, clampVertical, flipY, useMipMap, dynamic);
  }

  /**
   * Update image
   *
   * @param image: Image element
   * @param slotIndex: Index used to bind the image. SlotIndex 0 is accessible as iChannel0, etc.
   * @param clampHorizontal: Clamp image horizontal
   * @param clampVertical: Clamp image vertical
   * @param flipY: Flip image vertical
   * @param useMipMap: Use mipmaps. You can only use mipmaps if the image size is a power of two.
   */
  public updateImage(
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageEffectRendererBuffer,
    slotIndex: number,
    clampHorizontal: boolean = true,
    clampVertical: boolean = true,
    flipY: boolean = false,
    useMipMap: boolean = false,
  ): void {
    this.mainBuffer.updateImage(image, slotIndex, clampHorizontal, clampVertical, flipY, useMipMap);
  }

  /**
   * Set a callback that is called everytime the EffectRenderer is drawn
   * @param tick: () => void
   */
  public tick(tick: () => void) {
    this.tickFunc = tick;
  }

  /**
   * Set a Uniform Floating variable used in the Shader
   * @param name: string
   * @param value: float
   */
  public setUniformFloat(name: string, value: number): void {
    this.mainBuffer.setUniformFloat(name, value);
  }

  /**
   * Set a Uniform Integer variable used in the Shader
   * @param name: string
   * @param value: Int
   */
  public setUniformInt(name: string, value: number): void {
    this.mainBuffer.setUniformInt(name, value);
  }

  /**
   * Set a Uniform Vec2 variable used in the Shader
   * @param name: string
   * @param value: Vec2
   */
  public setUniformVec2(name: string, x: number, y: number): void {
    this.mainBuffer.setUniformVec2(name, x, y);
  }

  /**
   * Set a Uniform Vec3 variable used in the Shader
   * @param name: string
   * @param value: Vec3
   */
  public setUniformVec3(name: string, x: number, y: number, z: number): void {
    this.mainBuffer.setUniformVec3(name, x, y, z);
  }

  /**
   * Set a Uniform Vec4 variable used in the Shader
   * @param name: string
   * @param value: Vec4
   */
  public setUniformVec4(name: string, x: number, y: number, z: number, w: number): void {
    this.mainBuffer.setUniformVec4(name, x, y, z, w);
  }

  /**
   * Set a Uniform matrix variable used in the Shader
   * @param name: string
   * @param value: Float32Array
   */
  public setUniformMatrix(name: string, matrix: Float32Array): void {
    this.mainBuffer.setUniformMatrix(name, matrix);
  }

  private destruct() {
    cancelAnimationFrame(this.animationRequestId);
    for (const k in this.buffers) {
      this.buffers[k].destruct();
    }
    this.buffers = [];

    this.mainBuffer.destruct();
    this.mainBuffer = undefined;

    this.tickFunc = undefined;
  }

  /**
   * Release a temporary Canvas context from the pool. Freeing it up for other uses.
   *
   * @param ier
   */
  public static releaseTemporary(ier: ImageEffectRenderer): void {
    ier.stop();
    ier.destruct();

    // @ts-ignore
    ier.canvas.parentNode.removeChild(ier.canvas);

    if (ier.useOwnGLInstance) {
      const index = ImageEffectRenderer.IEROWNActive.indexOf(ier);
      if (index > -1) {
        ImageEffectRenderer.IEROWNActive.splice(index, 1);
      }
      ImageEffectRenderer.IEROWNPool.push(ier);
    } else {
      const index = ImageEffectRenderer.IERActive.indexOf(ier);
      if (index > -1) {
        ImageEffectRenderer.IERActive.splice(index, 1);
      }
      ImageEffectRenderer.IERPool.push(ier);
      ImageEffectRenderer.IERActive.sort((a, b) => a.order() - b.order());
    }
  }
}
