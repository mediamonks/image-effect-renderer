export class ImageEffectRendererFrameBuffer {
  // webgl
  private gl: WebGLRenderingContext;
  width: number = 0;
  height: number = 0;

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

enum ImageEffectRendererUniformType {
  INT,
  FLOAT,
  VEC2,
  VEC3,
  VEC4,
  MATRIX,
}

class ImageEffectRendererUniform {
  public type: ImageEffectRendererUniformType;
  public location: WebGLUniformLocation;
  public x: number;
  public y: number;
  public z: number;
  public w: number;
  public matrix: Float32Array;

  constructor(
    type: ImageEffectRendererUniformType,
    x: number,
    y: number,
    z: number,
    w: number,
    matrix: Float32Array | null,
  ) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    this.matrix = matrix;
    this.type = type;
  }
}

export class ImageEffectRendererBuffer {
  private static cachedTextures: { [k: string]: WebGLTexture } = {};

  // webgl
  private gl: WebGLRenderingContext;
  public width: number = 0;
  public height: number = 0;
  private frame: number = 0;

  // custom uniforms map
  private uniforms: { [k: string]: ImageEffectRendererUniform } = {};

  // image input
  private textures: (WebGLTexture | ImageEffectRendererBuffer)[] = []; // <slotIndex> = texture ID
  private texturesDynamic: boolean[] = [];

  // shader
  private program: WebGLProgram | null;
  private posAttributeIndex: number;
  private uvAttributeIndex: number;

  // uniform
  private uniformGlobalTime: WebGLUniformLocation;
  private uniformTime: WebGLUniformLocation;
  private uniformFrame: WebGLUniformLocation;
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
    dynamic: boolean = false,
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

    this.setUniformInt('iChannel' + slotIndex, slotIndex);
    this.texturesDynamic[slotIndex] = true;

