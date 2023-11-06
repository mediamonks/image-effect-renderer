# Image Effect Renderer

The image-effect-renderer is lightweight package that allows you to run WebGL fragment shaders in your website using WebGL. It can be used to apply effects to HTML image or video sources.

The ImageEffectRenderer supports the most common variables used in [Shadertoy](https://www.shadertoy.com/) and the syntax of fragments shaders from Shadertoy and [OneShader](https://www.oneshader.net/). This makes it easy to prototype different effects using Shadertoy or OneShader.

## Getting started

### Installing

Add `@mediamonks/image-effect-renderer` to your project:

```sh
npm i image-effect-renderer
```
## Basic usage

Simple shader rendering on canvas.
```ts
import { ImageEffectRenderer } from '@mediamonks/image-effect-renderer';
import shader from './shader.glsl';

const renderer = ImageEffectRenderer.createTemporary(wrapperElement, shader, { loop: true });
```

This library allows adding images into up to eight different slots, which can be utilized in the shader (as iChannel0 to iChannel7). Ensure images are fully loaded prior to adding them.
```ts
import { ImageEffectRenderer } from '@mediamonks/image-effect-renderer';
import shader from './shader.glsl';

const renderer = ImageEffectRenderer.createTemporary(wrapperElement, shader, { loop: false });

renderer.setImage(0, image);
renderer.play();
```

### Shared WebGL Context

All ImageEffectRenderers share by default one WebGLContext. If you have only one ImageEffectRenderer on a page, or if you create a large ImageEffectRenderer (i.e. fullscreen),
the ImageEffectRenderer will run faster if you create it having its own WebGLContext:

```ts
const renderer = ImageEffectRenderer.createTemporary(wrapperElement, shader, { useSharedContext: false });
```

### Tick

You can assign a tick function for the renderer. This function will be invoked each frame just prior to output rendering.

```
renderer.tick(() => {
  renderer.setUniformFloat('uUniformName', 1.2345);
});
```

### Multiple buffers

Creation of multiple ping-pong buffers, each functioning with its own shader, is possible and functions analogously to adding extra buffer-tabs in Shadertoy.

```
renderer.createBuffer(0, shader);
```

You can assign a buffer to an image slot:

```
renderer.buffers[0].setImage(0, this.renderer.buffers[0]); // ping-pong
// and
renderer.setImage(0, renderer.buffers[0]);
```

A buffer will render in the same resolution as the output canvas. To see more examples, please refer to the examples directory.


## Building

In order to build seng-event, ensure that you have [Git](http://git-scm.com/downloads)
and [Node.js](http://nodejs.org/) installed.

Clone a copy of the repo:
```sh
git clone https://github.com/mediamonks/image-effect-renderer.git
```

Change to the image-effect-renderer directory:
```sh
cd image-effect-renderer
```

Install dev dependencies:
```sh
npm i
```

Build package:
```sh
npm run build
```
