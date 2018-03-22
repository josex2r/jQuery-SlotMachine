/* eslint-disable no-undef */

describe('Render', () => {
  let machine;

  afterEach(() => {
    if (machine) {
      machine.element.remove();
    }
  });

  it('machine exist', () => {
    machine = render();

    expect(machine.element).to.exist;
  });

  it('renders machine', () => {
    machine = render();
    const element = document.getElementById(id);

    expect(element).to.exist;
  });
});
