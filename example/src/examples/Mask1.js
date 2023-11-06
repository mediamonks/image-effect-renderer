import {ImageEffectRenderer} from '../../../dist/';
import shader from '../shader/mask_1.glsl';
import ImageLoader from "../utils/ImageLoader";

export default class Mask1 {
    constructor(wrapper, options = {}) {
        this.renderer = ImageEffectRenderer.createTemporary(wrapper, shader, options);

        ImageLoader.loadImages(['./growMask.png']).then(([mask]) => {
            this.renderer.setImage(0, mask);
            this.renderer.setUniformFloat('iFrames', 30);

            this.renderer.play();
        });
    }
}
