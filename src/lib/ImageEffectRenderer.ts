class ImageEffectRendererFrameBuffer {
  // webgl
  private gl: WebGLRenderingContext;
  private width: number = 0;
  private height: number = 0;

  private format: number = WebGLRenderingContext.RGBA;
  private type: number = WebGLRenderingContext.UNSIGNED_BYTE;

  private texture: WebGLTexture | null;
  private frameBuffer: WebGLFramebuffer | null;

  constructor(gl: WebGLRenderingContext, type: number = WebGLRenderingContext.UNSIGNED_BYTE) {
    this.gl = gl;
    this.type = type;

    this.texture = <WebGLTexture>this.gl.createTexture();
    this.resize(16, 16);

    this.frameBuffer = <WebGLFramebuffer>this.gl.createFramebuffer();
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D,
      this.texture,
      0,
    );
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
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.format,
      this.width,
      this.height,
      0,
      this.format,
      this.type,
      null,
    );
  }

  public destruct() {
    if (this.frameBuffer) {
      this.gl.deleteFramebuffer(this.frameBuffer);
    }
    if (this.texture) {
      this.gl.deleteTexture(this.texture);
    }

    this.frameBuffer = null;
    this.texture = null;
  }
}

export class ImageEffectRendererBuffer {
  // webgl
  private gl: WebGLRenderingContext;
  public width: number = 0;
  public height: number = 0;
  private frame: number = 0;

  // image input
  private textures: (WebGLTexture | ImageEffectRendererBuffer)[] = []; // <slotIndex> = texture ID

  // shader
  private program: WebGLProgram | null;
  private shader: string;
  private posAttributeIndex: number;
  private uvAttributeIndex: number;

  // uniform
  private uniformGlobalTime: WebGLUniformLocation;
  private uniformTime: WebGLUniformLocation;
  private uniformResolution: WebGLUniformLocation;

  // buffers
  private frameBuffer0: ImageEffectRendererFrameBuffer | null;
  private frameBuffer1: ImageEffectRendererFrameBuffer | null;

  constructor(gl: WebGLRenderingContext, type: number = -1) {
    this.gl = gl;

    if (type >= 0) {
      this.frameBuffer0 = new ImageEffectRendererFrameBuffer(gl, type);
      this.frameBuffer1 = new ImageEffectRendererFrameBuffer(gl, type);
    }
  }

  public addImage(
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageEffectRendererBuffer,
    slotIndex: number,
    clampHorizontal: boolean = true,
    clampVertical: boolean = true,
    flipY: boolean = false,
    useMipMap: boolean = false,
  ): void {
    if (slotIndex >= 4) {
      throw new Error(
        'ImageEffectRenderer: A maximum of 4 slots is available, slotIndex is out of bounds.',
      );
    }

    if (this.textures[slotIndex]) {
      throw new Error(
        'ImageEffectRenderer: Image already added to slot ' +
          slotIndex +
          '. Use updateImage if you want to update an existing slot.',
      );
    }

    if (image instanceof ImageEffectRendererBuffer) {
      this.textures[slotIndex] = image;
    } else {
      this.textures[slotIndex] = <WebGLTexture>this.gl.createTexture();
    }

    this.gl.useProgram(this.program);
    this.gl.uniform1i(
      this.gl.getUniformLocation(<WebGLProgram>this.program, 'iChannel' + slotIndex),
      slotIndex,
    );

    this.updateImage(image, slotIndex, clampHorizontal, clampVertical, flipY, useMipMap);
  }

