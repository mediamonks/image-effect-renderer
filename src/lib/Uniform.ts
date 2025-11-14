export const UNIFORM_INT = 0;
export const UNIFORM_FLOAT = 1;
export const UNIFORM_VEC2 = 2;
export const UNIFORM_VEC3 = 3;
export const UNIFORM_VEC4 = 4;
export const UNIFORM_MATRIX = 5;

export type UniformType =
  typeof UNIFORM_INT
  | typeof UNIFORM_FLOAT
  | typeof UNIFORM_VEC2
  | typeof UNIFORM_VEC3
  | typeof UNIFORM_VEC4
  | typeof UNIFORM_MATRIX;

export default class Uniform {
  public type: UniformType;
  public name: string;
  public x: number = 0;
  public y: number = 0;
  public z: number = 0;
  public w: number = 0;
  public matrix: Float32Array | undefined;

  constructor(type: UniformType, name: string) {
    this.type = type;
    this.name = name;
  }
}
