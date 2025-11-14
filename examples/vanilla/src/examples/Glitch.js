import {ImageEffectRenderer} from '../../../../src/index';
import shader from '../shader/glitch.glsl?raw';
import ImageLoader from "../utils/ImageLoader";

export default class Glitch {
  constructor(wrapper, options = {}) {
    this.renderer = ImageEffectRenderer.createTemporary(wrapper, shader, options);

    ImageLoader.loadImages(['./paddo.jpg']).then(([mask]) => {
      this.renderer.setImage(0, mask, {flipY: true});
      this.renderer.play();
    });
  }
}
