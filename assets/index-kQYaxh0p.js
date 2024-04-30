(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))t(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&t(o)}).observe(document,{childList:!0,subtree:!0});function n(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function t(r){if(r.ep)return;r.ep=!0;const i=n(r);fetch(r.href,i)}})();class b{constructor(e,n){this.initialized=!1,this.type=0,this.vsSource="",this.fsSource="",this.uniformLocations={},this.attributeLocations={},this._shaderCompiled=!1,this.gl=e;const t=e.context;this.ext=t.getExtension("KHR_parallel_shader_compile"),this._program=t.createProgram(),this.vs=t.createShader(t.VERTEX_SHADER),this.fs=t.createShader(t.FRAGMENT_SHADER),this.type=this.detectType(n),this.vsSource=this.getVertexShader(this.type),t.shaderSource(this.vs,this.vsSource),t.compileShader(this.vs),this.fsSource=`${this.getFragmentShader(this.type)}${n}`,t.shaderSource(this.fs,this.fsSource),t.compileShader(this.fs),t.attachShader(this._program,this.vs),t.attachShader(this._program,this.fs),t.linkProgram(this._program)}get program(){if(this.initialized)return this._program;this.initialized=!0;const e=this.gl.context;let n=e.getShaderParameter(this.vs,e.COMPILE_STATUS);if(!n)throw console.table(this.vsSource.split(`
`)),new Error(`ImageEffectRenderer: Vertex shader compilation failed: ${e.getShaderInfoLog(this.vs)}`);if(n=e.getShaderParameter(this.fs,e.COMPILE_STATUS),!n)throw console.table(this.fsSource.split(`
`)),new Error(`ImageEffectRenderer: Shader compilation failed: ${e.getShaderInfoLog(this.fs)}`);if(n=e.getProgramParameter(this._program,e.LINK_STATUS),!n)throw new Error(`ImageEffectRenderer: Program linking failed: ${e.getProgramInfoLog(this._program)}`);return this._program}get shaderCompiled(){return this._shaderCompiled=this._shaderCompiled||!this.ext||this.gl.context.getProgramParameter(this._program,this.ext.COMPLETION_STATUS_KHR),this._shaderCompiled}use(){this.gl.context.useProgram(this.program)}getUniformLocation(e){return this.uniformLocations[e]!==void 0?this.uniformLocations[e]:this.uniformLocations[e]=this.gl.context.getUniformLocation(this._program,e)}getAttributeLocation(e){return this.attributeLocations[e]!==void 0?this.attributeLocations[e]:(this.gl.context.useProgram(this.program),this.attributeLocations[e]=this.gl.context.getAttribLocation(this._program,e))}detectType(e){const n=/mainImage/gmi,t=/^#version[\s]+300[\s]+es[\s]+/gmi;return n.exec(e)?this.gl.isWebGL2?1:0:t.exec(e)?3:2}getFragmentShader(e){switch(e){case 0:return`precision highp float;

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
                        `;case 1:return`#version 300 es
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
                        `;default:return""}}getVertexShader(e){const n=`#version 300 es
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
                }`,t=`attribute vec3 aPos;
                attribute vec2 aUV;

                uniform float iAspect;

                varying vec2 vScreen;
                varying vec2 vUV0;

                void main(void) {
                    vUV0 = aUV;
                    vScreen = aPos.xy;
                    vScreen.x *= iAspect;
                    gl_Position = vec4(aPos, 1.0);
                }`,r=`attribute vec2 aPos;
                    attribute vec2 aUV;

                    varying vec2 vUV0;

                    void main(void) {
                        vUV0 = aUV;
                        gl_Position = vec4(aPos, 0.0, 1.0);
                    }
                `,i=`#version 300 es
                    in vec2 aPos;
                    in vec2 aUV;

                    out vec2 vUV0;

                    void main(void) {
                        vUV0 = aUV;
                        gl_Position = vec4(aPos, 0.0, 1.0);
                    }
                `;switch(e){case 0:return r;case 1:return i;case 2:return t;case 3:default:return n}}getUniformShader(){return`
            uniform vec2 iResolution;
            uniform float iTime;
            uniform float iGlobalTime;
            uniform float iAspect;
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
            `}}var l=(s=>(s[s.INT=0]="INT",s[s.FLOAT=1]="FLOAT",s[s.VEC2=2]="VEC2",s[s.VEC3=3]="VEC3",s[s.VEC4=4]="VEC4",s[s.MATRIX=5]="MATRIX",s))(l||{});class U{constructor(e,n){this.x=0,this.y=0,this.z=0,this.w=0,this.type=e,this.name=n}}class w{constructor(e=void 0){this.isWebGL2=!0,this.lastQuadVBO=void 0,this.sharedPrograms={},this.sharedTextures={},this.canvas=e||document.createElement("canvas");const n={premultipliedAlpha:!0,alpha:!0,preserveDrawingBuffer:!1,antialias:!1,depth:!1,stencil:!1};this.context=this.canvas.getContext("webgl2",n),this.context||(this.context=this.canvas.getContext("webgl",n),this.isWebGL2=!1),this.context.getExtension("WEBGL_color_buffer_float"),this.context.getExtension("EXT_color_buffer_float"),this.context.getExtension("OES_texture_float"),this.context.getExtension("OES_texture_float_linear"),this.context.getExtension("KHR_parallel_shader_compile"),this.context.clearColor(0,0,0,0),this.context.clear(this.context.COLOR_BUFFER_BIT),this.context.enable(this.context.BLEND),this.context.blendFunc(this.context.ONE,this.context.ONE_MINUS_SRC_ALPHA),this.quadVBO=this.generateQuad()}generateQuad(){const e=this.context,n=new Float32Array([-1,1,0,1,-1,-1,0,0,1,1,1,1,1,-1,1,0]),t=e.createBuffer();return e.bindBuffer(e.ARRAY_BUFFER,t),e.bufferData(e.ARRAY_BUFFER,n,e.STATIC_DRAW),t}drawQuad(e,n){const t=this.context;this.lastQuadVBO!==this.quadVBO&&(this.lastQuadVBO=this.quadVBO,t.bindBuffer(t.ARRAY_BUFFER,this.quadVBO),t.enableVertexAttribArray(e),t.vertexAttribPointer(e,2,t.FLOAT,!1,4*4,0),t.enableVertexAttribArray(n),t.vertexAttribPointer(n,2,t.FLOAT,!1,4*4,2*4)),t.drawArrays(t.TRIANGLE_STRIP,0,4)}getCachedTexture(e,n){const t=`${e}_${n.clampX}_${n.clampY}_${n.useMipmap}`;return this.sharedTextures[e]?this.sharedTextures[t]:this.sharedTextures[t]=this.context.createTexture()}compileShader(e){return this.sharedPrograms[e]?this.sharedPrograms[e]:this.sharedPrograms[e]=new b(this,e)}setTextureParameter(e,n){const t=this.context;t.bindTexture(t.TEXTURE_2D,e),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,n.clampX?t.CLAMP_TO_EDGE:t.REPEAT),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,n.clampY?t.CLAMP_TO_EDGE:t.REPEAT),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,n.magFilterLinear?t.LINEAR:t.NEAREST),n.useMipmap?(t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.generateMipmap(t.TEXTURE_2D)):t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,n.minFilterLinear?t.LINEAR:t.NEAREST)}bindTextures(e){const n=this.context;for(let t=0;t<8;t++){n.activeTexture(n.TEXTURE0+t);const r=e[t];r&&r.buffer?n.bindTexture(n.TEXTURE_2D,r.buffer.src.texture):r&&r.texture?n.bindTexture(n.TEXTURE_2D,r.texture):n.bindTexture(n.TEXTURE_2D,null)}}setUniforms(e,n){const t=this.context;Object.values(e).forEach(r=>{const i=n.getUniformLocation(r.name);if(i!==null)switch(r.type){case l.INT:t.uniform1i(i,r.x);break;case l.FLOAT:t.uniform1f(i,r.x);break;case l.VEC2:t.uniform2f(i,r.x,r.y);break;case l.VEC3:t.uniform3f(i,r.x,r.y,r.z);break;case l.VEC4:t.uniform4f(i,r.x,r.y,r.z,r.w);break;case l.MATRIX:t.uniformMatrix4fv(i,!1,r.matrix);break}})}}const d=class d{constructor(e){this.width=0,this.height=0,this.frame=0,this.uniforms={},this.textures=[],this.gl=e}setImage(e,n,t={}){if(e>=8)throw new Error("ImageEffectRenderer: A maximum of 8 slots is available, slotIndex is out of bounds.");this.setUniformInt(`iChannel${e}`,e),this.setUniformVec2(`iChannelResolution${e}`,n.width,n.height);const r=this.gl.context,i=this.textures[e];if(n instanceof d){i&&i.texture&&!i.cached&&r.deleteTexture(i.texture);const o={...n.options,...t};this.textures[e]={texture:void 0,buffer:n,cached:!1},this.gl.setTextureParameter(n.src.texture,o),this.gl.setTextureParameter(n.dest.texture,o)}else{const o={...d.defaultImageOptions,...t};o.useCache=o.useCache&&n instanceof HTMLImageElement,o.useCache&&i&&i.texture&&!i.cached&&(r.deleteTexture(i.texture),i.texture=void 0);let c=i&&i.texture;o.useCache&&n instanceof HTMLImageElement&&(c=this.gl.getCachedTexture(n.src,o)),c||(c=r.createTexture()),this.textures[e]={texture:c,buffer:void 0,cached:o.useCache},r.bindTexture(r.TEXTURE_2D,c),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,t.flipY?1:0),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,r.RGBA,r.UNSIGNED_BYTE,n),this.gl.setTextureParameter(c,o)}}setUniformFloat(e,n){this.setUniform(e,l.FLOAT,n,0,0,0,void 0)}setUniformInt(e,n){this.setUniform(e,l.INT,n,0,0,0,void 0)}setUniformVec2(e,n,t){this.setUniform(e,l.VEC2,n,t,0,0,void 0)}setUniformVec3(e,n,t,r){this.setUniform(e,l.VEC3,n,t,r,0,void 0)}setUniformVec4(e,n,t,r,i){this.setUniform(e,l.VEC4,n,t,r,i,void 0)}setUniformMatrix(e,n){this.setUniform(e,l.MATRIX,0,0,0,0,n)}draw(e=0,n,t){this.width=n|0,this.height=t|0,this.program.use(),this.setUniformFloat("iGlobalTime",e),this.setUniformFloat("iTime",e),this.setUniformInt("iFrame",this.frame),this.setUniformFloat("iAspect",n/t),this.setUniformVec2("iResolution",n,t),this.gl.setUniforms(this.uniforms,this.program),this.gl.bindTextures(this.textures),this.gl.drawQuad(this.program.getAttributeLocation("aPos"),this.program.getAttributeLocation("aUV")),this.frame++}get shaderCompiled(){return this.program.shaderCompiled}setUniform(e,n,t,r,i,o,c){let a=this.uniforms[e];a||(a=this.uniforms[e]=new U(n,e)),a.x=t,a.y=r,a.z=i,a.w=o,a.matrix=c}destruct(){this.textures.forEach(e=>e.texture&&!e.cached&&this.gl.context.deleteTexture(e.texture)),this.textures=[],this.uniforms={}}};d.defaultImageOptions={clampX:!0,clampY:!0,flipY:!1,useMipmap:!0,useCache:!0,minFilterLinear:!0,magFilterLinear:!0};let f=d;class T{constructor(e,n=WebGLRenderingContext.UNSIGNED_BYTE){if(this.width=0,this.height=0,this.format=WebGLRenderingContext.RGBA,this.internalFormat=WebGLRenderingContext.RGBA,this.type=WebGLRenderingContext.UNSIGNED_BYTE,this.gl=e,this.type=n,e.isWebGL2)switch(n){case WebGLRenderingContext.UNSIGNED_BYTE:this.internalFormat=WebGL2RenderingContext.RGBA8;break;case WebGLRenderingContext.FLOAT:this.internalFormat=WebGL2RenderingContext.RGBA32F;break}else this.internalFormat=this.format;const t=e.context;this.texture=t.createTexture(),this.resize(16,16),this.frameBuffer=t.createFramebuffer(),t.bindFramebuffer(t.FRAMEBUFFER,this.frameBuffer),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,this.texture,0),t.bindFramebuffer(t.FRAMEBUFFER,null)}resize(e,n){if(this.width===(e|0)&&this.height===(n|0))return;this.width=e|0,this.height=n|0;const t=this.gl.context;t.bindTexture(t.TEXTURE_2D,this.texture),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,0),this.gl.isWebGL2?t.texImage2D(t.TEXTURE_2D,0,this.internalFormat,this.width,this.height,0,this.format,this.type,null):t.texImage2D(t.TEXTURE_2D,0,this.format,this.width,this.height,0,this.format,this.type,null)}destruct(){const e=this.gl.context;this.frameBuffer&&e.deleteFramebuffer(this.frameBuffer),this.texture&&e.deleteTexture(this.texture)}}const x=class x extends f{constructor(e,n={}){super(e),this.options={...x.defaultBufferOptions,...n},this.frameBuffer0=new T(e,this.options.type),this.frameBuffer1=new T(e,this.options.type)}draw(e=0,n,t){if(n<=0||t<=0)return;const r=this.gl.context,i=this.dest;i.resize(n,t),r.bindFramebuffer(r.FRAMEBUFFER,i.frameBuffer),r.clear(r.COLOR_BUFFER_BIT),super.draw(e,n,t),r.bindFramebuffer(r.FRAMEBUFFER,null)}get src(){return this.frame%2===0?this.frameBuffer0:this.frameBuffer1}get dest(){return this.frame%2===1?this.frameBuffer0:this.frameBuffer1}destruct(){super.destruct(),this.frameBuffer0.destruct(),this.frameBuffer1.destruct()}};x.defaultBufferOptions={...f.defaultImageOptions,useMipmap:!1,useCache:!1,type:5121};let y=x;const p=class p extends f{constructor(e,n,t,r){if(super(e),this.buffers=[],this.time=0,this.tickFuncs=[],this.readyFuncs=[],this.startTime=-1,this.drawOneFrame=!1,this.animationRequestId=0,this._ready=!1,this.options={...r},this.index=p.index++,this.container=n,this.main=this,this.options.useSharedContext){this.canvas=document.createElement("canvas");const i=this.canvas.getContext("2d");i.fillStyle="#00000000",i.clearRect(0,0,this.canvas.width,this.canvas.height)}else this.canvas=this.gl.canvas;this.canvas.style.width="100%",this.canvas.style.height="100%",this.container.appendChild(this.canvas),this.program=new b(this.gl,t),this.resizeObserver=new ResizeObserver(()=>{this.options.autoResize&&this.updateSize()}),this.resizeObserver.observe(n),this.options.useSharedContext||this.drawingLoop(0)}play(){this.options.loop=!0}stop(){this.options.loop=!1}createBuffer(e,n,t={}){const r=this.buffers[e];r&&r.destruct();const i=new y(this.gl,t);return i.program=this.gl.compileShader(n),i.main=this,this.buffers[e]=i}tick(e){this.tickFuncs.push(e)}ready(e){this.readyFuncs.push(e)}drawFrame(e=0){this.time=e/1e3,this.drawOneFrame=!0}get drawThisFrame(){return(this.options.loop||this.drawOneFrame)&&this.width>0&&this.height>0&&(!this.options.asyncCompile||this.allShadersCompiled)}drawInstance(e){const n=this.gl.context;this.drawOneFrame||(this.time+=e),this.tickFuncs.forEach(t=>t(e)),this.buffers.forEach(t=>{t&&(n.viewport(0,0,this.width,this.height),t.draw(this.time,this.canvas.width,this.canvas.height))}),n.viewport(0,0,this.width,this.height),n.clear(n.COLOR_BUFFER_BIT),this.draw(this.time,this.canvas.width,this.canvas.height),this.drawOneFrame=!1}get allShadersCompiled(){return this.shaderCompiled&&this.buffers.every(e=>e&&e.shaderCompiled)}update(e){this.allShadersCompiled&&(this._ready||(this._ready=!0,this.readyFuncs.forEach(n=>n()),this.readyFuncs=[]))}updateSize(){this.width=this.container.offsetWidth*this.options.pixelRatio|0,this.height=this.container.offsetHeight*this.options.pixelRatio|0,(this.width!==this.canvas.width||this.height!==this.canvas.height)&&(this.canvas.width=this.width,this.canvas.height=this.height,this.drawOneFrame=!0)}drawingLoop(e=0){this.animationRequestId=window.requestAnimationFrame(t=>this.drawingLoop(t)),e/=1e3;const n=this.startTime<0?1/60:e-this.startTime;this.startTime=e>0?e:-1,this.update(n),this.drawThisFrame&&this.drawInstance(n)}destruct(){cancelAnimationFrame(this.animationRequestId),super.destruct(),this.resizeObserver.disconnect(),this.container.removeChild(this.canvas),this.canvas.replaceWith(this.canvas.cloneNode(!0)),this.buffers.forEach(e=>{e.destruct()}),this.buffers=[],this.tickFuncs=[]}copyCanvas(){const e=this.gl.canvas,n=this.canvas.getContext("2d");n.clearRect(0,0,this.width,this.height),n.drawImage(e,0,e.height-this.height,this.width,this.height,0,0,this.width,this.height)}};p.index=0;let v=p;const h=class h{constructor(){throw new Error("Use ImageEffectRenderer.createTemporary to create an ImageEffectRenderer")}static createTemporary(e,n,t={}){const r={...h.defaultOptions,...t};if(r.useSharedContext){h.sharedInstance||(h.sharedInstance=new w,this.drawInstances(0));const i=new v(h.sharedInstance,e,n,r);return this.poolInUse.push(i),i}else{const i=h.poolWebGLInstance.pop()||new w;return new v(i,e,n,r)}}static releaseTemporary(e){e.options.useSharedContext||this.poolWebGLInstance.push(e.gl),e.stop(),e.destruct();const n=h.poolInUse.indexOf(e);n>-1&&h.poolInUse.splice(n,1)}static drawInstances(e=0){window.requestAnimationFrame(a=>this.drawInstances(a)),e/=1e3;const n=h.sharedTime<0?1/60:e-h.sharedTime;h.sharedTime=e;const t=h.sharedInstance.canvas,r=h.sharedInstance.context,i=h.poolInUse;let o=0,c=0;i.forEach(a=>{a.update(n)}),i.forEach(a=>{a.drawThisFrame&&(o=Math.max(o,a.width),c=Math.max(c,a.height))}),(o>t.width||c>t.height)&&(t.width=o,t.height=c),r.clear(r.COLOR_BUFFER_BIT),i.forEach(a=>{a.drawThisFrame&&(a.drawInstance(n),a.copyCanvas())})}};h.defaultOptions={loop:!1,autoResize:!0,pixelRatio:typeof window<"u"?window.devicePixelRatio:1,useSharedContext:!0,asyncCompile:!0},h.poolInUse=[],h.poolWebGLInstance=[],h.sharedTime=-1;let u=h;const L=`#version 300 es
precision highp float;

uniform float iTime;
uniform vec2  iResolution;

in vec2 vScreen;

out vec4 fragColor;


const float _Temporal = 0.25;    //value=.25, min=0, max=1, step=0.01
const float _FrequencyY = 2.;    //value=2., min=0.1, max=4, step=0.01
const float _SpeedZ = 2.;    //value=2., min=0., max=32, step=0.01
const float _RandomSpeed = 6.;    //value=6., min=0., max=8, step=0.01
const float _FrequencyZ = 0.01;    //value=.01, min=0.0001, max=0.1, step=0.0001

const float PI2 = 6.2831853;


vec3 hash31(float p)
{
    vec3 p3 = fract(p * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+19.19);
    return fract((p3.xxy+p3.yzz)*p3.zyx);
}

vec2 hash21(float p)
{
    vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xx+p3.yz)*p3.zy);

}