  public updateImage(
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageEffectRendererBuffer,
    slotIndex: number,
    clampHorizontal: boolean = true,
    clampVertical: boolean = true,
    flipY: boolean = false,
    useMipMap: boolean = false,
  ): void {
    if (image instanceof ImageEffectRendererBuffer) {
      this.updateTexture(
        image,
        (<ImageEffectRendererBuffer>image).getSrc().getTexture(),
        slotIndex,
        clampHorizontal,
        clampVertical,
        useMipMap,
      );
      this.updateTexture(
        image,
        (<ImageEffectRendererBuffer>image).getDest().getTexture(),
        slotIndex,
        clampHorizontal,
        clampVertical,
        useMipMap,
      );
    } else {
      this.gl.bindTexture(this.gl.TEXTURE_2D, <WebGLTexture>this.textures[slotIndex]);
      this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, flipY ? 1 : 0);
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        image,
      );
      this.updateTexture(
        image,
        <WebGLTexture>this.textures[slotIndex],
        slotIndex,
        clampHorizontal,
        clampVertical,
        useMipMap,
      );
    }
  }

  private updateTexture(
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageEffectRendererBuffer,
    texture: WebGLTexture,
    slotIndex: number,
    clampHorizontal: boolean = true,
    clampVertical: boolean = true,
    useMipMap: boolean = false,
  ): void {
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.uniform2f(
      this.gl.getUniformLocation(<WebGLProgram>this.program, 'iChannelResolution' + slotIndex),
      image.width,
      image.height,
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      clampHorizontal ? this.gl.CLAMP_TO_EDGE : this.gl.REPEAT,
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      clampVertical ? this.gl.CLAMP_TO_EDGE : this.gl.REPEAT,
    );
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    if (useMipMap) {
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MIN_FILTER,
        this.gl.LINEAR_MIPMAP_LINEAR,
      );
      this.gl.generateMipmap(this.gl.TEXTURE_2D);
    } else {
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    }
  }

  public setUniformFloat(name: string, value: number): void {
    this.gl.useProgram(this.program);
    this.gl.uniform1f(this.gl.getUniformLocation(<WebGLProgram>this.program, name), value);
  }

  public setUniformInt(name: string, value: number): void {
    this.gl.useProgram(this.program);
    this.gl.uniform1i(this.gl.getUniformLocation(<WebGLProgram>this.program, name), value);
  }

  public setUniformVec2(name: string, x: number, y: number): void {
    this.gl.useProgram(this.program);
    this.gl.uniform2f(this.gl.getUniformLocation(<WebGLProgram>this.program, name), x, y);
  }

  public setUniformVec3(name: string, x: number, y: number, z: number): void {
    this.gl.useProgram(this.program);
    this.gl.uniform3f(this.gl.getUniformLocation(<WebGLProgram>this.program, name), x, y, z);
  }

  public setUniformVec4(name: string, x: number, y: number, z: number, w: number): void {
    this.gl.useProgram(this.program);
    this.gl.uniform4f(this.gl.getUniformLocation(<WebGLProgram>this.program, name), x, y, z, w);
  }

  public setUniformMatrix(name: string, matrix: Float32Array): void {
    this.gl.useProgram(this.program);
    this.gl.uniformMatrix4fv(
      this.gl.getUniformLocation(<WebGLProgram>this.program, name),
      false,
      matrix,
    );
  }

  public compileShader(fsSource: string): void {
    if (this.shader !== fsSource) {
      if (this.program) {
        this.gl.deleteProgram(this.program);
        this.program = null;
      }
      this.shader = fsSource;
    } else {
      return;
    }

    this.program = this.gl.createProgram();

    const vs = <WebGLShader>this.gl.createShader(this.gl.VERTEX_SHADER);
    const fs = <WebGLShader>this.gl.createShader(this.gl.FRAGMENT_SHADER);

    // vertex shader
    const vsSource: string = `
            attribute vec2 aPos;
            attribute vec2 aUV;
            
            varying vec2 vUV0;
            
            void main(void) {
                vUV0 = aUV;
                gl_Position = vec4(aPos, 0.0, 1.0);
            }
        `;
    this.gl.shaderSource(vs, vsSource);
    this.gl.compileShader(vs);

    let success = this.gl.getShaderParameter(vs, this.gl.COMPILE_STATUS);
    if (!success) {
      throw new Error(
        `ImageEffectRenderer: Vertex shader compilation failed: ${this.gl.getShaderInfoLog(vs)}`,
      );
    }

    // fragment shader
    const fsMainSource: string = `
            #ifdef GL_ES
                precision highp float;
            #endif
            
            varying vec2 vUV0;
            
            uniform vec2 iResolution;
            uniform float iTime;
            uniform float iGlobalTime;
            uniform vec4 iMouse;
            
            uniform highp sampler2D iChannel0;
            uniform highp sampler2D iChannel1;
            uniform highp sampler2D iChannel2;
            uniform highp sampler2D iChannel3;
            
            uniform vec2 iChannelResolution0;
            uniform vec2 iChannelResolution1;
            uniform vec2 iChannelResolution2;
            uniform vec2 iChannelResolution3;
            
            void mainImage(out vec4, vec2);
            
            vec4 texture(sampler2D tex, vec2 uv) {
                return texture2D(tex, uv);
            }
            
            void main(void) {
            	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                mainImage(gl_FragColor, gl_FragCoord.xy);
            }
        `;
    this.gl.shaderSource(fs, fsMainSource + fsSource);
    this.gl.compileShader(fs);

    success = this.gl.getShaderParameter(fs, this.gl.COMPILE_STATUS);
    if (!success) {
      throw new Error(
        `ImageEffectRenderer: Shader compilation failed: ${this.gl.getShaderInfoLog(fs)}`,
      );
    }

    // link shaders
    this.gl.attachShader(<WebGLProgram>this.program, vs);
    this.gl.attachShader(<WebGLProgram>this.program, fs);
    this.gl.linkProgram(<WebGLProgram>this.program);

    success = this.gl.getProgramParameter(<WebGLProgram>this.program, this.gl.LINK_STATUS);
    if (!success) {
      throw new Error(
        `ImageEffectRenderer: Program linking failed: ${this.gl.getProgramInfoLog(<WebGLProgram>this
          .program)}`,
      );
    }

    // get attribute locations
    this.posAttributeIndex = this.gl.getAttribLocation(<WebGLProgram>this.program, 'aPos');
    this.uvAttributeIndex = this.gl.getAttribLocation(<WebGLProgram>this.program, 'aUV');

    // get uniform locations
    this.gl.useProgram(this.program);
    this.uniformGlobalTime = <WebGLUniformLocation>this.gl.getUniformLocation(
      <WebGLProgram>this.program,
      'iGlobalTime',
    );
    this.uniformTime = <WebGLUniformLocation>this.gl.getUniformLocation(
      <WebGLProgram>this.program,
      'iTime',
    );
    this.uniformResolution = <WebGLUniformLocation>this.gl.getUniformLocation(
      <WebGLProgram>this.program,
      'iResolution',
    );
  }

  public getSrc(): ImageEffectRendererFrameBuffer {
    return <ImageEffectRendererFrameBuffer>(this.frame % 2 === 0
      ? this.frameBuffer0
      : this.frameBuffer1);
  }

  public getDest(): ImageEffectRendererFrameBuffer {
    return <ImageEffectRendererFrameBuffer>(this.frame % 2 === 1
      ? this.frameBuffer0
      : this.frameBuffer1);
  }

  /**
   * Draw the new Canvas Frame, can be used to manually update the canvas when a Uniform has changed
   *
   * @param time
   */
  public draw(quadVBO: WebGLBuffer, time: number = 0, width: number, height: number): void {
    this.width = width | 0;
    this.height = height | 0;

    const fb = this.getDest();
    if (fb) {
      fb.resize(this.width, this.height);
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb.getFrameBuffer());
    }

    // clear
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.useProgram(this.program);

    // global uniforms
    this.gl.uniform1f(this.uniformGlobalTime, time);
    this.gl.uniform1f(this.uniformTime, time);
    this.gl.uniform2f(this.uniformResolution, width, height);

    // texture/channel uniforms
    for (let slotIndex: number = 0; slotIndex < this.textures.length; ++slotIndex) {
      this.gl.activeTexture(this.gl.TEXTURE0 + slotIndex);
      if (this.textures[slotIndex] instanceof ImageEffectRendererBuffer) {
        this.gl.bindTexture(
          this.gl.TEXTURE_2D,
          (<ImageEffectRendererBuffer>this.textures[slotIndex]).getSrc().getTexture(),
        );
      } else {
        this.gl.bindTexture(this.gl.TEXTURE_2D, <WebGLTexture>this.textures[slotIndex]);
      }
    }

    // render NDC quad
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, quadVBO);
    this.gl.enableVertexAttribArray(this.posAttributeIndex);

    // 4 32-bit values = 4 4-byte values
    this.gl.vertexAttribPointer(this.posAttributeIndex, 2, this.gl.FLOAT, false, 4 * 4, 0);

    this.gl.enableVertexAttribArray(this.uvAttributeIndex);
    this.gl.vertexAttribPointer(this.uvAttributeIndex, 2, this.gl.FLOAT, false, 4 * 4, 2 * 4);

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    if (fb) {
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }
    this.frame++;
  }

  public getShaderSource(): string {
    return this.shader;
  }

  public destruct() {
    for (const k in this.textures) {
      if (this.textures[k] instanceof ImageEffectRendererBuffer) {
      } else {
        this.gl.deleteTexture(<WebGLTexture>this.textures[k]);
      }
    }
    this.textures = [];

    if (this.frameBuffer0) {
      this.frameBuffer0.destruct();
      this.frameBuffer0 = null;
    }

    if (this.frameBuffer1) {
      this.frameBuffer1.destruct();
      this.frameBuffer1 = null;
    }
  }
}

