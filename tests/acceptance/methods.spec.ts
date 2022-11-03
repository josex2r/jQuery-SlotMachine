import SlotMachine from '../../lib';
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

        expect(machine.container.getTileOffset(index)).toBe(offset);
      });
    });
  });

  describe('next()', () => {
    it('changes machine state', () => {
      machine = render();

      machine.next();

      expect(machine.running).toBeTruthy();
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
        expect(machine.active).toBe(2);
        expect(tile?.element?.innerHTML).toBe('wow');

        machine.next();

        tile = getVisibleTile(machine);
        expect(machine.active).toBe(1);
        expect(tile?.element?.innerHTML).toBe('bar');
      });

      it('second to last', () => {
        machine = render({
          direction: 'up',
          active: 1,
        });

        let tile = getVisibleTile(machine);
        expect(machine.active).toBe(1);
        expect(tile?.element?.innerHTML).toBe('bar');

        machine.next();

        tile = getVisibleTile(machine);
        expect(machine.active).toBe(0);
        expect(tile?.element?.innerHTML).toBe('foo');
      });
    });

    describe('direction "bottom"', () => {
      it('last to first', () => {
        machine = render({
          direction: 'down',
          active: 2,
        });

        let tile = getVisibleTile(machine);
        expect(machine.active).toBe(2);
        expect(tile?.element?.innerHTML).toBe('wow');

        machine.next();

        tile = getVisibleTile(machine);
        expect(machine.active).toBe(0);
        expect(tile?.element?.innerHTML).toBe('foo');
      });

      it('first to second', () => {
        machine = render({
          direction: 'down',
        });

        let tile = getVisibleTile(machine);
        expect(machine.active).toBe(0);
        expect(tile?.element?.innerHTML).toBe('foo');

        machine.next();

        tile = getVisibleTile(machine);
        expect(machine.active).toBe(1);
        expect(tile?.element?.innerHTML).toBe('bar');
      });
    });
  });

  describe('prev()', () => {
    it('changes machine state', () => {
      machine = render();

      machine.next();

      expect(machine.running).toBeTruthy();
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
        expect(machine.active).toBe(0);
        expect(tile?.element?.innerHTML).toBe('foo');

        machine.prev();

        tile = getVisibleTile(machine);
        expect(machine.active).toBe(1);
        expect(tile?.element?.innerHTML).toBe('bar');
      });

      it('last to second', () => {
        machine = render({
          direction: 'up',
          active: 2,
        });

        let tile = getVisibleTile(machine);
        expect(machine.active).toBe(2);
        expect(tile?.element?.innerHTML).toBe('wow');

        machine.prev();

        tile = getVisibleTile(machine);
        expect(machine.active).toBe(0);
        expect(tile?.element?.innerHTML).toBe('foo');
      });
    });

    describe('direction "bottom"', () => {
      it('second to first', () => {
        machine = render({
          direction: 'down',
          active: 2,
        });

        let tile = getVisibleTile(machine);
        expect(machine.active).toBe(2);
        expect(tile?.element?.innerHTML).toBe('wow');

        machine.prev();

        tile = getVisibleTile(machine);
        expect(machine.active).toBe(1);
        expect(tile?.element?.innerHTML).toBe('bar');
      });

      it('first to last', () => {
        machine = render({
          direction: 'down',
        });

        let tile = getVisibleTile(machine);
        expect(machine.active).toBe(0);
        expect(tile?.element?.innerHTML).toBe('foo');

        machine.prev();

        tile = getVisibleTile(machine);
        expect(machine.active).toBe(2);
        expect(tile?.element?.innerHTML).toBe('wow');
      });
    });
  });
});
