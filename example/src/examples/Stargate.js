import {ImageEffectRenderer} from '../../../dist/';
import shader from '../shader/stargate.glsl';

export default class Stargate {
    constructor(wrapper, options = {}) {
        this.renderer = ImageEffectRenderer.createTemporary(wrapper, shader, {loop: true, ...options});
    }
}
