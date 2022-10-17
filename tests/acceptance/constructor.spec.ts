import SlotMachine, { Direction } from '../../lib/slot-machine';
import { MACHINE_ID, render } from '../setup';

describe('Constructor', () => {
  let machine: SlotMachine;
  let shuffleSpy;
  let runSpy;

  beforeEach(() => {
    shuffleSpy = jest.spyOn(SlotMachine.prototype, 'shuffle');
    runSpy = jest.spyOn(SlotMachine.prototype, 'run');
  });

  afterEach(() => {
    jest.clearAllMocks();
    machine.element?.remove();
  });

  it('has element', () => {
    machine = render();

    const element = document.getElementById(MACHINE_ID);

    expect(machine.element).toBe(element);
  });

  it('element does not have overflow', () => {
    machine = render();

    expect(machine.element.style.overflow).toBe('hidden');
  });

  [
    { active: 0, result: 0 },
    { active: 1, result: 1 },
    { active: 99, result: 0 },
    { active: -99, result: 0 },
    { active: undefined, result: 0 },
  ].forEach((testCase) => {
    it(`sets active: ${testCase.active}`, () => {
      machine = render({
        active: testCase.active,
      });

      expect(machine.active).toBe(testCase.result);
    });
  });

  it('wraps tiles and adds offsets', () => {
    machine = render();

    expect(machine.container.classList.contains('slotMachineContainer')).toBeTruthy();
    expect(machine.container.children.length).toBe(5);
  });

  (['up', 'down'] as Direction[]).forEach((direction) => {
    it(`sets direction: ${direction}`, () => {
      machine = render({
        direction: direction,
      });

      expect(machine.direction).toBe(direction);
    });
  });

  it('sets randomize', () => {
    const randomize = () => 1;
    machine = render({
      randomize,
    });

    expect(machine.randomize).toBe(randomize);
  });

  it('does not auto start', () => {
    machine = render();

    expect(shuffleSpy).not.toHaveBeenCalled();
    expect(runSpy).not.toHaveBeenCalled();
  });
});