export default class ImageEffectRenderer {
  public static MAX_IMAGE_EFFECT_RENDERERS: number = 10;

  // webgl
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private width: number = 0;
  private height: number = 0;

  // quad
  private quadVBO: WebGLBuffer;

  // control
  private requestAnimationID: number;
  private time: number = 0;

  // (global) context resource management
  private static IERActive: ImageEffectRenderer[] = [];
  private static IERPool: ImageEffectRenderer[] = [];

  private container: HTMLElement;
  private animationLoop: boolean;

  private canvasScale: number = 1;

  private mainBuffer: ImageEffectRendererBuffer;
  private buffers: ImageEffectRendererBuffer[] = [];

  /**
   * Requires a HTMLCanvasElement and a shader program as a plain text string
   *
   * @param container
   * @param shader
   * @param _animationLoop
   */
  constructor(
    container: HTMLElement,
    animationLoop: boolean = false,
    createTemporaryUsed: boolean = false,
  ) {
    if (!createTemporaryUsed) {
      throw new Error('Use ImageEffectRenderer.createTemporary to create a ImageEffectRenderer');
    }

    this.container = container;
    this.animationLoop = animationLoop;

    this.canvas = document.createElement('canvas');
    this.gl = <WebGLRenderingContext>this.canvas.getContext('experimental-webgl', {
      premultipliedAlpha: true,
    });

    if (!this.gl) {
      throw new Error('ImageEffectRenderer: Failed to request a 3D context, aborting...');
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
    canvasScale: number = 1,
  ): ImageEffectRenderer {
    let ier: ImageEffectRenderer;

    // before creating a context, determine if we already reached the maximum number of contexts
    if (ImageEffectRenderer.IERActive.length >= ImageEffectRenderer.MAX_IMAGE_EFFECT_RENDERERS) {
      throw new Error(
        `Maximum number of ImageEffectRenderer's reached, no new ImageEffectRenderer created`,
      );
    }

    // determine if there's an ImageEffectRenderer in the IERPool and if so, re-use its context
    if (ImageEffectRenderer.IERPool.length > 0) {
      // first look for same shader
      let sameShaderFound = false;
      for (let i = 0; i < ImageEffectRenderer.IERPool.length; i++) {
        if (ImageEffectRenderer.IERPool[i].mainBuffer.getShaderSource() === shader) {
          ier = ImageEffectRenderer.IERPool[i];
          ImageEffectRenderer.IERPool.splice(i, 1);
          sameShaderFound = true;
        }
      }
      if (!sameShaderFound) {
        ier = ImageEffectRenderer.IERPool[0];
        ImageEffectRenderer.IERPool.splice(0, 1);
      }
    } else {
      ier = new ImageEffectRenderer(container, animationLoop, true);
    }

    ier.animationLoop = animationLoop;
    ier.container = container;
    ier.canvasScale = canvasScale;
    container.appendChild(ier.canvas);
    ier.updateSize();

    if (!ier.quadVBO) {
      ier.generateNDCQuad();
    }

    if (!ier.mainBuffer) {
      ier.mainBuffer = new ImageEffectRendererBuffer(ier.gl);
    }
    ier.mainBuffer.compileShader(shader);

    // gl configuration
    ier.gl.clearColor(0, 0, 0, 0);
    ier.gl.viewport(0, 0, ier.canvas.width, ier.canvas.height);
    ier.gl.clear(ier.gl.COLOR_BUFFER_BIT);

    ier.gl.enable(ier.gl.BLEND);
    ier.gl.blendFunc(ier.gl.ONE, ier.gl.ONE_MINUS_SRC_ALPHA);

    ier.width = ier.canvas.width;
    ier.height = ier.canvas.height;

    // store current ImageEffectRenderer in the list of active IERs
    ImageEffectRenderer.IERActive.push(ier);

    return ier;
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
    if (!this.requestAnimationID) {
      this.animationLoop = true;
      this.draw(0);
    }
  }

  /**
   * Stop the animationFrame loop
   */
  public stop(): void {
    if (this.requestAnimationID) {
      window.cancelAnimationFrame(this.requestAnimationID);
      this.requestAnimationID = 0;
      this.animationLoop = false;
    }
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
    }
    this.buffers[i] = new ImageEffectRendererBuffer(this.gl, type);
    this.buffers[i].compileShader(shader);
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
  }

