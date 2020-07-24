import {ImageEffectRenderer} from '../../../src/';

const fluid_dynamics = require('../shader/fluid_dynamics.glsl');
const fluid_paint = require('../shader/fluid_paint.glsl');
const fluid_image = require('../shader/fluid_image.glsl');

export default class FluidDynamics {
  private wrapper: HTMLElement;
  private renderer: ImageEffectRenderer;
  private mouseDown: boolean = false;

  private mouseX: number = 0;
  private mouseY: number = 0;
  private prevMouseX: number = 0;
  private prevMouseY: number = 0;

  constructor(wrapper: HTMLElement) {
    this.wrapper = wrapper;

    this.renderer = ImageEffectRenderer.createTemporary(this.wrapper, fluid_image, true, true);

    // fluid dynamics
    this.renderer.getContext().getExtension('WEBGL_color_buffer_float');
    this.renderer.getContext().getExtension('EXT_color_buffer_float');

    this.renderer.getContext().getExtension('OES_texture_float');
    this.renderer.getContext().getExtension('OES_texture_float_linear');

    this.renderer.addBuffer(0, fluid_dynamics, WebGLRenderingContext.FLOAT);

    this.renderer.addBuffer(1, fluid_dynamics, WebGLRenderingContext.FLOAT);
    this.renderer.getBuffer(1).addImage(this.renderer.getBuffer(0), 0);

    this.renderer.addBuffer(2, fluid_dynamics, WebGLRenderingContext.FLOAT);
    this.renderer.getBuffer(2).addImage(this.renderer.getBuffer(1), 0);
    this.renderer.getBuffer(0).addImage(this.renderer.getBuffer(2), 0);

    // fluid paint
    this.renderer.addBuffer(3, fluid_paint, WebGLRenderingContext.FLOAT);
    this.renderer.getBuffer(3).addImage(this.renderer.getBuffer(2), 0);
    this.renderer.getBuffer(3).addImage(this.renderer.getBuffer(3), 1);

    this.renderer.addImage(this.renderer.getBuffer(3), 0);


    const canvas = this.renderer.getCanvas();

    canvas.onmousedown = () => {
      this.mouseDown = true;
    };

    canvas.onmouseenter = canvas.onmousemove = (e) => {
      const bounds = canvas.getBoundingClientRect();
      const x = (e.clientX - bounds.left) / bounds.width;
      const y = (e.clientY - bounds.top) / bounds.height;
      if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;
        this.mouseX = x;
        this.mouseY = 1 - y;
      }
    };

    canvas.onmouseleave = canvas.onmouseup = () => {
      this.mouseDown = false;
    };

    this.renderer.tick(() => {
      this.renderer.updateSize();

      this.renderer.getBuffer(0).setUniformVec4('uMouse', this.mouseX, this.mouseY, this.prevMouseX, this.prevMouseY);
      this.renderer.getBuffer(1).setUniformVec4('uMouse', this.mouseX, this.mouseY, this.prevMouseX, this.prevMouseY);
      this.renderer.getBuffer(2).setUniformVec4('uMouse', this.mouseX, this.mouseY, this.prevMouseX, this.prevMouseY);
      this.renderer.getBuffer(3).setUniformVec4('uMouse', this.mouseX, this.mouseY, this.prevMouseX, this.prevMouseY);
    });
  }
}
