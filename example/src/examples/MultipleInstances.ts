import FlowBuffer from './FlowBuffer';
import RepeatingEffect from './RepeatingEffect';
import Wolfenstein from './Wolfenstein';

export default class MultipleInstances {
  private static NUM_INSTANCES: number = 50;

  constructor(wrapper: HTMLElement) {
    for (let i = 0; i < MultipleInstances.NUM_INSTANCES; i++) {
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.left = (Math.random() * 100-5) + '%';
      div.style.top = (Math.random() * 100-5) + '%';
      div.style.width = (100 + Math.random() * 200) + 'px';
      div.style.height = (100 + Math.random() * 200) + 'px';

      wrapper.appendChild(div);

      if (Math.random() < 1/3) {
        new FlowBuffer(div);
      } else if (Math.random() < .5) {
        new Wolfenstein(div);
      } else {
        new RepeatingEffect(div);
      }
    }
  }
}