vec3 spectrum(in float d)
{
    return smoothstep(0.25, 0., abs(d + vec3(0.125,0.,-0.125)));
    //return smoothstep(0.25, 0., abs(d + vec3(0.125,0.,-0.125)));
    //return sin((vec3(0, 1. ,2) / 3. + d) * PI2) * 0.5 + 0.5;
}

float aa(float x)
{
    float dx = fwidth(x);
    return smoothstep(dx, 0., x);
}

float aaa(float x)
{
    float dx = fwidth(x);
    return smoothstep(-dx, 0., x) * smoothstep(dx, 0., x);
}

void main() {
    vec3 color = vec3(0.);
    float z = iTime * _SpeedZ;
    float zOffset = z * _RandomSpeed;
    vec2 uv = vScreen * .5;
    uv.x = abs(uv.x);
    uv.y = abs(uv.y);

    vec3 ray = normalize(vec3(uv, 1.5));
    float l = length(ray.xy);
    bool isX =  abs(ray.x) > abs(ray.y);
    vec3 dir = ray / max(abs(ray.x),abs(ray.y)) ;
    float r = 0.5;
    float offset = 0.;
    float hue = sin(iTime) * 0.5 + 0.5;


    for(int i = 0; i <4; i++){
        vec3 hit = dir * r++;
        vec3 p = hit;
        p.z += z;

        float phase = isX? hit.y : hit.x;
        offset += 2.4;
        phase += sin(iTime * _Temporal + offset);
        phase += sin(phase * 6.) * 0.5;
        phase *= _FrequencyY;

        vec3 rand = hash31(floor(phase));

        //z animation
        p.z += rand.x * zOffset;
        p.z += float(i) * 10.;
        //frequency in z
        p.z *=	_FrequencyZ / (rand.y + 0.05);
        p.z += sin( p.z * 10.);
        // p.z += cos( p.z * 17.) * 0.5;
        vec2 cell = fract(vec2(phase, p.z)) - 0.5;

        float cellID = floor(p.z);
        vec2 cellRand = hash21(cellID);
        float ax = abs(cell.x);
        float ay = abs(cell.y);
        float fx = fwidth(ax) * 1.;
        float fy = fwidth(ay) * 1.;

        //float d = 0.45;
        float d = 0.1 + cellRand.y * 0.3;
        float outer = smoothstep(fx, 0., ax - d + fx) * smoothstep(fy, 0., ay - d + fy);
        float inner = smoothstep(fx, 0., ax -d + fx * 2.) * smoothstep(fy, 0., ay - d + fy * 2.);

        float outerGlow = smoothstep(0.1, 0., ax - d );
        outerGlow *= smoothstep(0.5, 0., ay);
        float b = outer - inner;
        b += outerGlow * 0.25;
        b *= smoothstep(50., 20., hit.z);
        b *= 0.5 + rand.z;
        color += spectrum((cellRand.x - hue) * 0.25) * b;
    }
    //color *= 2.;
    color = sqrt(color);
    color *= 1. - dot(uv, uv);
    fragColor = vec4(color,1.0);
}`;class E{constructor(e,n={}){this.renderer=u.createTemporary(e,L,{loop:!0,...n})}}const A=`//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
//

vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
    return mod289(((x*34.0)+1.0)*x);
}

float snoise(vec2 v)
{
    const vec4 C = vec4(0.211324865405187, // (3.0-sqrt(3.0))/6.0
                        0.366025403784439, // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626, // -1.0 + 2.0 * C.x
                        0.024390243902439);// 1.0 / 41.0
    // First corner
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);

    // Other corners
    vec2 i1;
    //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
    //i1.y = 1.0 - i1.x;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    // x0 = x0 - 0.0 + 0.0 * C.xx ;
    // x1 = x0 - i1 + 1.0 * C.xx ;
    // x2 = x0 - 1.0 + 2.0 * C.xx ;
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;

    // Permutations
    i = mod289(i);// Avoid truncation effects in permutation
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));

    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m*m;
    m = m*m;

    // Gradients: 41 points uniformly over a line, mapped onto a diamond.
    // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt( a0*a0 + h*h );
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

    // Compute final noise value at P
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

float rand(vec2 co)
{
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}


void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord.xy / iResolution.xy;
    float time = iTime * 2.0;

    // Create large, incidental noise waves
    float noise = max(0.0, snoise(vec2(time, uv.y * 0.3)) - 0.3) * (1.0 / 0.7);

    // Offset by smaller, constant noise waves
    noise = noise + (snoise(vec2(time*10.0, uv.y * 2.4)) - 0.5) * 0.15;

    // Apply the noise as x displacement for every line
    float xpos = uv.x - noise * noise * 0.25;
    fragColor = texture(iChannel0, vec2(xpos, uv.y));

    // Mix in some random interference for lines
    fragColor.rgb = mix(fragColor.rgb, vec3(rand(vec2(uv.y * time))), noise * 0.3).rgb;

    // Apply a line pattern every 4 pixels
    if (floor(mod(fragCoord.y * 0.25, 2.0)) == 0.0)
    {
        fragColor.rgb *= 1.0 - (0.15 * noise);
    }

    // Shift green/blue channels (using the red channel)
    fragColor.g = mix(fragColor.r, texture(iChannel0, vec2(xpos + noise * 0.05, uv.y)).g, 0.25);
    fragColor.b = mix(fragColor.r, texture(iChannel0, vec2(xpos - noise * 0.05, uv.y)).b, 0.25);
}
`;class m{static loadImages(e){return Promise.all(e.map(n=>m.loadImage(n)))}static loadImage(e){return new Promise(n=>{const t=new Image;t.onload=()=>n(t),t.src=`./static/${e}`})}}class R{constructor(e,n={}){this.renderer=u.createTemporary(e,A,n),m.loadImages(["./paddo.jpg"]).then(([t])=>{this.renderer.setImage(0,t,{flipY:!0}),this.renderer.play()})}}const g=`uniform vec4 uMouse;
uniform float uMouseDown;

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;
    const float dt = 0.15;

    // Simple and Fast Fluids
    // https://hal.inria.fr/inria-00596050/document

    vec4 me = texture(iChannel0, uv);// x,y velocity, z density, w curl
    vec4 tr = texture(iChannel0, uv + vec2(1./iResolution.x, 0));
    vec4 tl = texture(iChannel0, uv - vec2(1./iResolution.x, 0));
    vec4 tu = texture(iChannel0, uv + vec2(0, 1./iResolution.y));
    vec4 td = texture(iChannel0, uv - vec2(0, 1./iResolution.y));

    vec3 dx = (tr.xyz - tl.xyz)*0.5;
    vec3 dy = (tu.xyz - td.xyz)*0.5;
    vec2 DdX = vec2(dx.z, dy.z);

    // Solve for density
    me.z -= dt*dot(vec3(DdX, dx.x + dy.y), me.xyz);

    // Solve for velocity
    vec2 viscosityForce = 0.55*(tu.xy + td.xy + tr.xy + tl.xy - 4.0*me.xy);
    me.xyw = texture(iChannel0, uv - me.xy*(dt/iResolution.xy)).xyw;

    vec2 externalForces = clamp(vec2(uMouse.xy - uMouse.zw) * (.4 / max(dot(uv - uMouse.xy, uv - uMouse.xy), .05)), -1., 1.);

    // Semi−lagrangian advection.
    me.xy += dt*(viscosityForce.xy + externalForces) - 0.2*DdX;

    // Vorticity refinement, copied from "Chimera's Breath" by nimitz 2018 (twitter: @stormoid)
    // https://www.shadertoy.com/view/4tGfDW
    // License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License
    me.w = (tr.y - tl.y - tu.x + td.x);
    vec2 vort = vec2(abs(tu.w) - abs(td.w), abs(tl.w) - abs(tr.w));
    vort *= 0.11/length(vort + 1e-9)*me.w;
    me.xy += vort;
    // end of vorticy refinement

    // stability
    fragColor = clamp(me, vec4(-10, -10, 0.5, -10.), vec4(10, 10, 3.0, 10.));
}
`,M=`uniform vec4 uMouse;
uniform float uMouseDown;

