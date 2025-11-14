import {ImageEffectRenderer} from '../../../../src/index';
import fluid_dynamics from '../shader/fluid_dynamics.glsl?raw';
import fluid_paint from '../shader/fluid_paint.glsl?raw';
import fluid_image from '../shader/fluid_image.glsl?raw';

export default class FluidDynamics {
  constructor(wrapper, options = {}) {
    this.wrapper = wrapper;

    this.renderer = ImageEffectRenderer.createTemporary(this.wrapper, fluid_image, {loop: true, ...options});

    const bufferOptions = {
      type: WebGLRenderingContext.FLOAT,
      clampX: false,
      clampY: false
    };

    this.renderer.setData({
      buffers: [
        // Fluid dynamics buffers with circular dependencies
        {
          index: 0,
          shader: fluid_dynamics,
          options: bufferOptions,
          images: [{slotIndex: 0, image: {bufferIndex: 2}}]
        },
        {
          index: 1,
          shader: fluid_dynamics,
          options: bufferOptions,
          images: [{slotIndex: 0, image: {bufferIndex: 0}}]
        },
        {
          index: 2,
          shader: fluid_dynamics,
          options: bufferOptions,
          images: [{slotIndex: 0, image: {bufferIndex: 1}}]
        },
        // Fluid paint buffer
        {
          index: 3,
          shader: fluid_paint,
          options: bufferOptions,
          images: [
            {slotIndex: 0, image: {bufferIndex: 2}},
            {slotIndex: 1, image: {bufferIndex: 3}}
          ]
        }
      ],
      // Main renderer uses buffer 3
      images: [{slotIndex: 0, image: {bufferIndex: 3}}]
    });
  }
}
