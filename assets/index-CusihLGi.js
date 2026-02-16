var ne=Object.defineProperty;var ie=(l,n,t)=>n in l?ne(l,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):l[n]=t;var r=(l,n,t)=>(ie(l,typeof n!="symbol"?n+"":n,t),t);(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))e(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&e(a)}).observe(document,{childList:!0,subtree:!0});function t(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function e(i){if(i.ep)return;i.ep=!0;const s=t(i);fetch(i.href,s)}})();const g=0,P=2,L=3;class X{constructor(n,t){r(this,"gl");r(this,"_program");r(this,"vs");r(this,"fs");r(this,"initialized",!1);r(this,"ext");r(this,"type",g);r(this,"vsSource","");r(this,"fsSource","");r(this,"uniformLocations",{});r(this,"uniformTypes",{});r(this,"attributeLocations",{});r(this,"_compiled",!1);this.gl=n;const e=n.context;this.ext=e.getExtension("KHR_parallel_shader_compile"),this._program=e.createProgram(),this.vs=e.createShader(e.VERTEX_SHADER),this.fs=e.createShader(e.FRAGMENT_SHADER),this.type=this.detectType(t),this.vsSource=this.getVertexShader(this.type),e.shaderSource(this.vs,this.vsSource),e.compileShader(this.vs),this.fsSource=`${this.getFragmentShader(this.type)}${t}`,e.shaderSource(this.fs,this.fsSource),e.compileShader(this.fs),e.attachShader(this._program,this.vs),e.attachShader(this._program,this.fs),e.linkProgram(this._program)}get program(){if(this.initialized)return this._program;this.initialized=!0;const n=this.gl.context;let t=n.getShaderParameter(this.vs,n.COMPILE_STATUS);if(!t)throw console.table(this.vsSource.split(`
`)),new Error(`ImageEffectRenderer: Vertex shader compilation failed: ${n.getShaderInfoLog(this.vs)}`);if(t=n.getShaderParameter(this.fs,n.COMPILE_STATUS),!t)throw console.table(this.fsSource.split(`
`)),new Error(`ImageEffectRenderer: Shader compilation failed: ${n.getShaderInfoLog(this.fs)}`);if(t=n.getProgramParameter(this._program,n.LINK_STATUS),!t)throw new Error(`ImageEffectRenderer: Program linking failed: ${n.getProgramInfoLog(this._program)}`);return this._program}get shaderCompiled(){return this._compiled=this._compiled||!this.ext||this.gl.context.getProgramParameter(this._program,this.ext.COMPLETION_STATUS_KHR),this._compiled}use(){this.gl.context.useProgram(this.program)}getUniformLocation(n){return this.uniformLocations[n]!==void 0?this.uniformLocations[n]:this.uniformLocations[n]=this.gl.context.getUniformLocation(this._program,n)}getAttributeLocation(n){return this.attributeLocations[n]!==void 0?this.attributeLocations[n]:(this.gl.context.useProgram(this.program),this.attributeLocations[n]=this.gl.context.getAttribLocation(this._program,n))}getUniformType(n){if(this.uniformTypes[n]!==void 0)return this.uniformTypes[n];const t=this.gl.context,e=t.getProgramParameter(this._program,t.ACTIVE_UNIFORMS);for(let i=0;i<e;i++){const s=t.getActiveUniform(this._program,i);if(s&&s.name===n)return this.uniformTypes[n]=s.type}return this.uniformTypes[n]=null}detectType(n){const t=/mainImage/gmi,e=/^#version[\s]+300[\s]+es[\s]+/gmi;return t.exec(n)?g:e.exec(n)?L:P}getFragmentShader(n){switch(n){case g:return`#version 300 es
                        precision highp float;

                        ${this.getUniformShader()}

                        in vec2 vUV0;
                        out vec4 outFragColor;

                        void mainImage(out vec4, vec2);

                        vec4 texture2D(sampler2D tex, vec2 uv) {
                            return texture(tex, uv);
                        }

                        vec4 texture2DLod(sampler2D tex, vec2 uv, float lod) {
                            return textureLod(tex, uv, lod);
                        }

                        vec4 texture2DLodEXT(sampler2D tex, vec2 uv, float lod) {
                            return textureLod(tex, uv, lod);
                        }

                        
                        vec4 texture2DGrad(sampler2D tex, vec2 uv, vec2 dPdx, vec2 dPdy) {
                            return textureGrad(tex, uv, dPdx, dPdy);
                        }

                        vec4 texture2DGradEXT(sampler2D tex, vec2 uv, vec2 dPdx, vec2 dPdy) {
                            return textureGrad(tex, uv, dPdx, dPdy);
                        }

                        void main(void) {
                            outFragColor = vec4(0.0, 0.0, 0.0, 1.0);
                            mainImage(outFragColor, vUV0 * iResolution.xy);
                        }
                        `;default:return""}}getVertexShader(n){switch(n){case g:return`#version 300 es
                    in vec2 aPos;
                    in vec2 aUV;

                    out vec2 vUV0;

                    void main(void) {
                        vUV0 = aUV;
                        gl_Position = vec4(aPos, 0.0, 1.0);
                    }
                `;case P:return`attribute vec3 aPos;
                attribute vec2 aUV;

                uniform float iAspect;

                varying vec2 vScreen;
                varying vec2 vUV0;

                void main(void) {
                    vUV0 = aUV;
                    vScreen = aPos.xy;
                    vScreen.x *= iAspect;
                    gl_Position = vec4(aPos, 1.0);
                }`;case L:default:return`#version 300 es
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
            #define HW_PERFORMANCE 1

            uniform vec3 iResolution;
            uniform float iTime;
            uniform float iTimeDelta;
            uniform int iFrame;
            uniform float iChannelTime[4];
            uniform vec4 iMouse;
            uniform vec4 iMouseNormalized;
            uniform vec4 iDate;
            uniform float iSampleRate;
            uniform vec3 iChannelResolution[4];

            uniform float iGlobalTime;
            uniform float iAspect;

            uniform highp sampler2D iChannel0;
            uniform highp sampler2D iChannel1;
            uniform highp sampler2D iChannel2;
            uniform highp sampler2D iChannel3;
            uniform highp sampler2D iChannel4;
            uniform highp sampler2D iChannel5;
            uniform highp sampler2D iChannel6;
            uniform highp sampler2D iChannel7;

            uniform highp samplerCube iChannelCube0;
            uniform highp samplerCube iChannelCube1;
            uniform highp samplerCube iChannelCube2;
            uniform highp samplerCube iChannelCube3;
            uniform highp samplerCube iChannelCube4;
            uniform highp samplerCube iChannelCube5;
            uniform highp samplerCube iChannelCube6;
            uniform highp samplerCube iChannelCube7;
            `}}const G=0,V=1,q=2,W=3,Y=4,k=5;class re{constructor(n,t){r(this,"type");r(this,"name");r(this,"x",0);r(this,"y",0);r(this,"z",0);r(this,"w",0);r(this,"matrix");this.type=n,this.name=t}}class z{constructor(n=void 0){r(this,"context");r(this,"canvas");r(this,"sharedPrograms",{});r(this,"sharedTextures",{});r(this,"quadVBO");r(this,"lastQuadVBO");this.canvas=n||document.createElement("canvas");const t={premultipliedAlpha:!0,alpha:!0,preserveDrawingBuffer:!1,antialias:!1,depth:!1,stencil:!1};if(this.context=this.canvas.getContext("webgl2",t),!this.context)throw new Error("Unable to create WebGL2 context.");this.context.getExtension("WEBGL_color_buffer_float"),this.context.getExtension("EXT_color_buffer_float"),this.context.getExtension("OES_texture_float"),this.context.getExtension("OES_texture_float_linear"),this.context.getExtension("KHR_parallel_shader_compile"),this.context.clearColor(0,0,0,0),this.context.clear(this.context.COLOR_BUFFER_BIT),this.context.enable(this.context.BLEND),this.context.blendFunc(this.context.ONE,this.context.ONE_MINUS_SRC_ALPHA),this.quadVBO=this.generateQuad()}drawQuad(n,t){const e=this.context;this.lastQuadVBO!==this.quadVBO&&(this.lastQuadVBO=this.quadVBO,e.bindBuffer(e.ARRAY_BUFFER,this.quadVBO),e.enableVertexAttribArray(n),e.vertexAttribPointer(n,2,e.FLOAT,!1,4*4,0),e.enableVertexAttribArray(t),e.vertexAttribPointer(t,2,e.FLOAT,!1,4*4,2*4)),e.drawArrays(e.TRIANGLE_STRIP,0,4)}getCachedTexture(n,t){const e=`${n}_${t.clampX}_${t.clampY}_${t.useMipmap}`;return this.sharedTextures[n]?this.sharedTextures[e]:this.sharedTextures[e]=this.context.createTexture()}compileShader(n){return this.sharedPrograms[n]?this.sharedPrograms[n]:this.sharedPrograms[n]=new X(this,n)}setTextureParameter(n,t){const e=this.context;e.bindTexture(e.TEXTURE_2D,n),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,t.clampX?e.CLAMP_TO_EDGE:e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,t.clampY?e.CLAMP_TO_EDGE:e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,t.magFilterLinear?e.LINEAR:e.NEAREST),t.useMipmap?(e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.generateMipmap(e.TEXTURE_2D)):e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,t.minFilterLinear?e.LINEAR:e.NEAREST)}setCubeMapParameter(n,t){const e=this.context;e.bindTexture(e.TEXTURE_CUBE_MAP,n),e.texParameteri(e.TEXTURE_CUBE_MAP,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_CUBE_MAP,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_CUBE_MAP,e.TEXTURE_MAG_FILTER,t.magFilterLinear?e.LINEAR:e.NEAREST),t.useMipmap?(e.texParameteri(e.TEXTURE_CUBE_MAP,e.TEXTURE_MIN_FILTER,e.LINEAR_MIPMAP_LINEAR),e.generateMipmap(e.TEXTURE_CUBE_MAP)):e.texParameteri(e.TEXTURE_CUBE_MAP,e.TEXTURE_MIN_FILTER,t.minFilterLinear?e.LINEAR:e.NEAREST)}bindTextures(n){const t=this.context;for(let e=0;e<8;e++){t.activeTexture(t.TEXTURE0+e);const i=n[e];i&&i.buffer?t.bindTexture(t.TEXTURE_2D,i.buffer.src.texture):i&&i.texture?i.isCubemap?t.bindTexture(t.TEXTURE_CUBE_MAP,i.texture):t.bindTexture(t.TEXTURE_2D,i.texture):t.bindTexture(t.TEXTURE_2D,null)}}setUniforms(n,t){const e=this.context;Object.values(n).forEach(i=>{const s=t.getUniformLocation(i.name);if(s!==null)switch(i.type){case G:e.uniform1i(s,i.x);break;case V:e.uniform1f(s,i.x);break;case q:e.uniform2f(s,i.x,i.y);break;case W:e.uniform3f(s,i.x,i.y,i.z);break;case Y:e.uniform4f(s,i.x,i.y,i.z,i.w);break;case k:e.uniformMatrix4fv(s,!1,i.matrix);break}})}generateQuad(){const n=this.context,t=new Float32Array([-1,1,0,1,-1,-1,0,0,1,1,1,1,1,-1,1,0]),e=n.createBuffer();return n.bindBuffer(n.ARRAY_BUFFER,e),n.bufferData(n.ARRAY_BUFFER,t,n.STATIC_DRAW),e}}const w={clampX:!0,clampY:!0,flipY:!1,useMipmap:!0,useCache:!0,minFilterLinear:!0,magFilterLinear:!0};class T{constructor(n){r(this,"width",0);r(this,"height",0);r(this,"program");r(this,"main");r(this,"gl");r(this,"frame",0);r(this,"lastTime",0);r(this,"mouse",[0,0,0,0]);r(this,"mouseNormalized",[0,0,0,0]);r(this,"uniforms",{});r(this,"textures",[]);this.gl=n}get shaderCompiled(){return this.program.shaderCompiled}get iMouseUsed(){return this.program.getUniformLocation("iMouse")!==null||this.program.getUniformLocation("iMouseNormalized")!==null}setImage(n,t,e={}){if(n>=8)throw new Error("ImageEffectRenderer: A maximum of 8 slots is available, slotIndex is out of bounds.");if(t instanceof HTMLImageElement){if(!t.complete||t.naturalWidth===0){t.addEventListener("load",()=>{this.setImage(n,t,e)},{once:!0});return}}else if(t instanceof HTMLVideoElement&&t.readyState<HTMLMediaElement.HAVE_CURRENT_DATA){t.addEventListener("loadeddata",()=>{this.setImage(n,t,e)},{once:!0});return}this.setUniformInt(`iChannel${n}`,n);let i,s;typeof VideoFrame<"u"&&t instanceof VideoFrame?(i=t.displayWidth,s=t.displayHeight):(i=t.width,s=t.height),this.setUniformVec3(`iChannelResolution[${n}]`,i,s,1);const a=this.gl.context,c=this.textures[n];if(t instanceof T){c&&c.texture&&!c.cached&&a.deleteTexture(c.texture);const o={...t.options,...e};this.textures[n]={texture:void 0,buffer:t,cached:!1,isCubemap:!1},this.gl.setTextureParameter(t.src.texture,o),this.gl.setTextureParameter(t.dest.texture,o)}else{const o={...w,...e};o.useCache=o.useCache&&t instanceof HTMLImageElement,o.useCache&&c&&c.texture&&!c.cached&&(a.deleteTexture(c.texture),c.texture=void 0);let h=c&&c.texture;o.useCache&&t instanceof HTMLImageElement&&(h=this.gl.getCachedTexture(t.src,o)),h||(h=a.createTexture()),this.textures[n]={texture:h,buffer:void 0,cached:o.useCache,isCubemap:!1},a.bindTexture(a.TEXTURE_2D,h),a.pixelStorei(a.UNPACK_FLIP_Y_WEBGL,e.flipY?1:0),a.texImage2D(a.TEXTURE_2D,0,a.RGBA,a.RGBA,a.UNSIGNED_BYTE,t),this.gl.setTextureParameter(h,o)}}setCubeMap(n,t,e={}){if(n>=8)throw new Error("ImageEffectRenderer: A maximum of 8 slots is available, slotIndex is out of bounds.");if(t.length!==6)throw new Error("ImageEffectRenderer: Cubemap requires exactly 6 face images.");for(let u=0;u<6;u++){const v=t[u];if(v instanceof HTMLImageElement&&(!v.complete||v.naturalWidth===0)){v.addEventListener("load",()=>{this.setCubeMap(n,t,e)},{once:!0});return}}this.setUniformInt(`iChannelCube${n}`,n);const i=t[0];let s,a;typeof VideoFrame<"u"&&i instanceof VideoFrame?(s=i.displayWidth,a=i.displayHeight):(s=i.width,a=i.height),this.setUniformVec3(`iChannelResolution[${n}]`,s,a,1);const c=this.gl.context,o=this.textures[n];o&&o.texture&&!o.cached&&c.deleteTexture(o.texture);const h={...w,...e},x=c.createTexture();this.textures[n]={texture:x,buffer:void 0,cached:!1,isCubemap:!0},c.bindTexture(c.TEXTURE_CUBE_MAP,x),c.pixelStorei(c.UNPACK_FLIP_Y_WEBGL,0);const _=[c.TEXTURE_CUBE_MAP_POSITIVE_X,c.TEXTURE_CUBE_MAP_NEGATIVE_X,c.TEXTURE_CUBE_MAP_POSITIVE_Y,c.TEXTURE_CUBE_MAP_NEGATIVE_Y,c.TEXTURE_CUBE_MAP_POSITIVE_Z,c.TEXTURE_CUBE_MAP_NEGATIVE_Z];for(let u=0;u<6;u++)c.texImage2D(_[u],0,c.RGBA,c.RGBA,c.UNSIGNED_BYTE,t[u]);this.gl.setCubeMapParameter(x,h)}setUniformFloat(n,t){this.setUniform(n,V,t,0,0,0,void 0)}setUniformInt(n,t){this.setUniform(n,G,t,0,0,0,void 0)}setUniformVec2(n,t,e){this.setUniform(n,q,t,e,0,0,void 0)}setUniformVec3(n,t,e,i){this.setUniform(n,W,t,e,i,0,void 0)}setUniformVec4(n,t,e,i,s){this.setUniform(n,Y,t,e,i,s,void 0)}setUniformMatrix(n,t){this.setUniform(n,k,0,0,0,0,t)}destruct(){this.textures.forEach(n=>n.texture&&!n.cached&&this.gl.context.deleteTexture(n.texture)),this.textures=[],this.uniforms={}}draw(n=0,t,e){this.width=t|0,this.height=e|0,this.program.use();const i=n-this.lastTime;this.lastTime=n,this.setUniformFloat("iTime",n),this.setUniformFloat("iTimeDelta",i),this.setUniformInt("iFrame",this.frame),this.program.getUniformType("iResolution")===this.gl.context.FLOAT_VEC2?this.setUniformVec2("iResolution",t,e):this.setUniformVec3("iResolution",t,e,1);const a=this.main.mouse;this.setUniformVec4("iMouse",a[0],a[1],a[2],a[3]);const c=this.main.mouseNormalized;this.setUniformVec4("iMouseNormalized",c[0],c[1],c[2],c[3]);const o=new Date;this.setUniformVec4("iDate",o.getFullYear(),o.getMonth(),o.getDate(),o.getHours()*3600+o.getMinutes()*60+o.getSeconds()+o.getMilliseconds()/1e3),this.setUniformFloat("iSampleRate",44100),this.setUniformFloat("iGlobalTime",n),this.setUniformFloat("iAspect",t/e),this.gl.setUniforms(this.uniforms,this.program),this.gl.bindTextures(this.textures),this.gl.drawQuad(this.program.getAttributeLocation("aPos"),this.program.getAttributeLocation("aUV")),this.frame++}setUniform(n,t,e,i,s,a,c){let o=this.uniforms[n];o||(o=this.uniforms[n]=new re(t,n)),o.x=e,o.y=i,o.z=s,o.w=a,o.matrix=c}}const H={type:5121,pixelRatio:1,msaa:!1};class B{constructor(n,t={}){r(this,"width",0);r(this,"height",0);r(this,"texture");r(this,"frameBuffer");r(this,"options");r(this,"gl");r(this,"format",WebGLRenderingContext.RGBA);r(this,"internalFormat",WebGLRenderingContext.RGBA);switch(this.gl=n,this.options={...H,...t},this.options.type){case WebGLRenderingContext.UNSIGNED_BYTE:this.internalFormat=WebGL2RenderingContext.RGBA8;break;case WebGLRenderingContext.FLOAT:this.internalFormat=WebGL2RenderingContext.RGBA32F;break}const e=n.context;this.texture=e.createTexture(),this.resize(16,16),this.frameBuffer=e.createFramebuffer(),e.bindFramebuffer(e.FRAMEBUFFER,this.frameBuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,this.texture,0),e.bindFramebuffer(e.FRAMEBUFFER,null)}resize(n,t){if(this.width===(n|0)&&this.height===(t|0))return;this.width=n|0,this.height=t|0;const e=this.gl.context;e.bindTexture(e.TEXTURE_2D,this.texture),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,0),e.texImage2D(e.TEXTURE_2D,0,this.internalFormat,this.width,this.height,0,this.format,this.options.type,null)}destruct(){const n=this.gl.context;this.frameBuffer&&n.deleteFramebuffer(this.frameBuffer),this.texture&&n.deleteTexture(this.texture)}}const se={...w,...H,useMipmap:!1,useCache:!1};class oe extends T{constructor(t,e={}){super(t);r(this,"options");r(this,"frameBuffer0");r(this,"frameBuffer1");this.options={...se,...e},this.frameBuffer0=new B(t,this.options),this.frameBuffer1=new B(t,this.options)}get src(){return this.frame%2===0?this.frameBuffer0:this.frameBuffer1}get dest(){return this.frame%2===1?this.frameBuffer0:this.frameBuffer1}draw(t=0,e,i){if(e<=0||i<=0)return;const s=this.gl.context,a=this.dest;a.resize(e,i),s.bindFramebuffer(s.FRAMEBUFFER,a.frameBuffer),s.clear(s.COLOR_BUFFER_BIT),super.draw(t,e,i),s.bindFramebuffer(s.FRAMEBUFFER,null)}destruct(){super.destruct(),this.frameBuffer0.destruct(),this.frameBuffer1.destruct()}}let E=0,C=0,$=0,K=0,f=!1,S=!1,F=0,U=0,I=0,A=0,D=!1;function ae(l){D||(D=!0,l.addEventListener("mousemove",n=>{$=E,K=C,E=n.clientX,C=n.clientY,f&&(I=E,A=C)},{passive:!0}),l.addEventListener("mousedown",n=>{n.button===0&&(f=!0,S=!0,F=n.clientX,U=n.clientY,I=n.clientX,A=n.clientY)},{passive:!0}),l.addEventListener("mouseup",n=>{n.button===0&&(f=!1)},{passive:!0}))}function ce(){S=!1}function le(l){const n=(E-l.left)/l.width,t=1-(C-l.top)/l.height,e=($-l.left)/l.width,i=1-(K-l.top)/l.height;return[n,t,e,i]}function he(l,n,t){const e=l.height,i=l.width,s=I-l.left,a=e-(A-l.top),c=F-l.left,o=e-(U-l.top),h=f||F>0?s:0,x=f||U>0?a:0,_=(f?1:-1)*(c>0?c:0),u=(S?1:-1)*(o>0?o:0);return[h/i*n,x/e*t,_/i*n,u/e*t]}class N extends T{constructor(t,e,i,s){super(t);r(this,"canvas");r(this,"buffers",[]);r(this,"options");r(this,"time",0);r(this,"tickFuncs",[]);r(this,"readyFuncs",[]);r(this,"startTime",-1);r(this,"drawOneFrame",!1);r(this,"container");r(this,"animationRequestId",0);r(this,"resizeObserver");r(this,"_ready",!1);if(this.options={...s},this.container=e,this.main=this,this.options.useSharedContext){this.canvas=document.createElement("canvas");const a=this.canvas.getContext("2d");a.fillStyle="#00000000",a.clearRect(0,0,this.canvas.width,this.canvas.height)}else this.canvas=this.gl.canvas;Object.assign(this.canvas.style,{inset:"0",width:"100%",height:"100%",margin:"0",display:"block"}),this.container.appendChild(this.canvas),this.program=new X(this.gl,i),this.resizeObserver=new ResizeObserver(()=>{this.options.autoResize&&this.updateSize()}),this.resizeObserver.observe(e),this.options.useSharedContext||this.drawingLoop(0)}get drawThisFrame(){return(this.options.loop||this.drawOneFrame)&&this.width>0&&this.height>0&&(!this.options.asyncCompile||this.allShadersCompiled)}get iMouseUsed(){return super.iMouseUsed||this.buffers.some(t=>t&&t.iMouseUsed)}get allShadersCompiled(){return this.shaderCompiled&&this.buffers.every(t=>t&&t.shaderCompiled)}play(){this.options.loop=!0}stop(){this.options.loop=!1}createBuffer(t,e,i={}){const s=this.buffers[t];s&&s.destruct();const a=new oe(this.gl,i);return a.program=this.gl.compileShader(e),a.main=this,this.buffers[t]=a}tick(t){this.tickFuncs.push(t)}ready(t){this.readyFuncs.push(t)}drawFrame(t=0){this.time=t/1e3,this.drawOneFrame=!0}setData(t){t.buffers&&this.setBuffersData(t.buffers),t.images&&this.setImagesData(t.images),t.cubemaps&&this.setCubeMapsData(t.cubemaps)}setImagesData(t,e=this){t.forEach(i=>{i.image.bufferIndex!==void 0?e==null||e.setImage(i.slotIndex,this.buffers[i.image.bufferIndex],i.options):e==null||e.setImage(i.slotIndex,i.image,i.options)})}setBuffersData(t){t.forEach(e=>{this.createBuffer(e.index,e.shader,e.options)}),t.forEach(e=>{e.images&&this.setImagesData(e.images,this.buffers[e.index]),e.cubemaps&&this.setCubeMapsData(e.cubemaps,this.buffers[e.index])})}setCubeMapsData(t,e=this){t.forEach(i=>{e==null||e.setCubeMap(i.slotIndex,i.faces,i.options)})}drawInstance(t){const e=this.gl.context;if(this.drawOneFrame||(this.time+=t),this.tickFuncs.forEach(i=>i(t)),this.iMouseUsed){const i=this.container.getBoundingClientRect();this.mouse=he(i,this.width,this.height),this.mouseNormalized=le(i),ce()}this.buffers.forEach(i=>{i&&(e.viewport(0,0,this.width,this.height),i.draw(this.time,this.canvas.width,this.canvas.height))}),e.viewport(0,0,this.width,this.height),e.clear(e.COLOR_BUFFER_BIT),this.draw(this.time,this.canvas.width,this.canvas.height),this.drawOneFrame=!1}update(t){this.allShadersCompiled&&(this._ready||(this._ready=!0,this.readyFuncs.forEach(e=>e()),this.readyFuncs=[],this.iMouseUsed&&ae(document.body)))}destruct(){cancelAnimationFrame(this.animationRequestId),super.destruct(),this.resizeObserver.disconnect(),this.container.removeChild(this.canvas),this.canvas.replaceWith(this.canvas.cloneNode(!0)),this.buffers.forEach(t=>{t.destruct()}),this.buffers=[],this.tickFuncs=[]}copyCanvas(){const t=this.gl.canvas,i=this.canvas.getContext("2d");i.clearRect(0,0,this.width,this.height),i.drawImage(t,0,t.height-this.height,this.width,this.height,0,0,this.width,this.height)}updateSize(){this.width=this.container.offsetWidth*this.options.pixelRatio|0,this.height=this.container.offsetHeight*this.options.pixelRatio|0,(this.width!==this.canvas.width||this.height!==this.canvas.height)&&(this.canvas.width=this.width,this.canvas.height=this.height,this.drawOneFrame=!0)}drawingLoop(t=0){this.animationRequestId=window.requestAnimationFrame(i=>this.drawingLoop(i)),t/=1e3;const e=this.startTime<0?1/60:t-this.startTime;this.startTime=t>0?t:-1,this.update(e),this.drawThisFrame&&this.drawInstance(e)}}const ue={loop:!1,autoResize:!0,pixelRatio:typeof window<"u"?window.devicePixelRatio:1,useSharedContext:!1,asyncCompile:!0},y=[],O=[];let p,R=-1;class m{constructor(){throw new Error("Use ImageEffectRenderer.createTemporary to create an ImageEffectRenderer")}static createTemporary(n,t,e={}){const i={...ue,...e};if(i.useSharedContext){p||(p=new z,this.drawInstances(0));const s=new N(p,n,t,i);return y.push(s),s}else{const s=O.pop()||new z;return new N(s,n,t,i)}}static releaseTemporary(n){n.options.useSharedContext||O.push(n.gl),n.stop(),n.destruct();const t=y.indexOf(n);t>-1&&y.splice(t,1)}static drawInstances(n=0){window.requestAnimationFrame(o=>this.drawInstances(o)),n/=1e3;const t=R<0?1/60:n-R;R=n;const e=p.canvas,i=p.context,s=y;let a=0,c=0;s.forEach(o=>{o.update(t)}),s.forEach(o=>{o.drawThisFrame&&(a=Math.max(a,o.width),c=Math.max(c,o.height))}),(a>e.width||c>e.height)&&(e.width=a,e.height=c),i.clear(i.COLOR_BUFFER_BIT),s.forEach(o=>{o.drawThisFrame&&(o.drawInstance(t),o.copyCanvas())})}}const me=`#version 300 es
precision highp float;

uniform float iTime;
uniform vec2  iResolution;

in vec2 vScreen;

out vec4 fragColor;


const float _Temporal = 0.25;//value=.25, min=0, max=1, step=0.01
const float _FrequencyY = 2.;//value=2., min=0.1, max=4, step=0.01
const float _SpeedZ = 2.;//value=2., min=0., max=32, step=0.01
const float _RandomSpeed = 6.;//value=6., min=0., max=8, step=0.01
const float _FrequencyZ = 0.01;//value=.01, min=0.0001, max=0.1, step=0.0001

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
  return smoothstep(0.25, 0., abs(d + vec3(0.125, 0., -0.125)));
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
  vec3 dir = ray / max(abs(ray.x), abs(ray.y));
  float r = 0.5;
  float offset = 0.;
  float hue = sin(iTime) * 0.5 + 0.5;


  for (int i = 0; i <4; i++){
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
    p.z *=  _FrequencyZ / (rand.y + 0.05);
    p.z += sin(p.z * 10.);
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

    float outerGlow = smoothstep(0.1, 0., ax - d);
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
  fragColor = vec4(color, 1.0);
}
`;class Q{constructor(n,t={}){this.renderer=m.createTemporary(n,me,{loop:!0,...t})}}const fe=`//
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
`;class d{static loadImages(n){return Promise.all(n.map(t=>d.loadImage(t)))}static loadImage(n){return new Promise(t=>{const e=new Image;t(e),e.src=`./static/${n}`})}}class j{constructor(n,t={}){this.renderer=m.createTemporary(n,fe,t),d.loadImages(["./paddo.jpg"]).then(([e])=>{this.renderer.setImage(0,e,{flipY:!0}),this.renderer.play()})}}const b=`uniform float uMouseDown;

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

  vec2 externalForces = clamp(vec2(iMouseNormalized.xy - iMouseNormalized.zw) * (.4 / max(dot(uv - iMouseNormalized.xy, uv - iMouseNormalized.xy), .05)), -1., 1.);

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
`,de=`// The MIT License
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

  col += newCol * 0.01*distance(iMouseNormalized.xy, iMouseNormalized.zw)/(dot(uv - iMouseNormalized.xy, uv - iMouseNormalized.xy)+0.002);

  col = clamp(0.998 * col - 0.00005, 0., 5.);
  fragColor = vec4(col, 1.);
}

`,xe=`void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord.xy / iResolution.xy;

  vec3 col = 1.-exp(-texture(iChannel0, uv).rgb);
  col = smoothstep(vec3(0), vec3(1), col);

  fragColor = vec4(col, 1);
}
`;class Z{constructor(n,t={}){this.wrapper=n,this.renderer=m.createTemporary(this.wrapper,xe,{loop:!0,...t});const e={type:WebGLRenderingContext.FLOAT,clampX:!1,clampY:!1};this.renderer.setData({buffers:[{index:0,shader:b,options:e,images:[{slotIndex:0,image:{bufferIndex:2}}]},{index:1,shader:b,options:e,images:[{slotIndex:0,image:{bufferIndex:0}}]},{index:2,shader:b,options:e,images:[{slotIndex:0,image:{bufferIndex:1}}]},{index:3,shader:de,options:e,images:[{slotIndex:0,image:{bufferIndex:2}},{slotIndex:1,image:{bufferIndex:3}}]}],images:[{slotIndex:0,image:{bufferIndex:3}}]})}}const pe=`#version 300 es
precision highp float;

