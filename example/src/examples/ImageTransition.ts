import { TweenLite, Linear } from 'gsap';
import { ImageEffectRenderer } from '../../../src/';
import ImageLoader from '../utils/ImageLoader';
const smoothstep = require('../shader/smoothstep.glsl');

export default class ImageEffectExample {
  public static MAX_ANIMATION_FRAMES: number = 255;

  private wrapper: HTMLElement;
  private renderer: ImageEffectRenderer;

  private currentFrame:number = 0;

  constructor(wrapper: HTMLElement) {
    this.wrapper = wrapper;

    this.renderer = ImageEffectRenderer.createTemporary(this.wrapper, smoothstep, false);

    ImageLoader.loadImages(['example.jpg', 'transition.jpg']).then(this.init.bind(this));
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

    const playButton = <HTMLButtonElement>document.querySelector('.js-play');
    playButton.addEventListener('click', () => this.playRange(parseInt(range.max, 10), range));
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
