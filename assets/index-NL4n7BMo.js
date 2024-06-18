var V=Object.defineProperty;var Y=(h,n,t)=>n in h?V(h,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):h[n]=t;var i=(h,n,t)=>(Y(h,typeof n!="symbol"?n+"":n,t),t);(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))e(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&e(o)}).observe(document,{childList:!0,subtree:!0});function t(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function e(r){if(r.ep)return;r.ep=!0;const s=t(r);fetch(r.href,s)}})();const d=0,R=2,T=3;class _{constructor(n,t){i(this,"gl");i(this,"_program");i(this,"vs");i(this,"fs");i(this,"initialized",!1);i(this,"ext");i(this,"type",d);i(this,"vsSource","");i(this,"fsSource","");i(this,"uniformLocations",{});i(this,"attributeLocations",{});i(this,"_compiled",!1);this.gl=n;const e=n.context;this.ext=e.getExtension("KHR_parallel_shader_compile"),this._program=e.createProgram(),this.vs=e.createShader(e.VERTEX_SHADER),this.fs=e.createShader(e.FRAGMENT_SHADER),this.type=this.detectType(t),this.vsSource=this.getVertexShader(this.type),e.shaderSource(this.vs,this.vsSource),e.compileShader(this.vs),this.fsSource=`${this.getFragmentShader(this.type)}${t}`,e.shaderSource(this.fs,this.fsSource),e.compileShader(this.fs),e.attachShader(this._program,this.vs),e.attachShader(this._program,this.fs),e.linkProgram(this._program)}get program(){if(this.initialized)return this._program;this.initialized=!0;const n=this.gl.context;let t=n.getShaderParameter(this.vs,n.COMPILE_STATUS);if(!t)throw console.table(this.vsSource.split(`
`)),new Error(`ImageEffectRenderer: Vertex shader compilation failed: ${n.getShaderInfoLog(this.vs)}`);if(t=n.getShaderParameter(this.fs,n.COMPILE_STATUS),!t)throw console.table(this.fsSource.split(`
`)),new Error(`ImageEffectRenderer: Shader compilation failed: ${n.getShaderInfoLog(this.fs)}`);if(t=n.getProgramParameter(this._program,n.LINK_STATUS),!t)throw new Error(`ImageEffectRenderer: Program linking failed: ${n.getProgramInfoLog(this._program)}`);return this._program}get shaderCompiled(){return this._compiled=this._compiled||!this.ext||this.gl.context.getProgramParameter(this._program,this.ext.COMPLETION_STATUS_KHR),this._compiled}use(){this.gl.context.useProgram(this.program)}getUniformLocation(n){return this.uniformLocations[n]!==void 0?this.uniformLocations[n]:this.uniformLocations[n]=this.gl.context.getUniformLocation(this._program,n)}getAttributeLocation(n){return this.attributeLocations[n]!==void 0?this.attributeLocations[n]:(this.gl.context.useProgram(this.program),this.attributeLocations[n]=this.gl.context.getAttribLocation(this._program,n))}detectType(n){const t=/mainImage/gmi,e=/^#version[\s]+300[\s]+es[\s]+/gmi;return t.exec(n)?d:e.exec(n)?T:R}getFragmentShader(n){switch(n){case d:return`#version 300 es
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
                        `;default:return""}}getVertexShader(n){switch(n){case d:return`#version 300 es
                    in vec2 aPos;
                    in vec2 aUV;

                    out vec2 vUV0;

                    void main(void) {
                        vUV0 = aUV;
                        gl_Position = vec4(aPos, 0.0, 1.0);
                    }
                `;case R:return`attribute vec3 aPos;
                attribute vec2 aUV;

                uniform float iAspect;

                varying vec2 vScreen;
                varying vec2 vUV0;

                void main(void) {
                    vUV0 = aUV;
                    vScreen = aPos.xy;
                    vScreen.x *= iAspect;
                    gl_Position = vec4(aPos, 1.0);
                }`;case T:default:return`#version 300 es
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
                }`}}getUniformShader(){return`
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
            uniform highp sampler2D iChannel4;
            uniform highp sampler2D iChannel5;
            uniform highp sampler2D iChannel6;
            uniform highp sampler2D iChannel7;

            uniform vec2 iChannelResolution0;
            uniform vec2 iChannelResolution1;
            uniform vec2 iChannelResolution2;
            uniform vec2 iChannelResolution3;
            uniform vec2 iChannelResolution4;
            uniform vec2 iChannelResolution5;
            uniform vec2 iChannelResolution6;
            uniform vec2 iChannelResolution7;
            `}}const S=0,I=1,U=2,A=3,M=4,L=5;class q{constructor(n,t){i(this,"type");i(this,"name");i(this,"x",0);i(this,"y",0);i(this,"z",0);i(this,"w",0);i(this,"matrix");this.type=n,this.name=t}}class b{constructor(n=void 0){i(this,"context");i(this,"canvas");i(this,"sharedPrograms",{});i(this,"sharedTextures",{});i(this,"quadVBO");i(this,"lastQuadVBO");this.canvas=n||document.createElement("canvas");const t={premultipliedAlpha:!0,alpha:!0,preserveDrawingBuffer:!1,antialias:!1,depth:!1,stencil:!1};if(this.context=this.canvas.getContext("webgl2",t),!this.context)throw new Error("Unable to create WebGL2 context.");this.context.getExtension("WEBGL_color_buffer_float"),this.context.getExtension("EXT_color_buffer_float"),this.context.getExtension("OES_texture_float"),this.context.getExtension("OES_texture_float_linear"),this.context.getExtension("KHR_parallel_shader_compile"),this.context.clearColor(0,0,0,0),this.context.clear(this.context.COLOR_BUFFER_BIT),this.context.enable(this.context.BLEND),this.context.blendFunc(this.context.ONE,this.context.ONE_MINUS_SRC_ALPHA),this.quadVBO=this.generateQuad()}drawQuad(n,t){const e=this.context;this.lastQuadVBO!==this.quadVBO&&(this.lastQuadVBO=this.quadVBO,e.bindBuffer(e.ARRAY_BUFFER,this.quadVBO),e.enableVertexAttribArray(n),e.vertexAttribPointer(n,2,e.FLOAT,!1,4*4,0),e.enableVertexAttribArray(t),e.vertexAttribPointer(t,2,e.FLOAT,!1,4*4,2*4)),e.drawArrays(e.TRIANGLE_STRIP,0,4)}getCachedTexture(n,t){const e=`${n}_${t.clampX}_${t.clampY}_${t.useMipmap}`;return this.sharedTextures[n]?this.sharedTextures[e]:this.sharedTextures[e]=this.context.createTexture()}compileShader(n){return this.sharedPrograms[n]?this.sharedPrograms[n]:this.sharedPrograms[n]=new _(this,n)}setTextureParameter(n,t){const e=this.context;e.bindTexture(e.TEXTURE_2D,n),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,t.clampX?e.CLAMP_TO_EDGE:e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,t.clampY?e.CLAMP_TO_EDGE:e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,t.magFilterLinear?e.LINEAR:e.NEAREST),t.useMipmap?(e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.generateMipmap(e.TEXTURE_2D)):e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,t.minFilterLinear?e.LINEAR:e.NEAREST)}bindTextures(n){const t=this.context;for(let e=0;e<8;e++){t.activeTexture(t.TEXTURE0+e);const r=n[e];r&&r.buffer?t.bindTexture(t.TEXTURE_2D,r.buffer.src.texture):r&&r.texture?t.bindTexture(t.TEXTURE_2D,r.texture):t.bindTexture(t.TEXTURE_2D,null)}}setUniforms(n,t){const e=this.context;Object.values(n).forEach(r=>{const s=t.getUniformLocation(r.name);if(s!==null)switch(r.type){case S:e.uniform1i(s,r.x);break;case I:e.uniform1f(s,r.x);break;case U:e.uniform2f(s,r.x,r.y);break;case A:e.uniform3f(s,r.x,r.y,r.z);break;case M:e.uniform4f(s,r.x,r.y,r.z,r.w);break;case L:e.uniformMatrix4fv(s,!1,r.matrix);break}})}generateQuad(){const n=this.context,t=new Float32Array([-1,1,0,1,-1,-1,0,0,1,1,1,1,1,-1,1,0]),e=n.createBuffer();return n.bindBuffer(n.ARRAY_BUFFER,e),n.bufferData(n.ARRAY_BUFFER,t,n.STATIC_DRAW),e}}const B={clampX:!0,clampY:!0,flipY:!1,useMipmap:!0,useCache:!0,minFilterLinear:!0,magFilterLinear:!0};class g{constructor(n){i(this,"width",0);i(this,"height",0);i(this,"program");i(this,"main");i(this,"gl");i(this,"frame",0);i(this,"uniforms",{});i(this,"textures",[]);this.gl=n}get shaderCompiled(){return this.program.shaderCompiled}setImage(n,t,e={}){if(n>=8)throw new Error("ImageEffectRenderer: A maximum of 8 slots is available, slotIndex is out of bounds.");this.setUniformInt(`iChannel${n}`,n);let r,s;t instanceof VideoFrame?(r=t.displayWidth,s=t.displayHeight):(r=t.width,s=t.height),this.setUniformVec2(`iChannelResolution${n}`,r,s);const o=this.gl.context,c=this.textures[n];if(t instanceof g){c&&c.texture&&!c.cached&&o.deleteTexture(c.texture);const a={...t.options,...e};this.textures[n]={texture:void 0,buffer:t,cached:!1},this.gl.setTextureParameter(t.src.texture,a),this.gl.setTextureParameter(t.dest.texture,a)}else{const a={...B,...e};a.useCache=a.useCache&&t instanceof HTMLImageElement,a.useCache&&c&&c.texture&&!c.cached&&(o.deleteTexture(c.texture),c.texture=void 0);let u=c&&c.texture;a.useCache&&t instanceof HTMLImageElement&&(u=this.gl.getCachedTexture(t.src,a)),u||(u=o.createTexture()),this.textures[n]={texture:u,buffer:void 0,cached:a.useCache},o.bindTexture(o.TEXTURE_2D,u),o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,e.flipY?1:0),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,o.RGBA,o.UNSIGNED_BYTE,t),this.gl.setTextureParameter(u,a)}}setUniformFloat(n,t){this.setUniform(n,I,t,0,0,0,void 0)}setUniformInt(n,t){this.setUniform(n,S,t,0,0,0,void 0)}setUniformVec2(n,t,e){this.setUniform(n,U,t,e,0,0,void 0)}setUniformVec3(n,t,e,r){this.setUniform(n,A,t,e,r,0,void 0)}setUniformVec4(n,t,e,r,s){this.setUniform(n,M,t,e,r,s,void 0)}setUniformMatrix(n,t){this.setUniform(n,L,0,0,0,0,t)}destruct(){this.textures.forEach(n=>n.texture&&!n.cached&&this.gl.context.deleteTexture(n.texture)),this.textures=[],this.uniforms={}}draw(n=0,t,e){this.width=t|0,this.height=e|0,this.program.use(),this.setUniformFloat("iGlobalTime",n),this.setUniformFloat("iTime",n),this.setUniformInt("iFrame",this.frame),this.setUniformFloat("iAspect",t/e),this.setUniformVec2("iResolution",t,e),this.gl.setUniforms(this.uniforms,this.program),this.gl.bindTextures(this.textures),this.gl.drawQuad(this.program.getAttributeLocation("aPos"),this.program.getAttributeLocation("aUV")),this.frame++}setUniform(n,t,e,r,s,o,c){let a=this.uniforms[n];a||(a=this.uniforms[n]=new q(t,n)),a.x=e,a.y=r,a.z=s,a.w=o,a.matrix=c}}const z={type:5121,pixelRatio:1,msaa:!1};class E{constructor(n,t={}){i(this,"width",0);i(this,"height",0);i(this,"texture");i(this,"frameBuffer");i(this,"options");i(this,"gl");i(this,"format",WebGLRenderingContext.RGBA);i(this,"internalFormat",WebGLRenderingContext.RGBA);switch(this.gl=n,this.options={...z,...t},this.options.type){case WebGLRenderingContext.UNSIGNED_BYTE:this.internalFormat=WebGL2RenderingContext.RGBA8;break;case WebGLRenderingContext.FLOAT:this.internalFormat=WebGL2RenderingContext.RGBA32F;break}const e=n.context;this.texture=e.createTexture(),this.resize(16,16),this.frameBuffer=e.createFramebuffer(),e.bindFramebuffer(e.FRAMEBUFFER,this.frameBuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,this.texture,0),e.bindFramebuffer(e.FRAMEBUFFER,null)}resize(n,t){if(this.width===(n|0)&&this.height===(t|0))return;this.width=n|0,this.height=t|0;const e=this.gl.context;e.bindTexture(e.TEXTURE_2D,this.texture),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,0),e.texImage2D(e.TEXTURE_2D,0,this.internalFormat,this.width,this.height,0,this.format,this.options.type,null)}destruct(){const n=this.gl.context;this.frameBuffer&&n.deleteFramebuffer(this.frameBuffer),this.texture&&n.deleteTexture(this.texture)}}const W={...B,...z,useMipmap:!1,useCache:!1};class k extends g{constructor(t,e={}){super(t);i(this,"options");i(this,"frameBuffer0");i(this,"frameBuffer1");this.options={...W,...e},this.frameBuffer0=new E(t,this.options),this.frameBuffer1=new E(t,this.options)}get src(){return this.frame%2===0?this.frameBuffer0:this.frameBuffer1}get dest(){return this.frame%2===1?this.frameBuffer0:this.frameBuffer1}draw(t=0,e,r){if(e<=0||r<=0)return;const s=this.gl.context,o=this.dest;o.resize(e,r),s.bindFramebuffer(s.FRAMEBUFFER,o.frameBuffer),s.clear(s.COLOR_BUFFER_BIT),super.draw(t,e,r),s.bindFramebuffer(s.FRAMEBUFFER,null)}destruct(){super.destruct(),this.frameBuffer0.destruct(),this.frameBuffer1.destruct()}}const p=class p extends g{constructor(t,e,r,s){super(t);i(this,"canvas");i(this,"buffers",[]);i(this,"options");i(this,"time",0);i(this,"index");i(this,"tickFuncs",[]);i(this,"readyFuncs",[]);i(this,"startTime",-1);i(this,"drawOneFrame",!1);i(this,"container");i(this,"animationRequestId",0);i(this,"resizeObserver");i(this,"_ready",!1);if(this.options={...s},this.index=p.index++,this.container=e,this.main=this,this.options.useSharedContext){this.canvas=document.createElement("canvas");const o=this.canvas.getContext("2d");o.fillStyle="#00000000",o.clearRect(0,0,this.canvas.width,this.canvas.height)}else this.canvas=this.gl.canvas;Object.assign(this.canvas.style,{inset:"0",width:"100%",height:"100%",margin:"0",display:"block"}),this.container.appendChild(this.canvas),this.program=new _(this.gl,r),this.resizeObserver=new ResizeObserver(()=>{this.options.autoResize&&this.updateSize()}),this.resizeObserver.observe(e),this.options.useSharedContext||this.drawingLoop(0)}get drawThisFrame(){return(this.options.loop||this.drawOneFrame)&&this.width>0&&this.height>0&&(!this.options.asyncCompile||this.allShadersCompiled)}get allShadersCompiled(){return this.shaderCompiled&&this.buffers.every(t=>t&&t.shaderCompiled)}play(){this.options.loop=!0}stop(){this.options.loop=!1}createBuffer(t,e,r={}){const s=this.buffers[t];s&&s.destruct();const o=new k(this.gl,r);return o.program=this.gl.compileShader(e),o.main=this,this.buffers[t]=o}tick(t){this.tickFuncs.push(t)}ready(t){this.readyFuncs.push(t)}drawFrame(t=0){this.time=t/1e3,this.drawOneFrame=!0}drawInstance(t){const e=this.gl.context;this.drawOneFrame||(this.time+=t),this.tickFuncs.forEach(r=>r(t)),this.buffers.forEach(r=>{r&&(e.viewport(0,0,this.width,this.height),r.draw(this.time,this.canvas.width,this.canvas.height))}),e.viewport(0,0,this.width,this.height),e.clear(e.COLOR_BUFFER_BIT),this.draw(this.time,this.canvas.width,this.canvas.height),this.drawOneFrame=!1}update(t){this.allShadersCompiled&&(this._ready||(this._ready=!0,this.readyFuncs.forEach(e=>e()),this.readyFuncs=[]))}destruct(){cancelAnimationFrame(this.animationRequestId),super.destruct(),this.resizeObserver.disconnect(),this.container.removeChild(this.canvas),this.canvas.replaceWith(this.canvas.cloneNode(!0)),this.buffers.forEach(t=>{t.destruct()}),this.buffers=[],this.tickFuncs=[]}copyCanvas(){const t=this.gl.canvas,r=this.canvas.getContext("2d");r.clearRect(0,0,this.width,this.height),r.drawImage(t,0,t.height-this.height,this.width,this.height,0,0,this.width,this.height)}updateSize(){this.width=this.container.offsetWidth*this.options.pixelRatio|0,this.height=this.container.offsetHeight*this.options.pixelRatio|0,(this.width!==this.canvas.width||this.height!==this.canvas.height)&&(this.canvas.width=this.width,this.canvas.height=this.height,this.drawOneFrame=!0)}drawingLoop(t=0){this.animationRequestId=window.requestAnimationFrame(r=>this.drawingLoop(r)),t/=1e3;const e=this.startTime<0?1/60:t-this.startTime;this.startTime=t>0?t:-1,this.update(e),this.drawThisFrame&&this.drawInstance(e)}};i(p,"index",0);let x=p;const $={loop:!1,autoResize:!0,pixelRatio:typeof window<"u"?window.devicePixelRatio:1,useSharedContext:!1,asyncCompile:!0},v=[],F=[];let f,y=-1;class l{constructor(){throw new Error("Use ImageEffectRenderer.createTemporary to create an ImageEffectRenderer")}static createTemporary(n,t,e={}){const r={...$,...e};if(r.useSharedContext){f||(f=new b,this.drawInstances(0));const s=new x(f,n,t,r);return v.push(s),s}else{const s=F.pop()||new b;return new x(s,n,t,r)}}static releaseTemporary(n){n.options.useSharedContext||F.push(n.gl),n.stop(),n.destruct();const t=v.indexOf(n);t>-1&&v.splice(t,1)}static drawInstances(n=0){window.requestAnimationFrame(a=>this.drawInstances(a)),n/=1e3;const t=y<0?1/60:n-y;y=n;const e=f.canvas,r=f.context,s=v;let o=0,c=0;s.forEach(a=>{a.update(t)}),s.forEach(a=>{a.drawThisFrame&&(o=Math.max(o,a.width),c=Math.max(c,a.height))}),(o>e.width||c>e.height)&&(e.width=o,e.height=c),r.clear(r.COLOR_BUFFER_BIT),s.forEach(a=>{a.drawThisFrame&&(a.drawInstance(t),a.copyCanvas())})}}const H=`#version 300 es
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
}`;class O{constructor(n,t={}){this.renderer=l.createTemporary(n,H,{loop:!0,...t})}}const Q=`//
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
`;class m{static loadImages(n){return Promise.all(n.map(t=>m.loadImage(t)))}static loadImage(n){return new Promise(t=>{const e=new Image;e.onload=()=>t(e),e.src=`./static/${n}`})}}class P{constructor(n,t={}){this.renderer=l.createTemporary(n,Q,t),m.loadImages(["./paddo.jpg"]).then(([e])=>{this.renderer.setImage(0,e,{flipY:!0}),this.renderer.play()})}}const C=`uniform vec4 uMouse;
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
`,K=`uniform vec4 uMouse;
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

