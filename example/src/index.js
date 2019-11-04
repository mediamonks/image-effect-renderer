import Wolfenstein from './examples/Wolfenstein';
import ImageTransition from './examples/ImageTransition';
import RepeatingEffect from './examples/RepeatingEffect';
import FlowBuffer from './examples/FlowBuffer';
import MultipleInstances from './examples/MultipleInstances';

const imageEffectWrapper = document.querySelector('.image-effect');

if (imageEffectWrapper) {
  const name = imageEffectWrapper.getAttribute('data-className');
  switch (name) {
    case 'wolfenstein':
      new Wolfenstein(imageEffectWrapper);
      break;
    case 'transition':
      new ImageTransition(imageEffectWrapper);
      break;
    case 'glitch':
      new RepeatingEffect(imageEffectWrapper);
      break;
    case 'flow':
      new FlowBuffer(imageEffectWrapper);
      break;
    case 'multiple':
      new MultipleInstances(imageEffectWrapper);
      break;
    default:
      throw new Error(`Can't find a class with name: ${name}`);
      break;
  }
}
