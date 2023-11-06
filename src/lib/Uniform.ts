export enum UniformType {
    INT,
    FLOAT,
    VEC2,
    VEC3,
    VEC4,
    MATRIX,
}

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
