import { ImageEffectRenderer } from '../../src/';
const wolfenstein = require('./shader/wolfenstein.glsl');
const smoothstep = require('./shader/smoothstep.glsl');

export default class ImageEffectExample {

  private renderer: ImageEffectRenderer;
  private hasImage: boolean = false;

  private currentFrame:number;

  constructor(private wrapper:HTMLElement) {
    this.hasImage = this.wrapper.hasAttribute('data-image');

    this.renderer = ImageEffectRenderer.createTemporary(
      this.wrapper,
      this.hasImage ? smoothstep : wolfenstein,
      !this.hasImage,
    );

    if (this.hasImage) {
      this.loadImages().then(this.init.bind(this));
    } else {
      this.renderer.play();
    }
  }

  private init(images: Array<HTMLImageElement>):void {
  	this.renderer.addImage(images[0], 0);
  	this.renderer.addImage(images[1], 1);

  	this.drawCurrentFrame();

  	const range = <HTMLInputElement>document.querySelector('.js-progress');
  	range.addEventListener('input', () => {
  	  this.currentFrame = parseInt(range.value, 10);
  	  this.drawCurrentFrame();
    });
  }

  private drawCurrentFrame():void {
    this.renderer.setUniformFloat('delta', this.currentFrame / ImageEffectRenderer.MAX_ANIMATION_FRAMES);
    this.renderer.draw();
  }

  private loadImages():Promise<any> {
    return Promise.all(
      ['example.jpg', 'transition.jpg'].map(fileName => this.loadImage(fileName)),
    );
  }

  private loadImage(fileName: string):Promise<HTMLImageElement> {
    return new Promise((resolve) => {
      const img = new Image;
      img.onload = () => resolve(img);
      img.src = `../static/${fileName}`;
    });
  }
}