  private generateNDCQuad(): void {
    // prettier-ignore
    const vertices: Float32Array = new Float32Array([-1, 1, 0, 1, -1, -1, 0, 0, 1, 1, 1, 1, 1, -1, 1, 0]);
    this.quadVBO = <WebGLBuffer>this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVBO);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
  }

  /**
   * Draw the new Canvas Frame, can be used to manually update the canvas when a Uniform has changed
   *
   * @param time
   */
  public draw(time: number = 0): void {
    this.time = time / 1000;

    // determine if screen has been resized. If so, adjust viewport
    if (this.canvas.width !== this.width || this.canvas.height !== this.height) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this.width = this.canvas.width;
      this.height = this.canvas.height;
    }

    // update buffers
    for (const k in this.buffers) {
      this.buffers[k].draw(this.quadVBO, this.time, this.canvas.width, this.canvas.height);
    }

    this.mainBuffer.draw(this.quadVBO, this.time, this.canvas.width, this.canvas.height);

    if (this.animationLoop) {
      this.requestAnimationID = window.requestAnimationFrame(time => this.draw(time));
    }
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
  ): void {
    this.mainBuffer.addImage(image, slotIndex, clampHorizontal, clampVertical, flipY, useMipMap);
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

  public setUniformMatrix(name: string, matrix: Float32Array): void {
    this.mainBuffer.setUniformMatrix(name, matrix);
  }

  public destruct() {
    for (const k in this.buffers) {
      this.buffers[k].destruct();
    }
    this.buffers = [];
    this.mainBuffer.destruct();
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

    // remove from active IER instances
    const index = ImageEffectRenderer.IERActive.indexOf(ier);
    if (index > -1) {
      ImageEffectRenderer.IERActive.splice(index, 1);
    } else {
      throw new Error(`Can't find the EffectRenderer in the active pool`);
    }

    // add current instance to pool
    ImageEffectRenderer.IERPool.push(ier);
  }
}
