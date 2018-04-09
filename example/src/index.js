import ImageEffectExample from './ImageEffectExample';
import PanoramaExample from './PanoramaExample';

const imageEffectWrapper = document.querySelector('.image-effect');
const panoramaWrapper = document.querySelector('.panorama');

if (imageEffectWrapper) {
  new ImageEffectExample(imageEffectWrapper);
}

if (panoramaWrapper) {
  new PanoramaExample(panoramaWrapper);
}
