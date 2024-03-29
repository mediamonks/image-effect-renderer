import {ImageEffectRenderer} from '@mediamonks/image-effect-renderer';
import flow_image from '../shader/flow_image.glsl?raw';
import flow_buffer from '../shader/flow_buffer.glsl?raw';
import ImageLoader from "../utils/ImageLoader";

export default class Flow {
  constructor(wrapper, options = {}) {
    this.wrapper = wrapper;

    this.renderer = ImageEffectRenderer.createTemporary(this.wrapper, flow_image, options);

    this.mouseX = 0;
    this.mouseY = 0;
    this.prevMouseX = 0;
    this.prevMouseY = 0;

    this.renderer.createBuffer(0, flow_buffer);
    this.renderer.buffers[0].setImage(0, this.renderer.buffers[0], {type: WebGLRenderingContext.FLOAT});
    this.renderer.setImage(1, this.renderer.buffers[0]);

    const canvas = this.renderer.canvas;

    canvas.onmousedown = () => {
      this.mouseDown = true;
    };

    canvas.onmouseenter = canvas.onmousemove = (e) => {
      const bounds = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (e.clientY - bounds.top) / bounds.height));
      this.mouseX = x;
      this.mouseY = 1 - y;
    };

    this.renderer.tick(() => {
      this.renderer.buffers[0].setUniformVec4('uMouse', this.mouseX, this.mouseY, this.prevMouseX, this.prevMouseY);
      this.prevMouseX = this.mouseX;
      this.prevMouseY = this.mouseY;
    });

    ImageLoader.loadImages(['./paddo.jpg']).then(([mask]) => {
      this.renderer.setImage(0, mask, {flipY: true});
      this.renderer.play();
    });
  }
}
