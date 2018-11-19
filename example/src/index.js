import Wolfenstein from './examples/Wolfenstein';
import ImageTransition from './examples/ImageTransition';
import RepeatingEffect from './examples/RepeatingEffect';
import Panorama from './examples/Panorama';

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
    default:
      throw new Error(`Can't find a class with name: ${name}`);
      break;
  }
}

if (panoramaWrapper) {
  new Panorama(panoramaWrapper);
}
