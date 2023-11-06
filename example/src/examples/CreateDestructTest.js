import {ImageEffectRenderer} from '../../../dist/';
import Stargate from "./Stargate";
import Flow from "./Flow";
import FluidDynamics from "./FluidDynamics";
import Glitch from "./Glitch";
import FluidLike from "./FluidLike";
import Mask1 from "./Mask1";
import Mask2 from "./Mask2";

export default class CreateDestructTest {
    constructor(wrapper, options = {}) {
        this.wrapper = wrapper;
        this.options = options;

        this.index = 0;
        this.classes = [Stargate, Flow, FluidDynamics, Glitch, Mask1, Mask2, FluidLike];
        // this.classes = [CornellBox, Glitch, Mask1, Mask2, MetaBalls];

        window.setInterval(() => {
            if (this.renderer) {
                ImageEffectRenderer.releaseTemporary(this.renderer);
            }

            this.index = (this.index + 1) % this.classes.length;

            this.renderer = (new this.classes[this.index](this.wrapper, {...this.options})).renderer;
        }, 500);
    }
}
