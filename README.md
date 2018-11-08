[![Travis](https://img.shields.io/travis/mediamonks/seng-effectrenderer.svg?maxAge=2592000)](https://travis-ci.org/mediamonks/seng-effectrenderer)
[![Code Climate](https://img.shields.io/codeclimate/github/mediamonks/seng-effectrenderer.svg?maxAge=2592000)](https://codeclimate.com/github/mediamonks/seng-effectrenderer)
[![Coveralls](https://img.shields.io/coveralls/mediamonks/seng-effectrenderer.svg?maxAge=2592000)](https://coveralls.io/github/mediamonks/seng-effectrenderer?branch=master)
[![npm](https://img.shields.io/npm/v/seng-effectrenderer.svg?maxAge=2592000)](https://www.npmjs.com/package/seng-effectrenderer)
[![npm](https://img.shields.io/npm/dm/seng-effectrenderer.svg?maxAge=2592000)](https://www.npmjs.com/package/seng-effectrenderer)

# seng-effectrenderer
Provides functionality for easily insert WebGL shaders in your application.

Provides an _ImageEffectRenderer_ that can handle simple WebGL shaders.
The _ImageEffectRenderer_ has a method to add up to 4 images on layers, which you can use to create effects with.

It also provides a _PanoramaRenderer_ for displaying simple image panorama's

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
renderer.play();
```

Add an image you can apply the shader to. This can have 4 layers of images to read from the shader (make sure the images are preloaded first).
```ts
import { ImageEffectRenderer } from 'seng-effectrenderer';
import shader from './shader.glsl';

const renderer = ImageEffectRenderer.createTemporary(
  wrapperElement,
  shader,
  true,
);

renderer.addImage(image, 0);
renderer.play();
```

Simple Panorama example (make sure the images are preloaded first).
```ts
import { PanoramaRenderer } from 'seng-effectrenderer';

const renderer = new PanoramaRenderer(wrapperElement, imageSrc);
renderer.init();
```

For more examples, please check the examples directory.


## Documentation

View the [generated documentation](http://mediamonks.github.io/seng-effectrenderer/).


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


## Changelog

View [CHANGELOG.md](./CHANGELOG.md)


## Authors

View [AUTHORS.md](./AUTHORS.md)


## LICENSE

[MIT](./LICENSE) © MediaMonks
