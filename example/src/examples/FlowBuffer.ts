import {ImageEffectRenderer} from '../../../src/';

import ImageLoader from '../utils/ImageLoader';

const flow_buffer = require('../shader/flow_buffer.glsl');
const flow_image = require('../shader/flow_image.glsl');

export default class FlowBuffer {
  private wrapper: HTMLElement;
  private renderer: ImageEffectRenderer;
  private mouseDown: boolean = false;

  private mouseX: number = 0;
  private mouseY: number = 0;
  private prevMouseX: number = 0;
  private prevMouseY: number = 0;

  constructor(wrapper: HTMLElement) {
    this.wrapper = wrapper;

    this.renderer = ImageEffectRenderer.createTemporary(this.wrapper, flow_image, false);
    this.renderer.addBuffer(0, flow_buffer);
    this.renderer.getBuffer(0).addImage(this.renderer.getBuffer(0), 0);
    this.renderer.addImage(this.renderer.getBuffer(0), 1);
    this.renderer.stop();

    ImageLoader.loadImages(['example.jpg']).then(this.init.bind(this));

    this.wrapper.onmousedown = () => {
      this.mouseDown = true;
    }

    this.wrapper.onmouseenter = this.wrapper.onmousemove = (e) => {
      const bounds = this.wrapper.querySelector('canvas').getBoundingClientRect();
      const x = (e.clientX - bounds.left) / bounds.width;
      const y = (e.clientY - bounds.top) / bounds.height;
      if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
        if (this.mouseDown) {
          this.prevMouseX = this.mouseX;
          this.prevMouseY = this.mouseY;
        } else {
          this.prevMouseX = x;
          this.prevMouseY = 1-y;
        }
        this.mouseX = x;
        this.mouseY = 1-y;
      }
    }

    this.wrapper.onmouseleave = this.wrapper.onmouseup = () => {
      this.mouseDown = false;
    }

    this.tick();
  }

  private init(images: Array<HTMLImageElement>): void {
    this.renderer.addImage(images[0], 0);
  }

  private tick() {
    window.requestAnimationFrame(() => this.tick());
    this.renderer.getBuffer(0).setUniformVec4('uMouse', this.mouseX, this.mouseY, this.prevMouseX, this.prevMouseY);
    this.renderer.getBuffer(0).setUniformFloat('uMouseDown', this.mouseDown ? 1 : 0);

    this.renderer.draw();
  }
}
