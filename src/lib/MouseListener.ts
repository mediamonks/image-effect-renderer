// Shadertoy mouse semantics:
//   mouse.xy  = mouse position during last button down (pixels)
//   abs(mouse.zw) = mouse position during last button click (pixels)
//   sign(mouse.z)  = button is down
//   sign(mouse.w)  = button is clicked (only frame of click)

let mouseX: number = 0;
let mouseY: number = 0;
let mouseXPrev: number = 0;
let mouseYPrev: number = 0;
let mouseDown: boolean = false;
let mouseClicked: boolean = false;
let clickX: number = 0;
let clickY: number = 0;
let dragX: number = 0;
let dragY: number = 0;
let mouseBinded: boolean = false;

export function bindMouseListener(container: HTMLElement) {
  if (mouseBinded) {
    return;
  }
  mouseBinded = true;

  container.addEventListener('mousemove', (event) => {
    mouseXPrev = mouseX;
    mouseYPrev = mouseY;
    mouseX = event.clientX;
    mouseY = event.clientY;
    if (mouseDown) {
      dragX = mouseX;
      dragY = mouseY;
    }
  }, {passive: true});

  container.addEventListener('mousedown', (event) => {
    if (event.button === 0) {
      mouseDown = true;
      mouseClicked = true;
      clickX = event.clientX;
      clickY = event.clientY;
      dragX = event.clientX;
      dragY = event.clientY;
    }
  }, {passive: true});

  container.addEventListener('mouseup', (event) => {
    if (event.button === 0) {
      mouseDown = false;
    }
  }, {passive: true});
}

export function clearMouseClick(): void {
  mouseClicked = false;
}

export type Rect = {
  left: number,
  top: number,
  width: number,
  height: number,
}

export function getMousePosition(): [number, number] {
  return [mouseX, mouseY];
}

// Returns normalized mouse vec4 (x, y, xprev, yprev) in 0-1 range
export function getNormalizedMouse(container: Rect): [number, number, number, number] {
  const x = (mouseX - container.left) / container.width;
  const y = 1 - (mouseY - container.top) / container.height;
  const xprev = (mouseXPrev - container.left) / container.width;
  const yprev = 1 - (mouseYPrev - container.top) / container.height;
  return [x, y, xprev, yprev];
}

// Returns Shadertoy-compatible mouse vec4 in pixel coordinates
export function getShadertoyMouse(container: Rect): [number, number, number, number] {
  const height = container.height;
  
  // Convert to pixel coords relative to container, Y flipped
  const dx = dragX - container.left;
  const dy = height - (dragY - container.top);
  const cx = clickX - container.left;
  const cy = height - (clickY - container.top);
  
  // xy = drag position (only valid when button was/is down)
  const x = mouseDown || clickX > 0 ? dx : 0;
  const y = mouseDown || clickY > 0 ? dy : 0;
  
  // zw = click position with sign for button state
  const z = (mouseDown ? 1 : -1) * (cx > 0 ? cx : 0);
  const w = (mouseClicked ? 1 : -1) * (cy > 0 ? cy : 0);
  
  return [x, y, z, w];
}