var k=Object.defineProperty;var Y=(c,n,e)=>n in c?k(c,n,{enumerable:!0,configurable:!0,writable:!0,value:e}):c[n]=e;var i=(c,n,e)=>(Y(c,typeof n!="symbol"?n+"":n,e),e);(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))t(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&t(o)}).observe(document,{childList:!0,subtree:!0});function e(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerPolicy&&(s.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?s.credentials="include":r.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function t(r){if(r.ep)return;r.ep=!0;const s=e(r);fetch(r.href,s)}})();const d=0,T=2,R=3;class S{constructor(n,e){i(this,"gl");i(this,"_program");i(this,"vs");i(this,"fs");i(this,"initialized",!1);i(this,"ext");i(this,"type",d);i(this,"vsSource","");i(this,"fsSource","");i(this,"uniformLocations",{});i(this,"attributeLocations",{});i(this,"_compiled",!1);this.gl=n;const t=n.context;this.ext=t.getExtension("KHR_parallel_shader_compile"),this._program=t.createProgram(),this.vs=t.createShader(t.VERTEX_SHADER),this.fs=t.createShader(t.FRAGMENT_SHADER),this.type=this.detectType(e),this.vsSource=this.getVertexShader(this.type),t.shaderSource(this.vs,this.vsSource),t.compileShader(this.vs),this.fsSource=`${this.getFragmentShader(this.type)}${e}`,t.shaderSource(this.fs,this.fsSource),t.compileShader(this.fs),t.attachShader(this._program,this.vs),t.attachShader(this._program,this.fs),t.linkProgram(this._program)}get program(){if(this.initialized)return this._program;this.initialized=!0;const n=this.gl.context;let e=n.getShaderParameter(this.vs,n.COMPILE_STATUS);if(!e)throw console.table(this.vsSource.split(`
`)),new Error(`ImageEffectRenderer: Vertex shader compilation failed: ${n.getShaderInfoLog(this.vs)}`);if(e=n.getShaderParameter(this.fs,n.COMPILE_STATUS),!e)throw console.table(this.fsSource.split(`
`)),new Error(`ImageEffectRenderer: Shader compilation failed: ${n.getShaderInfoLog(this.fs)}`);if(e=n.getProgramParameter(this._program,n.LINK_STATUS),!e)throw new Error(`ImageEffectRenderer: Program linking failed: ${n.getProgramInfoLog(this._program)}`);return this._program}get shaderCompiled(){return this._compiled=this._compiled||!this.ext||this.gl.context.getProgramParameter(this._program,this.ext.COMPLETION_STATUS_KHR),this._compiled}use(){this.gl.context.useProgram(this.program)}getUniformLocation(n){return this.uniformLocations[n]!==void 0?this.uniformLocations[n]:this.uniformLocations[n]=this.gl.context.getUniformLocation(this._program,n)}getAttributeLocation(n){return this.attributeLocations[n]!==void 0?this.attributeLocations[n]:(this.gl.context.useProgram(this.program),this.attributeLocations[n]=this.gl.context.getAttribLocation(this._program,n))}detectType(n){const e=/mainImage/gmi,t=/^#version[\s]+300[\s]+es[\s]+/gmi;return e.exec(n)?d:t.exec(n)?R:T}getFragmentShader(n){switch(n){case d:return`#version 300 es
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
                `;case T:return`attribute vec3 aPos;
                attribute vec2 aUV;

                uniform float iAspect;

                varying vec2 vScreen;
                varying vec2 vUV0;

                void main(void) {
                    vUV0 = aUV;
                    vScreen = aPos.xy;
                    vScreen.x *= iAspect;
                    gl_Position = vec4(aPos, 1.0);
                }`;case R:default:return`#version 300 es
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
            `}}const U=0,I=1,A=2,L=3,z=4,B=5;class ${constructor(n,e){i(this,"type");i(this,"name");i(this,"x",0);i(this,"y",0);i(this,"z",0);i(this,"w",0);i(this,"matrix");this.type=n,this.name=e}}class b{constructor(n=void 0){i(this,"context");i(this,"canvas");i(this,"sharedPrograms",{});i(this,"sharedTextures",{});i(this,"quadVBO");i(this,"lastQuadVBO");this.canvas=n||document.createElement("canvas");const e={premultipliedAlpha:!0,alpha:!0,preserveDrawingBuffer:!1,antialias:!1,depth:!1,stencil:!1};if(this.context=this.canvas.getContext("webgl2",e),!this.context)throw new Error("Unable to create WebGL2 context.");this.context.getExtension("WEBGL_color_buffer_float"),this.context.getExtension("EXT_color_buffer_float"),this.context.getExtension("OES_texture_float"),this.context.getExtension("OES_texture_float_linear"),this.context.getExtension("KHR_parallel_shader_compile"),this.context.clearColor(0,0,0,0),this.context.clear(this.context.COLOR_BUFFER_BIT),this.context.enable(this.context.BLEND),this.context.blendFunc(this.context.ONE,this.context.ONE_MINUS_SRC_ALPHA),this.quadVBO=this.generateQuad()}drawQuad(n,e){const t=this.context;this.lastQuadVBO!==this.quadVBO&&(this.lastQuadVBO=this.quadVBO,t.bindBuffer(t.ARRAY_BUFFER,this.quadVBO),t.enableVertexAttribArray(n),t.vertexAttribPointer(n,2,t.FLOAT,!1,4*4,0),t.enableVertexAttribArray(e),t.vertexAttribPointer(e,2,t.FLOAT,!1,4*4,2*4)),t.drawArrays(t.TRIANGLE_STRIP,0,4)}getCachedTexture(n,e){const t=`${n}_${e.clampX}_${e.clampY}_${e.useMipmap}`;return this.sharedTextures[n]?this.sharedTextures[t]:this.sharedTextures[t]=this.context.createTexture()}compileShader(n){return this.sharedPrograms[n]?this.sharedPrograms[n]:this.sharedPrograms[n]=new S(this,n)}setTextureParameter(n,e){const t=this.context;t.bindTexture(t.TEXTURE_2D,n),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,e.clampX?t.CLAMP_TO_EDGE:t.REPEAT),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,e.clampY?t.CLAMP_TO_EDGE:t.REPEAT),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,e.magFilterLinear?t.LINEAR:t.NEAREST),e.useMipmap?(t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR_MIPMAP_LINEAR),t.generateMipmap(t.TEXTURE_2D)):t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,e.minFilterLinear?t.LINEAR:t.NEAREST)}bindTextures(n){const e=this.context;for(let t=0;t<8;t++){e.activeTexture(e.TEXTURE0+t);const r=n[t];r&&r.buffer?e.bindTexture(e.TEXTURE_2D,r.buffer.src.texture):r&&r.texture?e.bindTexture(e.TEXTURE_2D,r.texture):e.bindTexture(e.TEXTURE_2D,null)}}setUniforms(n,e){const t=this.context;Object.values(n).forEach(r=>{const s=e.getUniformLocation(r.name);if(s!==null)switch(r.type){case U:t.uniform1i(s,r.x);break;case I:t.uniform1f(s,r.x);break;case A:t.uniform2f(s,r.x,r.y);break;case L:t.uniform3f(s,r.x,r.y,r.z);break;case z:t.uniform4f(s,r.x,r.y,r.z,r.w);break;case B:t.uniformMatrix4fv(s,!1,r.matrix);break}})}generateQuad(){const n=this.context,e=new Float32Array([-1,1,0,1,-1,-1,0,0,1,1,1,1,1,-1,1,0]),t=n.createBuffer();return n.bindBuffer(n.ARRAY_BUFFER,t),n.bufferData(n.ARRAY_BUFFER,e,n.STATIC_DRAW),t}}const O={clampX:!0,clampY:!0,flipY:!1,useMipmap:!0,useCache:!0,minFilterLinear:!0,magFilterLinear:!0};class g{constructor(n){i(this,"width",0);i(this,"height",0);i(this,"program");i(this,"main");i(this,"gl");i(this,"frame",0);i(this,"mouse",[0,0,0,0]);i(this,"uniforms",{});i(this,"textures",[]);this.gl=n}get shaderCompiled(){return this.program.shaderCompiled}get iMouseUsed(){return this.program.getUniformLocation("iMouse")!==null}setImage(n,e,t={}){if(n>=8)throw new Error("ImageEffectRenderer: A maximum of 8 slots is available, slotIndex is out of bounds.");this.setUniformInt(`iChannel${n}`,n);let r,s;e instanceof VideoFrame?(r=e.displayWidth,s=e.displayHeight):(r=e.width,s=e.height),this.setUniformVec2(`iChannelResolution${n}`,r,s);const o=this.gl.context,l=this.textures[n];if(e instanceof g){l&&l.texture&&!l.cached&&o.deleteTexture(l.texture);const a={...e.options,...t};this.textures[n]={texture:void 0,buffer:e,cached:!1},this.gl.setTextureParameter(e.src.texture,a),this.gl.setTextureParameter(e.dest.texture,a)}else{const a={...O,...t};a.useCache=a.useCache&&e instanceof HTMLImageElement,a.useCache&&l&&l.texture&&!l.cached&&(o.deleteTexture(l.texture),l.texture=void 0);let u=l&&l.texture;a.useCache&&e instanceof HTMLImageElement&&(u=this.gl.getCachedTexture(e.src,a)),u||(u=o.createTexture()),this.textures[n]={texture:u,buffer:void 0,cached:a.useCache},o.bindTexture(o.TEXTURE_2D,u),o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,t.flipY?1:0),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,o.RGBA,o.UNSIGNED_BYTE,e),this.gl.setTextureParameter(u,a)}}setUniformFloat(n,e){this.setUniform(n,I,e,0,0,0,void 0)}setUniformInt(n,e){this.setUniform(n,U,e,0,0,0,void 0)}setUniformVec2(n,e,t){this.setUniform(n,A,e,t,0,0,void 0)}setUniformVec3(n,e,t,r){this.setUniform(n,L,e,t,r,0,void 0)}setUniformVec4(n,e,t,r,s){this.setUniform(n,z,e,t,r,s,void 0)}setUniformMatrix(n,e){this.setUniform(n,B,0,0,0,0,e)}destruct(){this.textures.forEach(n=>n.texture&&!n.cached&&this.gl.context.deleteTexture(n.texture)),this.textures=[],this.uniforms={}}draw(n=0,e,t){this.width=e|0,this.height=t|0,this.program.use(),this.setUniformFloat("iGlobalTime",n),this.setUniformFloat("iTime",n),this.setUniformInt("iFrame",this.frame),this.setUniformFloat("iAspect",e/t),this.setUniformVec2("iResolution",e,t);const r=this.main.mouse;this.setUniformVec4("iMouse",r[0],r[1],r[2],r[3]),this.gl.setUniforms(this.uniforms,this.program),this.gl.bindTextures(this.textures),this.gl.drawQuad(this.program.getAttributeLocation("aPos"),this.program.getAttributeLocation("aUV")),this.frame++}setUniform(n,e,t,r,s,o,l){let a=this.uniforms[n];a||(a=this.uniforms[n]=new $(e,n)),a.x=t,a.y=r,a.z=s,a.w=o,a.matrix=l}}const P={type:5121,pixelRatio:1,msaa:!1};class E{constructor(n,e={}){i(this,"width",0);i(this,"height",0);i(this,"texture");i(this,"frameBuffer");i(this,"options");i(this,"gl");i(this,"format",WebGLRenderingContext.RGBA);i(this,"internalFormat",WebGLRenderingContext.RGBA);switch(this.gl=n,this.options={...P,...e},this.options.type){case WebGLRenderingContext.UNSIGNED_BYTE:this.internalFormat=WebGL2RenderingContext.RGBA8;break;case WebGLRenderingContext.FLOAT:this.internalFormat=WebGL2RenderingContext.RGBA32F;break}const t=n.context;this.texture=t.createTexture(),this.resize(16,16),this.frameBuffer=t.createFramebuffer(),t.bindFramebuffer(t.FRAMEBUFFER,this.frameBuffer),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,this.texture,0),t.bindFramebuffer(t.FRAMEBUFFER,null)}resize(n,e){if(this.width===(n|0)&&this.height===(e|0))return;this.width=n|0,this.height=e|0;const t=this.gl.context;t.bindTexture(t.TEXTURE_2D,this.texture),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,0),t.texImage2D(t.TEXTURE_2D,0,this.internalFormat,this.width,this.height,0,this.format,this.options.type,null)}destruct(){const n=this.gl.context;this.frameBuffer&&n.deleteFramebuffer(this.frameBuffer),this.texture&&n.deleteTexture(this.texture)}}const H={...O,...P,useMipmap:!1,useCache:!1};class Q extends g{constructor(e,t={}){super(e);i(this,"options");i(this,"frameBuffer0");i(this,"frameBuffer1");this.options={...H,...t},this.frameBuffer0=new E(e,this.options),this.frameBuffer1=new E(e,this.options)}get src(){return this.frame%2===0?this.frameBuffer0:this.frameBuffer1}get dest(){return this.frame%2===1?this.frameBuffer0:this.frameBuffer1}draw(e=0,t,r){if(t<=0||r<=0)return;const s=this.gl.context,o=this.dest;o.resize(t,r),s.bindFramebuffer(s.FRAMEBUFFER,o.frameBuffer),s.clear(s.COLOR_BUFFER_BIT),super.draw(e,t,r),s.bindFramebuffer(s.FRAMEBUFFER,null)}destruct(){super.destruct(),this.frameBuffer0.destruct(),this.frameBuffer1.destruct()}}let M=-0,D=-0,F=!1;function K(c){F||(F=!0,c.addEventListener("mousemove",n=>{M=n.clientX,D=n.clientY},{passive:!0}))}function j(){return[M,D]}function Z(c,n){const e=(n[0]-c.left)/c.width,t=1-(n[1]-c.top)/c.height;return[e,t]}const p=class p extends g{constructor(e,t,r,s){super(e);i(this,"canvas");i(this,"buffers",[]);i(this,"options");i(this,"time",0);i(this,"index");i(this,"tickFuncs",[]);i(this,"readyFuncs",[]);i(this,"startTime",-1);i(this,"drawOneFrame",!1);i(this,"container");i(this,"animationRequestId",0);i(this,"resizeObserver");i(this,"_ready",!1);if(this.options={...s},this.index=p.index++,this.container=t,this.main=this,this.options.useSharedContext){this.canvas=document.createElement("canvas");const o=this.canvas.getContext("2d");o.fillStyle="#00000000",o.clearRect(0,0,this.canvas.width,this.canvas.height)}else this.canvas=this.gl.canvas;Object.assign(this.canvas.style,{inset:"0",width:"100%",height:"100%",margin:"0",display:"block"}),this.container.appendChild(this.canvas),this.program=new S(this.gl,r),this.resizeObserver=new ResizeObserver(()=>{this.options.autoResize&&this.updateSize()}),this.resizeObserver.observe(t),this.options.useSharedContext||this.drawingLoop(0)}get drawThisFrame(){return(this.options.loop||this.drawOneFrame)&&this.width>0&&this.height>0&&(!this.options.asyncCompile||this.allShadersCompiled)}get iMouseUsed(){return super.iMouseUsed||this.buffers.some(e=>e&&e.iMouseUsed)}get allShadersCompiled(){return this.shaderCompiled&&this.buffers.every(e=>e&&e.shaderCompiled)}play(){this.options.loop=!0}stop(){this.options.loop=!1}createBuffer(e,t,r={}){const s=this.buffers[e];s&&s.destruct();const o=new Q(this.gl,r);return o.program=this.gl.compileShader(t),o.main=this,this.buffers[e]=o}tick(e){this.tickFuncs.push(e)}ready(e){this.readyFuncs.push(e)}drawFrame(e=0){this.time=e/1e3,this.drawOneFrame=!0}drawInstance(e){const t=this.gl.context;if(this.drawOneFrame||(this.time+=e),this.tickFuncs.forEach(r=>r(e)),this.iMouseUsed){const r=this.mouse[0],s=this.mouse[1],[o,l]=Z(this.container.getBoundingClientRect(),j());this.mouse=[o,l,r,s]}this.buffers.forEach(r=>{r&&(t.viewport(0,0,this.width,this.height),r.draw(this.time,this.canvas.width,this.canvas.height))}),t.viewport(0,0,this.width,this.height),t.clear(t.COLOR_BUFFER_BIT),this.draw(this.time,this.canvas.width,this.canvas.height),this.drawOneFrame=!1}update(e){this.allShadersCompiled&&(this._ready||(this._ready=!0,this.readyFuncs.forEach(t=>t()),this.readyFuncs=[],this.iMouseUsed&&K(document.body)))}destruct(){cancelAnimationFrame(this.animationRequestId),super.destruct(),this.resizeObserver.disconnect(),this.container.removeChild(this.canvas),this.canvas.replaceWith(this.canvas.cloneNode(!0)),this.buffers.forEach(e=>{e.destruct()}),this.buffers=[],this.tickFuncs=[]}copyCanvas(){const e=this.gl.canvas,r=this.canvas.getContext("2d");r.clearRect(0,0,this.width,this.height),r.drawImage(e,0,e.height-this.height,this.width,this.height,0,0,this.width,this.height)}updateSize(){this.width=this.container.offsetWidth*this.options.pixelRatio|0,this.height=this.container.offsetHeight*this.options.pixelRatio|0,(this.width!==this.canvas.width||this.height!==this.canvas.height)&&(this.canvas.width=this.width,this.canvas.height=this.height,this.drawOneFrame=!0)}drawingLoop(e=0){this.animationRequestId=window.requestAnimationFrame(r=>this.drawingLoop(r)),e/=1e3;const t=this.startTime<0?1/60:e-this.startTime;this.startTime=e>0?e:-1,this.update(t),this.drawThisFrame&&this.drawInstance(t)}};i(p,"index",0);let x=p;const J={loop:!1,autoResize:!0,pixelRatio:typeof window<"u"?window.devicePixelRatio:1,useSharedContext:!1,asyncCompile:!0},v=[],_=[];let m,y=-1;class h{constructor(){throw new Error("Use ImageEffectRenderer.createTemporary to create an ImageEffectRenderer")}static createTemporary(n,e,t={}){const r={...J,...t};if(r.useSharedContext){m||(m=new b,this.drawInstances(0));const s=new x(m,n,e,r);return v.push(s),s}else{const s=_.pop()||new b;return new x(s,n,e,r)}}static releaseTemporary(n){n.options.useSharedContext||_.push(n.gl),n.stop(),n.destruct();const e=v.indexOf(n);e>-1&&v.splice(e,1)}static drawInstances(n=0){window.requestAnimationFrame(a=>this.drawInstances(a)),n/=1e3;const e=y<0?1/60:n-y;y=n;const t=m.canvas,r=m.context,s=v;let o=0,l=0;s.forEach(a=>{a.update(e)}),s.forEach(a=>{a.drawThisFrame&&(o=Math.max(o,a.width),l=Math.max(l,a.height))}),(o>t.width||l>t.height)&&(t.width=o,t.height=l),r.clear(r.COLOR_BUFFER_BIT),s.forEach(a=>{a.drawThisFrame&&(a.drawInstance(e),a.copyCanvas())})}}const ee=`#version 300 es
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
}`;class N{constructor(n,e={}){this.renderer=h.createTemporary(n,ee,{loop:!0,...e})}}const te=`//
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
`;class f{static loadImages(n){return Promise.all(n.map(e=>f.loadImage(e)))}static loadImage(n){return new Promise(e=>{const t=new Image;t.onload=()=>e(t),t.src=`./static/${n}`})}}class G{constructor(n,e={}){this.renderer=h.createTemporary(n,te,e),f.loadImages(["./paddo.jpg"]).then(([t])=>{this.renderer.setImage(0,t,{flipY:!0}),this.renderer.play()})}}const C=`uniform float uMouseDown;

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

    vec2 externalForces = clamp(vec2(iMouse.xy - iMouse.zw) * (.4 / max(dot(uv - iMouse.xy, uv - iMouse.xy), .05)), -1., 1.);

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
`,ne=`// The MIT License
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

    col += newCol * 0.01*distance(iMouse.xy, iMouse.zw)/(dot(uv - iMouse.xy, uv - iMouse.xy)+0.002);

    col = clamp(0.998 * col - 0.00005, 0., 5.);
    fragColor = vec4(col, 1.);
}

