import { PanoramaRenderer } from '../../../src/';
import ImageLoader from '../utils/ImageLoader';

export default class Panorama {

  private renderer: PanoramaRenderer;
  private wrapper: HTMLElement;

  constructor(wrapper: HTMLElement) {
    this.wrapper = wrapper;
    ImageLoader.loadImages(['panorama.jpg']).then(this.init.bind(this));
  }

  private init(images: Array<HTMLImageElement>):void {
    this.renderer = new PanoramaRenderer(this.wrapper.querySelector('.canvas'), images[0].src);
    this.renderer.init();

    this.wrapper.querySelector('.js-play').addEventListener('click', () => this.renderer.play());
    this.wrapper.querySelector('.js-stop').addEventListener('click', () => this.renderer.pause());
  }
}
