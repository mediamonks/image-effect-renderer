import {WebGLInstance} from "./WebGLInstance.js";

export type FrameBufferOptions = {
  type: number,
  pixelRatio: number,
  msaa: boolean,
}

export const defaultFrameBufferOptions: FrameBufferOptions = {
  type: 5121, // WebGLRenderingContext.UNSIGNED_BYTE,
  pixelRatio: 1,
  msaa: false,
};

export class FrameBuffer {
  public width: number = 0;
  public height: number = 0;

  public texture: WebGLTexture;
  public frameBuffer: WebGLFramebuffer;
  public options: FrameBufferOptions;

  private gl: WebGLInstance;
  private format: number = WebGLRenderingContext.RGBA;
  private internalFormat: number = WebGLRenderingContext.RGBA;

  constructor(gl: WebGLInstance, options: Partial<FrameBufferOptions> = {}) {
    this.gl = gl;
    this.options = {
      ...defaultFrameBufferOptions,
      ...options,
    };

    switch (this.options.type) {
      case WebGLRenderingContext.UNSIGNED_BYTE:
        this.internalFormat = WebGL2RenderingContext.RGBA8;
        break;
      case WebGLRenderingContext.FLOAT:
        this.internalFormat = WebGL2RenderingContext.RGBA32F;
        break;
    }

    const context = gl.context;

    this.texture = <WebGLTexture>context.createTexture();
    this.resize(16, 16);

    this.frameBuffer = <WebGLFramebuffer>context.createFramebuffer();
    context.bindFramebuffer(context.FRAMEBUFFER, this.frameBuffer);
    context.framebufferTexture2D(context.FRAMEBUFFER, context.COLOR_ATTACHMENT0, context.TEXTURE_2D, this.texture, 0);
    context.bindFramebuffer(context.FRAMEBUFFER, null);
  }

  public resize(width: number, height: number) {
    if (this.width === (width | 0) && this.height === (height | 0)) {
      return;
    }
    this.width = width | 0;
    this.height = height | 0;

    const context = this.gl.context;

    // this.gl.activeTexture(GL.TEXTURE0);
    context.bindTexture(context.TEXTURE_2D, this.texture);
    context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, 0);

    context.texImage2D(context.TEXTURE_2D, 0, this.internalFormat, this.width, this.height, 0, this.format, this.options.type, null);
  }

  public destruct() {
    const context = this.gl.context;

    if (this.frameBuffer) {
      context.deleteFramebuffer(this.frameBuffer);
    }
    if (this.texture) {
      context.deleteTexture(this.texture);
    }
  }
}
