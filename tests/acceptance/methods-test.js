/* eslint-disable no-undef */

describe('Setters', () => {
  let machine;

  afterEach(() => {
    if (machine) {
      machine.element.remove();
    }
  });

  describe('getTileOffset()', () => {
    [-18, -36, -54, -72].forEach((offset, index) => {
      it(`getTileOffset(): ${index}`, () => {
        machine = render();

        expect(machine.getTileOffset(index)).to.be.equal(offset);
      });
    });
  });

  describe('next()', () => {
    it('changes machine state', () => {
      machine = render();

      machine.next();

      expect(machine.running).to.be.true;
    });

    it('return next active element', () => {
      machine = render();

      const nextIndex = machine.next();

      expect(nextIndex).to.exist;
    });

    it('stops the machine', () => {
      machine = render();
      machine.stop = sinon.spy();

      machine.next();

      expect(machine.stop).to.have.been.called;
    });

    it('shows next element: first to second, direction "up"', () => {
      machine = render({
        direction: 'up'
      });

      let tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(0);
      expect(machine.active).to.be.equal(0);
      expect(tile.innerText).to.be.equal('foo');

      machine.next();

      tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(2);
      expect(machine.active).to.be.equal(2);
      expect(tile.innerText).to.be.equal('wow');
    });

    it('shows next element: last to first, direction "up"', () => {
      machine = render({
        active: 2,
        direction: 'up'
      });

      let tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(2);
      expect(machine.active).to.be.equal(2);
      expect(tile.innerText).to.be.equal('wow');

      machine.next();

      tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(1);
      expect(machine.active).to.be.equal(1);
      expect(tile.innerText).to.be.equal('bar');
    });

    it('shows next element: first to second, direction "down"', () => {
      machine = render({
        direction: 'down'
      });

      let tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(0);
      expect(machine.active).to.be.equal(0);
      expect(tile.innerText).to.be.equal('foo');

      machine.next();

      tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(1);
      expect(machine.active).to.be.equal(1);
      expect(tile.innerText).to.be.equal('bar');
    });

    it('shows next element: last to first, direction "down"', () => {
      machine = render({
        direction: 'down',
        active: 2
      });

      let tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(2);
      expect(machine.active).to.be.equal(2);
      expect(tile.innerText).to.be.equal('wow');

      machine.next();

      tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(0);
      expect(machine.active).to.be.equal(0);
      expect(tile.innerText).to.be.equal('foo');
    });
  });

  describe('prev()', () => {
    it('changes machine state', () => {
      machine = render();

      machine.next();

      expect(machine.running).to.be.true;
    });

    it('return next active element', () => {
      machine = render();

      const nextIndex = machine.next();

      expect(nextIndex).to.exist;
    });

    it('stops the machine', () => {
      machine = render();
      machine.stop = sinon.spy();

      machine.next();

      expect(machine.stop).to.have.been.called;
    });

    it('shows prev element: second to first, direction "up"', () => {
      machine = render({
        direction: 'up',
        active: 1
      });

      let tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(1);
      expect(machine.active).to.be.equal(1);
      expect(tile.innerText).to.be.equal('bar');

      machine.prev();

      tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(2);
      expect(machine.active).to.be.equal(2);
      expect(tile.innerText).to.be.equal('wow');
    });

    it('shows prev element: first to last, direction "up"', () => {
      machine = render({
        direction: 'up'
      });

      let tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(0);
      expect(machine.active).to.be.equal(0);
      expect(tile.innerText).to.be.equal('foo');

      machine.prev();

      tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(1);
      expect(machine.active).to.be.equal(1);
      expect(tile.innerText).to.be.equal('bar');
    });

    it('shows prev element: second to first, direction "down"', () => {
      machine = render({
        direction: 'down',
        active: 1
      });

      let tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(1);
      expect(machine.active).to.be.equal(1);
      expect(tile.innerText).to.be.equal('bar');

      machine.prev();

      tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(0);
      expect(machine.active).to.be.equal(0);
      expect(tile.innerText).to.be.equal('foo');
    });

    it('shows prev element: first to last, direction "down"', () => {
      machine = render({
        direction: 'down'
      });

      let tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(0);
      expect(machine.active).to.be.equal(0);
      expect(tile.innerText).to.be.equal('foo');

      machine.prev();

      tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(2);
      expect(machine.active).to.be.equal(2);
      expect(tile.innerText).to.be.equal('wow');
    });
  });

  // describe('shuffle()', () => {
  //   it('changes machine state', (callback) => {
  //     machine = render({
  //       delay: 1,
  //       spins: 1
  //     });

  //     machine.shuffle(() => {
  //       expect(machine.running).to.be.false;
  //       callback();
  //     });

  //     expect(machine.running).to.be.true;
  //   });

  //   it('calls callback when shuffle ends', (callback) => {
  //     machine = render({
  //       delay: 1,
  //       spins: 1
  //     });

  //     let nextActive;

  //     machine.shuffle(() => {
  //       expect(machine.active).to.be.equal(nextActive);
  //       callback();
  //     });

  //     nextActive = machine.futureActive;
  //   });

  //   it('calls shuffle recursively', (callback) => {
  //     machine = render({
  //       delay: 1,
  //       spins: 1,
  //       auto: false
  //     });
  //     const times = 5;
  //     const spy = sinon.spy(machine, 'shuffle');

  //     machine.shuffle(times, () => {
  //       expect(spy).to.have.been.callCount(times - 1);
  //       machine.shuffle.restore();
  //       callback();
  //     });
  //   });

  //   it('calls stop', (callback) => {
  //     machine = render({
  //       delay: 1,
  //       spins: 1,
  //       auto: false
  //     });
  //     const spy = sinon.spy(machine, 'stop');

  //     machine.shuffle(() => {
  //       expect(spy).to.have.been.called;
  //       machine.stop.restore();
  //       callback();
  //     });
  //   });
  // });
});