// The MIT License
// Copyright © 2015 Inigo Quilez
// https://www.shadertoy.com/view/ll2GD3

vec3 pal(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
    return a + b*cos(6.28318*(c*t+d));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    const float dt = 0.15;

    vec2 uv = fragCoord.xy / iResolution.xy;

    vec2 velocity = texture(iChannel0, uv).xy;
    vec3 col = texture(iChannel1, uv - (dt*3.)*velocity/iResolution.xy).rgb;

    vec3 newCol = pal(iTime, vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5), vec3(1.0, 1.0, 1.0), vec3(0.0, 0.10, 0.20));

    col += newCol * 0.01*distance(uMouse.xy, uMouse.zw)/(dot(uv - uMouse.xy, uv - uMouse.xy)+0.002);

    col = clamp(0.998 * col - 0.00005, 0., 5.);
    fragColor = vec4(col, 1.);
}

`,z=`void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;

    vec3 col = 1.-exp(-texture(iChannel0, uv).rgb);
    col = smoothstep(vec3(0), vec3(1), col);

    fragColor = vec4(col, 1);
}
`;class F{constructor(e,n={}){this.wrapper=e,this.renderer=u.createTemporary(this.wrapper,z,{loop:!0,...n}),this.mouseX=0,this.mouseY=0,this.prevMouseX=0,this.prevMouseY=0,this.renderer.createBuffer(0,g,{type:WebGLRenderingContext.FLOAT,clampX:!1,clampY:!1}),this.renderer.createBuffer(1,g,{type:WebGLRenderingContext.FLOAT,clampX:!1,clampY:!1}),this.renderer.createBuffer(2,g,{type:WebGLRenderingContext.FLOAT,clampX:!1,clampY:!1}),this.renderer.buffers[0].setImage(0,this.renderer.buffers[2]),this.renderer.buffers[1].setImage(0,this.renderer.buffers[0]),this.renderer.buffers[2].setImage(0,this.renderer.buffers[1]),this.renderer.createBuffer(3,M,{type:WebGLRenderingContext.FLOAT,clampX:!1,clampY:!1}),this.renderer.buffers[3].setImage(0,this.renderer.buffers[2]),this.renderer.buffers[3].setImage(1,this.renderer.buffers[3]),this.renderer.setImage(0,this.renderer.buffers[3]);const t=this.renderer.canvas;t.onmouseenter=t.onmousemove=r=>{const i=t.getBoundingClientRect(),o=Math.max(0,Math.min(1,(r.clientX-i.left)/i.width)),c=Math.max(0,Math.min(1,(r.clientY-i.top)/i.height));this.mouseX=o,this.mouseY=1-c},this.renderer.tick(()=>{this.renderer.buffers[0].setUniformVec4("uMouse",this.mouseX,this.mouseY,this.prevMouseX,this.prevMouseY),this.renderer.buffers[1].setUniformVec4("uMouse",this.mouseX,this.mouseY,this.prevMouseX,this.prevMouseY),this.renderer.buffers[2].setUniformVec4("uMouse",this.mouseX,this.mouseY,this.prevMouseX,this.prevMouseY),this.renderer.buffers[3].setUniformVec4("uMouse",this.mouseX,this.mouseY,this.prevMouseX,this.prevMouseY),this.prevMouseX=this.mouseX,this.prevMouseY=this.mouseY})}}const B=`#version 300 es
precision highp float;

