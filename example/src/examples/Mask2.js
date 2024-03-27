import {ImageEffectRenderer} from '@mediamonks/image-effect-renderer';
import shader from '../shader/mask_2.glsl?raw';
import ImageLoader from "../utils/ImageLoader";

export default class Mask2 {
    constructor(wrapper, options = {}) {
        this.renderer = ImageEffectRenderer.createTemporary(wrapper, shader, options);

        ImageLoader.loadImages(['./growMask.png', './paddo.jpg']).then(([mask, paddo]) => {
            this.renderer.setImage(0, mask);
            this.renderer.setImage(1, paddo, {useMips: true});

            this.renderer.setUniformFloat('iFrames', 30);
            this.renderer.play();
        });
    }
}
