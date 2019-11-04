import { ImageEffectRenderer } from '../../../src/';
const wolfenstein = require('../shader/wolfenstein.glsl');

export default class Wolfenstein {
  constructor(wrapper: HTMLElement) {
    ImageEffectRenderer.createTemporary(wrapper, wolfenstein, true);
  }
}