#define PI2 6.2831853

uniform float iTime;
uniform vec2  iResolution;
const float Detail = 2.5; // value= 2.5, min=1., max=5., step=0.1

in vec2 vScreen;
out vec4 fragColor;

#define _CameraDist 3.

#define _Saturation 0.37
#define _Color0 vec3(180./255.,205./255.,245./255.)
#define _Color1 vec3(173./255.,215./255.,252./255.)
#define _Color2 vec3(202./255.,204./255.,235./255.)
#define _NormalStrength 0.75
#define _Frequency 3.5

#define TemporalFrequency  0.125
#define Falloff  0.525
#define Frequency PI2

#define m3 mat3(-0.737, 0.456, 0.498, 0, -0.737, 0.675, 0.675, 0.498, 0.544)

vec3 twistedSineNoise33(vec3 q) {
    q.xy *= vec2(1.8, 1.);
    float a = 1.;
    vec3 sum = vec3(0);
    for (int i = 0; i <4; i++){
        q = m3 * q;
        vec3 s = sin(q.zxy * (1./ a)) * a;
        q += s;
        sum += s;
        a *= Falloff;
    }
    return sum;
}

vec3 getBgCol(vec3 p) {
    vec3 mn = twistedSineNoise33(p);
    vec3 col = mix(mix(mix(_Color0 * _Color0, _Color1 * _Color1, mn.x), _Color2 * _Color2, mn.z), vec3(1), .5 * mn.y);
    return max(vec3(0), col);
}

