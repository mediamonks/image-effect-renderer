import {ImageEffectRenderer} from '../../../../src/index';
import shader from '../shader/fluid_like.glsl?raw';

export default class FluidLike {
  constructor(wrapper, options = {}) {
    this.renderer = ImageEffectRenderer.createTemporary(wrapper, shader, {loop: true, ...options});
  }
}