`,re=`void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;

    vec3 col = 1.-exp(-texture(iChannel0, uv).rgb);
    col = smoothstep(vec3(0), vec3(1), col);

    fragColor = vec4(col, 1);
}
`;class V{constructor(n,e={}){this.wrapper=n,this.renderer=h.createTemporary(this.wrapper,re,{loop:!0,...e}),this.renderer.createBuffer(0,C,{type:WebGLRenderingContext.FLOAT,clampX:!1,clampY:!1}),this.renderer.createBuffer(1,C,{type:WebGLRenderingContext.FLOAT,clampX:!1,clampY:!1}),this.renderer.createBuffer(2,C,{type:WebGLRenderingContext.FLOAT,clampX:!1,clampY:!1}),this.renderer.buffers[0].setImage(0,this.renderer.buffers[2]),this.renderer.buffers[1].setImage(0,this.renderer.buffers[0]),this.renderer.buffers[2].setImage(0,this.renderer.buffers[1]),this.renderer.createBuffer(3,ne,{type:WebGLRenderingContext.FLOAT,clampX:!1,clampY:!1}),this.renderer.buffers[3].setImage(0,this.renderer.buffers[2]),this.renderer.buffers[3].setImage(1,this.renderer.buffers[3]),this.renderer.setImage(0,this.renderer.buffers[3])}}const ie=`#version 300 es
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
}`;class X{constructor(n,e={}){this.renderer=h.createTemporary(n,ie,{loop:!0,...e})}}const se=`const float iFrameStepSize = 1.;// Based on alpha during additive blending
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
`;class w{constructor(n,e={}){this.renderer=h.createTemporary(n,se,e),f.loadImages(["./growMask.png"]).then(([t])=>{this.renderer.setImage(0,t),this.renderer.setUniformFloat("iFrames",30),this.renderer.play()})}}const oe=`const float iFrameStepSize = 1.;// Based on alpha during additive blending
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
`;class q{constructor(n,e={}){this.renderer=h.createTemporary(n,oe,e),f.loadImages(["./growMask.png","./paddo.jpg"]).then(([t,r])=>{this.renderer.setImage(0,t),this.renderer.setImage(1,r,{useMips:!0}),this.renderer.setUniformFloat("iFrames",30),this.renderer.play()})}}const ae=`void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    uv += .1 * (texture(iChannel1, uv).xy);
    fragColor = texture(iChannel0, uv);
}
`,ce=`vec3 mouseInput(vec2 uv) {
  vec2 d = uv - iMouse.xy;
  d.x *= iResolution.x / iResolution.y;
  return vec3((iMouse.zw-iMouse.xy) * 20. * smoothstep(.2, 0., length(d)), 0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord.xy / iResolution.xy;

  vec3 oldColor = iFrame <= 1 ? vec3(0) : texture(iChannel0, uv).rgb * 250./255.;
  vec3 newColor = oldColor + mouseInput(uv);

  // newColor -= sign(newColor) * 1./127.;

  fragColor = vec4(newColor, 1);
}
`;class W{constructor(n,e={}){this.wrapper=n,this.renderer=h.createTemporary(this.wrapper,ae,e),this.renderer.createBuffer(0,ce),this.renderer.buffers[0].setImage(0,this.renderer.buffers[0],{type:WebGLRenderingContext.FLOAT}),this.renderer.setImage(1,this.renderer.buffers[0]),f.loadImages(["./paddo.jpg"]).then(([t])=>{this.renderer.setImage(0,t,{flipY:!0}),this.renderer.play()})}}class le{constructor(n,e={}){this.wrapper=n,this.options=e,this.index=0,this.classes=[N,W,V,G,w,q,X],window.setInterval(()=>{this.renderer&&h.releaseTemporary(this.renderer),this.index=(this.index+1)%this.classes.length,this.renderer=new this.classes[this.index](this.wrapper,{...this.options}).renderer},500)}}new w(document.getElementsByClassName("grid-item")[0]);new N(document.getElementsByClassName("grid-item")[1]);new G(document.getElementsByClassName("grid-item")[2]);new X(document.getElementsByClassName("grid-item")[3]);new V(document.getElementsByClassName("grid-item")[4]);new q(document.getElementsByClassName("grid-item")[5]);new W(document.getElementsByClassName("grid-item")[6]);new le(document.getElementsByClassName("grid-item")[7],{useSharedContext:!0});new w(document.getElementsByClassName("grid-item")[8],{useSharedContext:!1});
