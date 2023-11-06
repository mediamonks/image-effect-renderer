import {ImageEffectRenderer} from '../../../dist/';
import shader from '../shader/fluid_like.glsl';

export default class FluidLike {
    constructor(wrapper, options = {}) {
        this.renderer = ImageEffectRenderer.createTemporary(wrapper, shader, {loop: true, ...options});
    }
}
