import { ImageEffectRenderer } from '../../src/';
const wolfenstein = require('./shader/wolfenstein.glsl');

export default class ImageEffectExample {

  private renderer: ImageEffectRenderer;

  constructor(private wrapper:HTMLElement) {
    this.renderer = ImageEffectRenderer.createTemporary(this.wrapper, wolfenstein, true);
    this.renderer.play();
  }
}
