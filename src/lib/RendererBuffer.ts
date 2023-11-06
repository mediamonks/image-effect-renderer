import {FrameBuffer} from "./FrameBuffer.js";
import {WebGLInstance} from "./WebGLInstance.js";
import {type ImageOptions, Renderer} from "./Renderer.js";

export type BufferOptions = ImageOptions & {
    type: number,
}

export class RendererBuffer extends Renderer {
    public static defaultBufferOptions: BufferOptions = {
        ...Renderer.defaultImageOptions,
        useMipmap: false,
        useCache: false,
        type: WebGLRenderingContext.UNSIGNED_BYTE,
    };

    public options: BufferOptions;
    // buffers
    private readonly frameBuffer0: FrameBuffer;
    private readonly frameBuffer1: FrameBuffer;

    constructor(glInstance: WebGLInstance, options: Partial<BufferOptions> = {}) {
        super(glInstance);

        this.options = {...RendererBuffer.defaultBufferOptions, ...options};

        this.frameBuffer0 = new FrameBuffer(glInstance, this.options.type);
        this.frameBuffer1 = new FrameBuffer(glInstance, this.options.type);
    }

    public override draw(time: number = 0, width: number, height: number): void {
        if (width <= 0 || height <= 0) {
            return;
        }

        const context = this.gl.context;

        const fb = this.dest;

        fb.resize(width, height);
        context.bindFramebuffer(context.FRAMEBUFFER, fb.frameBuffer);
        context.clear(context.COLOR_BUFFER_BIT);

        super.draw(time, width, height);

        context.bindFramebuffer(context.FRAMEBUFFER, null);
    }

    public get src(): FrameBuffer {
        return (this.frame % 2 === 0
            ? this.frameBuffer0
            : this.frameBuffer1);
    }

    public get dest(): FrameBuffer {
        return (this.frame % 2 === 1
            ? this.frameBuffer0
            : this.frameBuffer1);
    }

    public override destruct() {
        super.destruct();

        this.frameBuffer0.destruct();
        this.frameBuffer1.destruct();
    }
}
