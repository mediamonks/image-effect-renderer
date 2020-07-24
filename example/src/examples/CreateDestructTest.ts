import {ImageEffectRenderer} from '../../../src/';
import ImageLoader from '../utils/ImageLoader';

const glitch = require('../shader/glitch.glsl');
const wolfenstein = require('../shader/wolfenstein.glsl');

export default class CreateDestructTest {
  private wrapper: HTMLElement;
  private renderer: ImageEffectRenderer;
  private image: HTMLImageElement;
  private count: number = 0;
  private pingPong: boolean = false

  constructor(wrapper: HTMLElement) {
    this.wrapper = wrapper;

    this.renderer = ImageEffectRenderer.createTemporary(this.wrapper, glitch, false, false);

    ImageLoader.loadImages(['example.jpg']).then(this.init.bind(this));

    const tickLoop = () => {
      this.count++;
      if (this.count >= 100) {
        this.pingPong = !this.pingPong;
        this.count = 0;

        ImageEffectRenderer.releaseTemporary(this.renderer);
        this.renderer = ImageEffectRenderer.createTemporary(this.wrapper, this.pingPong ? wolfenstein : glitch, false, false);
        this.renderer.addImage(this.image, 0);
        this.renderer.tick(tickLoop);
        this.renderer.play();
      }
    };

    this.renderer.tick(tickLoop);
  }

  private init(images: Array<HTMLImageElement>): void {
    this.image = images[0];
    this.renderer.addImage(images[0], 0);
    this.renderer.play();
  }
}
