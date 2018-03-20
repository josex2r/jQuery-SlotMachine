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

  describe('constructor', () => {
    it('has element', () => {
      machine = render();
      const element = document.getElementById(id);

      expect(machine.element).to.be.equal(element);
    });

    it('element does not have overflow', () => {
      machine = render();

      expect(machine.element.style.overflow).to.be.equal('hidden');
    });

    it('has settings', () => {
      machine = render();

      expect(machine.settings).to.exist;
    });

    [
      { active: 0, result: 0 },
      { active: 1, result: 1 },
      { active: 99, result: 0 },
      { active: -99, result: 0 },
      { active: '0', result: 0 },
      { active: {}, result: 0 },
      { active: null, result: 0 },
      { active: undefined, result: 0 }
    ].forEach((testCase) => {
      it(`has active: ${testCase.active}`, () => {
        machine = render({
          active: testCase.active
        });

        expect(machine.active).to.be.equal(testCase.result);
      });
    });

    it('wraps tiles and adds offsets', () => {
      machine = render();

      expect(machine.container.classList.contains('slotMachineContainer')).to.be.true;
      expect(machine.container.children).to.have.lengthOf(5);
    });

    [
      {
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
      },
      {
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
      }
    ].forEach((testCase) => {
      it(`sets direction: ${testCase.direction}`, () => {
        machine = render({
          direction: testCase.direction
        });

        expect(machine.direction).to.include(testCase.result);
      });
    });
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
