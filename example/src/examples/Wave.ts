import { ImageEffectRenderer } from '../../../src/';
import ImageLoader from '../utils/ImageLoader';

const wave = require('../shader/wave.glsl');

export default class Wave {
  private wrapper: HTMLElement;
  private renderer: ImageEffectRenderer;

  constructor(wrapper: HTMLElement) {
    this.wrapper = wrapper;

    this.renderer = ImageEffectRenderer.createTemporary(this.wrapper, wave, true, true);

    ImageLoader.loadImages(['wave.jpg']).then(this.init.bind(this));
  }

  private init(images: Array<HTMLImageElement>): void {
    this.renderer.addImage(images[0], 0);
  }
}
