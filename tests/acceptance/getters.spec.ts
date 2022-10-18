import SlotMachine, { Direction } from '../../lib/slot-machine';
import { getVisibleTile, render } from '../setup';

describe('Getters', () => {
  let machine: SlotMachine;

  afterEach(() => {
    jest.clearAllMocks();
    machine.element?.remove();
  });

  describe('visibleTile', () => {
    ['foo', 'bar', 'wow'].forEach((text, index) => {
      it(`gets visibleTile: ${index}`, () => {
        machine = render({
          active: index,
        });
        const tile = getVisibleTile(machine);

        expect(machine.visibleTile).toBe(index);
        expect(machine.active).toBe(index);
        expect(tile?.innerHTML).toBe(text);
      });
    });
  });

  describe('random', () => {
    it(`gets random index between min and max tiles length`, () => {
      machine = render();

      for (let i = 0; i < 1000; i++) {
        const random = machine.random;

        expect(random).toBeGreaterThanOrEqual(0);
        expect(random).toBeLessThanOrEqual(2);
      }
    });
  });

  describe('custom', () => {
    it(`receives active element when calling randomize`, () => {
      const randomize = jest.fn().mockReturnValue(1);

      machine = render({
        randomize,
      });

      expect(machine.custom).toBeGreaterThanOrEqual(0);
      expect(randomize).toHaveBeenCalledWith(machine.active);
    });

    it(`gets custom element from randomize function`, () => {
      const index = 1;
      const randomize = jest.fn().mockReturnValue(index);

      machine = render({
        randomize,
      });

      expect(machine.custom).toBe(index);
      expect(randomize).toHaveBeenCalled();
    });

    [-1, 9].forEach((index) => {
      it(`sets 0 when custom element is out of bounds: ${index}`, () => {
        const randomize = jest.fn().mockReturnValue(index);

        machine = render({
          randomize,
        });

        expect(machine.custom).toBe(0);
        expect(randomize).toHaveBeenCalled();
      });
    });

    it(`gets random element`, () => {
      machine = render();

      for (let i = 0; i < 1000; i++) {
        const custom = machine.custom;

        expect(custom).toBeGreaterThanOrEqual(0);
        expect(custom).toBeLessThanOrEqual(2);
      }
    });
  });

  describe('Direction', () => {
    [
      {
        direction: 'up' as Direction,
        result: {
          key: 'up',
          initial: -20,
          first: 0,
          last: -80,
          to: -60,
          firstToLast: -80,
          lastToFirst: 0,
        },
      },
      {
        direction: 'down' as Direction,
        result: {
          key: 'down',
          initial: -20,
          first: -80,
          last: 0,
          to: -20,
          firstToLast: -80,
          lastToFirst: 0,
        },
      },
    ].forEach((testCase) => {
      it(`sets direction: ${testCase.direction}`, () => {
        machine = render({
          direction: testCase.direction,
        });

        expect(machine.bounds).toStrictEqual(testCase.result);
      });
    });
  });

  describe('Prev index', () => {
    it('gets prev index from first element and direction "up"', () => {
      machine = render({
        direction: 'up',
        active: 0,
      });

      expect(machine.prevIndex).toBe(1);
    });

    it('gets prev index from last element and direction "up"', () => {
      machine = render({
        direction: 'up',
        active: 2,
      });

      expect(machine.prevIndex).toBe(0);
    });

    it('gets prev index from first element and direction "down"', () => {
      machine = render({
        direction: 'down',
        active: 0,
      });

      expect(machine.prevIndex).toBe(2);
    });

    it('gets prev index from last element and direction "down"', () => {
      machine = render({
        direction: 'down',
        active: 2,
      });

      expect(machine.prevIndex).toBe(1);
    });
  });

  describe('visible', () => {
    it('is visible', () => {
      machine = render();

      expect(machine.visible).toBeTruthy();
    });

    it.skip('is not visible when "top" is out of bounds', () => {
      machine = render();

      machine.element.style.position = 'absolute';
      machine.element.style.top = '-100px';

      expect(machine.visible).toBeFalsy();
    });

    it.skip('is not visible when "bottom" is out of bounds', () => {
      machine = render();

      machine.element.style.position = 'absolute';
      machine.element.style.bottom = '-100px';

      expect(machine.visible).toBeFalsy();
    });

    it.skip('is not visible when "left" is out of bounds', () => {
      machine = render();

      machine.element.style.position = 'absolute';
      machine.element.style.left = '-100px';

      expect(machine.visible).toBeFalsy();
    });

    it.skip('is not visible when "right" is out of bounds', () => {
      machine = render();

      machine.element.style.position = 'absolute';
      machine.element.style.right = '-100px';

      expect(machine.visible).toBeFalsy();
    });
  });
});
