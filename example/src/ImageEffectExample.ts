import { ImageEffectRenderer } from '../../src/';
import ImageLoader from './ImageLoader';
const wolfenstein = require('./shader/wolfenstein.glsl');
const smoothstep = require('./shader/smoothstep.glsl');
const glitch = require('./shader/glitch.glsl');

export default class ImageEffectExample {

  private renderer: ImageEffectRenderer;
  private hasImage: boolean = false;
  private isInfinite: boolean = false;

  private currentFrame:number;

  constructor(private wrapper:HTMLElement) {
    this.hasImage = this.wrapper.hasAttribute('data-image');
    this.isInfinite = this.wrapper.hasAttribute('data-infinite');

    this.renderer = ImageEffectRenderer.createTemporary(
      this.wrapper,
      this.hasImage ? smoothstep : this.isInfinite ? glitch : wolfenstein,
      !this.hasImage,
    );

    if (this.hasImage) {
      ImageLoader.loadImages(['example.jpg', 'transition.jpg']).then(this.init.bind(this));
    } else if (this.isInfinite) {
      ImageLoader.loadImages(['example.jpg']).then(this.init.bind(this));
    } else {
      this.renderer.play();
    }
  }

  private init(images: Array<HTMLImageElement>):void {
  	this.renderer.addImage(images[0], 0);

  	if (images[1]) {
      this.renderer.addImage(images[1], 1);

      this.drawCurrentFrame();

      const range = <HTMLInputElement>document.querySelector('.js-progress');
      range.addEventListener('input', () => {
        this.currentFrame = parseInt(range.value, 10);
        this.drawCurrentFrame();
      });
    } else {
  	  this.renderer.play();
    }
  }

  private drawCurrentFrame():void {
    this.renderer.setUniformFloat('delta', this.currentFrame / ImageEffectRenderer.MAX_ANIMATION_FRAMES);
    this.renderer.draw();
  }
}
