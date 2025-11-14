import {ImageEffectRenderer} from '../../../../src/index';
import flow_image from '../shader/flow_image.glsl?raw';
import flow_buffer from '../shader/flow_buffer.glsl?raw';
import ImageLoader from "../utils/ImageLoader";

export default class Flow {
  constructor(wrapper, options = {}) {
    this.wrapper = wrapper;

    this.renderer = ImageEffectRenderer.createTemporary(this.wrapper, flow_image, options);

    this.renderer.createBuffer(0, flow_buffer);
    this.renderer.buffers[0].setImage(0, this.renderer.buffers[0], {type: WebGLRenderingContext.FLOAT});
    this.renderer.setImage(1, this.renderer.buffers[0]);

    ImageLoader.loadImages(['./paddo.jpg']).then(([mask]) => {
      this.renderer.setImage(0, mask, {flipY: true});
      this.renderer.play();
    });
  }
}
