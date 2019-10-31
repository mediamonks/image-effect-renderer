import { ImageEffectRenderer } from '../../../src/';
const wolfenstein = require('../shader/wolfenstein.glsl');

export default class Wolfenstein {
  private wrapper: HTMLElement;
  private renderer: ImageEffectRenderer;

  constructor(wrapper: HTMLElement) {
    this.wrapper = wrapper;

    this.renderer = ImageEffectRenderer.createTemporary(this.wrapper, wolfenstein, true);
    this.renderer.play();
  }
}
