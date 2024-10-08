import {WebGLInstance} from "./WebGLInstance.js";
import type {ImageEffectRendererOptions} from "./ImageEffectRenderer.js";
import {Renderer} from "./Renderer.js";
import {type BufferOptions, RendererBuffer} from "./RendererBuffer.js";
import Program from "./Program.js";
import {bindMouseListener, getMousePosition, getNormalizedMousePosition} from "./MouseListener.js";

export class RendererInstance extends Renderer {
  private static index: number = 0;

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
      inset:   '0',
      width:   '100%',
      height:  '100%',
      margin:  '0',
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

  public drawInstance(dt: number): void {
    const context = this.gl.context;

    if (!this.drawOneFrame) {
      this.time += dt;
    }

    this.tickFuncs.forEach(func => func(dt));

    if (this.iMouseUsed) {
      const xprev = this.mouse[0], yprev = this.mouse[1];
      const [x, y] = getNormalizedMousePosition(this.container.getBoundingClientRect(), getMousePosition());
      this.mouse = [x, y, xprev, yprev];
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
