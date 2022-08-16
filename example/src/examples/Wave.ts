import { ImageEffectRenderer } from '../../../src/';
import ImageLoader from '../utils/ImageLoader';

const wave = require('../shader/wave.glsl');

export default class Wave {
  private wrapper: HTMLElement;
  private renderer: ImageEffectRenderer;

  constructor(wrapper: HTMLElement) {
    this.wrapper = wrapper;

    this.renderer = ImageEffectRenderer.createTemporary(this.wrapper, wave, true, true);

    this.renderer.tick(() => {
      this.renderer.updateSize();
    });

    ImageLoader.loadImages(['wave.jpg']).then(this.init.bind(this));
  }

  private init(images: Array<HTMLImageElement>): void {
    this.renderer.addImage(images[0], 0);
    this.renderer.setUniformFloat('uScrAspectRatio', images[0].width / images[0].height);
  }
}
