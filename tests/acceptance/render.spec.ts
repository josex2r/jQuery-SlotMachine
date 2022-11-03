import SlotMachine from '../../lib';
import { MACHINE_ID, render } from '../setup';

describe('Render', () => {
  let machine: SlotMachine;

  afterEach(() => {
    if (machine) {
      machine.element.remove();
    }
  });

  it('machine exist', () => {
    machine = render();

    expect(machine.element).toBeTruthy();
  });

  it('renders machine', () => {
    machine = render();

    const element = document.getElementById(MACHINE_ID);

    expect(element).toBeTruthy();
  });
});
