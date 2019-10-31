import { ImageEffectRenderer } from '../../../src/';
import ImageLoader from '../utils/ImageLoader';
const glitch = require('../shader/glitch.glsl');

export default class RepeatingEffect {
  private wrapper: HTMLElement;
  private renderer: ImageEffectRenderer;

  constructor(wrapper: HTMLElement) {
    this.wrapper = wrapper;

    this.renderer = ImageEffectRenderer.createTemporary(this.wrapper, glitch, false);

    ImageLoader.loadImages(['example.jpg']).then(this.init.bind(this));
  }

  private init(images: Array<HTMLImageElement>):void {
    this.renderer.addImage(images[0], 0);
    this.renderer.play();
  }
}
