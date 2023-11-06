(()=>{"use strict";var e,t;!function(e){e[e.SHADERTOY_WEBGL=0]="SHADERTOY_WEBGL",e[e.SHADERTOY_WEBGL2=1]="SHADERTOY_WEBGL2",e[e.ONESHADER_WEBGL=2]="ONESHADER_WEBGL",e[e.ONESHADER_WEBGL2=3]="ONESHADER_WEBGL2"}(e=e||(e={}));class r{constructor(t,r){this.initialized=!1,this.type=e.SHADERTOY_WEBGL,this.vsSource="",this.fsSource="",this.uniformLocations={},this.attributeLocations={},this._shaderCompiled=!1,this.gl=t;const n=t.context;this.ext=n.getExtension("KHR_parallel_shader_compile"),this._program=n.createProgram(),this.vs=n.createShader(n.VERTEX_SHADER),this.fs=n.createShader(n.FRAGMENT_SHADER),this.type=this.detectType(r),this.vsSource=this.getVertexShader(this.type),n.shaderSource(this.vs,this.vsSource),n.compileShader(this.vs),this.fsSource=`${this.getFragmentShader(this.type)}${r}`,n.shaderSource(this.fs,this.fsSource),n.compileShader(this.fs),n.attachShader(this._program,this.vs),n.attachShader(this._program,this.fs),n.linkProgram(this._program)}get program(){if(this.initialized)return this._program;this.initialized=!0;const e=this.gl.context;let t=e.getShaderParameter(this.vs,e.COMPILE_STATUS);if(!t)throw console.table(this.vsSource.split("\n")),new Error(`ImageEffectRenderer: Vertex shader compilation failed: ${e.getShaderInfoLog(this.vs)}`);if(t=e.getShaderParameter(this.fs,e.COMPILE_STATUS),!t)throw console.table(this.fsSource.split("\n")),new Error(`ImageEffectRenderer: Shader compilation failed: ${e.getShaderInfoLog(this.fs)}`);if(t=e.getProgramParameter(this._program,e.LINK_STATUS),!t)throw new Error(`ImageEffectRenderer: Program linking failed: ${e.getProgramInfoLog(this._program)}`);return this._program}get shaderCompiled(){return this._shaderCompiled=this._shaderCompiled||!this.ext||this.gl.context.getProgramParameter(this._program,this.ext.COMPLETION_STATUS_KHR),this._shaderCompiled}use(){this.gl.context.useProgram(this.program)}getUniformLocation(e){return void 0!==this.uniformLocations[e]?this.uniformLocations[e]:this.uniformLocations[e]=this.gl.context.getUniformLocation(this._program,e)}getAttributeLocation(e){return void 0!==this.attributeLocations[e]?this.attributeLocations[e]:(this.gl.context.useProgram(this.program),this.attributeLocations[e]=this.gl.context.getAttribLocation(this._program,e))}detectType(t){return/mainImage/gim.exec(t)?this.gl.isWebGL2?e.SHADERTOY_WEBGL2:e.SHADERTOY_WEBGL:/^#version[\s]+300[\s]+es[\s]+/gim.exec(t)?e.ONESHADER_WEBGL2:e.ONESHADER_WEBGL}getFragmentShader(t){switch(t){case e.SHADERTOY_WEBGL:return`precision highp float;\n\n                        ${this.getUniformShader()}\n\n                        varying vec2 vUV0;\n                        void mainImage(out vec4, vec2);\n\n                        vec4 texture(sampler2D tex, vec2 uv) {\n                            return texture2D(tex, uv);\n                        }\n\n                        void main(void) {\n                              gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n                              mainImage(gl_FragColor, vUV0 * iResolution.xy);\n                        }\n                        `;case e.SHADERTOY_WEBGL2:return`#version 300 es\n                        precision highp float;\n\n                        ${this.getUniformShader()}\n\n                        in vec2 vUV0;\n                        out vec4 outFragColor;\n\n                        void mainImage(out vec4, vec2);\n\n                        vec4 texture2D(sampler2D tex, vec2 uv) {\n                            return texture(tex, uv);\n                        }\n\n                        void main(void) {\n                            outFragColor = vec4(0.0, 0.0, 0.0, 1.0);\n                            mainImage(outFragColor, vUV0 * iResolution.xy);\n                        }\n                        `;default:return""}}getVertexShader(t){switch(t){case e.SHADERTOY_WEBGL:return"attribute vec2 aPos;\n                    attribute vec2 aUV;\n\n                    varying vec2 vUV0;\n\n                    void main(void) {\n                        vUV0 = aUV;\n                        gl_Position = vec4(aPos, 0.0, 1.0);\n                    }\n                ";case e.SHADERTOY_WEBGL2:return"#version 300 es\n                    in vec2 aPos;\n                    in vec2 aUV;\n\n                    out vec2 vUV0;\n\n                    void main(void) {\n                        vUV0 = aUV;\n                        gl_Position = vec4(aPos, 0.0, 1.0);\n                    }\n                ";case e.ONESHADER_WEBGL:return"attribute vec3 aPos;\n                attribute vec2 aUV;\n\n                uniform float iAspect;\n\n                varying vec2 vScreen;\n                varying vec2 vUV0;\n\n                void main(void) {\n                    vUV0 = aUV;\n                    vScreen = aPos.xy;\n                    vScreen.x *= iAspect;\n                    gl_Position = vec4(aPos, 1.0);\n                }";case e.ONESHADER_WEBGL2:default:return"#version 300 es\n                in  vec3 aPos;\n                in vec2 aUV;\n\n                uniform float iAspect;\n\n                out vec2 vScreen;\n                out vec2 vUV0;\n\n                void main(void) {\n                    vUV0 = aUV;\n                    vScreen = aPos.xy;\n                    vScreen.x *= iAspect;\n                    gl_Position = vec4(aPos, 1.0);\n                }"}}getUniformShader(){return"\n            uniform vec2 iResolution;\n            uniform float iTime;\n            uniform float iGlobalTime;\n            uniform int iFrame;\n            uniform vec4 iMouse;\n\n            uniform highp sampler2D iChannel0;\n            uniform highp sampler2D iChannel1;\n            uniform highp sampler2D iChannel2;\n            uniform highp sampler2D iChannel3;\n\n            uniform vec2 iChannelResolution0;\n            uniform vec2 iChannelResolution1;\n            uniform vec2 iChannelResolution2;\n            uniform vec2 iChannelResolution3;\n            "}}!function(e){e[e.INT=0]="INT",e[e.FLOAT=1]="FLOAT",e[e.VEC2=2]="VEC2",e[e.VEC3=3]="VEC3",e[e.VEC4=4]="VEC4",e[e.MATRIX=5]="MATRIX"}(t=t||(t={}));class n{constructor(e,t){this.x=0,this.y=0,this.z=0,this.w=0,this.type=e,this.name=t}}class i{constructor(e=void 0){this.isWebGL2=!0,this.lastQuadVBO=void 0,this.sharedPrograms={},this.sharedTextures={},this.canvas=e||document.createElement("canvas");const t={premultipliedAlpha:!0,alpha:!0,preserveDrawingBuffer:!1,antialias:!1,depth:!1,stencil:!1};this.context=this.canvas.getContext("webgl2",t),this.context||(this.context=this.canvas.getContext("webgl",t),this.isWebGL2=!1),this.context.getExtension("WEBGL_color_buffer_float"),this.context.getExtension("EXT_color_buffer_float"),this.context.getExtension("OES_texture_float"),this.context.getExtension("OES_texture_float_linear"),this.context.getExtension("KHR_parallel_shader_compile"),this.context.clearColor(0,0,0,0),this.context.clear(this.context.COLOR_BUFFER_BIT),this.context.enable(this.context.BLEND),this.context.blendFunc(this.context.ONE,this.context.ONE_MINUS_SRC_ALPHA),this.quadVBO=this.generateQuad()}generateQuad(){const e=this.context,t=new Float32Array([-1,1,0,1,-1,-1,0,0,1,1,1,1,1,-1,1,0]),r=e.createBuffer();return e.bindBuffer(e.ARRAY_BUFFER,r),e.bufferData(e.ARRAY_BUFFER,t,e.STATIC_DRAW),r}drawQuad(e,t){const r=this.context;this.lastQuadVBO!==this.quadVBO&&(this.lastQuadVBO=this.quadVBO,r.bindBuffer(r.ARRAY_BUFFER,this.quadVBO),r.enableVertexAttribArray(e),r.vertexAttribPointer(e,2,r.FLOAT,!1,16,0),r.enableVertexAttribArray(t),r.vertexAttribPointer(t,2,r.FLOAT,!1,16,8)),r.drawArrays(r.TRIANGLE_STRIP,0,4)}getCachedTexture(e,t){const r=`${e}_${t.clampX}_${t.clampY}_${t.useMipmap}`;return this.sharedTextures[e]?this.sharedTextures[r]:this.sharedTextures[r]=this.context.createTexture()}compileShader(e){return this.sharedPrograms[e]?this.sharedPrograms[e]:this.sharedPrograms[e]=new r(this,e)}setTextureParameter(e,t){const r=this.context;r.bindTexture(r.TEXTURE_2D,e),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,t.clampX?r.CLAMP_TO_EDGE:r.REPEAT),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,t.clampY?r.CLAMP_TO_EDGE:r.REPEAT),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.LINEAR),t.useMipmap?(r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR_MIPMAP_LINEAR),r.generateMipmap(r.TEXTURE_2D)):r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR)}bindTextures(e){const t=this.context;for(let r=0;r<8;r++){t.activeTexture(t.TEXTURE0+r);const n=e[r];n&&n.buffer?t.bindTexture(t.TEXTURE_2D,n.buffer.src.texture):n&&n.texture?t.bindTexture(t.TEXTURE_2D,n.texture):t.bindTexture(t.TEXTURE_2D,null)}}setUniforms(e,r){const n=this.context;Object.values(e).forEach((e=>{const i=r.getUniformLocation(e.name);if(null!==i)switch(e.type){case t.INT:n.uniform1i(i,e.x);break;case t.FLOAT:n.uniform1f(i,e.x);break;case t.VEC2:n.uniform2f(i,e.x,e.y);break;case t.VEC3:n.uniform3f(i,e.x,e.y,e.z);break;case t.VEC4:n.uniform4f(i,e.x,e.y,e.z,e.w);break;case t.MATRIX:n.uniformMatrix4fv(i,!1,e.matrix)}}))}}class s{constructor(e){this.width=0,this.height=0,this.frame=0,this.uniforms={},this.textures=[],this.gl=e}reset(){this.frame=0,this.width=this.height=0,this.uniforms={}}setImage(e,t,r={}){if(e>=8)throw new Error("ImageEffectRenderer: A maximum of 8 slots is available, slotIndex is out of bounds.");this.setUniformInt(`iChannel${e}`,e),this.setUniformVec2(`iChannelResolution${e}`,t.width,t.height);const n=this.gl.context,i=this.textures[e];if(t instanceof s){i&&i.texture&&!i.cached&&n.deleteTexture(i.texture);const s={...t.options,...r};this.textures[e]={texture:void 0,buffer:t,cached:!1},this.gl.setTextureParameter(t.src.texture,s),this.gl.setTextureParameter(t.dest.texture,s)}else{const o={...s.defaultImageOptions,...r};o.useCache=o.useCache&&t instanceof HTMLImageElement,o.useCache&&i&&i.texture&&!i.cached&&(n.deleteTexture(i.texture),i.texture=void 0);let a=i&&i.texture;o.useCache&&t instanceof HTMLImageElement&&(a=this.gl.getCachedTexture(t.src,o)),a||(a=n.createTexture()),this.textures[e]={texture:a,buffer:void 0,cached:o.useCache},n.bindTexture(n.TEXTURE_2D,a),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,r.flipY?1:0),n.texImage2D(n.TEXTURE_2D,0,n.RGBA,n.RGBA,n.UNSIGNED_BYTE,t),this.gl.setTextureParameter(a,o)}}setUniform(e,t,r,i,s,o,a){let h=this.uniforms[e];h||(h=this.uniforms[e]=new n(t,e)),h.x=r,h.y=i,h.z=s,h.w=o,h.matrix=a}setUniformFloat(e,r){this.setUniform(e,t.FLOAT,r,0,0,0,void 0)}setUniformInt(e,r){this.setUniform(e,t.INT,r,0,0,0,void 0)}setUniformVec2(e,r,n){this.setUniform(e,t.VEC2,r,n,0,0,void 0)}setUniformVec3(e,r,n,i){this.setUniform(e,t.VEC3,r,n,i,0,void 0)}setUniformVec4(e,r,n,i,s){this.setUniform(e,t.VEC4,r,n,i,s,void 0)}setUniformMatrix(e,r){this.setUniform(e,t.MATRIX,0,0,0,0,r)}draw(e=0,t,r){this.width=0|t,this.height=0|r,this.program.use(),this.setUniformFloat("iGlobalTime",e),this.setUniformFloat("iTime",e),this.setUniformInt("iFrame",this.frame),this.setUniformFloat("iAspect",t/r),this.setUniformVec2("iResolution",t,r),this.gl.setUniforms(this.uniforms,this.program),this.gl.bindTextures(this.textures),this.gl.drawQuad(this.program.getAttributeLocation("aPos"),this.program.getAttributeLocation("aUV")),this.frame++}get shaderCompiled(){return this.program.shaderCompiled}destruct(){const e=this.gl.context;Object.values(this.textures).forEach((t=>{t.texture&&!t.cached&&e.deleteTexture(t.texture)})),this.textures=[],this.uniforms={}}}s.defaultImageOptions={clampX:!0,clampY:!0,flipY:!1,useMipmap:!0,useCache:!0};class o{constructor(e,t=WebGLRenderingContext.UNSIGNED_BYTE){if(this.width=0,this.height=0,this.format=WebGLRenderingContext.RGBA,this.internalFormat=WebGLRenderingContext.RGBA,this.type=WebGLRenderingContext.UNSIGNED_BYTE,this.gl=e,this.type=t,e.isWebGL2)switch(t){case WebGLRenderingContext.UNSIGNED_BYTE:this.internalFormat=WebGL2RenderingContext.RGBA8;break;case WebGLRenderingContext.FLOAT:this.internalFormat=WebGL2RenderingContext.RGBA32F}else this.internalFormat=this.format;const r=e.context;this.texture=r.createTexture(),this.resize(16,16),this.frameBuffer=r.createFramebuffer(),r.bindFramebuffer(r.FRAMEBUFFER,this.frameBuffer),r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,this.texture,0),r.bindFramebuffer(r.FRAMEBUFFER,null)}resize(e,t){if(this.width===(0|e)&&this.height===(0|t))return;this.width=0|e,this.height=0|t;const r=this.gl.context;r.bindTexture(r.TEXTURE_2D,this.texture),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,0),this.gl.isWebGL2?r.texImage2D(r.TEXTURE_2D,0,this.internalFormat,this.width,this.height,0,this.format,this.type,null):r.texImage2D(r.TEXTURE_2D,0,this.format,this.width,this.height,0,this.format,this.type,null)}destruct(){const e=this.gl.context;this.frameBuffer&&e.deleteFramebuffer(this.frameBuffer),this.texture&&e.deleteTexture(this.texture)}}class a extends s{constructor(e,t={}){super(e),this.options={...a.defaultBufferOptions,...t},this.frameBuffer0=new o(e,this.options.type),this.frameBuffer1=new o(e,this.options.type)}draw(e=0,t,r){if(t<=0||r<=0)return;const n=this.gl.context,i=this.dest;i.resize(t,r),n.bindFramebuffer(n.FRAMEBUFFER,i.frameBuffer),n.clear(n.COLOR_BUFFER_BIT),super.draw(e,t,r),n.bindFramebuffer(n.FRAMEBUFFER,null)}get src(){return this.frame%2==0?this.frameBuffer0:this.frameBuffer1}get dest(){return this.frame%2==1?this.frameBuffer0:this.frameBuffer1}destruct(){super.destruct(),this.frameBuffer0.destruct(),this.frameBuffer1.destruct()}}a.defaultBufferOptions={...s.defaultImageOptions,useMipmap:!1,useCache:!1,type:WebGLRenderingContext.UNSIGNED_BYTE};class h extends s{constructor(e,t,n,i={}){super(e),this.buffers=[],this.tickFuncs=[],this.readyFuncs=[],this.startTime=-1,this.time=0,this.drawOneFrame=!1,this.animationRequestId=0,this._ready=!1,this.options={...l.defaultOptions,...i},this.index=h.index++,this.container=t,this.options.useSharedContext?(this.canvas=document.createElement("canvas"),this.canvas.getContext("2d").fillStyle="#00000000"):this.canvas=this.gl.canvas,this.canvas.style.width="100%",this.canvas.style.height="100%",this.container.appendChild(this.canvas),this.program=new r(this.gl,n),this.resizeObserver=new ResizeObserver((()=>{this.options.autoResize&&this.updateSize()})),this.resizeObserver.observe(t),this.options.useSharedContext||this.drawingLoop(0)}play(){this.options.loop=!0}stop(){this.options.loop=!1}createBuffer(e,t,r={}){const n=this.buffers[e];n&&n.destruct();const i=new a(this.gl,r);return i.program=this.gl.compileShader(t),this.buffers[e]=i}updateSize(){this.width=this.container.offsetWidth*this.options.pixelRatio|0,this.height=this.container.offsetHeight*this.options.pixelRatio|0,this.width===this.canvas.width&&this.height===this.canvas.height||(this.canvas.width=this.width,this.canvas.height=this.height,this.drawOneFrame=!0)}tick(e){this.tickFuncs.push(e)}ready(e){this.readyFuncs.push(e)}get drawThisFrame(){return(this.options.loop||this.drawOneFrame)&&this.width>0&&this.height>0&&(!this.options.asyncCompile||this.allShadersCompiled)}get allShadersCompiled(){return this.shaderCompiled&&this.buffers.every((e=>e&&e.shaderCompiled))}update(e){this.allShadersCompiled&&(this._ready||(this._ready=!0,this.readyFuncs.forEach((e=>e())),this.readyFuncs=[]))}drawFrame(e=0){this.time=e/1e3,this.drawOneFrame=!0}drawingLoop(e){this.animationRequestId=window.requestAnimationFrame((e=>this.drawingLoop(e)));const t=this.startTime<0?1/60:e-this.startTime;this.startTime=e>0?e:-1,this.update(e),this.drawThisFrame&&this.drawInstance(t)}drawInstance(e){const t=this.gl.context;this.drawOneFrame||(this.time+=e/1e3),this.tickFuncs.forEach((e=>e())),this.buffers.forEach((e=>{e&&(t.viewport(0,0,this.width,this.height),e.draw(this.time,this.canvas.width,this.canvas.height))})),t.viewport(0,0,this.width,this.height),t.clear(t.COLOR_BUFFER_BIT),this.draw(this.time,this.canvas.width,this.canvas.height),this.drawOneFrame=!1}destruct(){cancelAnimationFrame(this.animationRequestId),super.destruct(),this.resizeObserver.disconnect(),this.container.removeChild(this.canvas),this.canvas.replaceWith(this.canvas.cloneNode(!0)),this.buffers.forEach((e=>{e.destruct()})),this.buffers=[],this.tickFuncs=[]}copyCanvas(){const e=this.gl.canvas,t=this.canvas.getContext("2d");t.clearRect(0,0,this.width,this.height),t.drawImage(e,0,0,this.width,this.height,0,0,this.width,this.height)}}h.index=0;const c=h;class u{constructor(){throw new Error("Use ImageEffectRenderer.createTemporary to create an ImageEffectRenderer")}static createTemporary(e,t,r={}){const n={...u.defaultOptions,...r};if(n.useSharedContext){u.sharedInstance||(u.sharedInstance=new i,this.drawInstances(0));const r=new c(u.sharedInstance,e,t,n);return this.poolInUse.push(r),r}{const r=u.poolWebGLInstance.pop()||new i;return new c(r,e,t,n)}}static releaseTemporary(e){e.options.useSharedContext||this.poolWebGLInstance.push(e.gl),e.stop(),e.destruct();const t=u.poolInUse.indexOf(e);t>-1&&u.poolInUse.splice(t,1)}static drawInstances(e){window.requestAnimationFrame((e=>this.drawInstances(e)));const t=u.sharedTime<0?1/60:e-u.sharedTime;u.sharedTime=e;const r=u.sharedInstance.canvas,n=u.sharedInstance.context,i=u.poolInUse;let s=0,o=0;i.forEach((t=>{t.update(e)})),i.forEach((e=>{e.drawThisFrame&&(s=Math.max(s,e.width),o=Math.max(o,e.height))})),(s>r.width||o>r.height)&&(r.width=s,r.height=o),n.clear(n.COLOR_BUFFER_BIT),i.forEach((e=>{e.drawThisFrame&&(e.drawInstance(t),e.copyCanvas())}))}}u.defaultOptions={loop:!1,autoResize:!0,pixelRatio:window.devicePixelRatio,useSharedContext:!0,asyncCompile:!0},u.poolInUse=[],u.poolWebGLInstance=[],u.sharedTime=-1;const l=u;class m{constructor(e,t={}){this.renderer=l.createTemporary(e,"#version 300 es\r\nprecision highp float;\r\n\r\nuniform float iTime;\r\nuniform vec2  iResolution;\r\n\r\nin vec2 vScreen;\r\n\r\nout vec4 fragColor;\r\n\r\n\r\nconst float _Temporal = 0.25;    //value=.25, min=0, max=1, step=0.01\r\nconst float _FrequencyY = 2.;    //value=2., min=0.1, max=4, step=0.01\r\nconst float _SpeedZ = 2.;    //value=2., min=0., max=32, step=0.01\r\nconst float _RandomSpeed = 6.;    //value=6., min=0., max=8, step=0.01\r\nconst float _FrequencyZ = 0.01;    //value=.01, min=0.0001, max=0.1, step=0.0001\r\n\r\nconst float PI2 = 6.2831853;\r\n\r\n\r\nvec3 hash31(float p)\r\n{\r\n    vec3 p3 = fract(p * vec3(.1031, .1030, .0973));\r\n    p3 += dot(p3, p3.yzx+19.19);\r\n    return fract((p3.xxy+p3.yzz)*p3.zyx);\r\n}\r\n\r\nvec2 hash21(float p)\r\n{\r\n    vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));\r\n    p3 += dot(p3, p3.yzx + 33.33);\r\n    return fract((p3.xx+p3.yz)*p3.zy);\r\n\r\n}\r\n\r\n\r\nvec3 spectrum(in float d)\r\n{\r\n    return smoothstep(0.25, 0., abs(d + vec3(0.125,0.,-0.125)));\r\n    //return smoothstep(0.25, 0., abs(d + vec3(0.125,0.,-0.125)));\r\n    //return sin((vec3(0, 1. ,2) / 3. + d) * PI2) * 0.5 + 0.5;\r\n}\r\n\r\nfloat aa(float x)\r\n{\r\n    float dx = fwidth(x);\r\n    return smoothstep(dx, 0., x);\r\n}\r\n\r\nfloat aaa(float x)\r\n{\r\n    float dx = fwidth(x);\r\n    return smoothstep(-dx, 0., x) * smoothstep(dx, 0., x);\r\n}\r\n\r\nvoid main() {\r\n    vec3 color = vec3(0.);\r\n    float z = iTime * _SpeedZ;\r\n    float zOffset = z * _RandomSpeed;\r\n    vec2 uv = vScreen * .5;\r\n    uv.x = abs(uv.x);\r\n    uv.y = abs(uv.y);\r\n\r\n    vec3 ray = normalize(vec3(uv, 1.5));\r\n    float l = length(ray.xy);\r\n    bool isX =  abs(ray.x) > abs(ray.y);\r\n    vec3 dir = ray / max(abs(ray.x),abs(ray.y)) ;\r\n    float r = 0.5;\r\n    float offset = 0.;\r\n    float hue = sin(iTime) * 0.5 + 0.5;\r\n\r\n\r\n    for(int i = 0; i <4; i++){\r\n        vec3 hit = dir * r++;\r\n        vec3 p = hit;\r\n        p.z += z;\r\n\r\n        float phase = isX? hit.y : hit.x;\r\n        offset += 2.4;\r\n        phase += sin(iTime * _Temporal + offset);\r\n        phase += sin(phase * 6.) * 0.5;\r\n        phase *= _FrequencyY;\r\n\r\n        vec3 rand = hash31(floor(phase));\r\n\r\n        //z animation\r\n        p.z += rand.x * zOffset;\r\n        p.z += float(i) * 10.;\r\n        //frequency in z\r\n        p.z *=\t_FrequencyZ / (rand.y + 0.05);\r\n        p.z += sin( p.z * 10.);\r\n        // p.z += cos( p.z * 17.) * 0.5;\r\n        vec2 cell = fract(vec2(phase, p.z)) - 0.5;\r\n\r\n        float cellID = floor(p.z);\r\n        vec2 cellRand = hash21(cellID);\r\n        float ax = abs(cell.x);\r\n        float ay = abs(cell.y);\r\n        float fx = fwidth(ax) * 1.;\r\n        float fy = fwidth(ay) * 1.;\r\n\r\n        //float d = 0.45;\r\n        float d = 0.1 + cellRand.y * 0.3;\r\n        float outer = smoothstep(fx, 0., ax - d + fx) * smoothstep(fy, 0., ay - d + fy);\r\n        float inner = smoothstep(fx, 0., ax -d + fx * 2.) * smoothstep(fy, 0., ay - d + fy * 2.);\r\n\r\n        float outerGlow = smoothstep(0.1, 0., ax - d );\r\n        outerGlow *= smoothstep(0.5, 0., ay);\r\n        float b = outer - inner;\r\n        b += outerGlow * 0.25;\r\n        b *= smoothstep(50., 20., hit.z);\r\n        b *= 0.5 + rand.z;\r\n        color += spectrum((cellRand.x - hue) * 0.25) * b;\r\n    }\r\n    //color *= 2.;\r\n    color = sqrt(color);\r\n    color *= 1. - dot(uv, uv);\r\n    fragColor = vec4(color,1.0);\r\n}",{loop:!0,...t})}}class d{static loadImages(e){return Promise.all(e.map((e=>d.loadImage(e))))}static loadImage(e){return new Promise((t=>{const r=new Image;r.onload=()=>t(r),r.src=`./static/${e}`}))}}class f{constructor(e,t={}){this.renderer=l.createTemporary(e,"//\r\n// Description : Array and textureless GLSL 2D simplex noise function.\r\n//      Author : Ian McEwan, Ashima Arts.\r\n//  Maintainer : stegu\r\n//     Lastmod : 20110822 (ijm)\r\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\r\n//               Distributed under the MIT License. See LICENSE file.\r\n//               https://github.com/ashima/webgl-noise\r\n//               https://github.com/stegu/webgl-noise\r\n//\r\n\r\nvec3 mod289(vec3 x) {\r\n    return x - floor(x * (1.0 / 289.0)) * 289.0;\r\n}\r\n\r\nvec2 mod289(vec2 x) {\r\n    return x - floor(x * (1.0 / 289.0)) * 289.0;\r\n}\r\n\r\nvec3 permute(vec3 x) {\r\n    return mod289(((x*34.0)+1.0)*x);\r\n}\r\n\r\nfloat snoise(vec2 v)\r\n{\r\n    const vec4 C = vec4(0.211324865405187, // (3.0-sqrt(3.0))/6.0\r\n                        0.366025403784439, // 0.5*(sqrt(3.0)-1.0)\r\n                        -0.577350269189626, // -1.0 + 2.0 * C.x\r\n                        0.024390243902439);// 1.0 / 41.0\r\n    // First corner\r\n    vec2 i  = floor(v + dot(v, C.yy));\r\n    vec2 x0 = v -   i + dot(i, C.xx);\r\n\r\n    // Other corners\r\n    vec2 i1;\r\n    //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0\r\n    //i1.y = 1.0 - i1.x;\r\n    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\r\n    // x0 = x0 - 0.0 + 0.0 * C.xx ;\r\n    // x1 = x0 - i1 + 1.0 * C.xx ;\r\n    // x2 = x0 - 1.0 + 2.0 * C.xx ;\r\n    vec4 x12 = x0.xyxy + C.xxzz;\r\n    x12.xy -= i1;\r\n\r\n    // Permutations\r\n    i = mod289(i);// Avoid truncation effects in permutation\r\n    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))\r\n    + i.x + vec3(0.0, i1.x, 1.0));\r\n\r\n    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);\r\n    m = m*m;\r\n    m = m*m;\r\n\r\n    // Gradients: 41 points uniformly over a line, mapped onto a diamond.\r\n    // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)\r\n\r\n    vec3 x = 2.0 * fract(p * C.www) - 1.0;\r\n    vec3 h = abs(x) - 0.5;\r\n    vec3 ox = floor(x + 0.5);\r\n    vec3 a0 = x - ox;\r\n\r\n    // Normalise gradients implicitly by scaling m\r\n    // Approximation of: m *= inversesqrt( a0*a0 + h*h );\r\n    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);\r\n\r\n    // Compute final noise value at P\r\n    vec3 g;\r\n    g.x  = a0.x  * x0.x  + h.x  * x0.y;\r\n    g.yz = a0.yz * x12.xz + h.yz * x12.yw;\r\n    return 130.0 * dot(m, g);\r\n}\r\n\r\nfloat rand(vec2 co)\r\n{\r\n    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\r\n}\r\n\r\n\r\nvoid mainImage(out vec4 fragColor, in vec2 fragCoord)\r\n{\r\n    vec2 uv = fragCoord.xy / iResolution.xy;\r\n    float time = iTime * 2.0;\r\n\r\n    // Create large, incidental noise waves\r\n    float noise = max(0.0, snoise(vec2(time, uv.y * 0.3)) - 0.3) * (1.0 / 0.7);\r\n\r\n    // Offset by smaller, constant noise waves\r\n    noise = noise + (snoise(vec2(time*10.0, uv.y * 2.4)) - 0.5) * 0.15;\r\n\r\n    // Apply the noise as x displacement for every line\r\n    float xpos = uv.x - noise * noise * 0.25;\r\n    fragColor = texture(iChannel0, vec2(xpos, uv.y));\r\n\r\n    // Mix in some random interference for lines\r\n    fragColor.rgb = mix(fragColor.rgb, vec3(rand(vec2(uv.y * time))), noise * 0.3).rgb;\r\n\r\n    // Apply a line pattern every 4 pixels\r\n    if (floor(mod(fragCoord.y * 0.25, 2.0)) == 0.0)\r\n    {\r\n        fragColor.rgb *= 1.0 - (0.15 * noise);\r\n    }\r\n\r\n    // Shift green/blue channels (using the red channel)\r\n    fragColor.g = mix(fragColor.r, texture(iChannel0, vec2(xpos + noise * 0.05, uv.y)).g, 0.25);\r\n    fragColor.b = mix(fragColor.r, texture(iChannel0, vec2(xpos - noise * 0.05, uv.y)).b, 0.25);\r\n}\r\n",t),d.loadImages(["./paddo.jpg"]).then((([e])=>{this.renderer.setImage(0,e,{flipY:!0}),this.renderer.play()}))}}const v='uniform vec4 uMouse;\r\nuniform float uMouseDown;\r\n\r\nvoid mainImage(out vec4 fragColor, in vec2 fragCoord) {\r\n    vec2 uv = fragCoord / iResolution.xy;\r\n    const float dt = 0.15;\r\n\r\n    // Simple and Fast Fluids\r\n    // https://hal.inria.fr/inria-00596050/document\r\n\r\n    vec4 me = texture(iChannel0, uv);// x,y velocity, z density, w curl\r\n    vec4 tr = texture(iChannel0, uv + vec2(1./iResolution.x, 0));\r\n    vec4 tl = texture(iChannel0, uv - vec2(1./iResolution.x, 0));\r\n    vec4 tu = texture(iChannel0, uv + vec2(0, 1./iResolution.y));\r\n    vec4 td = texture(iChannel0, uv - vec2(0, 1./iResolution.y));\r\n\r\n    vec3 dx = (tr.xyz - tl.xyz)*0.5;\r\n    vec3 dy = (tu.xyz - td.xyz)*0.5;\r\n    vec2 DdX = vec2(dx.z, dy.z);\r\n\r\n    // Solve for density\r\n    me.z -= dt*dot(vec3(DdX, dx.x + dy.y), me.xyz);\r\n\r\n    // Solve for velocity\r\n    vec2 viscosityForce = 0.55*(tu.xy + td.xy + tr.xy + tl.xy - 4.0*me.xy);\r\n    me.xyw = texture(iChannel0, uv - me.xy*(dt/iResolution.xy)).xyw;\r\n\r\n    vec2 externalForces = clamp(vec2(uMouse.xy - uMouse.zw) * (.4 / max(dot(uv - uMouse.xy, uv - uMouse.xy), .05)), -1., 1.);\r\n\r\n    // Semi−lagrangian advection.\r\n    me.xy += dt*(viscosityForce.xy + externalForces) - 0.2*DdX;\r\n\r\n    // Vorticity refinement, copied from "Chimera\'s Breath" by nimitz 2018 (twitter: @stormoid)\r\n    // https://www.shadertoy.com/view/4tGfDW\r\n    // License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License\r\n    me.w = (tr.y - tl.y - tu.x + td.x);\r\n    vec2 vort = vec2(abs(tu.w) - abs(td.w), abs(tl.w) - abs(tr.w));\r\n    vort *= 0.11/length(vort + 1e-9)*me.w;\r\n    me.xy += vort;\r\n    // end of vorticy refinement\r\n\r\n    // stability\r\n    fragColor = clamp(me, vec4(-10, -10, 0.5, -10.), vec4(10, 10, 3.0, 10.));\r\n}\r\n';class x{constructor(e,t={}){this.wrapper=e,this.renderer=l.createTemporary(this.wrapper,"void mainImage(out vec4 fragColor, in vec2 fragCoord) {\n    vec2 uv = fragCoord.xy / iResolution.xy;\n\n    vec3 col = 1.-exp(-texture(iChannel0, uv).rgb);\n    col = smoothstep(vec3(0), vec3(1), col);\n\n    fragColor = vec4(col, 1);\n}\n",{loop:!0,...t}),this.mouseX=0,this.mouseY=0,this.prevMouseX=0,this.prevMouseY=0,this.renderer.createBuffer(0,v,{type:WebGLRenderingContext.FLOAT,clampX:!1,clampY:!1}),this.renderer.createBuffer(1,v,{type:WebGLRenderingContext.FLOAT,clampX:!1,clampY:!1}),this.renderer.createBuffer(2,v,{type:WebGLRenderingContext.FLOAT,clampX:!1,clampY:!1}),this.renderer.buffers[0].setImage(0,this.renderer.buffers[2]),this.renderer.buffers[1].setImage(0,this.renderer.buffers[0]),this.renderer.buffers[2].setImage(0,this.renderer.buffers[1]),this.renderer.createBuffer(3,"uniform vec4 uMouse;\nuniform float uMouseDown;\n\n// The MIT License\n// Copyright © 2015 Inigo Quilez\n// https://www.shadertoy.com/view/ll2GD3\n\nvec3 pal(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {\n    return a + b*cos(6.28318*(c*t+d));\n}\n\nvoid mainImage(out vec4 fragColor, in vec2 fragCoord) {\n    const float dt = 0.15;\n\n    vec2 uv = fragCoord.xy / iResolution.xy;\n\n    vec2 velocity = texture(iChannel0, uv).xy;\n    vec3 col = texture(iChannel1, uv - (dt*3.)*velocity/iResolution.xy).rgb;\n\n    vec3 newCol = pal(iTime, vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5), vec3(1.0, 1.0, 1.0), vec3(0.0, 0.10, 0.20));\n\n    col += newCol * 0.01*distance(uMouse.xy, uMouse.zw)/(dot(uv - uMouse.xy, uv - uMouse.xy)+0.002);\n\n    col = clamp(0.998 * col - 0.00005, 0., 5.);\n    fragColor = vec4(col, 1.);\n}\n\n",{type:WebGLRenderingContext.FLOAT,clampX:!1,clampY:!1}),this.renderer.buffers[3].setImage(0,this.renderer.buffers[2]),this.renderer.buffers[3].setImage(1,this.renderer.buffers[3]),this.renderer.setImage(0,this.renderer.buffers[3]);const r=this.renderer.canvas;r.onmouseenter=r.onmousemove=e=>{const t=r.getBoundingClientRect(),n=Math.max(0,Math.min(1,(e.clientX-t.left)/t.width)),i=Math.max(0,Math.min(1,(e.clientY-t.top)/t.height));this.prevMouseX=this.mouseX,this.prevMouseY=this.mouseY,this.mouseX=n,this.mouseY=1-i},this.renderer.tick((()=>{this.renderer.buffers[0].setUniformVec4("uMouse",this.mouseX,this.mouseY,this.prevMouseX,this.prevMouseY),this.renderer.buffers[1].setUniformVec4("uMouse",this.mouseX,this.mouseY,this.prevMouseX,this.prevMouseY),this.renderer.buffers[2].setUniformVec4("uMouse",this.mouseX,this.mouseY,this.prevMouseX,this.prevMouseY),this.renderer.buffers[3].setUniformVec4("uMouse",this.mouseX,this.mouseY,this.prevMouseX,this.prevMouseY)}))}}class p{constructor(e,t={}){this.renderer=l.createTemporary(e,"#version 300 es\r\nprecision highp float;\r\n\r\n#define PI2 6.2831853\r\n\r\nuniform float iTime;\r\nuniform vec2  iResolution;\r\nconst float Detail = 2.5; // value= 2.5, min=1., max=5., step=0.1\r\n\r\nin vec2 vScreen;\r\nout vec4 fragColor;\r\n\r\n#define _CameraDist 3.\r\n\r\n#define _Saturation 0.37\r\n#define _Color0 vec3(180./255.,205./255.,245./255.)\r\n#define _Color1 vec3(173./255.,215./255.,252./255.)\r\n#define _Color2 vec3(202./255.,204./255.,235./255.)\r\n#define _NormalStrength 0.75\r\n#define _Frequency 3.5\r\n\r\n#define TemporalFrequency  0.125\r\n#define Falloff  0.525\r\n#define Frequency PI2\r\n\r\n#define m3 mat3(-0.737, 0.456, 0.498, 0, -0.737, 0.675, 0.675, 0.498, 0.544)\r\n\r\nvec3 twistedSineNoise33(vec3 q) {\r\n    q.xy *= vec2(1.8, 1.);\r\n    float a = 1.;\r\n    vec3 sum = vec3(0);\r\n    for (int i = 0; i <4; i++){\r\n        q = m3 * q;\r\n        vec3 s = sin(q.zxy * (1./ a)) * a;\r\n        q += s;\r\n        sum += s;\r\n        a *= Falloff;\r\n    }\r\n    return sum;\r\n}\r\n\r\nvec3 getBgCol(vec3 p) {\r\n    vec3 mn = twistedSineNoise33(p);\r\n    vec3 col = mix(mix(mix(_Color0 * _Color0, _Color1 * _Color1, mn.x), _Color2 * _Color2, mn.z), vec3(1), .5 * mn.y);\r\n    return max(vec3(0), col);\r\n}\r\n\r\nvoid main() {\r\n    vec2 uv = vScreen;\r\n\r\n    vec3 huv = 7. + vec3(uv, iTime * (_Frequency * TemporalFrequency / Detail));\r\n    vec3 hduv = vec3(1./iResolution.x, 1./iResolution.y, 0.);\r\n\r\n    float hdx = (twistedSineNoise33(huv + hduv.xzz).x - twistedSineNoise33(huv - hduv.xzz).x) * (iResolution.x * .5);\r\n    float hdy = (twistedSineNoise33(huv + hduv.zyz).x - twistedSineNoise33(huv - hduv.zyz).x) * (iResolution.x * .5);\r\n\r\n    vec3 normal = normalize(vec3(hdx, hdy, _NormalStrength));\r\n\r\n    vec3 pos = vec3(uv, _CameraDist);\r\n    vec3 rd = normalize(pos);\r\n\r\n    vec3 rf = reflect(-rd, normal);\r\n    vec3 col = getBgCol(rf - vec3(uv * Detail, iTime * TemporalFrequency));\r\n\r\n    vec3 rfr = refract(-rd, normal, 1./1.4);\r\n    col += getBgCol(rfr +  vec3(uv * Detail, iTime * TemporalFrequency));\r\n\r\n    col = sqrt(col * .6);\r\n\r\n    fragColor = vec4(col, 1.0);\r\n}",{loop:!0,...t})}}class g{constructor(e,t={}){this.renderer=l.createTemporary(e,"const float iFrameStepSize = 1.;// Based on alpha during additive blending\nconst float smoothWidth = 4./255.;// 0 - 1 (1./255. = no smoothing, 10./255. = 10 frames smoothing)\n\nuniform float iFrames;\n\nfloat getDelta() {\n    // normally, you will pass delta as an uniform\n    return clamp(mod(iTime * 24., iFrames + 4.) - 2., 0., iFrames) / 255.;\n}\n\nvoid mainImage(out vec4 fragColor, in vec2 fragCoord)\n{\n    vec2 uv = fragCoord/iResolution.xy;\n    uv.y = 1.0 - uv.y;\n\n    float maskGrad = iFrames/255. - texture(iChannel0, uv).r * (1. / iFrameStepSize);\n\n    // normally, you will pass delta as an uniform\n    float delta = getDelta();\n\n    // temp color, you probably want to use texture\n    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0, 2, 4));\n\n    float alpha = smoothstep(maskGrad, maskGrad + smoothWidth, delta * (1.0 + smoothWidth * 255./iFrames));\n\n    fragColor = vec4(col * alpha, 1.0);\n}\n",t),d.loadImages(["./growMask.png"]).then((([e])=>{this.renderer.setImage(0,e),this.renderer.setUniformFloat("iFrames",30),this.renderer.play()}))}}class y{constructor(e,t={}){this.renderer=l.createTemporary(e,"const float iFrameStepSize = 1.;// Based on alpha during additive blending\nconst float smoothWidth = 4./255.;// 0 - 1 (1./255. = no smoothing, 10./255. = 10 frames smoothing)\n\nuniform float iFrames;\n\nfloat getDelta() {\n    // normally, you will pass delta as an uniform\n    return clamp(mod(iTime * 24., iFrames + 4.) - 2., 0., iFrames) / 255.;\n}\n\nvoid mainImage(out vec4 fragColor, in vec2 fragCoord)\n{\n    vec2 uv = fragCoord/iResolution.xy;\n    uv.y = 1.0 - uv.y;\n\n    float maskGrad = iFrames/255. - texture(iChannel0, uv).r * (1. / iFrameStepSize);\n\n    // normally, you will pass delta as an uniform\n    float delta = getDelta();\n\n    vec3 col = texture(iChannel1, uv).rgb;\n\n    float alpha = smoothstep(maskGrad, maskGrad + smoothWidth, delta * (1.0 + smoothWidth * 255./iFrames));\n\n    fragColor = vec4(col * alpha, alpha);\n}\n",t),d.loadImages(["./growMask.png","./paddo.jpg"]).then((([e,t])=>{this.renderer.setImage(0,e),this.renderer.setImage(1,t,{useMips:!0}),this.renderer.setUniformFloat("iFrames",30),this.renderer.play()}))}}class C{constructor(e,t={}){this.wrapper=e,this.renderer=l.createTemporary(this.wrapper,"void mainImage(out vec4 fragColor, in vec2 fragCoord) {\r\n    vec2 uv = fragCoord.xy / iResolution.xy;\r\n    uv += .1 * (texture(iChannel1, uv).xy);\r\n    fragColor = texture(iChannel0, uv);\r\n}\r\n",t),this.mouseDown=!1,this.mouseX=0,this.mouseY=0,this.prevMouseX=0,this.prevMouseY=0,this.renderer.createBuffer(0,"uniform vec4 uMouse;\r\nuniform float uMouseDown;\r\n\r\nvec3 mouseInput(vec2 uv) {\r\n  if (uMouseDown > .5) {\r\n    vec2 d = uv - uMouse.xy;\r\n    d.x *= iResolution.x / iResolution.y;\r\n    return vec3((uMouse.zw-uMouse.xy) * 20. * smoothstep(.2, 0., length(d)), 0);\r\n  } else {\r\n    return vec3(0);\r\n  }\r\n}\r\n\r\nvoid mainImage(out vec4 fragColor, in vec2 fragCoord) {\r\n  vec2 uv = fragCoord.xy / iResolution.xy;\r\n\r\n  vec3 oldColor = iFrame <= 1 ? vec3(0) : texture(iChannel0, uv).rgb * 250./255.;\r\n  vec3 newColor = oldColor + mouseInput(uv);\r\n\r\n  // newColor -= sign(newColor) * 1./127.;\r\n\r\n  fragColor = vec4(newColor, 1);\r\n}\r\n"),this.renderer.buffers[0].setImage(0,this.renderer.buffers[0],{type:WebGLRenderingContext.FLOAT}),this.renderer.setImage(1,this.renderer.buffers[0]);const r=this.renderer.canvas;r.onmousedown=()=>{this.mouseDown=!0},r.onmouseenter=r.onmousemove=e=>{const t=r.getBoundingClientRect(),n=Math.max(0,Math.min(1,(e.clientX-t.left)/t.width)),i=Math.max(0,Math.min(1,(e.clientY-t.top)/t.height));n>=0&&n<=1&&i>=0&&i<=1&&(this.mouseDown?(this.prevMouseX=this.mouseX,this.prevMouseY=this.mouseY):(this.prevMouseX=n,this.prevMouseY=1-i),this.mouseX=n,this.mouseY=1-i)},r.onmouseleave=r.onmouseup=()=>{this.mouseDown=!1},this.renderer.tick((()=>{this.renderer.buffers[0].setUniformVec4("uMouse",this.mouseX,this.mouseY,this.prevMouseX,this.prevMouseY),this.renderer.buffers[0].setUniformFloat("uMouseDown",this.mouseDown?1:0)})),d.loadImages(["./paddo.jpg"]).then((([e])=>{this.renderer.setImage(0,e,{flipY:!0}),this.renderer.play()}))}}new g(document.getElementsByClassName("grid-item")[0]),new m(document.getElementsByClassName("grid-item")[1]),new f(document.getElementsByClassName("grid-item")[2]),new p(document.getElementsByClassName("grid-item")[3]),new x(document.getElementsByClassName("grid-item")[4]),new y(document.getElementsByClassName("grid-item")[5]),new C(document.getElementsByClassName("grid-item")[6]),new class{constructor(e,t={}){this.wrapper=e,this.options=t,this.index=0,this.classes=[m,C,x,f,g,y,p],window.setInterval((()=>{this.renderer&&l.releaseTemporary(this.renderer),this.index=(this.index+1)%this.classes.length,this.renderer=new this.classes[this.index](this.wrapper,{...this.options}).renderer}),500)}}(document.getElementsByClassName("grid-item")[7],{useSharedContext:!1}),new g(document.getElementsByClassName("grid-item")[8],{useSharedContext:!1})})();