`,j=`void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;

    vec3 col = 1.-exp(-texture(iChannel0, uv).rgb);
    col = smoothstep(vec3(0), vec3(1), col);

    fragColor = vec4(col, 1);
}
`;class D{constructor(n,t={}){this.wrapper=n,this.renderer=l.createTemporary(this.wrapper,j,{loop:!0,...t}),this.mouseX=0,this.mouseY=0,this.prevMouseX=0,this.prevMouseY=0,this.renderer.createBuffer(0,C,{type:WebGLRenderingContext.FLOAT,clampX:!1,clampY:!1,pixelRatio:.5}),this.renderer.createBuffer(1,C,{type:WebGLRenderingContext.FLOAT,clampX:!1,clampY:!1,pixelRatio:.5}),this.renderer.createBuffer(2,C,{type:WebGLRenderingContext.FLOAT,clampX:!1,clampY:!1,pixelRatio:.5}),this.renderer.buffers[0].setImage(0,this.renderer.buffers[2]),this.renderer.buffers[1].setImage(0,this.renderer.buffers[0]),this.renderer.buffers[2].setImage(0,this.renderer.buffers[1]),this.renderer.createBuffer(3,K,{type:WebGLRenderingContext.FLOAT,clampX:!1,clampY:!1}),this.renderer.buffers[3].setImage(0,this.renderer.buffers[2]),this.renderer.buffers[3].setImage(1,this.renderer.buffers[3]),this.renderer.setImage(0,this.renderer.buffers[3]);const e=this.renderer.canvas;e.onmouseenter=e.onmousemove=r=>{const s=e.getBoundingClientRect(),o=Math.max(0,Math.min(1,(r.clientX-s.left)/s.width)),c=Math.max(0,Math.min(1,(r.clientY-s.top)/s.height));this.mouseX=o,this.mouseY=1-c},this.renderer.tick(()=>{this.renderer.buffers[0].setUniformVec4("uMouse",this.mouseX,this.mouseY,this.prevMouseX,this.prevMouseY),this.renderer.buffers[1].setUniformVec4("uMouse",this.mouseX,this.mouseY,this.prevMouseX,this.prevMouseY),this.renderer.buffers[2].setUniformVec4("uMouse",this.mouseX,this.mouseY,this.prevMouseX,this.prevMouseY),this.renderer.buffers[3].setUniformVec4("uMouse",this.mouseX,this.mouseY,this.prevMouseX,this.prevMouseY),this.prevMouseX=this.mouseX,this.prevMouseY=this.mouseY})}}const Z=`#version 300 es
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
}`;class X{constructor(n,t={}){this.renderer=l.createTemporary(n,Z,{loop:!0,...t})}}const J=`const float iFrameStepSize = 1.;// Based on alpha during additive blending
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
`;class w{constructor(n,t={}){this.renderer=l.createTemporary(n,J,t),m.loadImages(["./growMask.png"]).then(([e])=>{this.renderer.setImage(0,e),this.renderer.setUniformFloat("iFrames",30),this.renderer.play()})}}const ee=`const float iFrameStepSize = 1.;// Based on alpha during additive blending
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
`;class N{constructor(n,t={}){this.renderer=l.createTemporary(n,ee,t),m.loadImages(["./growMask.png","./paddo.jpg"]).then(([e,r])=>{this.renderer.setImage(0,e),this.renderer.setImage(1,r,{useMips:!0}),this.renderer.setUniformFloat("iFrames",30),this.renderer.play()})}}const te=`void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    uv += .1 * (texture(iChannel1, uv).xy);
    fragColor = texture(iChannel0, uv);
}
`,ne=`uniform vec4 uMouse;

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
`;class G{constructor(n,t={}){this.wrapper=n,this.renderer=l.createTemporary(this.wrapper,te,t),this.mouseX=0,this.mouseY=0,this.prevMouseX=0,this.prevMouseY=0,this.renderer.createBuffer(0,ne),this.renderer.buffers[0].setImage(0,this.renderer.buffers[0],{type:WebGLRenderingContext.FLOAT}),this.renderer.setImage(1,this.renderer.buffers[0]);const e=this.renderer.canvas;e.onmousedown=()=>{this.mouseDown=!0},e.onmouseenter=e.onmousemove=r=>{const s=e.getBoundingClientRect(),o=Math.max(0,Math.min(1,(r.clientX-s.left)/s.width)),c=Math.max(0,Math.min(1,(r.clientY-s.top)/s.height));this.mouseX=o,this.mouseY=1-c},this.renderer.tick(()=>{this.renderer.buffers[0].setUniformVec4("uMouse",this.mouseX,this.mouseY,this.prevMouseX,this.prevMouseY),this.prevMouseX=this.mouseX,this.prevMouseY=this.mouseY}),m.loadImages(["./paddo.jpg"]).then(([r])=>{this.renderer.setImage(0,r,{flipY:!0}),this.renderer.play()})}}class re{constructor(n,t={}){this.wrapper=n,this.options=t,this.index=0,this.classes=[O,G,D,P,w,N,X],window.setInterval(()=>{this.renderer&&l.releaseTemporary(this.renderer),this.index=(this.index+1)%this.classes.length,this.renderer=new this.classes[this.index](this.wrapper,{...this.options}).renderer},500)}}new w(document.getElementsByClassName("grid-item")[0]);new O(document.getElementsByClassName("grid-item")[1]);new P(document.getElementsByClassName("grid-item")[2]);new X(document.getElementsByClassName("grid-item")[3]);new D(document.getElementsByClassName("grid-item")[4]);new N(document.getElementsByClassName("grid-item")[5]);new G(document.getElementsByClassName("grid-item")[6]);new re(document.getElementsByClassName("grid-item")[7],{useSharedContext:!0});new w(document.getElementsByClassName("grid-item")[8],{useSharedContext:!1});
