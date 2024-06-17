import type {ImageOptions} from "./Renderer.js";
import Program from "./Program.js";
import type Uniform from "./Uniform.js";
import {UniformType} from "./Uniform.js";
import type {Texture} from "./Texture.js.js";

export class WebGLInstance {
    public context: WebGLRenderingContext;
    public canvas: HTMLCanvasElement;

    private quadVBO: WebGLBuffer;
    private lastQuadVBO: WebGLBuffer | undefined = undefined;

    // share resources
    public sharedPrograms: { [k: string]: Program } = {};
    public sharedTextures: { [k: string]: WebGLTexture } = {};

    constructor(canvas: HTMLCanvasElement | undefined = undefined) {
        this.canvas = canvas || document.createElement('canvas');

        const options = {
            premultipliedAlpha: true,
            alpha: true,
            preserveDrawingBuffer: false,
            antialias: false,
            depth: false,
            stencil: false,
        };

        this.context = <WebGLRenderingContext>this.canvas.getContext('webgl2', options);
        if (!this.context) {
            throw new Error('Unable to create WebGL2 context.');
        }

        this.context.getExtension('WEBGL_color_buffer_float');
        this.context.getExtension('EXT_color_buffer_float');

        this.context.getExtension('OES_texture_float');
        this.context.getExtension('OES_texture_float_linear');

        this.context.getExtension("KHR_parallel_shader_compile");

        this.context.clearColor(0, 0, 0, 0);
        this.context.clear(this.context.COLOR_BUFFER_BIT);
        this.context.enable(this.context.BLEND);
        this.context.blendFunc(this.context.ONE, this.context.ONE_MINUS_SRC_ALPHA);

        this.quadVBO = this.generateQuad();
    }

    private generateQuad(): WebGLBuffer {
        const gl = this.context;
        const vertices: Float32Array = new Float32Array([-1, 1, 0, 1, -1, -1, 0, 0, 1, 1, 1, 1, 1, -1, 1, 0]);
        const quadVBO = <WebGLBuffer>gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        return quadVBO;
    }

    public drawQuad(posAttributeIndex: number, uvAttributeIndex: number): void {
        const gl = this.context;

        if (this.lastQuadVBO !== this.quadVBO) {
            this.lastQuadVBO = this.quadVBO;

            // render NDC quad
            gl.bindBuffer(gl.ARRAY_BUFFER, this.quadVBO);
            gl.enableVertexAttribArray(posAttributeIndex);

            // 4 32-bit values = 4 4-byte values
            gl.vertexAttribPointer(posAttributeIndex, 2, gl.FLOAT, false, 4 * 4, 0);

            gl.enableVertexAttribArray(uvAttributeIndex);
            gl.vertexAttribPointer(uvAttributeIndex, 2, gl.FLOAT, false, 4 * 4, 2 * 4);
        }
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    public getCachedTexture(src: string, options: ImageOptions): WebGLTexture {
        const key = `${src}_${options.clampX}_${options.clampY}_${options.useMipmap}`;
        if (this.sharedTextures[src]) {
            return <WebGLTexture>this.sharedTextures[key];
        }
        return this.sharedTextures[key] = <WebGLTexture>this.context.createTexture();
    }

    public compileShader(fsSource: string): Program {
        if (this.sharedPrograms[fsSource]) {
            return <Program>this.sharedPrograms[fsSource];
        }

        return this.sharedPrograms[fsSource] = new Program(this, fsSource);
    }

    public setTextureParameter(texture: WebGLTexture, options: ImageOptions) {
        const gl = this.context;

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.clampX ? gl.CLAMP_TO_EDGE : gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.clampY ? gl.CLAMP_TO_EDGE : gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, options.magFilterLinear ? gl.LINEAR : gl.NEAREST);
        if (options.useMipmap) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, options.minFilterLinear ? gl.LINEAR : gl.NEAREST);
        }
    }

    public bindTextures(textures: Texture[]) {
        const context = this.context;
        // texture/channel uniforms
        for (let slotIndex: number = 0; slotIndex < 8; slotIndex++) {
            context.activeTexture(context.TEXTURE0 + slotIndex);
            const t = textures[slotIndex];
            if (t && t.buffer) {
                context.bindTexture(context.TEXTURE_2D, t.buffer.src.texture);
            } else if (t && t.texture) {
                context.bindTexture(context.TEXTURE_2D, t.texture);
            } else {
                context.bindTexture(context.TEXTURE_2D, null);
            }
        }
    }

    public setUniforms(uniforms: { [k: string]: Uniform }, program: Program) {
        const context = this.context;
        Object.values(uniforms).forEach((u) => {
            const location = program.getUniformLocation(u.name);
            if (location !== null) {
                switch (u.type) {
                    case UniformType.INT:
                        context.uniform1i(location, u.x);
                        break;
                    case UniformType.FLOAT:
                        context.uniform1f(location, u.x);
                        break;
                    case UniformType.VEC2:
                        context.uniform2f(location, u.x, u.y);
                        break;
                    case UniformType.VEC3:
                        context.uniform3f(location, u.x, u.y, u.z);
                        break;
                    case UniformType.VEC4:
                        context.uniform4f(location, u.x, u.y, u.z, u.w);
                        break;
                    case UniformType.MATRIX:
                        context.uniformMatrix4fv(location, false, <Float32Array>u.matrix);
                        break;
                }
            }
        });
    }
}