#define PI2 6.2831853

uniform float iTime;
uniform vec2 iResolution;
const float Detail = 2.5;// value= 2.5, min=1., max=5., step=0.1

in vec2 vScreen;
out vec4 fragColor;

#define _CameraDist 3.

#define _Saturation 0.37
#define _Color0 vec3(180./255., 205./255., 245./255.)
#define _Color1 vec3(173./255., 215./255., 252./255.)
#define _Color2 vec3(202./255., 204./255., 235./255.)
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
}
`;class J{constructor(n,t={}){this.renderer=m.createTemporary(n,pe,{loop:!0,...t})}}const ve=`const float iFrameStepSize = 1.;// Based on alpha during additive blending
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
`;class M{constructor(n,t={}){this.renderer=m.createTemporary(n,ve,t),d.loadImages(["./growMask.png"]).then(([e])=>{this.renderer.setImage(0,e),this.renderer.setUniformFloat("iFrames",30),this.renderer.play()})}}const ge=`const float iFrameStepSize = 1.;// Based on alpha during additive blending
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
`;class ee{constructor(n,t={}){this.renderer=m.createTemporary(n,ge,t),d.loadImages(["./growMask.png","./paddo.jpg"]).then(([e,i])=>{this.renderer.setImage(0,e),this.renderer.setImage(1,i,{useMips:!0}),this.renderer.setUniformFloat("iFrames",30),this.renderer.play()})}}const ye=`void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord.xy / iResolution.xy;
  uv += .1 * (texture(iChannel1, uv).xy);
  fragColor = texture(iChannel0, uv);
}
`,Ee=`vec3 mouseInput(vec2 uv) {
  vec2 d = uv - iMouseNormalized.xy;
  d.x *= iResolution.x / iResolution.y;
  return vec3((iMouseNormalized.zw-iMouseNormalized.xy) * 20. * smoothstep(.2, 0., length(d)), 0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord.xy / iResolution.xy;

  vec3 oldColor = iFrame <= 1 ? vec3(0) : texture(iChannel0, uv).rgb * 250./255.;
  vec3 newColor = oldColor + mouseInput(uv);

  // newColor -= sign(newColor) * 1./127.;

  fragColor = vec4(newColor, 1);
}
`;class te{constructor(n,t={}){this.wrapper=n,this.renderer=m.createTemporary(this.wrapper,ye,t),this.renderer.createBuffer(0,Ee),this.renderer.buffers[0].setImage(0,this.renderer.buffers[0],{type:WebGLRenderingContext.FLOAT}),this.renderer.setImage(1,this.renderer.buffers[0]),d.loadImages(["./paddo.jpg"]).then(([e])=>{this.renderer.setImage(0,e,{flipY:!0}),this.renderer.play()})}}class Ce{constructor(n,t={}){this.wrapper=n,this.options=t,this.index=0,this.classes=[Q,te,Z,j,M,ee,J],window.setInterval(()=>{this.renderer&&m.releaseTemporary(this.renderer),this.index=(this.index+1)%this.classes.length,this.renderer=new this.classes[this.index](this.wrapper,{...this.options}).renderer},500)}}new M(document.getElementsByClassName("grid-item")[0]);new Q(document.getElementsByClassName("grid-item")[1]);new j(document.getElementsByClassName("grid-item")[2]);new J(document.getElementsByClassName("grid-item")[3]);new Z(document.getElementsByClassName("grid-item")[4]);new ee(document.getElementsByClassName("grid-item")[5]);new te(document.getElementsByClassName("grid-item")[6]);new Ce(document.getElementsByClassName("grid-item")[7],{useSharedContext:!0});new M(document.getElementsByClassName("grid-item")[8],{useSharedContext:!1});
