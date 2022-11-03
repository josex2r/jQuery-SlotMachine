import SlotMachine from '../../lib';
import { render } from '../setup';

describe('Setters', () => {
  let machine: SlotMachine;

  afterEach(() => {
    if (machine) {
      machine.element.remove();
    }
  });

  describe('active', () => {
    it(`sets active element`, () => {
      const index = 1;
      machine = render();

      machine.active = index;

      expect(machine.active).toBe(index);
    });

    [-1, 9].forEach((index) => {
      it(`does not set active element when is out of bounds: ${index}`, () => {
        machine = render();

        machine.active = index;

        expect(machine.active).toBe(0);
      });
    });
  });
});
