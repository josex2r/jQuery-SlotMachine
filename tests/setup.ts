import SlotMachine from '../lib';
import { Options } from '../lib/types';

// "jsdom" does not support offset API >_<
Object.defineProperties(window.HTMLElement.prototype, {
  offsetTop: {
    get() {
      const index = [...this.parentElement.children].indexOf(this);
      const offset = parseFloat(window.getComputedStyle(this).height) || 0;

      return offset * index;
    },
  },
  offsetHeight: {
    get() {
      const offset = parseFloat(window.getComputedStyle(this).height) || 0;

      return offset;
    },
  },
});

export const MACHINE_ID = 'machine';

export function render(options?: Options) {
  const machine = document.createElement('div');

  machine.id = MACHINE_ID;
  machine.style.height = '20px';
  machine.style.width = '25px';
  machine.style.overflow = 'hidden';
  machine.innerHTML = `
    <div class="text-center" style="height: 20px">foo</div>
    <div class="text-center" style="height: 20px">bar</div>
    <div class="text-center" style="height: 20px">wow</div>`;
  document.body.appendChild(machine);

  return new SlotMachine(machine, options || ({} as Options));
}

export function getVisibleTile(machine: SlotMachine) {
  const rawContainerMargin = machine.container.element.style.transform || '';
  const matrixRegExp = /^matrix\(-?\d+,\s?-?\d+,\s?-?\d+,\s?-?\d+,\s?-?\d+,\s?(-?\d+)\)$/;
  const offset = parseInt(rawContainerMargin.replace(matrixRegExp, '$1'), 10);
  const height = machine.container.tiles[0].element.offsetHeight;

  return machine.container.tileNodes[Math.abs(offset / height)];
}