void main() {
    vec2 uv = vScreen;

    vec3 huv = 7. + vec3(uv, iTime * (_Frequency * TemporalFrequency / Detail));
    vec3 hduv = vec3(1./iResolution.x, 1./iResolution.y, 0.);

    float hdx = (twistedSineNoise33(huv + hduv.xzz).x - twistedSineNoise33(huv - hduv.xzz).x) * (iResolution.x * .5);
    float hdy = (twistedSineNoise33(huv + hduv.zyz).x - twistedSineNoise33(huv - hduv.zyz).x) * (iResolution.x * .5);

    vec3 normal = normalize(vec3(hdx, hdy, _NormalStrength));

    vec3 pos = vec3(uv, _CameraDist);
    vec3 rd = normalize(pos);

    vec3 rf = reflect(-rd, normal);
    vec3 col = getBgCol(rf - vec3(uv * Detail, iTime * TemporalFrequency));

    vec3 rfr = refract(-rd, normal, 1./1.4);
    col += getBgCol(rfr +  vec3(uv * Detail, iTime * TemporalFrequency));

    col = sqrt(col * .6);

    fragColor = vec4(col, 1.0);
}`;class I{constructor(e,n={}){this.renderer=u.createTemporary(e,B,{loop:!0,...n})}}const P=`const float iFrameStepSize = 1.;// Based on alpha during additive blending
const float smoothWidth = 4./255.;// 0 - 1 (1./255. = no smoothing, 10./255. = 10 frames smoothing)

