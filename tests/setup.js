/* eslint-disable no-undef */
const expect = chai.expect;

mocha.setup('bdd');

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
