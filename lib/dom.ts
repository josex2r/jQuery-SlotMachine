export class Container {
  element: HTMLElement;
  tiles: Tile[] = [];
  tileNodes: Tile[] = [];

  constructor(public container: HTMLElement) {
    const tileElements = [].slice.call(this.container.children) as HTMLElement[];

    this.container.style.overflow = 'hidden';
    this.element = document.createElement('div');
    this.element.classList.add('slot-machine__container');
    this.element.style.transition = '1s ease-in-out';
    this.container.appendChild(this.element);
    this.tiles = [...tileElements].map((element) => new Tile(element));
    this.tileNodes = [
      this.tiles[this.tiles.length - 1].clone(),
      ...this.tiles,
      this.tiles[0].clone(),
    ];
    this.wrapTiles();
  }

  private wrapTiles() {
    this.tileNodes.forEach((tile) => {
      this.element.appendChild(tile.element);
    });
  }

  private get lastTileOffset() {
    return this.tiles[0].offset;
  }

  getTileOffset(index: number) {
    let offset = 0;

    for (let i = 0; i < index; i++) {
      offset += this.tiles[i].offset;
    }

    return -this.lastTileOffset - offset;
  }

  get maxTopOffset() {
    return -1 * (this.tiles.reduce((acc, { offset }) => acc + offset, 0) + this.lastTileOffset);
  }
}

export class Tile {
  constructor(public element: HTMLElement) {
    this.element.classList.add('slot-machine__tile');
  }

  clone() {
    const element = this.element.cloneNode(true) as HTMLElement;

    return new Tile(element);
  }

  get offset() {
    return this.element.offsetHeight;
  }
}
