/* eslint-disable no-undef */

describe('Getters', () => {
  let machine;

  afterEach(() => {
    if (machine) {
      machine.element.remove();
    }
  });

  describe('visibleTile', () => {
    ['foo', 'bar', 'wow'].forEach((text, index) => {
      it(`gets visibleTile: ${index}`, () => {
        machine = render({
          active: index
        });
        const tile = getVisibleTile(machine);

        expect(machine.visibleTile).to.be.equal(index);
        expect(machine.active).to.be.equal(index);
        expect(tile.innerText).to.be.equal(text);
      });
    });
  });

  describe('random', () => {
    it(`gets random index between min and max tiles length`, () => {
      machine = render();

      for (let i = 0; i < 1000; i++) {
        const random = machine.random;

        expect(random).to.be.at.least(0);
        expect(random).to.be.below(3);
      }
    });
  });

  describe('custom', () => {
    it(`receives active element and has machine context when calling randomize`, (callback) => {
      const randomize = function (active) {
        expect(active).to.be.equal(this.active);
        callback();
      };
      machine = render({
        randomize
      });

      expect(machine.custom).to.exist;
    });

    it(`gets custom element from randomize function`, () => {
      const index = 1;
      const randomize = sinon.stub().returns(index);
      machine = render({
        randomize
      });

      expect(machine.custom).to.be.equal(index);
      expect(randomize).to.have.been.called;
    });

    [-1, 9].forEach((index) => {
      it(`sets 0 when custom element is out of bounds: ${index}`, () => {
        const randomize = sinon.stub().returns(index);
        machine = render({
          randomize
        });

        expect(machine.custom).to.be.equal(0);
        expect(randomize).to.have.been.called;
      });
    });

    it(`gets random element`, () => {
      machine = render();

      for (let i = 0; i < 1000; i++) {
        const custom = machine.custom;

        expect(custom).to.be.at.least(0);
        expect(custom).to.be.below(3);
      }
    });
  });

  describe('Direction', () => {
    [{
      direction: 'up',
      result: {
        key: 'up',
        initial: -18,
        first: 0,
        last: -72,
        to: -54,
        firstToLast: -72,
        lastToFirst: 0
      }
    }, {
      direction: 'down',
      result: {
        key: 'down',
        initial: -18,
        first: -72,
        last: 0,
        to: -18,
        firstToLast: -72,
        lastToFirst: 0
      }
    }].forEach((testCase) => {
      it(`sets direction: ${testCase.direction}`, () => {
        machine = render({
          direction: testCase.direction
        });

        expect(machine.bounds).to.include(testCase.result);
      });
    });
  });

  describe('Prev index', () => {
    it('gets prev index from first element and direction "up"', () => {
      machine = render({
        direction: 'up',
        active: 0
      });

      expect(machine.prevIndex).to.be.equal(1);
    });

    it('gets prev index from last element and direction "up"', () => {
      machine = render({
        direction: 'up',
        active: 2
      });

      expect(machine.prevIndex).to.be.equal(0);
    });

    it('gets prev index from first element and direction "down"', () => {
      machine = render({
        direction: 'down',
        active: 0
      });

      expect(machine.prevIndex).to.be.equal(2);
    });

    it('gets prev index from last element and direction "down"', () => {
      machine = render({
        direction: 'down',
        active: 2
      });

      expect(machine.prevIndex).to.be.equal(1);
    });
  });

  describe('visible', () => {
    it('is visible', () => {
      machine = render();

      expect(machine.visible).to.be.true;
    });

    it('is not visible when "top" is out of bounds', () => {
      machine = render();

      machine.element.style.position = 'absolute';
      machine.element.style.top = '-100px';

      expect(machine.visible).to.be.false;
    });

    it('is not visible when "bottom" is out of bounds', () => {
      machine = render();

      machine.element.style.position = 'absolute';
      machine.element.style.bottom = '-100px';

      expect(machine.visible).to.be.false;
    });

    it('is not visible when "left" is out of bounds', () => {
      machine = render();

      machine.element.style.position = 'absolute';
      machine.element.style.left = '-100px';

      expect(machine.visible).to.be.false;
    });

    it('is not visible when "right" is out of bounds', () => {
      machine = render();

      machine.element.style.position = 'absolute';
      machine.element.style.right = '-100px';

      expect(machine.visible).to.be.false;
    });
  });
});
