import Wolfenstein from './examples/Wolfenstein';
import ImageTransition from './examples/ImageTransition';
import RepeatingEffect from './examples/RepeatingEffect';
import Panorama from './examples/Panorama';
import PanoramaVideo from './examples/PanoramaVideo';
import FlowBuffer from './examples/FlowBuffer';

const imageEffectWrapper = document.querySelector('.image-effect');
const panoramaWrapper = document.querySelector('.panorama');

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
    default:
      throw new Error(`Can't find a class with name: ${name}`);
      break;
  }
}

if (panoramaWrapper) {
  const name = panoramaWrapper.getAttribute('data-className');
  switch (name) {
    case 'panorama':
      new Panorama(panoramaWrapper);
      break;
    case '360-video':
      new PanoramaVideo(panoramaWrapper);
      break;
    default:
      throw new Error(`Can't find a class with name: ${name}`);
      break;
  }
}
