[![Travis](https://img.shields.io/travis/mediamonks/seng-effectrenderer.svg?maxAge=2592000)](https://travis-ci.org/mediamonks/seng-effectrenderer)
[![Coveralls](https://img.shields.io/coveralls/mediamonks/seng-effectrenderer.svg?maxAge=2592000)](https://coveralls.io/github/mediamonks/seng-effectrenderer?branch=master)
[![npm](https://img.shields.io/npm/v/seng-effectrenderer.svg?maxAge=2592000)](https://www.npmjs.com/package/seng-effectrenderer)
[![npm](https://img.shields.io/npm/dm/seng-effectrenderer.svg?maxAge=2592000)](https://www.npmjs.com/package/seng-effectrenderer)

# seng-effectrenderer
Provides functionality for easily insert WebGL shaders in your application.

Provides an _ImageEffectRenderer_ that can handle simple WebGL shaders.
The _ImageEffectRenderer_ has a method to add up to 4 images on layers, which you can use to create effects with.

_ImageEffectRenderer_ supports the most common variables used in [Shadertoy](https://www.shadertoy.com).
This makes it easy to use base effects from that website.


## Installation

```sh
yarn add seng-effectrenderer
```

```sh
npm i -S seng-effectrenderer
```

## Basic usage

Simple shader rendering on canvas.
```ts
import { ImageEffectRenderer } from 'seng-effectrenderer';
import shader from './shader.glsl';

const renderer = ImageEffectRenderer.createTemporary(
  wrapperElement,
  shader,
  true,
);
```

You can add images to four different slots so you can use them in the shader (as iTexture0, ...iTexture3). Make sure the images are fully loaded when added.
```ts
import { ImageEffectRenderer } from 'seng-effectrenderer';
import shader from './shader.glsl';

const renderer = ImageEffectRenderer.createTemporary(
  wrapperElement,
  shader,
  false,
);

renderer.addImage(image, 0);
renderer.play();
```

### Shared WebGL Context

All ImageEffectRenderers share by default one WebGLContext. If you have only one ImageEffectRenderer on a page, or if you create a large ImageEffectRenderer (i.e. fullscreen),
 the ImageEffectRenderer will run faster if you create it having its own WebGLContext:

```ts
const renderer = ImageEffectRenderer.createTemporary(
  wrapperElement,
  shader,
  true,
  true, // Create a separate WebGLContext for this specific ImageEffectRenderer
);
```

### Tick

You can set a tick function for the renderer. This function will be called every frame just before the output is rendered.

```
renderer.tick(() => {
  renderer.setUniformFloat('uUniformName', 1.2345); // set a custom uniform
  renderer.updateSize();                            // resize WebGL canvas to container (if needed)
});
```

### Multiple buffers

You can create multiple ping-pong buffers that all run using with their own shader. This is similar to adding extra buffer-tabs in Shadertoy.

```
renderer.addBuffer(0, shader);
```

You can add a buffer to an image slot:

```
renderer.getBuffer(0).addImage(this.renderer.getBuffer(0) , 0); // ping-pong
// and
renderer.addImage(this.renderer.getBuffer(0), 0);
```

A buffer will render in the same resolution as the output canvas.

For more examples, please check the examples directory.

### Panorama Renderer

If you want to render a (lightweight) panorama in WebGL, you can use the seng-panoramarenderer(https://github.com/mediamonks/seng-panoramarenderer). 
The seng-panoramarenderer is a wrapper around seng-effectrenderer and provides basic panorama functionality.


## Building

In order to build seng-event, ensure that you have [Git](http://git-scm.com/downloads)
and [Node.js](http://nodejs.org/) installed.

Clone a copy of the repo:
```sh
git clone https://github.com/mediamonks/seng-effectrenderer.git
```

Change to the seng-effectrenderer directory:
```sh
cd seng-effectrenderer
```

Install dev dependencies:
```sh
yarn
```

Use one of the following main scripts:
```sh
yarn build            # build this project
yarn dev              # run compilers in watch mode, both for babel and typescript
yarn test             # run the unit tests incl coverage
yarn test:dev         # run the unit tests in watch mode
yarn lint             # run eslint and tslint on this project
yarn doc              # generate typedoc documentation
```

When installing this module, it adds a pre-commit hook, that runs lint and prettier commands
before committing, so you can be sure that everything checks out.

## Contribute

View [CONTRIBUTING.md](./CONTRIBUTING.md)


## Authors

View [AUTHORS.md](./AUTHORS.md)


## LICENSE

[MIT](./LICENSE) © MediaMonks
