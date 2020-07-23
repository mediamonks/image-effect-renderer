// prettier-ignore
import { ImageEffectRendererWebGLInstance } from './ImageEffectRendererWebGLInstance';
import { ImageEffectRendererFrameBuffer } from './ImageEffectRendererFrameBuffer';

// prettier-ignore
enum ImageEffectRendererUniformType {
  INT,
  FLOAT,
  VEC2,
  VEC3,
  VEC4,
  MATRIX,
}

// prettier-ignore
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
    matrix: Float32Array | undefined,
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
  // webgl
  private glInstance: ImageEffectRendererWebGLInstance;
  public width: number = 0;
  public height: number = 0;
  private frame: number = 0;

  // custom uniforms map
  private uniforms: { [k: string]: ImageEffectRendererUniform } = {};

  // image input
  private textures: (WebGLTexture | ImageEffectRendererBuffer)[] = []; // <slotIndex> = texture ID
  private texturesDynamic: boolean[] = [];

  // shader
  private program: WebGLProgram | undefined;
  private posAttributeIndex: number;
  private uvAttributeIndex: number;

  // uniform
  private uniformGlobalTime: WebGLUniformLocation;
  private uniformTime: WebGLUniformLocation;
  private uniformFrame: WebGLUniformLocation;
  private uniformResolution: WebGLUniformLocation;

  // buffers
  private frameBuffer0: ImageEffectRendererFrameBuffer | undefined;
  private frameBuffer1: ImageEffectRendererFrameBuffer | undefined;

  constructor(glInstance: ImageEffectRendererWebGLInstance, type: number = -1) {
    this.glInstance = glInstance;

    if (type >= 0) {
      this.frameBuffer0 = new ImageEffectRendererFrameBuffer(glInstance.gl, type);
      this.frameBuffer1 = new ImageEffectRendererFrameBuffer(glInstance.gl, type);
    }
  }

  private textureCacheKey(
    src: string,
    clampHorizontal: boolean = true,
    clampVertical: boolean = true,
    flipY: boolean = false,
    useMipMap: boolean = false,
  ): string {
    return src + '_' + clampHorizontal + clampVertical + flipY + useMipMap;
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
      const key = this.textureCacheKey(image.src, clampHorizontal, clampVertical, flipY, useMipMap);
      const cached = this.glInstance.SharedTextures[key];

      if (cached) {
        this.textures[slotIndex] = cached;
      } else {
        this.textures[slotIndex] = <WebGLTexture>this.glInstance.gl.createTexture();
        this.updateImage(image, slotIndex, clampHorizontal, clampVertical, flipY, useMipMap, false);

        this.glInstance.SharedTextures[key] = this.textures[slotIndex];
      }
      return;
    } else {
      this.textures[slotIndex] = <WebGLTexture>this.glInstance.gl.createTexture();
      this.updateImage(image, slotIndex, clampHorizontal, clampVertical, flipY, useMipMap, false);
    }
  }

  public updateImage(
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageEffectRendererBuffer,
    slotIndex: number,
    clampHorizontal: boolean = true,
    clampVertical: boolean = true,
    flipY: boolean = false,
    useMipMap: boolean = false,
    dynamic: boolean = true,
  ): void {
    const gl = this.glInstance.gl;

    if (image instanceof ImageEffectRendererBuffer) {
      this.updateTexture(
        image,
        slotIndex,
        (<ImageEffectRendererBuffer>image).getSrc().getTexture(),
        clampHorizontal,
        clampVertical,
        useMipMap,
      );
      this.updateTexture(
        image,
        slotIndex,
        (<ImageEffectRendererBuffer>image).getDest().getTexture(),
        clampHorizontal,
        clampVertical,
        useMipMap,
      );
    } else {
      if (dynamic && !this.texturesDynamic[slotIndex]) {
        this.texturesDynamic[slotIndex] = true;
        this.textures[slotIndex] = <WebGLTexture>gl.createTexture();
      }
      gl.bindTexture(gl.TEXTURE_2D, <WebGLTexture>this.textures[slotIndex]);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flipY ? 1 : 0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      this.updateTexture(
        image,
        slotIndex,
        <WebGLTexture>this.textures[slotIndex],
        clampHorizontal,
        clampVertical,
        useMipMap,
      );
    }
  }

  private updateTexture(
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageEffectRendererBuffer,
    slotIndex: number,
    texture: WebGLTexture,
    clampHorizontal: boolean = true,
    clampVertical: boolean = true,
    useMipMap: boolean = false,
  ): void {
    const gl = this.glInstance.gl;

    this.setUniformVec2('iChannelResolution' + slotIndex, image.width, image.height);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_WRAP_S,
      clampHorizontal ? gl.CLAMP_TO_EDGE : gl.REPEAT,
    );
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_WRAP_T,
      clampVertical ? gl.CLAMP_TO_EDGE : gl.REPEAT,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (useMipMap) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  }

  private drawQuad(): void {
    const gl = this.glInstance.gl;

    if (this.glInstance.lastQuadVBO !== this.glInstance.quadVBO) {
      this.glInstance.lastQuadVBO = this.glInstance.quadVBO;

      // render NDC quad
      gl.bindBuffer(gl.ARRAY_BUFFER, this.glInstance.quadVBO);
      gl.enableVertexAttribArray(this.posAttributeIndex);

      // 4 32-bit values = 4 4-byte values
      gl.vertexAttribPointer(this.posAttributeIndex, 2, gl.FLOAT, false, 4 * 4, 0);

      gl.enableVertexAttribArray(this.uvAttributeIndex);
      gl.vertexAttribPointer(this.uvAttributeIndex, 2, gl.FLOAT, false, 4 * 4, 2 * 4);
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private setUniform(
    name,
    type: ImageEffectRendererUniformType,
    x: number,
    y: number,
    z: number,
    w: number,
    matrix: Float32Array | undefined,
  ) {
    if (!this.uniforms[name]) {
      const uniform = new ImageEffectRendererUniform(type, x, y, z, w, matrix);
      this.glInstance.gl.useProgram(this.program);
      uniform.location = this.glInstance.gl.getUniformLocation(this.program, name);
      if (uniform.location) {
        this.uniforms[name] = uniform;
      }
    } else {
      const uniform = this.uniforms[name];
      if (uniform.type !== type) {
        throw new Error('Updating uniform ' + name + ' using a different type.');
      }
      (uniform.x = x), (uniform.y = y), (uniform.z = z), (uniform.w = w), (uniform.matrix = matrix);
    }
  }

  public setUniformFloat(name: string, value: number): void {
    this.setUniform(name, ImageEffectRendererUniformType.FLOAT, value, 0, 0, 0, undefined);
  }

  public setUniformInt(name: string, value: number): void {
    this.setUniform(name, ImageEffectRendererUniformType.INT, value, 0, 0, 0, undefined);
  }

  public setUniformVec2(name: string, x: number, y: number): void {
    this.setUniform(name, ImageEffectRendererUniformType.VEC2, x, y, 0, 0, undefined);
  }

  public setUniformVec3(name: string, x: number, y: number, z: number): void {
    this.setUniform(name, ImageEffectRendererUniformType.VEC3, x, y, z, 0, undefined);
  }

  public setUniformVec4(name: string, x: number, y: number, z: number, w: number): void {
    this.setUniform(name, ImageEffectRendererUniformType.VEC4, x, y, z, w, undefined);
  }

  public setUniformMatrix(name: string, matrix: Float32Array): void {
    this.setUniform(name, ImageEffectRendererUniformType.MATRIX, 0, 0, 0, 0, matrix);
  }

  public setProgram(program: WebGLProgram): void {
    const gl = this.glInstance.gl;
    this.program = program;

    // get attribute locations
    this.posAttributeIndex = gl.getAttribLocation(<WebGLProgram>this.program, 'aPos');
    this.uvAttributeIndex = gl.getAttribLocation(<WebGLProgram>this.program, 'aUV');

    // get uniform locations
    gl.useProgram(this.program);
    this.uniformGlobalTime = <WebGLUniformLocation>gl.getUniformLocation(
      <WebGLProgram>this.program,
      'iGlobalTime',
    );
    this.uniformTime = <WebGLUniformLocation>gl.getUniformLocation(
      <WebGLProgram>this.program,
      'iTime',
    );
    this.uniformResolution = <WebGLUniformLocation>gl.getUniformLocation(
      <WebGLProgram>this.program,
      'iResolution',
    );
    this.uniformFrame = <WebGLUniformLocation>gl.getUniformLocation(
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

  public draw(time: number = 0, width: number, height: number): void {
    const gl = this.glInstance.gl;
    this.width = width | 0;
    this.height = height | 0;

    const fb = this.getDest();
    if (fb) {
      fb.resize(this.width, this.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb.getFrameBuffer());
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    gl.useProgram(this.program);

    // global uniforms
    if (this.uniformGlobalTime) gl.uniform1f(this.uniformGlobalTime, time);
    if (this.uniformTime) gl.uniform1f(this.uniformTime, time);
    if (this.uniformFrame) gl.uniform1i(this.uniformFrame, this.frame);
    if (this.uniformResolution) gl.uniform2f(this.uniformResolution, width, height);

    // custom uniforms
    for (const k in this.uniforms) {
      const u = this.uniforms[k];
      switch (u.type) {
        case ImageEffectRendererUniformType.INT:
          gl.uniform1i(u.location, u.x);
          break;
        case ImageEffectRendererUniformType.FLOAT:
          gl.uniform1f(u.location, u.x);
          break;
        case ImageEffectRendererUniformType.VEC2:
          gl.uniform2f(u.location, u.x, u.y);
          break;
        case ImageEffectRendererUniformType.VEC3:
          gl.uniform3f(u.location, u.x, u.y, u.z);
          break;
        case ImageEffectRendererUniformType.VEC4:
          gl.uniform4f(u.location, u.x, u.y, u.z, u.w);
          break;
        case ImageEffectRendererUniformType.MATRIX:
          gl.uniformMatrix4fv(u.location, false, u.matrix);
          break;
      }
    }

    // texture/channel uniforms
    for (let slotIndex: number = 0; slotIndex < this.textures.length; slotIndex++) {
      gl.activeTexture(gl.TEXTURE0 + slotIndex);
      if (this.textures[slotIndex] instanceof ImageEffectRendererBuffer) {
        const src = (<ImageEffectRendererBuffer>this.textures[slotIndex]).getSrc();
        gl.bindTexture(gl.TEXTURE_2D, src.getTexture());
      } else {
        gl.bindTexture(gl.TEXTURE_2D, <WebGLTexture>this.textures[slotIndex]);
      }
    }

    // render NDC quad
    this.drawQuad();

    if (fb) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, undefined);
    }
    this.frame++;
  }

  public destruct() {
    const gl = this.glInstance.gl;

    for (const k in this.textures) {
      if (this.textures[k] instanceof ImageEffectRendererBuffer) {
      } else {
        if (this.texturesDynamic[k]) {
          gl.deleteTexture(<WebGLTexture>this.textures[k]);
        }
      }
    }
    this.textures = [];
    this.uniforms = {};

    if (this.frameBuffer0) {
      this.frameBuffer0.destruct();
      this.frameBuffer0 = undefined;
    }

    if (this.frameBuffer1) {
      this.frameBuffer1.destruct();
      this.frameBuffer1 = undefined;
    }
  }
}
