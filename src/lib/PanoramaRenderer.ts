import sengDisposable from 'seng-disposable';
import ImageEffectRenderer from './ImageEffectRenderer';

/**
 * Created by johan on 28-12-2017.
 */
class MouseButton {
  public press: boolean = false; // currently pressed
  public down: boolean = false; // moment of press start
  public oldDown: boolean = false;
  public hit: boolean = false;
  public downTime: number = 0;
}

class MouseListener extends sengDisposable {
  private canvas: HTMLCanvasElement;
  private mousePos: Float32Array = new Float32Array([0, 0]);
  private previousMousePos: Float32Array = new Float32Array([0, 0]);
  private mouseVelocity: Float32Array = new Float32Array([0, 0]);
  private normalized: Float32Array = new Float32Array([0, 0]);
  private mouseClickCallbacks: any[] = [];
  private buttons: MouseButton[] = [];
  private resetSpeed: boolean = false;

  private touchMoveListener: any;
  private endListener: any;
  private mouseMoveListener: any;

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;

    for (let i = 0; i < 3; i++) {
      this.buttons.push(new MouseButton());
    }

    this.touchMoveListener = e => this.setMouse(e.targetTouches[0]);
    this.mouseMoveListener = e => this.setMouse(e);
    this.endListener = () => {
      this.buttons[0].press = false;
    };

    this.canvas.addEventListener('touchstart', this.onMouseStart, false);
    this.canvas.addEventListener('touchmove', this.touchMoveListener, false);
    this.canvas.addEventListener('touchend', this.endListener, false);
    this.canvas.addEventListener('touchcancel', this.endListener, false);
    this.canvas.addEventListener('mousedown', this.onMouseStart, false);
    this.canvas.addEventListener('mousemove', this.mouseMoveListener, false);
    this.canvas.addEventListener('mouseup', this.endListener, false);
    this.canvas.addEventListener('mousecancel', this.endListener, false);
    this.canvas.addEventListener('mouseout', this.endListener, false);
  }

  private onMouseStart = (event: TouchEvent | MouseEvent): void => {
    event.preventDefault();

    const isTouch = event instanceof TouchEvent;
    this.resetSpeed = true;

    this.buttons[isTouch ? 0 : event.which - 1].press = true;
    this.setMouse(isTouch ? (<TouchEvent>event).targetTouches[0] : event);

    for (let i = 0; i < this.mouseClickCallbacks.length; i++) {
      this.mouseClickCallbacks[i].call(this);
    }
  };

  private setMouse(event: any): void {
    this.mousePos[0] = event.pageX;
    this.mousePos[1] = event.pageY;
  }

  public getNormalizedVelocity(): Float32Array {
    return this.mouseVelocity;
  }

  public getMouseDown(): boolean {
    return this.buttons[0].press;
  }

  public update(): void {
    this.normalized[0] = this.mousePos[0] / this.canvas.clientWidth;
    this.normalized[1] = this.mousePos[1] / this.canvas.clientHeight;

    if (this.resetSpeed) {
      this.resetSpeed = false;
      this.mouseVelocity[0] = 0;
      this.mouseVelocity[1] = 0;
    } else {
      this.mouseVelocity[0] = this.normalized[0] - this.previousMousePos[0];
      this.mouseVelocity[1] = this.normalized[1] - this.previousMousePos[1];
    }
    this.previousMousePos[0] = this.normalized[0];
    this.previousMousePos[1] = this.normalized[1];

    // this section makes sure a drag is not used as a click
    // when the mouse is released after a press longer than 0.25 sec, it is not a click
    for (let i = 0; i < 3; i++) {
      const button: MouseButton = this.buttons[i];
      button.hit = false;
      button.down = false;

      if (this.buttons[i].press) {
        if (button.downTime === 0) {
          button.down = true;
        }
        button.downTime++;
      } else {
        button.hit = button.downTime < 15 && button.oldDown;
        button.downTime = 0;
      }

      button.oldDown = button.press;
    }
  }

  dispose() {
    if (!this.isDisposed()) {
      if (this.canvas) {
        this.canvas.removeEventListener('touchstart', this.onMouseStart, false);
        this.canvas.removeEventListener('touchmove', this.touchMoveListener, false);
        this.canvas.removeEventListener('touchend', this.endListener, false);
        this.canvas.removeEventListener('touchcancel', this.endListener, false);
        this.canvas.removeEventListener('mousedown', this.onMouseStart, false);
        this.canvas.removeEventListener('mousemove', this.mouseMoveListener, false);
        this.canvas.removeEventListener('mouseend', this.endListener, false);
        this.canvas.removeEventListener('mousecancel', this.endListener, false);
        this.canvas.removeEventListener('mouseout', this.endListener, false);
      }

      this.normalized = null;
      this.mouseVelocity = null;
      this.previousMousePos = null;
    }

    super.dispose();
  }
}

