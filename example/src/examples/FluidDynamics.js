import {ImageEffectRenderer} from '../../../src/index';
import fluid_dynamics from '../shader/fluid_dynamics.glsl?raw';
import fluid_paint from '../shader/fluid_paint.glsl?raw';
import fluid_image from '../shader/fluid_image.glsl?raw';

export default class FluidDynamics {
    constructor(wrapper, options = {}) {
        this.wrapper = wrapper;

        this.renderer = ImageEffectRenderer.createTemporary(this.wrapper, fluid_image, {loop: true, ...options});

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
    }
}
