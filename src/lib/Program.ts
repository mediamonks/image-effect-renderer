import {WebGLInstance} from "./WebGLInstance.js";

export enum ProgramType {
    SHADERTOY_WEBGL,
    SHADERTOY_WEBGL2,
    ONESHADER_WEBGL,
    ONESHADER_WEBGL2,
}

export default class Program {
    private gl: WebGLInstance;
    private _program: WebGLProgram;
    private vs: WebGLShader;
    private fs: WebGLShader;
    private initialized: boolean = false;
    private ext: KHR_parallel_shader_compile | null;

    private type: ProgramType = ProgramType.SHADERTOY_WEBGL;

    private vsSource: string = '';
    private fsSource: string = '';

    private uniformLocations: { [k: string]: WebGLUniformLocation | null } = {};
    private attributeLocations: { [k: string]: number } = {};
    private _shaderCompiled: boolean = false;

    constructor(gl: WebGLInstance, fsSource: string) {
        this.gl = gl;
        const context = gl.context;
        this.ext = context.getExtension("KHR_parallel_shader_compile");

        this._program = <WebGLProgram>context.createProgram();

        this.vs = <WebGLShader>context.createShader(context.VERTEX_SHADER);
        this.fs = <WebGLShader>context.createShader(context.FRAGMENT_SHADER);

        this.type = this.detectType(fsSource);

        // vertex shader
        this.vsSource = this.getVertexShader(this.type);
        context.shaderSource(this.vs, this.vsSource);
        context.compileShader(this.vs);

        this.fsSource = `${this.getFragmentShader(this.type)}${fsSource}`;
        context.shaderSource(this.fs, this.fsSource);
        context.compileShader(this.fs);

        // link shaders
        context.attachShader(this._program, this.vs);
        context.attachShader(this._program, this.fs);
        context.linkProgram(this._program);
    }

    public get program(): WebGLProgram | null {
        if (this.initialized) {
            return this._program;
        }

        this.initialized = true;

        const context = this.gl.context;

        let success = context.getShaderParameter(this.vs, context.COMPILE_STATUS);
        if (!success) {
            console.table(this.vsSource.split('\n'));
            throw new Error(`ImageEffectRenderer: Vertex shader compilation failed: ${context.getShaderInfoLog(this.vs)}`);
        }

        success = context.getShaderParameter(this.fs, context.COMPILE_STATUS);
        if (!success) {
            console.table(this.fsSource.split('\n'));
            throw new Error(`ImageEffectRenderer: Shader compilation failed: ${context.getShaderInfoLog(this.fs)}`);
        }

        success = context.getProgramParameter(<WebGLProgram>this._program, context.LINK_STATUS);
        if (!success) {
            throw new Error(`ImageEffectRenderer: Program linking failed: ${context.getProgramInfoLog(this._program)}`);
        }
        return this._program;
    }

    public get shaderCompiled(): boolean {
        this._shaderCompiled = this._shaderCompiled || (!this.ext || this.gl.context.getProgramParameter(this._program, this.ext.COMPLETION_STATUS_KHR));
        return this._shaderCompiled;
    }

    public use() {
        this.gl.context.useProgram(this.program);
    }

    public getUniformLocation(name: string): WebGLUniformLocation | null {
        if (this.uniformLocations[name] !== undefined) {
            return this.uniformLocations[name] as (WebGLUniformLocation | null);
        }
        return this.uniformLocations[name] = this.gl.context.getUniformLocation(this._program, name);
    }

    public getAttributeLocation(name: string): number {
        if (this.attributeLocations[name] !== undefined) {
            return this.attributeLocations[name] as number;
        }
        this.gl.context.useProgram(this.program);
        return this.attributeLocations[name] = this.gl.context.getAttribLocation(this._program, name);
    }

    private detectType(src: string) {
        const res = /mainImage/gmi;
        const re2 = /^#version[\s]+300[\s]+es[\s]+/gmi;

        if (res.exec(src)) {
            return this.gl.isWebGL2 ? ProgramType.SHADERTOY_WEBGL2 : ProgramType.SHADERTOY_WEBGL;
        } else if (re2.exec(src)) {
            return ProgramType.ONESHADER_WEBGL2;
        } else {
            return ProgramType.ONESHADER_WEBGL;
        }
    }

    private getFragmentShader(type: ProgramType) {
        switch (type) {
            case ProgramType.SHADERTOY_WEBGL:
                return `precision highp float;

                        ${this.getUniformShader()}

                        varying vec2 vUV0;
                        void mainImage(out vec4, vec2);

                        vec4 texture(sampler2D tex, vec2 uv) {
                            return texture2D(tex, uv);
                        }

                        void main(void) {
                              gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                              mainImage(gl_FragColor, vUV0 * iResolution.xy);
                        }
                        `;
            case ProgramType.SHADERTOY_WEBGL2:
                return `#version 300 es
                        precision highp float;

                        ${this.getUniformShader()}

                        in vec2 vUV0;
                        out vec4 outFragColor;

                        void mainImage(out vec4, vec2);

                        vec4 texture2D(sampler2D tex, vec2 uv) {
                            return texture(tex, uv);
                        }

                        void main(void) {
                            outFragColor = vec4(0.0, 0.0, 0.0, 1.0);
                            mainImage(outFragColor, vUV0 * iResolution.xy);
                        }
                        `;
            default:
                return '';
        }
    }

    private getVertexShader(type: ProgramType) {
        const vo2: string = `#version 300 es
                in  vec3 aPos;
                in vec2 aUV;

                uniform float iAspect;

                out vec2 vScreen;
                out vec2 vUV0;

                void main(void) {
                    vUV0 = aUV;
                    vScreen = aPos.xy;
                    vScreen.x *= iAspect;
                    gl_Position = vec4(aPos, 1.0);
                }`;
        const vo1: string = `attribute vec3 aPos;
                attribute vec2 aUV;

                uniform float iAspect;

                varying vec2 vScreen;
                varying vec2 vUV0;

                void main(void) {
                    vUV0 = aUV;
                    vScreen = aPos.xy;
                    vScreen.x *= iAspect;
                    gl_Position = vec4(aPos, 1.0);
                }`;
        const vs1: string = `attribute vec2 aPos;
                    attribute vec2 aUV;

                    varying vec2 vUV0;

                    void main(void) {
                        vUV0 = aUV;
                        gl_Position = vec4(aPos, 0.0, 1.0);
                    }
                `;
        const vs2: string = `#version 300 es
                    in vec2 aPos;
                    in vec2 aUV;

                    out vec2 vUV0;

                    void main(void) {
                        vUV0 = aUV;
                        gl_Position = vec4(aPos, 0.0, 1.0);
                    }
                `;

        switch (type) {
            case ProgramType.SHADERTOY_WEBGL:
                return vs1;
            case ProgramType.SHADERTOY_WEBGL2:
                return vs2;
            case ProgramType.ONESHADER_WEBGL:
                return vo1;
            case ProgramType.ONESHADER_WEBGL2:
            default:
                return vo2;

        }
    }

    private getUniformShader(): string {
        return `
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
            `;
    }
}
