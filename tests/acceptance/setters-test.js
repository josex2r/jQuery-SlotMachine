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

  describe('direction', () => {
    ['up', 'down'].forEach((direction) => {
      it(`sets "${direction}" direction`, () => {
        machine = render();

        machine.direction = direction;

        expect(machine.direction).to.be.equal(direction);
      });
    });
  });

  describe('randomize', () => {
    it('sets randomize', () => {
      const randomize = () => {};
      machine = render();

      machine.randomize = randomize;

      expect(machine._randomize).to.be.equal(randomize);
    });

    it('wrap numbers as functions', () => {
      const index = 1;
      machine = render();

      machine.randomize = index;

      expect(machine._randomize()).to.be.equal(index);
    });
  });

  describe('delay', () => {
    it(`sets delay`, () => {
      const delay = 1000;
      machine = render();

      machine.delay = delay;

      expect(machine._delay).to.be.equal(delay / 1000);
    });

    it(`calls "_changeTransition" after setting the value`, () => {
      const spy = sinon.spy();
      machine = render();

      machine._changeTransition = spy;
      machine.delay = 1;

      expect(spy).to.have.been.called;
    });
  });

  describe('transition', () => {
    it(`sets transition`, () => {
      const transition = 1000;
      machine = render();

      machine.transition = transition;

      expect(machine._transition).to.be.equal(transition);
    });

    it(`sets "ease-in-out" if no value is passed`, () => {
      machine = render();

      machine.transition = null;

      expect(machine._transition).to.be.equal('ease-in-out');
    });

    it(`calls "_changeTransition" after setting the value`, () => {
      const transition = 1000;
      const spy = sinon.spy();
      machine = render();

      machine._changeTransition = spy;
      machine.transition = transition;

      expect(spy).to.have.been.called;
    });
  });
});
