import Stargate from "./examples/Stargate";
import Glitch from "./examples/Glitch";
import FluidDynamics from "./examples/FluidDynamics";
import FluidLike from "./examples/FluidLike";
import Mask1 from "./examples/Mask1";
import Mask2 from "./examples/Mask2";
import Flow from "./examples/Flow";
import CreateDestructTest from "./examples/CreateDestructTest";

new Mask1(document.getElementsByClassName('grid-item')[0]);
new Stargate(document.getElementsByClassName('grid-item')[1]);
new Glitch(document.getElementsByClassName('grid-item')[2]);
new FluidLike(document.getElementsByClassName('grid-item')[3]);
new FluidDynamics(document.getElementsByClassName('grid-item')[4]);
new Mask2(document.getElementsByClassName('grid-item')[5]);
new Flow(document.getElementsByClassName('grid-item')[6]);
new CreateDestructTest(document.getElementsByClassName('grid-item')[7], {useSharedContext: true});
new Mask1(document.getElementsByClassName('grid-item')[8], {useSharedContext: false});