uniform float iFrames;

float getDelta() {
    // normally, you will pass delta as an uniform
    return clamp(mod(iTime * 24., iFrames + 4.) - 2., 0., iFrames) / 255.;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord/iResolution.xy;
    uv.y = 1.0 - uv.y;

    float maskGrad = iFrames/255. - texture(iChannel0, uv).r * (1. / iFrameStepSize);

    // normally, you will pass delta as an uniform
    float delta = getDelta();

    // temp color, you probably want to use texture
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0, 2, 4));

    float alpha = smoothstep(maskGrad, maskGrad + smoothWidth, delta * (1.0 + smoothWidth * 255./iFrames));

    fragColor = vec4(col * alpha, 1.0);
}
`;class C{constructor(e,n={}){this.renderer=u.createTemporary(e,P,n),m.loadImages(["./growMask.png"]).then(([t])=>{this.renderer.setImage(0,t),this.renderer.setUniformFloat("iFrames",30),this.renderer.play()})}}const O=`const float iFrameStepSize = 1.;// Based on alpha during additive blending
const float smoothWidth = 4./255.;// 0 - 1 (1./255. = no smoothing, 10./255. = 10 frames smoothing)

uniform float iFrames;

float getDelta() {
    // normally, you will pass delta as an uniform
    return clamp(mod(iTime * 24., iFrames + 4.) - 2., 0., iFrames) / 255.;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = fragCoord/iResolution.xy;
    uv.y = 1.0 - uv.y;

    float maskGrad = iFrames/255. - texture(iChannel0, uv).r * (1. / iFrameStepSize);

    // normally, you will pass delta as an uniform
    float delta = getDelta();

    vec3 col = texture(iChannel1, uv).rgb;

    float alpha = smoothstep(maskGrad, maskGrad + smoothWidth, delta * (1.0 + smoothWidth * 255./iFrames));

    fragColor = vec4(col * alpha, alpha);
}
`;class _{constructor(e,n={}){this.renderer=u.createTemporary(e,O,n),m.loadImages(["./growMask.png","./paddo.jpg"]).then(([t,r])=>{this.renderer.setImage(0,t),this.renderer.setImage(1,r,{useMips:!0}),this.renderer.setUniformFloat("iFrames",30),this.renderer.play()})}}const D=`void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    uv += .1 * (texture(iChannel1, uv).xy);
    fragColor = texture(iChannel0, uv);
}
`,X=`uniform vec4 uMouse;

