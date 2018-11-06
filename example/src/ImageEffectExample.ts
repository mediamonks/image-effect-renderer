import { TweenLite, Linear } from 'gsap';
import { ImageEffectRenderer } from '../../src/';
import ImageLoader from './ImageLoader';
const wolfenstein = require('./shader/wolfenstein.glsl');
const smoothstep = require('./shader/smoothstep.glsl');
const glitch = require('./shader/glitch.glsl');

export default class ImageEffectExample {
  public static MAX_ANIMATION_FRAMES: number = 255;

  private wrapper: HTMLElement;
  private renderer: ImageEffectRenderer;
  private hasImage: boolean = false;
  private isInfinite: boolean = false;

  private currentFrame:number = 0;

  constructor(wrapper: HTMLElement) {
    this.wrapper = wrapper;
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

      const playButton = <HTMLButtonElement>document.querySelector('.js-play');
      playButton.addEventListener('click', () => this.playRange(parseInt(range.max, 10), range));
    } else {
  	  this.renderer.play();
    }
  }

  private drawCurrentFrame():void {
    this.renderer.setUniformFloat('delta', this.currentFrame / ImageEffectExample.MAX_ANIMATION_FRAMES);
    this.renderer.draw();
  }

  private playRange(to: number, rangeInput: HTMLInputElement):void {
    this.currentFrame = this.currentFrame === to ? 0 : this.currentFrame;
    TweenLite.to(this, Math.max(0, to - this.currentFrame) / 25, {
      currentFrame: to,
      roundProps: 'currentFrame',
      ease: Linear.easeNone,
      onUpdate: () => {
        rangeInput.value = this.currentFrame.toString();
        this.drawCurrentFrame();
      },
    });
  }
}
