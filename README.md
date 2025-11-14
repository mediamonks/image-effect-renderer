# Image Effect Renderer

The image-effect-renderer is a lightweight package that allows you to run fragment shaders in your
website using WebGL. It can be used to apply effects to HTML images or video sources. Zero
dependencies.

The ImageEffectRenderer supports the most common variables used
in [Shadertoy](https://www.shadertoy.com/) and the syntax of fragments shaders from Shadertoy
and [OneShader](https://www.oneshader.net/). This makes it easy to prototype different effects using
Shadertoy or OneShader.

## Demo

- [Stress test with multiple demos](https://mediamonks.github.io/image-effect-renderer/).

This is a build from the repository's example/ directory.

## Getting started

### Installing

Add `@mediamonks/image-effect-renderer` to your project:

```sh
npm i @mediamonks/image-effect-renderer
```

## Basic usage

Simple shader rendering on canvas.

```ts
import {ImageEffectRenderer} from '@mediamonks/image-effect-renderer';
import shader from './shader.glsl';

const options = {loop: true};

// Creating an RendererInstance
const renderer = ImageEffectRenderer.createTemporary(wrapperElement, shader, options);

...

// Clean up the renderer when it's no longer needed
ImageEffectRenderer.releaseTemporary(renderer);
```

### ImageEffectRendererOptions

You can set the following options when creating a renderer:

- **loop** _(boolean)_ - The renderer will play automatically if set to true. The default value is
  `false`.
- **autoResize** _(boolean)_ - If set to true, the renderer will automatically resize to fit the
  wrapperElement. The default value is `true`.
- **pixelRatio** _(number)_ - This sets the pixel ratio of the renderer. The default value is
  `window.devicePixelRatio`.
- **useSharedContext** _(boolean)_ - If set to true, the renderer will use a shared WebGL context.
  The default value is `false`.
- **asyncCompile** _(boolean)_ - If set to true, the renderer will compile shaders asynchronously.
  The default value is `true`.

ImageEffectRenderers can share one WebGLContext (see `useSharedContext`). This is needed if multiple
ImageEffectRenderers are active at a time.
If you have only one ImageEffectRenderer on a page or if you create a large ImageEffectRenderer (
i.e. fullscreen), the ImageEffectRenderer will run faster if you create it having its own
WebGLContext:

## React Usage

The package includes optional React components and hooks. React is tree-shakeable and only included
when you import from `@mediamonks/image-effect-renderer/react`.

### Using the React Component

```tsx
import { useRef } from 'react';
import { ImageEffectRendererComponent } from '@mediamonks/image-effect-renderer/react';
import glitchShader from './glitch.glsl?raw';

function App() {
  const rendererRef = useRef(null);

  const handlePlay = () => {
    rendererRef.current?.renderer?.play();
  };

  return (
    <>
      <ImageEffectRendererComponent
        ref={rendererRef}
        shader={glitchShader}
        loop={false}
        images={[
          { slotIndex: 0, image: myImage, options: { flipY: true } }
        ]}
        style={{ width: '100%', height: '100vh' }}
      />
      <button onClick={handlePlay}>Play</button>
    </>
  );
}
```

### Using the React Hook

For more control, you can use the `useImageEffectRenderer` hook:

```tsx
import { useEffect } from 'react';
import { useImageEffectRenderer } from '@mediamonks/image-effect-renderer/react';
import shader from './shader.glsl?raw';

function App() {
  const { ref, renderer, isReady } = useImageEffectRenderer({
    shader,
    loop: true,
    images: [{ slotIndex: 0, image: myImage }]
  });

  useEffect(() => {
    if (renderer && isReady) {
      renderer.play();
    }
  }, [renderer, isReady]);

  return <div ref={ref} style={{ width: '100%', height: '100vh' }} />;
}
```

### React Component Props

The `ImageEffectRendererComponent` accepts all `ImageEffectRendererOptions` plus:

- **shader** _(string)_ - The fragment shader code (required)
- **buffers** _(BufferData[])_ - Array of buffer configurations
- **images** _(ImagesData)_ - Array of image configurations
- **className** _(string)_ - CSS class name for the container
- **style** _(React.CSSProperties)_ - Inline styles for the container
- **onReady** _(renderer: RendererInstance) => void_ - Callback when renderer is ready

### React Hook Return Value

The `useImageEffectRenderer` hook returns:

- **ref** _React.RefObject\<HTMLDivElement\>_ - Ref to attach to your container element
- **renderer** _RendererInstance | null_ - The RendererInstance
- **isReady** _boolean_ - Whether the renderer is initialized and ready

## Methods

### setImage(slotIndex, image, options)

This library allows adding images into up to eight slots, which can be utilized in the shader (as
sampler2D iChannel0 to iChannel7). Ensure images are fully loaded before adding them.

- `slotIndex` _(number)_ - Index of the slot where the image will be set.
- `image` _(HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | RendererBuffer)_ - The image
  data you want to use in the shader.
- `options` _(Partial<ImageOptions>)_ - Custom configuration for image handling. This is optional.

```ts
import {ImageEffectRenderer} from '@mediamonks/image-effect-renderer';
import shader from './shader.glsl';

const renderer = ImageEffectRenderer.createTemporary(wrapperElement, shader, {loop: false});

const imageOptions = {};
renderer.setImage(0, image, imageOptions);
renderer.play();
```

When setting an image, you can pass an object with the following options:

- **clampX** _(boolean)_ - If set to true, the texture's horizontal dimension will be clamped. The
  default value is `true`.
- **clampY** _(boolean)_ - If set to true, the texture's vertical dimension will be clamped. The
  default value is `true`.
- **flipY** _(boolean)_ - If set to true, the image texture will be inverted on the y-axis. The
  default value is `false`.
- **useMipmap** _(boolean)_ - If set to true, mipmaps will be used for texture sampling. The default
  value is `true`.
- **useCache** _(boolean)_ - If set to true, the texture will be cached. The default value is
  `true`.
- **minFilterLinear** _(boolean)_ - If set to true, the texture's min filter will be linear. The
  default value is `true`.
- **magFilterLinear** _(boolean)_ - If set to true, the texture's mag filter will be linear. The
  default value is `true`.

### play()

Commences or resumes the rendering loop.

```ts
renderer.play();
```

### stop()

Pauses the rendering loop.

```ts
renderer.stop();
```

### createBuffer(i, shader, options = {})

Creates or replaces a render buffer at a specified index.

- `i` _(number)_ - The index of the buffer to create/replace.
- `shader` _(string)_ - The shader used for the buffer rendering.
- `options` _(Partial<BufferOptions>)_ - Custom configuration for buffer creation. This is optional.

#### Returns

- `Renderer` - The newly created or replaced buffer object.

```ts
let newBuffer = renderer.createBuffer(index, shader, options);
```

### tick(tick: (dt) => void)

Registers a tick function to be called on every frame update.

- `tick` _(Function)_ - The function to be called. It accepts a single parameter `dt` representing
  the delta time.

```ts
renderer.tick(dt => {
  // Operations to be performed every tick
});
```

### ready(ready: () => void)

Registers a ready function to be called when the renderer instance is ready.

- `ready` _(Function)_ - The function to be called.

```ts
renderer.ready(() => {
  // Operations to be performed when renderer is ready
});
```

### drawFrame(time = 0)

Draws a frame manually.

- `time` _(number)_ - Time of the frame to draw. Defaults to 0 if not specified.

```ts
renderer.drawFrame(time);
```

### Setting uniforms

You can set uniforms for each RendererInstance (created by calling
`ImageEffectRenderer.createTemporary` or by creating a buffer using `renderer.createBuffer`).

#### setUniformFloat(name: string, value: number)

Sets a float uniform in the shader program.

- `name` _(string)_ - Name of the uniform.
- `value` _(number)_ - Float value.

```ts
renderer.setUniformFloat('uniformName', 0.5);
```

#### setUniformInt(name: string, value: number)

Sets an integer uniform in the shader program.

- `name` _(string)_ - Name of the uniform.
- `value` _(number)_ - Integer value.

```ts
renderer.setUniformInt('uniformName', 4);
```

#### setUniformVec2(name: string, x: number, y: number)

Sets a vec2 uniform in the shader program.

- `name` _(string)_ - Name of the uniform.
- `x` _(number)_ - X value.
- `y` _(number)_ - Y value.

```ts
renderer.setUniformVec2('uniformName', 0.5, 1.5);
```

#### setUniformVec3(name: string, x: number, y: number, z: number)

Sets a vec3 uniform in the shader program.

- `name` _(string)_ - Name of the uniform.
- `x` _(number)_ - X value.
- `y` _(number)_ - Y value.
- `z` _(number)_ - Z value.

```ts
renderer.setUniformVec3('uniformName', 0.5, 1.5, 2.5);
```

#### setUniformVec4(name: string, x: number, y: number, z: number, w: number)

Sets a vec4 uniform in the shader program.

- `name` _(string)_ - Name of the uniform.
- `x` _(number)_ - X value.
- `y` _(number)_ - Y value.
- `z` _(number)_ - Z value.
- `w` _(number)_ - W value.

```ts
renderer.setUniformVec4('uniformName', 0.5, 1.5, 2.5, 3.5);
```

#### setUniformMatrix(name: string, matrix: Float32Array)

Sets a matrix uniform in the shader program.

- `name` _(string)_ - Name of the uniform.
- `matrix` _(Float32Array)_ - 4X4 matrix.

```ts
let matrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
renderer.setUniformMatrix('uniformName', matrix);
```

## Multiple buffers

It is possible to create multiple ping-pong buffers, each functioning with its shader, which
functions analogously to adding extra buffer tabs in Shadertoy.

```
renderer.createBuffer(0, shader);
```

You can assign a buffer to an image slot:

```
renderer.buffers[0].setImage(0, this.renderer.buffers[0]); // ping-pong
// and
renderer.setImage(0, renderer.buffers[0]);
```

### setData(data)

Sets buffers and images using a declarative configuration object. This is a convenience method that
calls `setBuffersData` and `setImagesData` in the correct order.

- `data` _(RendererData)_ - Configuration object containing buffers and/or images.

```ts
renderer.setData({
  buffers: [
    {
      index: 0,
      shader: bufferShader,
      options: { clampX: false, clampY: false },
      images: [{ slotIndex: 0, image: { bufferIndex: 1 } }]
    }
  ],
  images: [
    { slotIndex: 0, image: myImage, options: { flipY: true } }
  ]
});
```

### setBuffersData(buffers)

Creates multiple buffers from an array of buffer configurations. Buffers are created in two passes:
first all buffers are initialized, then images are assigned to ensure buffer dependencies are
available.

- `buffers` _(BufferData[])_ - Array of buffer configurations.

```ts
renderer.setBuffersData([
  {
    index: 0,
    shader: shader0,
    options: { clampX: false },
    images: [{ slotIndex: 0, image: { bufferIndex: 1 } }]
  },
  {
    index: 1,
    shader: shader1,
    options: { clampY: false }
  }
]);
```

### setImagesData(images)

Sets multiple images to slots using an array configuration. Images can reference buffers using the
`bufferIndex` property.

- `images` _(ImagesData)_ - Array of image configurations.

```ts
renderer.setImagesData([
  { slotIndex: 0, image: myImage, options: { flipY: true } },
  { slotIndex: 1, image: { bufferIndex: 0 } } // Reference buffer 0
]);
```

A buffer will render in the exact resolution as the output canvas. Please take a look at the
examples directory for more examples.

## Building

To build image-effect-renderer, ensure that you have [Git](http://git-scm.com/downloads)
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
