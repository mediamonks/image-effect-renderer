import type {RendererBuffer} from "./RendererBuffer.js";

export type Texture = {
  texture: WebGLTexture | undefined;
  buffer: RendererBuffer | undefined;
  cached: boolean;
  isCubemap: boolean;
}
