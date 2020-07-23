// prettier-ignore
export class ImageEffectRendererFrameBuffer {
  // webgl
  private gl: WebGLRenderingContext;
  width: number = 0;
  height: number = 0;

  private format: number = WebGLRenderingContext.RGBA;
  private type: number = WebGLRenderingContext.UNSIGNED_BYTE;

  private texture: WebGLTexture | undefined;
  private frameBuffer: WebGLFramebuffer | undefined;

  constructor(gl: WebGLRenderingContext, type: number = WebGLRenderingContext.UNSIGNED_BYTE) {
    this.gl = gl;
    this.type = type;

    this.texture = <WebGLTexture>this.gl.createTexture();
    this.resize(16, 16);

    this.frameBuffer = <WebGLFramebuffer>this.gl.createFramebuffer();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.texture, 0);
  }

  public getTexture(): WebGLTexture {
    return <WebGLTexture>this.texture;
  }

  public getFrameBuffer(): WebGLFramebuffer {
    return <WebGLFramebuffer>this.frameBuffer;
  }

  public resize(width: number, height: number) {
    if (this.width === width && this.height === height) {
      return;
    }
    this.width = width;
    this.height = height;

    // this.gl.activeTexture(GL.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 0);
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.format, this.width, this.height, 0, this.format, this.type, undefined);
  }

  public destruct() {
    if (this.frameBuffer) {
      this.gl.deleteFramebuffer(this.frameBuffer);
    }
    if (this.texture) {
      this.gl.deleteTexture(this.texture);
    }

    this.frameBuffer = undefined;
    this.texture = undefined;
  }
}
