/* eslint-disable no-undef */

const id = 'machine';

function render (options) {
  const container = document.getElementById('sandbox');
  const machine = document.createElement('div');

  machine.id = id;
  machine.style.height = '18px';
  machine.style.width = '25px';
  machine.style.overflow = 'hidden';
  machine.innerHTML = `
    <div class="text-center">foo</div>
    <div class="text-center">bar</div>
    <div class="text-center">wow</div>`;
  container.appendChild(machine);

  return new SlotMachine(machine, options || {});
}

function getVisibleTile (machine) {
  const firstTileHeight = machine.tiles[0].offsetHeight;
  const rawContainerMargin = machine.container.style.transform || '';
  const matrixRegExp = /^matrix\(-?\d+,\s?-?\d+,\s?-?\d+,\s?-?\d+,\s?-?\d+,\s?(-?\d+)\)$/;
  const offset = parseInt(rawContainerMargin.replace(matrixRegExp, '$1'), 10);

  return machine.tiles.find((tile) => tile.offsetTop === Math.abs(offset));
}

describe('SlotMachine', () => {
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

  ['foo', 'bar', 'wow'].forEach((text, index) => {
    it(`gets visibleTile: ${index}`, () => {
      machine = render({
        active: index
      });
      const tile = getVisibleTile(machine);

      expect(machine.visibleTile).to.be.equal(index);
      expect(tile.innerText).to.be.equal(text);
    });
  });

  describe('Switch tiles', () => {
    it('shows next element: first to second', () => {
      machine = render();

      let tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(0);
      expect(tile.innerText).to.be.equal('foo');

      machine.next();

      tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(1);
      expect(tile.innerText).to.be.equal('bar');
    });

    it('shows next element: last to first', () => {
      machine = render({
        active: 2
      });

      let tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(2);
      expect(tile.innerText).to.be.equal('wow');

      machine.next();

      tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(0);
      expect(tile.innerText).to.be.equal('foo');
    });

    it('shows prev element: second to first', () => {
      machine = render({
        active: 1
      });

      let tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(1);
      expect(tile.innerText).to.be.equal('bar');

      machine.prev();

      tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(0);
      expect(tile.innerText).to.be.equal('foo');
    });

    it('shows prev element: first to last', () => {
      machine = render();

      let tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(0);
      expect(tile.innerText).to.be.equal('foo');

      machine.prev();

      tile = getVisibleTile(machine);
      expect(machine.visibleTile).to.be.equal(2);
      expect(tile.innerText).to.be.equal('wow');
    });
  });
});
