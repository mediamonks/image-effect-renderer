(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=class{gl;_program;vs;fs;initialized=!1;ext;type=0;vsSource=``;fsSource=``;uniformLocations={};uniformTypes={};attributeLocations={};_compiled=!1;constructor(e,t){this.gl=e;let n=e.context;this.ext=n.getExtension(`KHR_parallel_shader_compile`),this._program=n.createProgram(),this.vs=n.createShader(n.VERTEX_SHADER),this.fs=n.createShader(n.FRAGMENT_SHADER),this.type=this.detectType(t),this.vsSource=this.getVertexShader(this.type),n.shaderSource(this.vs,this.vsSource),n.compileShader(this.vs),this.fsSource=`${this.getFragmentShader(this.type)}${t}`,n.shaderSource(this.fs,this.fsSource),n.compileShader(this.fs),n.attachShader(this._program,this.vs),n.attachShader(this._program,this.fs),n.linkProgram(this._program)}get program(){if(this.initialized)return this._program;this.initialized=!0;let e=this.gl.context,t=e.getShaderParameter(this.vs,e.COMPILE_STATUS);if(!t)throw console.table(this.vsSource.split(`
`)),Error(`ImageEffectRenderer: Vertex shader compilation failed: ${e.getShaderInfoLog(this.vs)}`);if(t=e.getShaderParameter(this.fs,e.COMPILE_STATUS),!t)throw console.table(this.fsSource.split(`
`)),Error(`ImageEffectRenderer: Shader compilation failed: ${e.getShaderInfoLog(this.fs)}`);if(t=e.getProgramParameter(this._program,e.LINK_STATUS),!t)throw Error(`ImageEffectRenderer: Program linking failed: ${e.getProgramInfoLog(this._program)}`);return this._program}get shaderCompiled(){return this._compiled=this._compiled||!this.ext||this.gl.context.getProgramParameter(this._program,this.ext.COMPLETION_STATUS_KHR),this._compiled}use(){this.gl.context.useProgram(this.program)}getUniformLocation(e){return this.uniformLocations[e]===void 0?this.uniformLocations[e]=this.gl.context.getUniformLocation(this._program,e):this.uniformLocations[e]}getAttributeLocation(e){return this.attributeLocations[e]===void 0?(this.gl.context.useProgram(this.program),this.attributeLocations[e]=this.gl.context.getAttribLocation(this._program,e)):this.attributeLocations[e]}getUniformType(e){if(this.uniformTypes[e]!==void 0)return this.uniformTypes[e];let t=this.gl.context,n=t.getProgramParameter(this._program,t.ACTIVE_UNIFORMS);for(let r=0;r<n;r++){let n=t.getActiveUniform(this._program,r);if(n&&n.name===e)return this.uniformTypes[e]=n.type}return this.uniformTypes[e]=null}detectType(e){return/mainImage/gim.exec(e)?0:/^#version[\s]+300[\s]+es[\s]+/gim.exec(e)?3:2}getFragmentShader(e){switch(e){case 0:return`#version 300 es
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
                        `;default:return``}}getVertexShader(e){switch(e){case 0:return`#version 300 es
                    in vec2 aPos;
                    in vec2 aUV;

                    out vec2 vUV0;

                    void main(void) {
                        vUV0 = aUV;
                        gl_Position = vec4(aPos, 0.0, 1.0);
                    }
                `;case 2:return`attribute vec3 aPos;
                attribute vec2 aUV;

                uniform float iAspect;

                varying vec2 vScreen;
                varying vec2 vUV0;

                void main(void) {
                    vUV0 = aUV;
                    vScreen = aPos.xy;
                    vScreen.x *= iAspect;
                    gl_Position = vec4(aPos, 1.0);
                }`;default:return`#version 300 es
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
            `}},t=class{type;name;x=0;y=0;z=0;w=0;matrix;constructor(e,t){this.type=e,this.name=t}},n=class{context;canvas;sharedPrograms={};sharedTextures={};quadVBO;lastQuadVBO=void 0;constructor(e=void 0){this.canvas=e||document.createElement(`canvas`);let t={premultipliedAlpha:!0,alpha:!0,preserveDrawingBuffer:!1,antialias:!1,depth:!1,stencil:!1};if(this.context=this.canvas.getContext(`webgl2`,t),!this.context)throw Error(`Unable to create WebGL2 context.`);this.context.getExtension(`WEBGL_color_buffer_float`),this.context.getExtension(`EXT_color_buffer_float`),this.context.getExtension(`OES_texture_float`),this.context.getExtension(`OES_texture_float_linear`),this.context.getExtension(`KHR_parallel_shader_compile`),this.context.clearColor(0,0,0,0),this.context.clear(this.context.COLOR_BUFFER_BIT),this.context.enable(this.context.BLEND),this.context.blendFunc(this.context.ONE,this.context.ONE_MINUS_SRC_ALPHA),this.quadVBO=this.generateQuad()}drawQuad(e,t){let n=this.context;this.lastQuadVBO!==this.quadVBO&&(this.lastQuadVBO=this.quadVBO,n.bindBuffer(n.ARRAY_BUFFER,this.quadVBO),n.enableVertexAttribArray(e),n.vertexAttribPointer(e,2,n.FLOAT,!1,16,0),n.enableVertexAttribArray(t),n.vertexAttribPointer(t,2,n.FLOAT,!1,16,8)),n.drawArrays(n.TRIANGLE_STRIP,0,4)}getCachedTexture(e,t){let n=`${e}_${t.clampX}_${t.clampY}_${t.useMipmap}`;return this.sharedTextures[e]?this.sharedTextures[n]:this.sharedTextures[n]=this.context.createTexture()}compileShader(t){return this.sharedPrograms[t]?this.sharedPrograms[t]:this.sharedPrograms[t]=new e(this,t)}setTextureParameter(e,t){let n=this.context;n.bindTexture(n.TEXTURE_2D,e),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,t.clampX?n.CLAMP_TO_EDGE:n.REPEAT),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,t.clampY?n.CLAMP_TO_EDGE:n.REPEAT),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MAG_FILTER,t.magFilterLinear?n.LINEAR:n.NEAREST),t.useMipmap?(n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR_MIPMAP_LINEAR),n.generateMipmap(n.TEXTURE_2D)):n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,t.minFilterLinear?n.LINEAR:n.NEAREST)}setCubeMapParameter(e,t){let n=this.context;n.bindTexture(n.TEXTURE_CUBE_MAP,e),n.texParameteri(n.TEXTURE_CUBE_MAP,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_CUBE_MAP,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_CUBE_MAP,n.TEXTURE_MAG_FILTER,t.magFilterLinear?n.LINEAR:n.NEAREST),t.useMipmap?(n.texParameteri(n.TEXTURE_CUBE_MAP,n.TEXTURE_MIN_FILTER,n.LINEAR_MIPMAP_LINEAR),n.generateMipmap(n.TEXTURE_CUBE_MAP)):n.texParameteri(n.TEXTURE_CUBE_MAP,n.TEXTURE_MIN_FILTER,t.minFilterLinear?n.LINEAR:n.NEAREST)}bindTextures(e){let t=this.context;for(let n=0;n<8;n++){t.activeTexture(t.TEXTURE0+n);let r=e[n];r&&r.buffer?t.bindTexture(t.TEXTURE_2D,r.buffer.src.texture):r&&r.texture?r.isCubemap?t.bindTexture(t.TEXTURE_CUBE_MAP,r.texture):t.bindTexture(t.TEXTURE_2D,r.texture):t.bindTexture(t.TEXTURE_2D,null)}}setUniforms(e,t){let n=this.context;Object.values(e).forEach(e=>{let r=t.getUniformLocation(e.name);if(r!==null)switch(e.type){case 0:n.uniform1i(r,e.x);break;case 1:n.uniform1f(r,e.x);break;case 2:n.uniform2f(r,e.x,e.y);break;case 3:n.uniform3f(r,e.x,e.y,e.z);break;case 4:n.uniform4f(r,e.x,e.y,e.z,e.w);break;case 5:n.uniformMatrix4fv(r,!1,e.matrix);break}})}generateQuad(){let e=this.context,t=new Float32Array([-1,1,0,1,-1,-1,0,0,1,1,1,1,1,-1,1,0]),n=e.createBuffer();return e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,t,e.STATIC_DRAW),n}},r={clampX:!0,clampY:!0,flipY:!1,useMipmap:!0,useCache:!0,minFilterLinear:!0,magFilterLinear:!0},i=class e{width=0;height=0;program;main;gl;frame=0;lastTime=0;mouse=[0,0,0,0];mouseNormalized=[0,0,0,0];uniforms={};textures=[];constructor(e){this.gl=e}get shaderCompiled(){return this.program.shaderCompiled}get iMouseUsed(){return this.program.getUniformLocation(`iMouse`)!==null||this.program.getUniformLocation(`iMouseNormalized`)!==null}setImage(t,n,i={}){if(t>=8)throw Error(`ImageEffectRenderer: A maximum of 8 slots is available, slotIndex is out of bounds.`);if(n instanceof HTMLImageElement){if(!n.complete||n.naturalWidth===0){n.addEventListener(`load`,()=>{this.setImage(t,n,i)},{once:!0});return}}else if(n instanceof HTMLVideoElement&&n.readyState<HTMLMediaElement.HAVE_CURRENT_DATA){n.addEventListener(`loadeddata`,()=>{this.setImage(t,n,i)},{once:!0});return}this.setUniformInt(`iChannel${t}`,t);let a,o;typeof VideoFrame<`u`&&n instanceof VideoFrame?(a=n.displayWidth,o=n.displayHeight):(a=n.width,o=n.height),this.setUniformVec3(`iChannelResolution[${t}]`,a,o,1);let s=this.gl.context,c=this.textures[t];if(n instanceof e){c&&c.texture&&!c.cached&&s.deleteTexture(c.texture);let e={...n.options,...i};this.textures[t]={texture:void 0,buffer:n,cached:!1,isCubemap:!1},this.gl.setTextureParameter(n.src.texture,e),this.gl.setTextureParameter(n.dest.texture,e)}else{let e={...r,...i};e.useCache=e.useCache&&n instanceof HTMLImageElement,e.useCache&&c&&c.texture&&!c.cached&&(s.deleteTexture(c.texture),c.texture=void 0);let a=c&&c.texture;e.useCache&&n instanceof HTMLImageElement&&(a=this.gl.getCachedTexture(n.src,e)),a||=s.createTexture(),this.textures[t]={texture:a,buffer:void 0,cached:e.useCache,isCubemap:!1},s.bindTexture(s.TEXTURE_2D,a),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,+!!i.flipY),s.texImage2D(s.TEXTURE_2D,0,s.RGBA,s.RGBA,s.UNSIGNED_BYTE,n),this.gl.setTextureParameter(a,e)}}setCubeMap(e,t,n={}){if(e>=8)throw Error(`ImageEffectRenderer: A maximum of 8 slots is available, slotIndex is out of bounds.`);if(t.length!==6)throw Error(`ImageEffectRenderer: Cubemap requires exactly 6 face images.`);for(let r=0;r<6;r++){let i=t[r];if(i instanceof HTMLImageElement&&(!i.complete||i.naturalWidth===0)){i.addEventListener(`load`,()=>{this.setCubeMap(e,t,n)},{once:!0});return}}this.setUniformInt(`iChannelCube${e}`,e);let i=t[0],a,o;typeof VideoFrame<`u`&&i instanceof VideoFrame?(a=i.displayWidth,o=i.displayHeight):(a=i.width,o=i.height),this.setUniformVec3(`iChannelResolution[${e}]`,a,o,1);let s=this.gl.context,c=this.textures[e];c&&c.texture&&!c.cached&&s.deleteTexture(c.texture);let l={...r,...n},u=s.createTexture();this.textures[e]={texture:u,buffer:void 0,cached:!1,isCubemap:!0},s.bindTexture(s.TEXTURE_CUBE_MAP,u),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,0);let d=[s.TEXTURE_CUBE_MAP_POSITIVE_X,s.TEXTURE_CUBE_MAP_NEGATIVE_X,s.TEXTURE_CUBE_MAP_POSITIVE_Y,s.TEXTURE_CUBE_MAP_NEGATIVE_Y,s.TEXTURE_CUBE_MAP_POSITIVE_Z,s.TEXTURE_CUBE_MAP_NEGATIVE_Z];for(let e=0;e<6;e++)s.texImage2D(d[e],0,s.RGBA,s.RGBA,s.UNSIGNED_BYTE,t[e]);this.gl.setCubeMapParameter(u,l)}setUniformFloat(e,t){this.setUniform(e,1,t,0,0,0,void 0)}setUniformInt(e,t){this.setUniform(e,0,t,0,0,0,void 0)}setUniformVec2(e,t,n){this.setUniform(e,2,t,n,0,0,void 0)}setUniformVec3(e,t,n,r){this.setUniform(e,3,t,n,r,0,void 0)}setUniformVec4(e,t,n,r,i){this.setUniform(e,4,t,n,r,i,void 0)}setUniformMatrix(e,t){this.setUniform(e,5,0,0,0,0,t)}destruct(){this.textures.forEach(e=>e.texture&&!e.cached&&this.gl.context.deleteTexture(e.texture)),this.textures=[],this.uniforms={}}draw(e=0,t,n){this.width=t|0,this.height=n|0,this.program.use();let r=e-this.lastTime;this.lastTime=e,this.setUniformFloat(`iTime`,e),this.setUniformFloat(`iTimeDelta`,r),this.setUniformInt(`iFrame`,this.frame),this.program.getUniformType(`iResolution`)===this.gl.context.FLOAT_VEC2?this.setUniformVec2(`iResolution`,t,n):this.setUniformVec3(`iResolution`,t,n,1);let i=this.main.mouse;this.setUniformVec4(`iMouse`,i[0],i[1],i[2],i[3]);let a=this.main.mouseNormalized;this.setUniformVec4(`iMouseNormalized`,a[0],a[1],a[2],a[3]);let o=new Date;this.setUniformVec4(`iDate`,o.getFullYear(),o.getMonth(),o.getDate(),o.getHours()*3600+o.getMinutes()*60+o.getSeconds()+o.getMilliseconds()/1e3),this.setUniformFloat(`iSampleRate`,44100),this.setUniformFloat(`iGlobalTime`,e),this.setUniformFloat(`iAspect`,t/n),this.gl.setUniforms(this.uniforms,this.program),this.gl.bindTextures(this.textures),this.gl.drawQuad(this.program.getAttributeLocation(`aPos`),this.program.getAttributeLocation(`aUV`)),this.frame++}setUniform(e,n,r,i,a,o,s){let c=this.uniforms[e];c||=this.uniforms[e]=new t(n,e),c.x=r,c.y=i,c.z=a,c.w=o,c.matrix=s}},a={type:5121,pixelRatio:1,msaa:!1},o=class{width=0;height=0;texture;frameBuffer;options;gl;format=WebGLRenderingContext.RGBA;internalFormat=WebGLRenderingContext.RGBA;constructor(e,t={}){switch(this.gl=e,this.options={...a,...t},this.options.type){case WebGLRenderingContext.UNSIGNED_BYTE:this.internalFormat=WebGL2RenderingContext.RGBA8;break;case WebGLRenderingContext.FLOAT:this.internalFormat=WebGL2RenderingContext.RGBA32F;break}let n=e.context;this.texture=n.createTexture(),this.resize(16,16),this.frameBuffer=n.createFramebuffer(),n.bindFramebuffer(n.FRAMEBUFFER,this.frameBuffer),n.framebufferTexture2D(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,this.texture,0),n.bindFramebuffer(n.FRAMEBUFFER,null)}resize(e,t){if(this.width===(e|0)&&this.height===(t|0))return;this.width=e|0,this.height=t|0;let n=this.gl.context;n.bindTexture(n.TEXTURE_2D,this.texture),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,0),n.texImage2D(n.TEXTURE_2D,0,this.internalFormat,this.width,this.height,0,this.format,this.options.type,null)}destruct(){let e=this.gl.context;this.frameBuffer&&e.deleteFramebuffer(this.frameBuffer),this.texture&&e.deleteTexture(this.texture)}},s={...r,...a,useMipmap:!1,useCache:!1},c=class extends i{options;frameBuffer0;frameBuffer1;constructor(e,t={}){super(e),this.options={...s,...t},this.frameBuffer0=new o(e,this.options),this.frameBuffer1=new o(e,this.options)}get src(){return this.frame%2==0?this.frameBuffer0:this.frameBuffer1}get dest(){return this.frame%2==1?this.frameBuffer0:this.frameBuffer1}draw(e=0,t,n){if(t<=0||n<=0)return;let r=this.gl.context,i=this.dest;i.resize(t,n),r.bindFramebuffer(r.FRAMEBUFFER,i.frameBuffer),r.clear(r.COLOR_BUFFER_BIT),super.draw(e,t,n),r.bindFramebuffer(r.FRAMEBUFFER,null)}destruct(){super.destruct(),this.frameBuffer0.destruct(),this.frameBuffer1.destruct()}},l=0,u=0,d=0,f=0,p=!1,m=!1,h=0,g=0,_=0,v=0,y=!1;function b(e){y||(y=!0,e.addEventListener(`mousemove`,e=>{d=l,f=u,l=e.clientX,u=e.clientY,p&&(_=l,v=u)},{passive:!0}),e.addEventListener(`mousedown`,e=>{e.button===0&&(p=!0,m=!0,h=e.clientX,g=e.clientY,_=e.clientX,v=e.clientY)},{passive:!0}),e.addEventListener(`mouseup`,e=>{e.button===0&&(p=!1)},{passive:!0}))}function x(){m=!1}function S(e){return[(l-e.left)/e.width,1-(u-e.top)/e.height,(d-e.left)/e.width,1-(f-e.top)/e.height]}function C(e,t,n){let r=e.height,i=e.width,a=_-e.left,o=r-(v-e.top),s=h-e.left,c=r-(g-e.top),l=p||h>0?a:0,u=p||g>0?o:0,d=(p?1:-1)*(s>0?s:0),f=(m?1:-1)*(c>0?c:0);return[l/i*t,u/r*n,d/i*t,f/r*n]}var w=class extends i{canvas;buffers=[];options;time=0;tickFuncs=[];readyFuncs=[];startTime=-1;drawOneFrame=!1;container;animationRequestId=0;resizeObserver;_ready=!1;constructor(t,n,r,i){if(super(t),this.options={...i},this.container=n,this.main=this,this.options.useSharedContext){this.canvas=document.createElement(`canvas`);let e=this.canvas.getContext(`2d`);e.fillStyle=`#00000000`,e.clearRect(0,0,this.canvas.width,this.canvas.height)}else this.canvas=this.gl.canvas;Object.assign(this.canvas.style,{inset:`0`,width:`100%`,height:`100%`,margin:`0`,display:`block`}),this.container.appendChild(this.canvas),this.program=new e(this.gl,r),this.resizeObserver=new ResizeObserver(()=>{this.options.autoResize&&this.updateSize()}),this.resizeObserver.observe(n),this.options.useSharedContext||this.drawingLoop(0)}get drawThisFrame(){return(this.options.loop||this.drawOneFrame)&&this.width>0&&this.height>0&&(!this.options.asyncCompile||this.allShadersCompiled)}get iMouseUsed(){return super.iMouseUsed||this.buffers.some(e=>e&&e.iMouseUsed)}get allShadersCompiled(){return this.shaderCompiled&&this.buffers.every(e=>e&&e.shaderCompiled)}play(){this.options.loop=!0}stop(){this.options.loop=!1}createBuffer(e,t,n={}){let r=this.buffers[e];r&&r.destruct();let i=new c(this.gl,n);return i.program=this.gl.compileShader(t),i.main=this,this.buffers[e]=i}tick(e){this.tickFuncs.push(e)}ready(e){this.readyFuncs.push(e)}drawFrame(e=0){this.time=e/1e3,this.drawOneFrame=!0}setData(e){e.buffers&&this.setBuffersData(e.buffers),e.images&&this.setImagesData(e.images),e.cubemaps&&this.setCubeMapsData(e.cubemaps)}setImagesData(e,t=this){e.forEach(e=>{e.image.bufferIndex===void 0?t?.setImage(e.slotIndex,e.image,e.options):t?.setImage(e.slotIndex,this.buffers[e.image.bufferIndex],e.options)})}setBuffersData(e){e.forEach(e=>{this.createBuffer(e.index,e.shader,e.options)}),e.forEach(e=>{e.images&&this.setImagesData(e.images,this.buffers[e.index]),e.cubemaps&&this.setCubeMapsData(e.cubemaps,this.buffers[e.index])})}setCubeMapsData(e,t=this){e.forEach(e=>{t?.setCubeMap(e.slotIndex,e.faces,e.options)})}drawInstance(e){let t=this.gl.context;if(this.drawOneFrame||(this.time+=e),this.tickFuncs.forEach(t=>t(e)),this.iMouseUsed){let e=this.container.getBoundingClientRect();this.mouse=C(e,this.width,this.height),this.mouseNormalized=S(e),x()}this.buffers.forEach(e=>{e&&(t.viewport(0,0,this.width,this.height),e.draw(this.time,this.canvas.width,this.canvas.height))}),t.viewport(0,0,this.width,this.height),t.clear(t.COLOR_BUFFER_BIT),this.draw(this.time,this.canvas.width,this.canvas.height),this.drawOneFrame=!1}update(e){this.allShadersCompiled&&(this._ready||(this._ready=!0,this.readyFuncs.forEach(e=>e()),this.readyFuncs=[],this.iMouseUsed&&b(document.body)))}destruct(){cancelAnimationFrame(this.animationRequestId),super.destruct(),this.resizeObserver.disconnect(),this.container.removeChild(this.canvas),this.canvas.replaceWith(this.canvas.cloneNode(!0)),this.buffers.forEach(e=>{e.destruct()}),this.buffers=[],this.tickFuncs=[]}copyCanvas(){let e=this.gl.canvas,t=this.canvas.getContext(`2d`);t.clearRect(0,0,this.width,this.height),t.drawImage(e,0,e.height-this.height,this.width,this.height,0,0,this.width,this.height)}updateSize(){this.width=this.container.offsetWidth*this.options.pixelRatio|0,this.height=this.container.offsetHeight*this.options.pixelRatio|0,(this.width!==this.canvas.width||this.height!==this.canvas.height)&&(this.canvas.width=this.width,this.canvas.height=this.height,this.drawOneFrame=!0)}drawingLoop(e=0){this.animationRequestId=window.requestAnimationFrame(e=>this.drawingLoop(e)),e/=1e3;let t=this.startTime<0?1/60:e-this.startTime;this.startTime=e>0?e:-1,this.update(t),this.drawThisFrame&&this.drawInstance(t)}},T={loop:!1,autoResize:!0,pixelRatio:typeof window<`u`?window.devicePixelRatio:1,useSharedContext:!1,asyncCompile:!0},E=[],D=[],O,k=-1,A=class{constructor(){throw Error(`Use ImageEffectRenderer.createTemporary to create an ImageEffectRenderer`)}static createTemporary(e,t,r={}){let i={...T,...r};if(i.useSharedContext){O||(O=new n,this.drawInstances(0));let r=new w(O,e,t,i);return E.push(r),r}else return new w(D.pop()||new n,e,t,i)}static releaseTemporary(e){e.options.useSharedContext||D.push(e.gl),e.stop(),e.destruct();let t=E.indexOf(e);t>-1&&E.splice(t,1)}static drawInstances(e=0){window.requestAnimationFrame(e=>this.drawInstances(e)),e/=1e3;let t=k<0?1/60:e-k;k=e;let n=O.canvas,r=O.context,i=E,a=0,o=0;i.forEach(e=>{e.update(t)}),i.forEach(e=>{e.drawThisFrame&&(a=Math.max(a,e.width),o=Math.max(o,e.height))}),(a>n.width||o>n.height)&&(n.width=a,n.height=o),r.clear(r.COLOR_BUFFER_BIT),i.forEach(e=>{e.drawThisFrame&&(e.drawInstance(t),e.copyCanvas())})}},j=`#version 300 es
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
`,M=class{constructor(e,t={}){this.renderer=A.createTemporary(e,j,{loop:!0,...t})}},N=`//
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
`,P=class e{static loadImages(t){return Promise.all(t.map(t=>e.loadImage(t)))}static loadImage(e){return new Promise(t=>{let n=new Image;t(n),n.src=`./static/${e}`})}},F=class{constructor(e,t={}){this.renderer=A.createTemporary(e,N,t),P.loadImages([`./paddo.jpg`]).then(([e])=>{this.renderer.setImage(0,e,{flipY:!0}),this.renderer.play()})}},I=`uniform float uMouseDown;

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
`,L=`// The MIT License
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

`,R=`void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord.xy / iResolution.xy;

  vec3 col = 1.-exp(-texture(iChannel0, uv).rgb);
  col = smoothstep(vec3(0), vec3(1), col);

  fragColor = vec4(col, 1);
}
`,z=class{constructor(e,t={}){this.wrapper=e,this.renderer=A.createTemporary(this.wrapper,R,{loop:!0,...t});let n={type:WebGLRenderingContext.FLOAT,clampX:!1,clampY:!1};this.renderer.setData({buffers:[{index:0,shader:I,options:n,images:[{slotIndex:0,image:{bufferIndex:2}}]},{index:1,shader:I,options:n,images:[{slotIndex:0,image:{bufferIndex:0}}]},{index:2,shader:I,options:n,images:[{slotIndex:0,image:{bufferIndex:1}}]},{index:3,shader:L,options:n,images:[{slotIndex:0,image:{bufferIndex:2}},{slotIndex:1,image:{bufferIndex:3}}]}],images:[{slotIndex:0,image:{bufferIndex:3}}]})}},B=`#version 300 es
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
`,V=class{constructor(e,t={}){this.renderer=A.createTemporary(e,B,{loop:!0,...t})}},H=`const float iFrameStepSize = 1.;// Based on alpha during additive blending
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
`,U=class{constructor(e,t={}){this.renderer=A.createTemporary(e,H,t),P.loadImages([`./growMask.png`]).then(([e])=>{this.renderer.setImage(0,e),this.renderer.setUniformFloat(`iFrames`,30),this.renderer.play()})}},W=`const float iFrameStepSize = 1.;// Based on alpha during additive blending
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
`,G=class{constructor(e,t={}){this.renderer=A.createTemporary(e,W,t),P.loadImages([`./growMask.png`,`./paddo.jpg`]).then(([e,t])=>{this.renderer.setImage(0,e),this.renderer.setImage(1,t,{useMips:!0}),this.renderer.setUniformFloat(`iFrames`,30),this.renderer.play()})}},K=`void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord.xy / iResolution.xy;
  uv += .1 * (texture(iChannel1, uv).xy);
  fragColor = texture(iChannel0, uv);
}
`,q=`vec3 mouseInput(vec2 uv) {
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
`,J=class{constructor(e,t={}){this.wrapper=e,this.renderer=A.createTemporary(this.wrapper,K,t),this.renderer.createBuffer(0,q),this.renderer.buffers[0].setImage(0,this.renderer.buffers[0],{type:WebGLRenderingContext.FLOAT}),this.renderer.setImage(1,this.renderer.buffers[0]),P.loadImages([`./paddo.jpg`]).then(([e])=>{this.renderer.setImage(0,e,{flipY:!0}),this.renderer.play()})}},Y=class{constructor(e,t={}){this.wrapper=e,this.options=t,this.index=0,this.classes=[M,J,z,F,U,G,V],window.setInterval(()=>{this.renderer&&A.releaseTemporary(this.renderer),this.index=(this.index+1)%this.classes.length,this.renderer=new this.classes[this.index](this.wrapper,{...this.options}).renderer},500)}};new U(document.getElementsByClassName(`grid-item`)[0]),new M(document.getElementsByClassName(`grid-item`)[1]),new F(document.getElementsByClassName(`grid-item`)[2]),new V(document.getElementsByClassName(`grid-item`)[3]),new z(document.getElementsByClassName(`grid-item`)[4]),new G(document.getElementsByClassName(`grid-item`)[5]),new J(document.getElementsByClassName(`grid-item`)[6]),new Y(document.getElementsByClassName(`grid-item`)[7],{useSharedContext:!0}),new U(document.getElementsByClassName(`grid-item`)[8],{useSharedContext:!1});