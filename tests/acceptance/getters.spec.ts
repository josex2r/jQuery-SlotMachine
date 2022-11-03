import SlotMachine from '../../lib';
import { Direction } from '../../lib/types';
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

        expect(machine.active).toBe(index);
        expect(tile?.element?.innerHTML).toBe(text);
      });
    });
  });

  describe('custom', () => {
    it(`receives active element when calling randomize`, () => {
      const randomize = jest.fn().mockReturnValue(1);

      machine = render({
        randomize,
      });
      machine.shuffle(2);

      expect(randomize).toHaveBeenCalledWith(machine.active, 3);
    });

    it(`gets custom element from randomize function`, () => {
      const index = 1;
      const randomize = jest.fn().mockReturnValue(index);

      machine = render({
        randomize,
      });
      machine.shuffle(2);

      expect(randomize).toHaveBeenCalled();
    });
  });

  describe('Direction', () => {
    [
      {
        direction: 'up' as Direction,
        result: {
          initial: -20,
          from: -60,
          to: 0,
          nextReset: 0,
          prevReset: -80,
        },
      },
      {
        direction: 'down' as Direction,
        result: {
          initial: -20,
          from: -20,
          to: -80,
          nextReset: 0,
          prevReset: -80,
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
});
