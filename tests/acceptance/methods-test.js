/* eslint-disable no-undef */

describe('Setters', () => {
  let machine;

  afterEach(() => {
    if (machine) {
      machine.element.remove();
    }
  });

  describe('getTileOffset()', () => {
    [-20, -40, -60, -80].forEach((offset, index) => {
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

    describe('direction "up"', () => {
      it('last to first', () => {
        machine = render({
          direction: 'up',
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

      it('second to last', () => {
        machine = render({
          direction: 'up',
          active: 1,
        });

        let tile = getVisibleTile(machine);
        expect(machine.visibleTile).to.be.equal(1);
        expect(machine.active).to.be.equal(1);
        expect(tile.innerText).to.be.equal('bar');

        machine.next();

        tile = getVisibleTile(machine);
        expect(machine.visibleTile).to.be.equal(2);
        expect(machine.active).to.be.equal(2);
        expect(tile.innerText).to.be.equal('wow');
      });
    });

    describe('direction "bottom"', () => {
      it('last to first', () => {
        machine = render({
          direction: 'bottom',
          active: 2,
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

      it('first to second', () => {
        machine = render({
          direction: 'bottom',
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

    describe('direction "up"', () => {
      it('first to last', () => {
        machine = render({
          direction: 'up',
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

      it('last to second', () => {
        machine = render({
          direction: 'up',
          active: 2,
        });

        let tile = getVisibleTile(machine);
        expect(machine.visibleTile).to.be.equal(2);
        expect(machine.active).to.be.equal(2);
        expect(tile.innerText).to.be.equal('wow');

        machine.prev();

        tile = getVisibleTile(machine);
        expect(machine.visibleTile).to.be.equal(1);
        expect(machine.active).to.be.equal(1);
        expect(tile.innerText).to.be.equal('bar');
      });
    });

    describe('direction "bottom"', () => {
      it('second to first', () => {
        machine = render({
          direction: 'bottom',
          active: 2,
        });

        let tile = getVisibleTile(machine);
        expect(machine.visibleTile).to.be.equal(2);
        expect(machine.active).to.be.equal(2);
        expect(tile.innerText).to.be.equal('wow');

        machine.prev();

        tile = getVisibleTile(machine);
        expect(machine.visibleTile).to.be.equal(1);
        expect(machine.active).to.be.equal(1);
        expect(tile.innerText).to.be.equal('bar');
      });

      it('first to last', () => {
        machine = render({
          direction: 'bottom',
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
  });
});
