import {ImageEffectRenderer} from '../../../dist/';
import flow_image from '../shader/flow_image.glsl';
import flow_buffer from '../shader/flow_buffer.glsl';
import ImageLoader from "../utils/ImageLoader";

export default class Flow {
    constructor(wrapper, options = {}) {
        this.wrapper = wrapper;

        this.renderer = ImageEffectRenderer.createTemporary(this.wrapper, flow_image, options);

        this.mouseDown = false;
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
            if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
                if (this.mouseDown) {
                    this.prevMouseX = this.mouseX;
                    this.prevMouseY = this.mouseY;
                } else {
                    this.prevMouseX = x;
                    this.prevMouseY = 1 - y;
                }
                this.mouseX = x;
                this.mouseY = 1 - y;
            }
        };

        canvas.onmouseleave = canvas.onmouseup = () => {
            this.mouseDown = false;
        };

        this.renderer.tick(() => {
            this.renderer.buffers[0].setUniformVec4('uMouse', this.mouseX, this.mouseY, this.prevMouseX, this.prevMouseY);
            this.renderer.buffers[0].setUniformFloat('uMouseDown', this.mouseDown ? 1 : 0);
        });

        ImageLoader.loadImages(['./paddo.jpg']).then(([mask]) => {
            this.renderer.setImage(0, mask, {flipY: true});
            this.renderer.play();
        });
    }
}
