import {WebGLInstance} from './WebGLInstance.js';
import Uniform, {
  UNIFORM_FLOAT,
  UNIFORM_INT,
  UNIFORM_MATRIX,
  UNIFORM_VEC2,
  UNIFORM_VEC3,
  UNIFORM_VEC4,
  type UniformType
} from "./Uniform.js";
import type Program from "./Program.js";
import type {RendererBuffer} from "./RendererBuffer.js";
import type {Texture} from "./Texture.js.js";
import type {RendererInstance} from "./RendererInstance.js";

/**
 * @typedef {Object} ImageOptions
 * @property {boolean} clampX - Determines if the texture's horizontal dimension will be clamped. Defaults to true.
 * @property {boolean} clampY - Determines if the texture's vertical dimension will be clamped. Defaults to true.
 * @property {boolean} flipY - Inverts the image texture in the y-axis. Defaults to false.
 * @property {boolean} useMipmap - Specifies whether to use mipmaps for texture sampling. Defaults to true.
 * @property {boolean} useCache - Indicates if the texture should be cached. Defaults to true.
 * @property {boolean} minFilterLinear - Determines if the texture's min filter will be linear. Defaults to true.
 * @property {boolean} magFilterLinear - Determines if the texture's mag filter will be linear. Defaults to true.
 */
export type ImageOptions = {
  clampX: boolean,
  clampY: boolean,
  flipY: boolean,
  useMipmap: boolean,
  useCache: boolean,
  minFilterLinear: boolean,
  magFilterLinear: boolean,
}

export const defaultImageOptions: ImageOptions = {
  clampX: true,
  clampY: true,
  flipY: false,
  useMipmap: true,
  useCache: true,
  minFilterLinear: true,
  magFilterLinear: true,
};

export type ImageSource = TexImageSource | RendererBuffer;

export class Renderer {
  public width: number = 0;
  public height: number = 0;
  public program!: Program;
  public main!: RendererInstance;

  public gl: WebGLInstance;
  protected frame: number = 0;
  protected mouse: [number, number, number, number] = [0, 0, 0, 0];
  private uniforms: { [k: string]: Uniform } = {};
  private textures: Texture[] = [];

  constructor(glInstance: WebGLInstance) {
    this.gl = glInstance;
  }

  public get shaderCompiled(): boolean {
    return this.program.shaderCompiled;
  }

  public get iMouseUsed(): boolean {
    return this.program.getUniformLocation('iMouse') !== null;
  }

