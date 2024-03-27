import {ImageEffectRenderer} from '@mediamonks/image-effect-renderer';
import shader from '../shader/stargate.glsl?raw';

export default class Stargate {
    constructor(wrapper, options = {}) {
        this.renderer = ImageEffectRenderer.createTemporary(wrapper, shader, {loop: true, ...options});
    }
}