export default class PanoramaRenderer extends sengDisposable {
  private imageEffectRender: ImageEffectRenderer;
  private mouseListener: MouseListener;
  private rotateX: number = 0;
  private rotateY: number = 0;
  private rotateSpeedX: number = 0;
  private rotateSpeedY: number = 0;
  private inertia: number;
  private smoothness: number;
  private fovV: number;

  private isReady: boolean = false;
  private animationLoop: boolean = false;

  constructor(
    canvasParent: HTMLElement,
    panoramaPath: string,
    fovDegrees: number = 70,
    rotateInertia = 0.95,
    smoothness = 0.75,
  ) {
    super();
    this.inertia = rotateInertia;
    this.fovV = fovDegrees;
    this.smoothness = smoothness;

    this.imageEffectRender = ImageEffectRenderer.createTemporary(
      canvasParent,
      this.getShader(),
      false,
    );

    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.src = panoramaPath;
    image.onload = () => {
      this.imageEffectRender.addImage(image, 0, false, true, true);
      this.isReady = true;
    };

    this.mouseListener = new MouseListener(this.imageEffectRender.getCanvas());
  }

  public init(): void {
    this.play();
  }

  public play(): void {
    this.animationLoop = true;
    this.update();
  }

  public pause(): void {
    this.animationLoop = false;
  }

  public updateSize(): void {
    this.imageEffectRender.updateSize();
  }

  private update(): void {
    if (this.isDisposed() || !this.animationLoop) return;
    if (this.isReady) {
      this.mouseListener.update();

      // aspect ratio can change
      const c = this.imageEffectRender.getCanvas();
      const aspect = c.width / c.height;
      const degToRad = Math.PI / 180;
      const z = 0.5 / Math.tan(this.fovV * (0.5 * degToRad));
      const fovH = Math.atan2(aspect * 0.5, z) * (2 * 180 / 3.14159265359);

      if (this.mouseListener.getMouseDown()) {
        const ms = this.mouseListener.getNormalizedVelocity();
        this.rotateSpeedX = this.lerp(-ms[0] * fovH, this.rotateSpeedX, this.smoothness);
        this.rotateSpeedY = this.lerp(ms[1] * this.fovV, this.rotateSpeedY, this.smoothness);
      } else {
        this.rotateSpeedX *= this.inertia;
        this.rotateSpeedY *= this.inertia;
      }
      this.rotateX += this.rotateSpeedX;
      this.rotateY += this.rotateSpeedY;
      if (this.rotateY > 90) this.rotateY = 90;
      if (this.rotateY < -90) this.rotateY = -90;

      this.imageEffectRender.setUniformVec2(
        'uRotation',
        this.rotateX * degToRad,
        this.rotateY * degToRad,
      );

      const height: number = Math.tan(this.fovV * 0.5);
      const width: number = height * aspect;

      this.imageEffectRender.setUniformVec3('uFrustumCorner', -width, height, 1);

      this.imageEffectRender.setUniformFloat('uAspect', aspect);

      this.imageEffectRender.draw();
    }

    window.requestAnimationFrame(() => this.update());
  }

  private getShader(): string {
    return `
      uniform vec2 uRotation;
			uniform float uAspect;
			uniform vec3 uFrustumCorner;
			
			vec2 getEqUV(vec3 rd)
      {
        vec2 uv = vec2(atan(rd.z, rd.x), asin(rd.y));
				uv *= vec2(0.1591,0.3183);
				uv.y += 0.5;
				return fract(uv);
      }
      mat2 getMatrix(float a)
			{
				float s = sin(a);
				float c = cos(a);
				return mat2(c, -s, s, c);
			}
      void mainImage( out vec4 c, vec2 p )
      {
        vec3 rd = vec3(vUV0 * 2. - 1., 1.) * uFrustumCorner;
        rd = normalize(rd);
        rd.yz *= getMatrix(-uRotation.y);
        rd.xz *= getMatrix(uRotation.x);
        c.xyz = texture(iChannel0, getEqUV(rd)).xyz;
        c.w = 1.0;
      }
    `;
  }

  private lerp(a: number, b: number, i: number): number {
    return (1 - i) * a + i * b;
  }

  dispose() {
    if (!this.isDisposed()) {
      this.mouseListener.dispose();
      ImageEffectRenderer.releaseTemporary(this.imageEffectRender);
    }
    super.dispose();
  }
}
