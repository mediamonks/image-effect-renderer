import {ImageEffectRenderer} from '../../../dist/';
import fluid_dynamics from '../shader/fluid_dynamics.glsl';
import fluid_paint from '../shader/fluid_paint.glsl';
import fluid_image from '../shader/fluid_image.glsl';

export default class FluidDynamics {
  constructor(wrapper, options = {}) {
    this.wrapper = wrapper;

    this.renderer = ImageEffectRenderer.createTemporary(this.wrapper, fluid_image, {loop: true, ...options});

    this.mouseX = 0;
    this.mouseY = 0;
    this.prevMouseX = 0;
    this.prevMouseY = 0;

    // fluid dynamics
    this.renderer.createBuffer(0, fluid_dynamics, {
      type: WebGLRenderingContext.FLOAT,
      clampX: false,
      clampY: false
    });
    this.renderer.createBuffer(1, fluid_dynamics, {
      type: WebGLRenderingContext.FLOAT,
      clampX: false,
      clampY: false
    });
    this.renderer.createBuffer(2, fluid_dynamics, {
      type: WebGLRenderingContext.FLOAT,
      clampX: false,
      clampY: false
    });

    this.renderer.buffers[0].setImage(0, this.renderer.buffers[2]);
    this.renderer.buffers[1].setImage(0, this.renderer.buffers[0]);
    this.renderer.buffers[2].setImage(0, this.renderer.buffers[1]);

    // fluid paint
    this.renderer.createBuffer(3, fluid_paint, {
      type: WebGLRenderingContext.FLOAT,
      clampX: false,
      clampY: false
    });
    this.renderer.buffers[3].setImage(0, this.renderer.buffers[2]);
    this.renderer.buffers[3].setImage(1, this.renderer.buffers[3]);

    this.renderer.setImage(0, this.renderer.buffers[3]);

    const canvas = this.renderer.canvas;

    canvas.onmouseenter = canvas.onmousemove = (e) => {
      const bounds = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (e.clientY - bounds.top) / bounds.height));
      this.mouseX = x;
      this.mouseY = 1 - y;
    };

    this.renderer.tick(() => {
      this.renderer.buffers[0].setUniformVec4('uMouse', this.mouseX, this.mouseY, this.prevMouseX, this.prevMouseY);
      this.renderer.buffers[1].setUniformVec4('uMouse', this.mouseX, this.mouseY, this.prevMouseX, this.prevMouseY);
      this.renderer.buffers[2].setUniformVec4('uMouse', this.mouseX, this.mouseY, this.prevMouseX, this.prevMouseY);
      this.renderer.buffers[3].setUniformVec4('uMouse', this.mouseX, this.mouseY, this.prevMouseX, this.prevMouseY);
      this.prevMouseX = this.mouseX;
      this.prevMouseY = this.mouseY;
    });
  }
}
