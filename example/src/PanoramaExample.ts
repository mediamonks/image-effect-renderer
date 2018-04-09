import { PanoramaRenderer } from '../../src/';
import ImageLoader from './ImageLoader';

export default class PanoramaExample {

  private renderer: PanoramaRenderer;

  constructor(private wrapper:HTMLElement) {
    ImageLoader.loadImages(['panorama.jpg']).then(this.init.bind(this));
  }

  private init(images: Array<HTMLImageElement>):void {
    this.renderer = new PanoramaRenderer(this.wrapper, images[0].src);
    this.renderer.init();
  }
}