  /**
   * Set an image to a slot for rendering.
   * Possible images can be image elements, video elements, canvas elements, or buffers.
   *
   * @param slotIndex - Index of the slot where to set the image.
   * @param image - The image data that you want to use in the shader.
   * @param options - Custom configuration for image handling.
   */
  public setImage(
    slotIndex: number,
    image: ImageSource,
    options: Partial<ImageOptions> = {},
  ): void {
    if (slotIndex >= 8) {
      throw new Error(
        'ImageEffectRenderer: A maximum of 8 slots is available, slotIndex is out of bounds.',
      );
    }

    // Check if image/video is ready
    if (image instanceof HTMLImageElement) {
      if (!image.complete || image.naturalWidth === 0) {
        image.addEventListener('load', () => {
          this.setImage(slotIndex, image, options);
        }, {once: true});
        return;
      }
    } else if (image instanceof HTMLVideoElement) {
      if (image.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        image.addEventListener('loadeddata', () => {
          this.setImage(slotIndex, image, options);
        }, {once: true});
        return;
      }
    }

    this.setUniformInt(`iChannel${slotIndex}`, slotIndex);
    // get image width and height
    let width, height;
    if (typeof VideoFrame !== 'undefined' && image instanceof VideoFrame) {
      width = image.displayWidth;
      height = image.displayHeight;
    } else {
      width = (image as any).width;
      height = (image as any).height;
    }

    this.setUniformVec2(`iChannelResolution${slotIndex}`, width, height);

    const context = this.gl.context;
    const currentTexture = this.textures[slotIndex];

    if (image instanceof Renderer) {
      if (currentTexture && currentTexture.texture && !currentTexture.cached) {
        context.deleteTexture(<WebGLTexture>currentTexture.texture);
      }
      const bufferOptions = {...image.options, ...options};

      this.textures[slotIndex] = {
        texture: undefined,
        buffer: image,
        cached: false,
      };

      this.gl.setTextureParameter(image.src.texture, bufferOptions);
      this.gl.setTextureParameter(image.dest.texture, bufferOptions);
    } else {
      const imageOptions = {...defaultImageOptions, ...options};
      imageOptions.useCache = imageOptions.useCache && image instanceof HTMLImageElement;

      if (imageOptions.useCache && currentTexture && currentTexture.texture && !currentTexture.cached) {
        context.deleteTexture(<WebGLTexture>currentTexture.texture);
        currentTexture.texture = undefined;
      }
      let texture = currentTexture && currentTexture.texture;
      if (imageOptions.useCache && image instanceof HTMLImageElement) {
        texture = this.gl.getCachedTexture(image.src, imageOptions);
      }
      if (!texture) {
        texture = <WebGLTexture>context.createTexture();
      }
      this.textures[slotIndex] = {
        texture: texture,
        buffer: undefined,
        cached: imageOptions.useCache,
      };
      context.bindTexture(context.TEXTURE_2D, texture);
      context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, options.flipY ? 1 : 0);
      context.texImage2D(context.TEXTURE_2D, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, image);

      this.gl.setTextureParameter(texture, imageOptions);
    }
  }

  /**
   * Set a float uniform in the shader program.
   * @param name - Name of the uniform.
   * @param value - Float value.
   */
  public setUniformFloat(name: string, value: number): void {
    this.setUniform(name, UNIFORM_FLOAT, value, 0, 0, 0, undefined);
  }

  /**
   * Set an integer uniform in the shader program.
   * @param name - Name of the uniform.
   * @param value - Integer value.
   */
  public setUniformInt(name: string, value: number): void {
    this.setUniform(name, UNIFORM_INT, value, 0, 0, 0, undefined);
  }

  /**
   * Set a vec2 uniform in the shader program.
   * @param name - Name of the uniform.
   * @param x - X value.
   * @param y - Y value.
   */
  public setUniformVec2(name: string, x: number, y: number): void {
    this.setUniform(name, UNIFORM_VEC2, x, y, 0, 0, undefined);
  }

  /**
   * Set a vec3 uniform in the shader program.
   * @param name - Name of the uniform.
   * @param x - X value.
   * @param y - Y value.
   * @param z - Z value.
   */
  public setUniformVec3(name: string, x: number, y: number, z: number): void {
    this.setUniform(name, UNIFORM_VEC3, x, y, z, 0, undefined);
  }

  /**
   * Set a vec4 uniform in the shader program.
   * @param name - Name of the uniform.
   * @param x - X value.
   * @param y - Y value.
   * @param z - Z value.
   * @param w - W value.
   */
  public setUniformVec4(name: string, x: number, y: number, z: number, w: number): void {
    this.setUniform(name, UNIFORM_VEC4, x, y, z, w, undefined);
  }

  /**
   * Set a matrix uniform in the shader program.
   * @param name - Name of the uniform.
   * @param matrix - 4X4 matrix.
   */
  public setUniformMatrix(name: string, matrix: Float32Array): void {
    this.setUniform(name, UNIFORM_MATRIX, 0, 0, 0, 0, matrix);
  }

  public destruct() {
    this.textures.forEach(t => t.texture && !t.cached && this.gl.context.deleteTexture(<WebGLTexture>t.texture));
    this.textures = [];
    this.uniforms = {};
  }

  protected draw(time: number = 0, width: number, height: number): void {
    this.width = width | 0;
    this.height = height | 0;

    this.program.use();

    this.setUniformFloat('iGlobalTime', time);
    this.setUniformFloat('iTime', time);
    this.setUniformInt('iFrame', this.frame);
    this.setUniformFloat('iAspect', width / height);
    this.setUniformVec2('iResolution', width, height);

    const mouse = this.main.mouse;
    this.setUniformVec4('iMouse', mouse[0], mouse[1], mouse[2], mouse[3]);

    this.gl.setUniforms(this.uniforms, this.program);
    this.gl.bindTextures(this.textures);
    this.gl.drawQuad(this.program.getAttributeLocation('aPos'), this.program.getAttributeLocation('aUV'));

    this.frame++;
  }

  private setUniform(name: string, type: UniformType, x: number, y: number, z: number, w: number, matrix: Float32Array | undefined) {
    let uniform = this.uniforms[name];
    if (!uniform) {
      uniform = this.uniforms[name] = new Uniform(type, name);
    }
    uniform.x = x;
    uniform.y = y;
    uniform.z = z;
    uniform.w = w;
    uniform.matrix = matrix;
  }
}
