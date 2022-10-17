import SlotMachine, { Direction } from '../../lib/slot-machine';
import { getVisibleTile, render } from '../setup';

describe('Setters', () => {
  let machine: SlotMachine;

  afterEach(() => {
    if (machine) {
      machine.element.remove();
    }
  });

  describe('getTileOffset()', () => {
    [-20, -40, -60, -80].forEach((offset, index) => {
      it(`getTileOffset(): ${index}`, () => {
        machine = render();

        expect(machine.getTileOffset(index)).toBe(offset);
      });
    });
  });

  describe('next()', () => {
    it('changes machine state', () => {
      machine = render();

      machine.next();

      expect(machine.running).toBeTruthy();
    });

    it('return next active element', () => {
      machine = render();

      const nextIndex = machine.next();

      expect(nextIndex).toBeGreaterThanOrEqual(0);
    });

    it('stops the machine', () => {
      machine = render();
      machine.stop = jest.fn();

      machine.next();

      expect(machine.stop).toHaveBeenCalled();
    });

    describe('direction "up"', () => {
      it('last to first', () => {
        machine = render({
          direction: 'up',
          active: 2,
        });

        let tile = getVisibleTile(machine);
        expect(machine.visibleTile).toBe(2);
        expect(machine.active).toBe(2);
        expect(tile?.innerHTML).toBe('wow');

        machine.next();

        tile = getVisibleTile(machine);
        expect(machine.visibleTile).toBe(0);
        expect(machine.active).toBe(0);
        expect(tile?.innerHTML).toBe('foo');
      });

      it('second to last', () => {
        machine = render({
          direction: 'up',
          active: 1,
        });

        let tile = getVisibleTile(machine);
        expect(machine.visibleTile).toBe(1);
        expect(machine.active).toBe(1);
        expect(tile?.innerHTML).toBe('bar');

        machine.next();

        tile = getVisibleTile(machine);
        expect(machine.visibleTile).toBe(2);
        expect(machine.active).toBe(2);
        expect(tile?.innerHTML).toBe('wow');
      });
    });

    describe('direction "bottom"', () => {
      it('last to first', () => {
        machine = render({
          direction: 'bottom' as Direction,
          active: 2,
        });

        let tile = getVisibleTile(machine);
        expect(machine.visibleTile).toBe(2);
        expect(machine.active).toBe(2);
        expect(tile?.innerHTML).toBe('wow');

        machine.next();

        tile = getVisibleTile(machine);
        expect(machine.visibleTile).toBe(0);
        expect(machine.active).toBe(0);
        expect(tile?.innerHTML).toBe('foo');
      });

      it('first to second', () => {
        machine = render({
          direction: 'bottom' as Direction,
        });

        let tile = getVisibleTile(machine);
        expect(machine.visibleTile).toBe(0);
        expect(machine.active).toBe(0);
        expect(tile?.innerHTML).toBe('foo');

        machine.next();

        tile = getVisibleTile(machine);
        expect(machine.visibleTile).toBe(1);
        expect(machine.active).toBe(1);
        expect(tile?.innerHTML).toBe('bar');
      });
    });
  });

  describe('prev()', () => {
    it('changes machine state', () => {
      machine = render();

      machine.next();

      expect(machine.running).toBeTruthy();
    });

    it('return next active element', () => {
      machine = render();

      const nextIndex = machine.next();

      expect(nextIndex).toBeGreaterThanOrEqual(0);
    });

    it('stops the machine', () => {
      machine = render();
      machine.stop = jest.fn();

      machine.next();

      expect(machine.stop).toHaveBeenCalled();
    });

    describe('direction "up"', () => {
      it('first to last', () => {
        machine = render({
          direction: 'up',
        });

        let tile = getVisibleTile(machine);
        expect(machine.visibleTile).toBe(0);
        expect(machine.active).toBe(0);
        expect(tile?.innerHTML).toBe('foo');

        machine.prev();

        tile = getVisibleTile(machine);
        expect(machine.visibleTile).toBe(2);
        expect(machine.active).toBe(2);
        expect(tile?.innerHTML).toBe('wow');
      });

      it('last to second', () => {
        machine = render({
          direction: 'up',
          active: 2,
        });

        let tile = getVisibleTile(machine);
        expect(machine.visibleTile).toBe(2);
        expect(machine.active).toBe(2);
        expect(tile?.innerHTML).toBe('wow');

        machine.prev();

        tile = getVisibleTile(machine);
        expect(machine.visibleTile).toBe(1);
        expect(machine.active).toBe(1);
        expect(tile?.innerHTML).toBe('bar');
      });
    });

    describe('direction "bottom"', () => {
      it('second to first', () => {
        machine = render({
          direction: 'bottom' as Direction,
          active: 2,
        });

        let tile = getVisibleTile(machine);
        expect(machine.visibleTile).toBe(2);
        expect(machine.active).toBe(2);
        expect(tile?.innerHTML).toBe('wow');

        machine.prev();

        tile = getVisibleTile(machine);
        expect(machine.visibleTile).toBe(1);
        expect(machine.active).toBe(1);
        expect(tile?.innerHTML).toBe('bar');
      });

      it('first to last', () => {
        machine = render({
          direction: 'bottom' as Direction,
        });

        let tile = getVisibleTile(machine);
        expect(machine.visibleTile).toBe(0);
        expect(machine.active).toBe(0);
        expect(tile?.innerHTML).toBe('foo');

        machine.prev();

        tile = getVisibleTile(machine);
        expect(machine.visibleTile).toBe(2);
        expect(machine.active).toBe(2);
        expect(tile?.innerHTML).toBe('wow');
      });
    });
  });
});
