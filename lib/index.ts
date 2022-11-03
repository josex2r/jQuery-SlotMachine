import raf from './raf';
import { Container } from './dom';
import type { Bounds, Options } from './types';
import { DEFAULTS, TILE_FX, CONTAINER_FX } from './constants';

const timeout = (delay: number) => new Promise((res) => setTimeout(res, delay));

export default class SlotMachine {
  container: Container;
  element: HTMLElement;
  running = false;
  stopping = false;
  nextActive?: number;

  private remainingSpins: number;
  private options: Required<Options>;
  private _active: number;
  private _bounds: Bounds;
  private _transition: string;

  constructor(element: HTMLElement, options: Options) {
    this.element = element;
    // Setup DOM
    this.container = new Container(this.element);
    // Set plugin options
    this.setOptions(options);
    this.active = this.options.active;
    this.setupBounds();
    // Show active element
    this._resetPosition();
  }

  setOptions(options: Options) {
    this.options = { ...DEFAULTS, ...options };
  }

  private setupBounds() {
    const initial = this.container.getTileOffset(this.active);
    const first = this.container.getTileOffset(0);
    const last = this.container.getTileOffset(this.container.tiles.length - 1);

    this._bounds = {
      up: {
        initial,
        from: last,
        to: 0,
        nextReset: 0,
        prevReset: this.container.maxTopOffset,
      },
      down: {
        initial,
        from: first,
        to: this.container.maxTopOffset,
        nextReset: 0,
        prevReset: this.container.maxTopOffset,
      },
    };
  }

  get bounds() {
    return this._bounds[this.options.direction];
  }

  get active() {
    return this._active;
  }

  set active(index: number) {
    if (index < 0 || index >= this.container.tiles.length || isNaN(index)) {
      index = 0;
    }

    this._active = index;
  }

  private get transition() {
    return this._transition;
  }

  private set transition(transition: string) {
    this._transition = transition || 'ease-in-out';
  }

  get _prevIndex() {
    const prevIndex = this.active - 1;

    return prevIndex < 0 ? this.container.tiles.length - 1 : prevIndex;
  }

  get _nextIndex() {
    const nextIndex = this.active + 1;

    return nextIndex < this.container.tiles.length ? nextIndex : 0;
  }

  get prevIndex() {
    return this.options.direction === 'up' ? this._nextIndex : this._prevIndex;
  }

  get nextIndex() {
    return this.options.direction === 'up' ? this._prevIndex : this._nextIndex;
  }

  set _animationFX(effect: TILE_FX) {
    const delay = this.options.delay / 4;

    raf(() => {
      this.container.tiles
        .map(({ element }) => element)
        .forEach((tile) => {
          tile.classList.remove(TILE_FX.FAST, TILE_FX.NORMAL, TILE_FX.SLOW, TILE_FX.TURTLE);
          if (effect !== TILE_FX.STOP) {
            tile.classList.add(effect);
          }
        });

      if (effect === TILE_FX.STOP) {
        this.container.element.classList.remove(CONTAINER_FX.GRADIENT);
      } else {
        this.container.element.classList.add(CONTAINER_FX.GRADIENT);
      }
    }, delay);
  }

  _changeTransition(delay = this.options.delay, transition = this.transition) {
    this.container.element.style.transition = `${delay / 1000}s ${transition}`;
  }

  _changeTransform(margin: number) {
    this.container.element.style.transform = `matrix(1, 0, 0, 1, 0, ${margin})`;
  }

  _isGoingBackward() {
    return !!(this.active === 0 && this.nextActive === this.container.tiles.length - 1);
  }

  _isGoingForward() {
    return !!(this.active === this.container.tiles.length - 1 && this.nextActive === 0);
  }

  _resetPosition(margin?: number) {
    this.container.element.classList.toggle(TILE_FX.NO_TRANSITION);
    this._changeTransform(margin !== undefined ? margin : this.bounds.initial);
    // Force reflow, flushing the CSS changes
    this.container.element.offsetHeight;
    this.container.element.classList.toggle(TILE_FX.NO_TRANSITION);
  }

  async next() {
    this.nextActive = this.nextIndex;
    this.running = true;
    await this.stop(0);

    return this.active;
  }

  async prev() {
    this.nextActive = this.prevIndex;
    this.running = true;
    await this.stop(0);

    return this.active;
  }

  _getDelayFromSpins(spins: number) {
    let delay = this.options.delay;
    this.transition = 'linear';

    switch (spins) {
      case 1:
        delay /= 0.5;
        this.transition = 'ease-out';
        this._animationFX = TILE_FX.TURTLE;
        break;
      case 2:
        delay /= 0.75;
        this._animationFX = TILE_FX.SLOW;
        break;
      case 3:
        delay /= 1;
        this._animationFX = TILE_FX.NORMAL;
        break;
      case 4:
        delay /= 1.25;
        this._animationFX = TILE_FX.NORMAL;
        break;
      default:
        delay /= 1.5;
        this._animationFX = TILE_FX.FAST;
    }

    return delay;
  }

  shuffle(spins: number) {
    if (this.running || this.stopping) {
      return;
    }

    this.nextActive = this.options.randomize(this.active, this.container.tiles.length);
    this.remainingSpins = spins;

    return this._shuffle();
  }

  private async _shuffle() {
    this.running = true;
    // Perform animation
    const delay = this._getDelayFromSpins(this.remainingSpins);
    this._changeTransition(delay);
    this._changeTransform(this.bounds.to);

    await timeout(delay);

    if (!this.stopping && this.running) {
      this.remainingSpins--;

      this._resetPosition(this.bounds.from);

      if (this.remainingSpins > 1) {
        // Repeat animation
        await this._shuffle();
      } else {
        await this.stop(0);
      }
    }
  }

  async stop(spins = 0) {
    if (!this.running || this.stopping) {
      return this.nextActive;
    }

    if (this.running && !this.stopping && spins) {
      this.remainingSpins = spins;
      return;
    }

    this.running = true;
    this.stopping = true;

    // Check direction to prevent jumping
    if (this._isGoingBackward()) {
      this._resetPosition(this.bounds.prevReset);
    } else if (this._isGoingForward()) {
      this._resetPosition(this.bounds.nextReset);
    }

    // Update last choosen element index
    this.active = this.nextActive as number;

    // Perform animation
    const delay = this._getDelayFromSpins(1);
    this._changeTransition(delay);
    this._animationFX = TILE_FX.STOP;
    this._changeTransform(this.container.getTileOffset(this.active));

    await timeout(delay);

    this.stopping = false;
    this.running = false;
    this.nextActive = undefined;
  }
}
