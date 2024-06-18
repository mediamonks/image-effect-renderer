let mouseX: number = -0;
let mouseY: number = -0;
let mouseBinded: boolean = false;

export function bindMouseListener(container: HTMLElement) {
  if (mouseBinded) {
    return;
  }
  mouseBinded = true;
  container.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  }, {passive: true});
}

export function getMousePosition(): [number, number] {
  return [mouseX, mouseY];
}

export type Rect = {
  left: number,
  top: number,
  width: number,
  height: number,
}

export function getNormalizedMousePosition(container: Rect, mouse: [number, number]): [number, number] {
  const x = (mouse[0] - container.left) / container.width;
  const y = 1 - (mouse[1] - container.top) / container.height;
  return [x, y];
}