    if (image instanceof ImageEffectRendererBuffer) {
      this.textures[slotIndex] = image;
      this.updateImage(image, slotIndex, clampHorizontal, clampVertical, flipY, useMipMap);
    } else if (image instanceof HTMLImageElement && !dynamic) {
      this.texturesDynamic[slotIndex] = false;

      // try to get cached texture
      const key = image.src + '_' + clampHorizontal + clampVertical + flipY + useMipMap;
      const cached = ImageEffectRendererBuffer.cachedTextures[key];

      if (cached) {
        this.textures[slotIndex] = cached;
      } else {
        this.textures[slotIndex] = <WebGLTexture>this.gl.createTexture();
        this.updateImage(image, slotIndex, clampHorizontal, clampVertical, flipY, useMipMap);

        ImageEffectRendererBuffer.cachedTextures[key] = this.textures[slotIndex];
      }
      return;
    } else {
      this.textures[slotIndex] = <WebGLTexture>this.gl.createTexture();
      this.updateImage(image, slotIndex, clampHorizontal, clampVertical, flipY, useMipMap);
    }
  }

  // prettier-ignore
  public updateImage(
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageEffectRendererBuffer,
    slotIndex: number,
    clampHorizontal: boolean = true,
    clampVertical: boolean = true,
    flipY: boolean = false,
    useMipMap: boolean = false,
  ): void {
    if (image instanceof ImageEffectRendererBuffer) {
      this.updateTexture(image, slotIndex, (<ImageEffectRendererBuffer>image).getSrc().getTexture(), clampHorizontal, clampVertical, useMipMap);
      this.updateTexture(image, slotIndex, (<ImageEffectRendererBuffer>image).getDest().getTexture(), clampHorizontal, clampVertical, useMipMap);
    } else {
      if (!this.texturesDynamic[slotIndex]) {
        this.texturesDynamic[slotIndex] = true;
        this.textures[slotIndex] = <WebGLTexture>this.gl.createTexture();
      }

      this.gl.bindTexture(this.gl.TEXTURE_2D, <WebGLTexture>this.textures[slotIndex]);
      this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, flipY ? 1 : 0);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
      this.updateTexture(image, slotIndex, <WebGLTexture>this.textures[slotIndex], clampHorizontal, clampVertical, useMipMap);
    }
  }

  // prettier-ignore
  private updateTexture(
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageEffectRendererBuffer,
    slotIndex: number,
    texture: WebGLTexture,
    clampHorizontal: boolean = true,
    clampVertical: boolean = true,
    useMipMap: boolean = false,
  ): void {
    this.setUniformVec2('iChannelResolution' + slotIndex, image.width, image.height);

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, clampHorizontal ? this.gl.CLAMP_TO_EDGE : this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, clampVertical ? this.gl.CLAMP_TO_EDGE : this.gl.REPEAT);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
    if (useMipMap) {
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
      this.gl.generateMipmap(this.gl.TEXTURE_2D);
    } else {
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    }
  }

  // prettier-ignore
  private setUniform(name, type: ImageEffectRendererUniformType, x: number, y: number, z: number, w: number, matrix: Float32Array | null) {
    if (!this.uniforms[name]) {
      const uniform = new ImageEffectRendererUniform(type, x, y, z, w, matrix);
      this.gl.useProgram(this.program);
      uniform.location = this.gl.getUniformLocation(this.program, name);
      if (uniform.location) {
        this.uniforms[name] = uniform;
      }
    } else {
      const uniform = this.uniforms[name];
      if (uniform.type !== type) {
        throw new Error('Updating uniform ' + name + ' using a different type.');
      }
      uniform.x = x, uniform.y = y, uniform.z = z, uniform.w = w, uniform.matrix = matrix;
    }
  }

  public setUniformFloat(name: string, value: number): void {
    this.setUniform(name, ImageEffectRendererUniformType.FLOAT, value, 0, 0, 0, null);
  }

  public setUniformInt(name: string, value: number): void {
    this.setUniform(name, ImageEffectRendererUniformType.INT, value, 0, 0, 0, null);
  }

  public setUniformVec2(name: string, x: number, y: number): void {
    this.setUniform(name, ImageEffectRendererUniformType.VEC2, x, y, 0, 0, null);
  }

  public setUniformVec3(name: string, x: number, y: number, z: number): void {
    this.setUniform(name, ImageEffectRendererUniformType.VEC3, x, y, z, 0, null);
  }

  public setUniformVec4(name: string, x: number, y: number, z: number, w: number): void {
    this.setUniform(name, ImageEffectRendererUniformType.VEC4, x, y, z, w, null);
  }

  public setUniformMatrix(name: string, matrix: Float32Array): void {
    this.setUniform(name, ImageEffectRendererUniformType.MATRIX, 0, 0, 0, 0, matrix);
  }

  public setProgram(program: WebGLProgram): void {
    this.program = program;

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
    this.uniformFrame = <WebGLUniformLocation>this.gl.getUniformLocation(
      <WebGLProgram>this.program,
      'iFrame',
    );
  }

  public getProgram(): WebGLProgram {
    return this.program;
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
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    this.gl.useProgram(this.program);

    // global uniforms
    if (this.uniformGlobalTime) this.gl.uniform1f(this.uniformGlobalTime, time);
    if (this.uniformTime) this.gl.uniform1f(this.uniformTime, time);
    if (this.uniformFrame) this.gl.uniform1i(this.uniformFrame, this.frame);
    if (this.uniformResolution) this.gl.uniform2f(this.uniformResolution, width, height);

    // custom uniforms
    for (const k in this.uniforms) {
      const u = this.uniforms[k];
      switch (u.type) {
        case ImageEffectRendererUniformType.INT:
          this.gl.uniform1i(u.location, u.x);
          break;
        case ImageEffectRendererUniformType.FLOAT:
          this.gl.uniform1f(u.location, u.x);
          break;
        case ImageEffectRendererUniformType.VEC2:
          this.gl.uniform2f(u.location, u.x, u.y);
          break;
        case ImageEffectRendererUniformType.VEC3:
          this.gl.uniform3f(u.location, u.x, u.y, u.z);
          break;
        case ImageEffectRendererUniformType.VEC4:
          this.gl.uniform4f(u.location, u.x, u.y, u.z, u.w);
          break;
        case ImageEffectRendererUniformType.MATRIX:
          this.gl.uniformMatrix4fv(u.location, false, u.matrix);
          break;
      }
    }

    // texture/channel uniforms
    for (let slotIndex: number = 0; slotIndex < this.textures.length; ++slotIndex) {
      this.gl.activeTexture(this.gl.TEXTURE0 + slotIndex);
      if (this.textures[slotIndex] instanceof ImageEffectRendererBuffer) {
        const src = (<ImageEffectRendererBuffer>this.textures[slotIndex]).getSrc();
        this.gl.bindTexture(this.gl.TEXTURE_2D, src.getTexture());
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

  public destruct() {
    for (const k in this.textures) {
      if (this.textures[k] instanceof ImageEffectRendererBuffer) {
      } else {
        if (this.texturesDynamic[k]) {
          this.gl.deleteTexture(<WebGLTexture>this.textures[k]);
        }
      }
    }
    this.textures = [];
    this.uniforms = {};

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
  // (global) context resource management
  private static IERActive: ImageEffectRenderer[] = [];
  private static IERPool: ImageEffectRenderer[] = [];

  private static sharedCanvas: HTMLCanvasElement;
  private static sharedGL: WebGLRenderingContext;
  private static sharedQuadVBO: WebGLBuffer;
  private static sharedTime: number = 0;

  // share resources
  private static ShaderPool: { [k: string]: WebGLShader } = {};

  // webgl
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private gl: WebGLRenderingContext;

  private left: number = 0;
  private top: number = 0;
  private width: number = 0;
  private height: number = 0;
  private tickFunc: () => void | null = null;

  // control
  private time: number = 0;
  private animationLoop: boolean = true;
  private drawOneFrame: boolean = false;

  private container: HTMLElement;
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

    if (!ImageEffectRenderer.sharedCanvas) {
      const canvas = (ImageEffectRenderer.sharedCanvas = document.createElement('canvas'));
      ImageEffectRenderer.sharedGL = <WebGLRenderingContext>canvas.getContext(
        'experimental-webgl',
        {
          premultipliedAlpha: true,
        },
      );
      if (!ImageEffectRenderer.sharedGL) {
        throw new Error('ImageEffectRenderer: Failed to request a 3D context, aborting...');
      }
      ImageEffectRenderer.generateNDCQuad();
      ImageEffectRenderer.drawInstances(0);

      const gl = ImageEffectRenderer.sharedGL;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      canvas.style.display = 'none';
      document.body.appendChild(canvas);
    }

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.gl = ImageEffectRenderer.sharedGL;
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

    if (ImageEffectRenderer.IERPool.length > 0) {
      ier = ImageEffectRenderer.IERPool[0];
      ImageEffectRenderer.IERPool.splice(0, 1);
    } else {
      ier = new ImageEffectRenderer(container, animationLoop, true);
    }

    ier.animationLoop = animationLoop;
    ier.drawOneFrame = true;
    ier.time = 0;
    ier.container = container;
    ier.canvasScale = canvasScale;

    container.appendChild(ier.canvas);
    ier.updateSize();

    if (!ier.mainBuffer) {
      ier.mainBuffer = new ImageEffectRendererBuffer(ier.gl);
    }
    ier.mainBuffer.setProgram(ImageEffectRenderer.compileShader(shader));

    ier.width = ier.canvas.width;
    ier.height = ier.canvas.height;

    // store current ImageEffectRenderer in the list of active IERs
    ImageEffectRenderer.IERActive.push(ier);
    // sort based on program
    ImageEffectRenderer.IERActive.sort((a, b) => a.order() - b.order());

    return ier;
  }

  private static drawInstances(time: number): void {
    window.requestAnimationFrame(time => this.drawInstances(time));

    const dt = time - ImageEffectRenderer.sharedTime;
    ImageEffectRenderer.sharedTime = time;

    const canvas = ImageEffectRenderer.sharedCanvas;
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
    if (left < Math.max(2048, width - this.width)) {
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

  // prettier-ignore
  private drawInstance(dt: number): void {
    if (!this.drawOneFrame) {
      this.time += dt / 1000;
    }
    if (this.tickFunc) {
      this.tickFunc();
    }

    // update buffers
    for (const k in this.buffers) {
      this.gl.viewport(0, 0, this.width, this.height);
      this.buffers[k].draw(ImageEffectRenderer.sharedQuadVBO, this.time, this.canvas.width, this.canvas.height);
    }

    this.gl.viewport(this.left, this.top, this.width, this.height);
    this.mainBuffer.draw(ImageEffectRenderer.sharedQuadVBO, this.time, this.canvas.width, this.canvas.height);
  }

  private static compileShader(fsSource: string) {
    if (ImageEffectRenderer.ShaderPool[fsSource]) {
      return ImageEffectRenderer.ShaderPool[fsSource];
    }
    const gl = ImageEffectRenderer.sharedGL;
    const program = gl.createProgram();

    const vs = <WebGLShader>gl.createShader(gl.VERTEX_SHADER);
    const fs = <WebGLShader>gl.createShader(gl.FRAGMENT_SHADER);

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
    gl.shaderSource(vs, vsSource);
    gl.compileShader(vs);

    let success = gl.getShaderParameter(vs, gl.COMPILE_STATUS);
    if (!success) {
      throw new Error(
        `ImageEffectRenderer: Vertex shader compilation failed: ${gl.getShaderInfoLog(vs)}`,
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
            uniform int iFrame;
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
                mainImage(gl_FragColor, vUV0 * iResolution.xy);
            }
        `;
    gl.shaderSource(fs, fsMainSource + fsSource);
    gl.compileShader(fs);

    success = gl.getShaderParameter(fs, gl.COMPILE_STATUS);
    if (!success) {
      throw new Error(`ImageEffectRenderer: Shader compilation failed: ${gl.getShaderInfoLog(fs)}`);
    }

    // link shaders
    gl.attachShader(<WebGLProgram>program, vs);
    gl.attachShader(<WebGLProgram>program, fs);
    gl.linkProgram(<WebGLProgram>program);

    success = gl.getProgramParameter(<WebGLProgram>program, gl.LINK_STATUS);
    if (!success) {
      throw new Error(
        `ImageEffectRenderer: Program linking failed: ${gl.getProgramInfoLog(
          <WebGLProgram>program,
        )}`,
      );
    }
    ImageEffectRenderer.ShaderPool[fsSource] = program;

    return program;
  }

  private copyCanvas(): void {
    const canvas = ImageEffectRenderer.sharedCanvas;
    this.context.drawImage(
      ImageEffectRenderer.sharedCanvas,
      this.left,
      canvas.height - this.height - this.top,
      this.width,
      this.height,
      0,
      0,
      this.width,
      this.height,
    );
  }

  protected order(): number {
    return <number>this.mainBuffer.getProgram();
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
    }
    this.buffers[i] = new ImageEffectRendererBuffer(this.gl, type);
    this.buffers[i].setProgram(ImageEffectRenderer.compileShader(shader));
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

  private static generateNDCQuad(): void {
    const gl = ImageEffectRenderer.sharedGL;
    // prettier-ignore
    const vertices: Float32Array = new Float32Array([-1, 1, 0, 1, -1, -1, 0, 0, 1, 1, 1, 1, 1, -1, 1, 0]);
    ImageEffectRenderer.sharedQuadVBO = <WebGLBuffer>gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ImageEffectRenderer.sharedQuadVBO);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
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
    this.mainBuffer.addImage(
      image,
      slotIndex,
      clampHorizontal,
      clampVertical,
      flipY,
      useMipMap,
      dynamic,
    );
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

  public destruct() {
    for (const k in this.buffers) {
      this.buffers[k].destruct();
    }
    this.buffers = [];
    this.mainBuffer.destruct();
    this.tickFunc = null;
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

    // sort based on program
    ImageEffectRenderer.IERActive.sort((a, b) => a.order() - b.order());
  }
}
