import SlotMachine from '../../lib';
import { MACHINE_ID, render } from '../setup';

describe('Constructor', () => {
  let machine: SlotMachine;
  let shuffleSpy;

  beforeEach(() => {
    shuffleSpy = jest.spyOn(SlotMachine.prototype, 'shuffle');
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

    expect(machine.container.element.classList.contains('slot-machine__container')).toBeTruthy();
    expect(machine.container.element.children.length).toBe(5);
  });

  it('does not auto start', () => {
    machine = render();

    expect(shuffleSpy).not.toHaveBeenCalled();
  });
});
