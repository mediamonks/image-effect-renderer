// prettier-ignore
export class ImageEffectRendererWebGLInstance {
  public gl: WebGLRenderingContext;
  public canvas: HTMLCanvasElement;
  public quadVBO: WebGLBuffer;
  public lastQuadVBO: WebGLBuffer | undefined = undefined;

  // share resources
  public ShaderPool: { [k: string]: WebGLShader } = {};
  public SharedTextures: { [k: string]: WebGLTexture } = {};

  constructor() {
    const canvas = document.createElement('canvas');
    this.canvas = canvas;
    this.gl = <WebGLRenderingContext>canvas.getContext('experimental-webgl', {
      premultipliedAlpha: true,
      alpha: true,
      preserveDrawingBuffer: false,
      antialias: false,
      depth: false,
      stencil: false,
    });

    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);

    this.canvas = canvas;
    this.generateNDCQuad();
  }

  private generateNDCQuad(): void {
    const gl = this.gl;
    const vertices: Float32Array = new Float32Array([-1, 1, 0, 1, -1, -1, 0, 0, 1, 1, 1, 1, 1, -1, 1, 0]);
    this.quadVBO = <WebGLBuffer>gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVBO);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  }

  public compileShader(fsSource: string) {
    if (this.ShaderPool[fsSource]) {
      return this.ShaderPool[fsSource];
    }
    const gl = this.gl;
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
    this.ShaderPool[fsSource] = program;

    return program;
  }
}