vec3 mouseInput(vec2 uv) {
  vec2 d = uv - uMouse.xy;
  d.x *= iResolution.x / iResolution.y;
  return vec3((uMouse.zw-uMouse.xy) * 20. * smoothstep(.2, 0., length(d)), 0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord.xy / iResolution.xy;

  vec3 oldColor = iFrame <= 1 ? vec3(0) : texture(iChannel0, uv).rgb * 250./255.;
  vec3 newColor = oldColor + mouseInput(uv);

  // newColor -= sign(newColor) * 1./127.;

  fragColor = vec4(newColor, 1);
}
`;class S{constructor(e,n={}){this.wrapper=e,this.renderer=u.createTemporary(this.wrapper,D,n),this.mouseX=0,this.mouseY=0,this.prevMouseX=0,this.prevMouseY=0,this.renderer.createBuffer(0,X),this.renderer.buffers[0].setImage(0,this.renderer.buffers[0],{type:WebGLRenderingContext.FLOAT}),this.renderer.setImage(1,this.renderer.buffers[0]);const t=this.renderer.canvas;t.onmousedown=()=>{this.mouseDown=!0},t.onmouseenter=t.onmousemove=r=>{const i=t.getBoundingClientRect(),o=Math.max(0,Math.min(1,(r.clientX-i.left)/i.width)),c=Math.max(0,Math.min(1,(r.clientY-i.top)/i.height));this.mouseX=o,this.mouseY=1-c},this.renderer.tick(()=>{this.renderer.buffers[0].setUniformVec4("uMouse",this.mouseX,this.mouseY,this.prevMouseX,this.prevMouseY),this.prevMouseX=this.mouseX,this.prevMouseY=this.mouseY}),m.loadImages(["./paddo.jpg"]).then(([r])=>{this.renderer.setImage(0,r,{flipY:!0}),this.renderer.play()})}}class V{constructor(e,n={}){this.wrapper=e,this.options=n,this.index=0,this.classes=[E,S,F,R,C,_,I],window.setInterval(()=>{this.renderer&&u.releaseTemporary(this.renderer),this.index=(this.index+1)%this.classes.length,this.renderer=new this.classes[this.index](this.wrapper,{...this.options}).renderer},500)}}new C(document.getElementsByClassName("grid-item")[0]);new E(document.getElementsByClassName("grid-item")[1]);new R(document.getElementsByClassName("grid-item")[2]);new I(document.getElementsByClassName("grid-item")[3]);new F(document.getElementsByClassName("grid-item")[4]);new _(document.getElementsByClassName("grid-item")[5]);new S(document.getElementsByClassName("grid-item")[6]);new V(document.getElementsByClassName("grid-item")[7],{useSharedContext:!0});new C(document.getElementsByClassName("grid-item")[8],{useSharedContext:!1});
