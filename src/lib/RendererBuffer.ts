import {FrameBuffer, type FrameBufferOptions} from "./FrameBuffer.js";
import {WebGLInstance} from "./WebGLInstance.js";
import {defaultImageOptions, type ImageOptions, Renderer} from "./Renderer.js";

export type BufferOptions = ImageOptions & FrameBufferOptions;

const defaultBufferOptions: BufferOptions = {
  ...defaultImageOptions,
  useMipmap: false,
  useCache:  false,
  type:      5121, // WebGLRenderingContext.UNSIGNED_BYTE,
  msaa:      false,
};

export class RendererBuffer extends Renderer {
  public options: BufferOptions;
  // buffers
  private readonly frameBuffer0: FrameBuffer;
  private readonly frameBuffer1: FrameBuffer;

  constructor(glInstance: WebGLInstance, options: Partial<BufferOptions> = {}) {
    super(glInstance);

    this.options = {...defaultBufferOptions, ...options};

    this.frameBuffer0 = new FrameBuffer(glInstance, this.options);
    this.frameBuffer1 = new FrameBuffer(glInstance, this.options);
  }

  public get src(): FrameBuffer {
    return (this.frame % 2 === 0
      ? this.frameBuffer0
      : this.frameBuffer1);
  }

  public get dest(): FrameBuffer {
    return (this.frame % 2 === 1
      ? this.frameBuffer0
      : this.frameBuffer1);
  }

  public override draw(time: number = 0, width: number, height: number): void {
    if (width <= 0 || height <= 0) {
      return;
    }

    const context = this.gl.context;

    const fb = this.dest;

    fb.resize(width, height);
    context.bindFramebuffer(context.FRAMEBUFFER, fb.frameBuffer);
    context.clear(context.COLOR_BUFFER_BIT);

    super.draw(time, width, height);

    context.bindFramebuffer(context.FRAMEBUFFER, null);
  }

  public override destruct() {
    super.destruct();

    this.frameBuffer0.destruct();
    this.frameBuffer1.destruct();
  }
}
