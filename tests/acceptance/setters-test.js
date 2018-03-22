/* eslint-disable no-undef */

describe('Setters', () => {
  let machine;

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

      expect(machine.active).to.be.equal(index);
    });

    [-1, 9].forEach((index) => {
      it(`does not set active element when is out of bounds: ${index}`, () => {
        machine = render();

        machine.active = index;

        expect(machine.active).to.be.equal(0);
      });
    });
  });
});
