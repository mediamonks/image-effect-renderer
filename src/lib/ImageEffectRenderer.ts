export default class ImageEffectRenderer {
  public static MAX_IMAGE_EFFECT_RENDERERS: number = 10;

  // webgl
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private width: number = 0;
  private height: number = 0;

  // image input
  private textures: WebGLTexture[] = []; // <slotIndex> = texture ID

  // shader
  private program: WebGLProgram;
  private posAttributeIndex: number;
  private uvAttributeIndex: number;
  private shader: string;

  // uniform
  private uniformGlobalTime: WebGLUniformLocation;
  private uniformTime: WebGLUniformLocation;
  private uniformResolution: WebGLUniformLocation;

  // quad
  private quadVBO: WebGLBuffer;

  // control
  private requestAnimationID: number;
  private time: number = 0;

  // (global) context resource management
  private static IERActive: ImageEffectRenderer[] = [];
  private static IERPool: ImageEffectRenderer[] = [];
  private activeIndex: number = -1;

  private container: HTMLElement;
  private animationLoop: boolean;

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
    this.gl = this.canvas.getContext('experimental-webgl', { premultipliedAlpha: true });

    if (!this.gl) {
      throw new Error('ImageEffectRenderer: Failed to request a 3D context, aborting...');
    }
  }

  public static createTemporary(
    container: HTMLElement,
    shader: string,
    animationLoop: boolean = false,
  ): ImageEffectRenderer {
    let ier: ImageEffectRenderer = null;

    // before creating a context, determine if we already reached the maximum number of contexts
    if (ImageEffectRenderer.IERActive.length >= ImageEffectRenderer.MAX_IMAGE_EFFECT_RENDERERS) {
      // console.error(`Maximum number of ImageEffectRenderer's reached;
      // 		no new ImageEffectRendererer created.
      // 		Clear other ImageEffectRenderer's before creating new ones.`);
      return ier;
    }

    // determine if there's an ImageEffectRenderer in the IERPool and if so, re-use its context
    if (ImageEffectRenderer.IERPool.length > 0) {
      // first look for same shader
      let sameShaderFound = false;
      for (let i = 0; i < ImageEffectRenderer.IERPool.length; i++) {
        if (ImageEffectRenderer.IERPool[i].shader === shader) {
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
    container.appendChild(ier.canvas);
    ier.updateSize();

    if (!ier.quadVBO) {
      ier.generateNDCQuad();
    }

    if (ier.shader !== shader) {
      if (ier.program) {
        ier.gl.deleteProgram(ier.program);
        ier.program = null;
      }
      ier.compileShader(shader);
      ier.shader = shader;
    }

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
    ier.activeIndex = ImageEffectRenderer.IERActive.length - 1;

    return ier;
  }

  /**
   * Add Image to the GL, This can be an HTMLImageElement or a rendered Canvas
   *
   * @param image
   * @param slotIndex
   * @param clampToEdge
   */
  public addImage(
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
    slotIndex: number,
    clampHorizontal: boolean = true,
    clampVertical: boolean = true,
    flipY: boolean = false,
  ): void {
    if (slotIndex >= 4) {
      // console.log('ImageEffectRenderer: A maximum of 4 slots is available, slotIndex is out of bounds.');
    }

    if (!this.textures[slotIndex]) {
      this.textures[slotIndex] = this.gl.createTexture();
    }

    this.gl.useProgram(this.program);
    this.gl.uniform1i(this.gl.getUniformLocation(this.program, 'iChannel' + slotIndex), slotIndex);
    this.gl.uniform2f(
      this.gl.getUniformLocation(this.program, 'iChannelResolution' + slotIndex),
      image.width,
      image.height,
    );

    this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[slotIndex]);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, flipY ? 1 : 0);
    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      image,
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
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public play(): void {
    if (!this.requestAnimationID) {
      this.draw(0);
    }
  }

  public stop(): void {
    if (this.requestAnimationID) {
      window.cancelAnimationFrame(this.requestAnimationID);
      this.requestAnimationID = null;
    }
  }

  public setUniformFloat(name: string, value: number): void {
    this.gl.useProgram(this.program);
    this.gl.uniform1f(this.gl.getUniformLocation(this.program, name), value);
  }

  public setUniformInt(name: string, value: number): void {
    this.gl.useProgram(this.program);
    this.gl.uniform1i(this.gl.getUniformLocation(this.program, name), value);
  }

  public setUniformVec2(name: string, x: number, y: number): void {
    this.gl.useProgram(this.program);
    this.gl.uniform2f(this.gl.getUniformLocation(this.program, name), x, y);
  }

  public setUniformVec3(name: string, x: number, y: number, z: number): void {
    this.gl.useProgram(this.program);
    this.gl.uniform3f(this.gl.getUniformLocation(this.program, name), x, y, z);
  }

  public setUniformVec4(name: string, x: number, y: number, z: number, w: number): void {
    this.gl.useProgram(this.program);
    this.gl.uniform4f(this.gl.getUniformLocation(this.program, name), x, y, z, w);
  }

  public get renderTime(): number {
    return this.time;
  }

  public draw(time: number = 0): void {
    this.time = time / 1000;

    // determine if screen has been resized. If so, adjust viewport
    if (this.canvas.width !== this.width || this.canvas.height !== this.height) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this.width = this.canvas.width;
      this.height = this.canvas.height;
    }

    // clear
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.useProgram(this.program);

    // global uniforms
    this.gl.uniform1f(this.uniformGlobalTime, this.time);
    this.gl.uniform1f(this.uniformTime, this.time);
    this.gl.uniform2f(this.uniformResolution, this.canvas.width, this.canvas.height);

    // texture/channel uniforms
    for (let slotIndex: number = 0; slotIndex < this.textures.length; ++slotIndex) {
      this.gl.activeTexture(this.gl.TEXTURE0 + slotIndex);
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.textures[slotIndex]);
    }

    // render NDC quad
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVBO);
    this.gl.enableVertexAttribArray(this.posAttributeIndex);

    // 4 32-bit values = 4 4-byte values
    this.gl.vertexAttribPointer(this.posAttributeIndex, 2, this.gl.FLOAT, false, 4 * 4, 0);

    this.gl.enableVertexAttribArray(this.uvAttributeIndex);
    this.gl.vertexAttribPointer(this.uvAttributeIndex, 2, this.gl.FLOAT, false, 4 * 4, 2 * 4);

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    if (this.animationLoop) {
      this.requestAnimationID = window.requestAnimationFrame(time => this.draw(time));
    }
  }

  public updateSize(): void {
    this.canvas.width = this.container.offsetWidth;
    this.canvas.height = this.container.offsetHeight;
  }

  private compileShader(fsSource: string): void {
    this.program = this.gl.createProgram();

    const vs = this.gl.createShader(this.gl.VERTEX_SHADER);
    const fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);

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
    this.gl.attachShader(this.program, vs);
    this.gl.attachShader(this.program, fs);
    this.gl.linkProgram(this.program);

    success = this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS);
    if (!success) {
      throw new Error(
        `ImageEffectRenderer: Program linking failed: ${this.gl.getProgramInfoLog(this.program)}`,
      );
    }

    // get attribute locations
    this.posAttributeIndex = this.gl.getAttribLocation(this.program, 'aPos');
    this.uvAttributeIndex = this.gl.getAttribLocation(this.program, 'aUV');

    // get uniform locations
    this.gl.useProgram(this.program);
    this.uniformGlobalTime = this.gl.getUniformLocation(this.program, 'iGlobalTime');
    this.uniformTime = this.gl.getUniformLocation(this.program, 'iTime');
    this.uniformResolution = this.gl.getUniformLocation(this.program, 'iResolution');
  }

  private generateNDCQuad(): void {
    // prettier-ignore
    const vertices: Float32Array = new Float32Array([-1, 1, 0, 1, -1, -1, 0, 0, 1, 1, 1, 1, 1, -1, 1, 0]);
    this.quadVBO = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadVBO);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
  }

  public static releaseTemporary(ier: ImageEffectRenderer): void {
    ier.stop();

    ier.canvas.parentNode.removeChild(ier.canvas);

    // remove from active IER instances
    ImageEffectRenderer.IERActive.splice(ier.activeIndex, 1);

    // add current instance to pool
    ImageEffectRenderer.IERPool.push(ier);
  }
}
