const Timer = require('./timer');
const raf = require('./raf');

const defaults = {
  active: 0, // Active element [Number]
  delay: 200, // Animation time [Number]
  auto: false, // Repeat delay [false||Number]
  spins: 5, // Number of spins when auto [Number]
  randomize: null, // Randomize function, must return a number with the selected position
  onComplete: null, // Callback function(result)
  inViewport: true, // Stops animations if the element isn´t visible on the screen
  direction: 'up', // Animation direction ['up'||'down']
  transition: 'ease-in-out'
};
const FX_NO_TRANSITION = 'slotMachineNoTransition';
const FX_FAST = 'slotMachineBlurFast';
const FX_NORMAL = 'slotMachineBlurMedium';
const FX_SLOW = 'slotMachineBlurSlow';
const FX_TURTLE = 'slotMachineBlurTurtle';
const FX_GRADIENT = 'slotMachineGradient';
const FX_STOP = FX_GRADIENT;

class SlotMachine {
  constructor (element, options) {
    this.element = element;
    // Slot Machine elements
    this.tiles = [].slice.call(this.element.children);
    // Machine is running?
    this.running = false;
    // Machine is stopping?
    this.stopping = false;
    // Disable overflow
    this.element.style.overflow = 'hidden';
    // Wrap elements inside container
    this._wrapTiles();
    // Set min top offset
    this._minTop = -this._fakeFirstTile.offsetHeight;
    // Set max top offset
    this._maxTop = -this.tiles.reduce((acc, tile) => (acc + tile.offsetHeight), 0);
    // Call setters if neccesary
    this.changeSettings(Object.assign({}, defaults, options));
    // Initialize spin direction [up, down]
    this._setBounds();
    // Show active element
    this._resetPosition();
    // Start auto animation
    if (this.auto !== false) {
      this.run();
    }
  }

  changeSettings (settings) {
    Object.keys(settings).forEach((key) => {
      // Trigger setters
      this[key] = settings[key];
    });
  }

  _wrapTiles () {
    this.container = document.createElement('div');
    this.container.classList.add('slotMachineContainer');
    this.container.style.transition = '1s ease-in-out';
    this.element.appendChild(this.container);

    this._fakeFirstTile = this.tiles[this.tiles.length - 1].cloneNode(true);
    this.container.appendChild(this._fakeFirstTile);

    this.tiles.forEach((tile) => {
      this.container.appendChild(tile);
    });

    this._fakeLastTile = this.tiles[0].cloneNode(true);
    this.container.appendChild(this._fakeLastTile);
  }

  _setBounds () {
    const initial = this.getTileOffset(this.active);
    const first = this.getTileOffset(this.tiles.length);
    const last = this.getTileOffset(this.tiles.length);

    this._bounds = {
      up: {
        key: 'up',
        initial,
        first: 0,
        last,
        to: this._maxTop,
        firstToLast: last,
        lastToFirst: 0
      },
      down: {
        key: 'down',
        initial,
        first,
        last: 0,
        to: this._minTop,
        firstToLast: last,
        lastToFirst: 0
      }
    };
  }

  get active () {
    return this._active;
  }

  get direction () {
    return this._direction;
  }

  get bounds () {
    return this._bounds[this._direction];
  }

  get transition () {
    return this._transition;
  }

  get visibleTile () {
    const firstTileHeight = this.tiles[0].offsetHeight;
    const rawContainerMargin = this.container.style.transform || '';
    const matrixRegExp = /^matrix\(-?\d+,\s?-?\d+,\s?-?\d+,\s?-?\d+,\s?-?\d+,\s?(-?\d+)\)$/;
    const containerMargin = parseInt(rawContainerMargin.replace(matrixRegExp, '$1'), 10);

    return Math.abs(Math.round(containerMargin / firstTileHeight)) - 1;
  }

  get random () {
    return Math.floor(Math.random() * this.tiles.length);
  }

  get custom () {
    let choosen;

    if (this.randomize) {
      let index = this.randomize(this.active);
      if (index < 0 || index >= this.tiles.length) {
        index = 0;
      }
      choosen = index;
    } else {
      choosen = this.random;
    }

    return choosen;
  }

  get _prevIndex () {
    const prevIndex = this.active - 1;

    return prevIndex < 0 ? (this.tiles.length - 1) : prevIndex;
  }

  get _nextIndex () {
    const nextIndex = this.active + 1;

    return nextIndex < this.tiles.length ? nextIndex : 0;
  }

  get prevIndex () {
    return this.direction === 'up' ? this._nextIndex : this._prevIndex;
  }

  get nextIndex () {
    return this.direction === 'up' ? this._prevIndex : this._nextIndex;
  }

  get visible () {
    const rect = this.element.getBoundingClientRect();
    const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
    const windowWidth = (window.innerWidth || document.documentElement.clientWidth);
    const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
    const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

    return vertInView && horInView;
  }

  set active (index) {
    index = Number(index);
    if (index < 0 || index >= this.tiles.length || isNaN(index)) {
      index = 0;
    }
    this._active = index;
  }

  set direction (direction) {
    if (!this.running) {
      this._direction = direction === 'down' ? 'down' : 'up';
    }
  }

  set _animationFX (FX_SPEED) {
    const delay = this.delay / 4;

    raf(() => {
      [...this.tiles, this._fakeLastTile, this._fakeFirstTile].forEach((tile) => {
        tile.classList.remove(FX_FAST, FX_NORMAL, FX_SLOW, FX_TURTLE);
        if (FX_SPEED !== FX_STOP) {
          tile.classList.add(FX_SPEED);
        }
      });

      if (FX_SPEED === FX_STOP) {
        this.container.classList.remove(FX_GRADIENT);
      } else {
        this.container.classList.add(FX_GRADIENT);
      }
    }, delay);
  }

  set transition (transition) {
    this._transition = transition || 'ease-in-out';
  }

  _changeTransition (delay = this.delay, transition = this.transition) {
    this.container.style.transition = `${delay / 1000}s ${transition}`;
  }

  _changeTransform (margin) {
    this.container.style.transform = `matrix(1, 0, 0, 1, 0, ${margin})`;
  }

  _isGoingBackward () {
    return this.nextActive > this.active && this.active === 0 && this.nextActive === this.tiles.length - 1;
  }

  _isGoingForward () {
    return this.nextActive <= this.active && this.active === this.tiles.length - 1 && this.nextActive === 0;
  }

  getTileOffset (index) {
    let offset = 0;

    for (let i = 0; i < index; i++) {
      offset += this.tiles[i].offsetHeight;
    }

    return this._minTop - offset;
  }

  _resetPosition (margin) {
    this.container.classList.toggle(FX_NO_TRANSITION);
    this._changeTransform(!isNaN(margin) ? margin : this.bounds.initial);
    // Force reflow, flushing the CSS changes
    this.container.offsetHeight;
    this.container.classList.toggle(FX_NO_TRANSITION);
  }

  prev () {
    this.nextActive = this.prevIndex;
    this.running = true;
    this.stop();

    return this.nextActive;
  }

  next () {
    this.nextActive = this.nextIndex;
    this.running = true;
    this.stop();

    return this.nextActive;
  }

  _getDelayFromSpins (spins) {
    let delay = this.delay;
    this.transition = 'linear';

    switch (spins) {
      case 1:
        delay /= 0.5;
        this.transition = 'ease-out';
        this._animationFX = FX_TURTLE;
        break;
      case 2:
        delay /= 0.75;
        this._animationFX = FX_SLOW;
        break;
      case 3:
        delay /= 1;
        this._animationFX = FX_NORMAL;
        break;
      case 4:
        delay /= 1.25;
        this._animationFX = FX_NORMAL;
        break;
      default:
        delay /= 1.5;
        this._animationFX = FX_FAST;
    }

    return delay;
  }

  shuffle (spins, onComplete) {
    // Make spins optional
    if (typeof spins === 'function') {
      onComplete = spins;
    }
    this.running = true;
    // Perform animation
    if (!this.visible && this.inViewport === true) {
      this.stop(onComplete);
    } else {
      const delay = this._getDelayFromSpins(spins);
      // this.delay = delay;
      this._changeTransition(delay);
      this._changeTransform(this.bounds.to);
      raf(() => {
        if (!this.stopping && this.running) {
          const left = spins - 1;

          this._resetPosition(this.bounds.first);

          if (left > 1) {
            // Repeat animation
            this.shuffle(left, onComplete);
          } else {
            this.stop(onComplete);
          }
        }
      }, delay);
    }

    return this.nextActive;
  }

  stop (onStop) {
    if (!this.running || this.stopping) {
      return this.nextActive;
    }

    this.running = true;
    this.stopping = true;

    if (!Number.isInteger(this.nextActive)) {
      // Get random or custom element
      this.nextActive = this.custom;
    }

    // Check direction to prevent jumping
    if (this._isGoingBackward()) {
      this._resetPosition(this.bounds.firstToLast);
    } else if (this._isGoingForward()) {
      this._resetPosition(this.bounds.lastToFirst);
    }

    // Update last choosen element index
    this.active = this.nextActive;

    // Perform animation
    const delay = this._getDelayFromSpins(1);
    // this.delay = delay;
    this._changeTransition(delay);
    this._animationFX = FX_STOP;
    this._changeTransform(this.getTileOffset(this.active));
    raf(() => {
      this.stopping = false;
      this.running = false;
      this.nextActive = null;

      if (typeof this.onComplete === 'function') {
        this.onComplete(this.active);
      }

      if (typeof onStop === 'function') {
        onStop.apply(this, [this.active]);
      }
    }, delay);

    return this.active;
  }

  run () {
    if (this.running) {
      return;
    }

    this._timer = new Timer(() => {
      if (!this.visible && this.inViewport === true) {
        raf(() => {
          this._timer.reset()
        }, 500);
      } else {
        this.shuffle(this.spins, () => {
          this._timer.reset()
        });
      }
    }, this.auto);
  }

  destroy () {
    this._fakeFirstTile.remove();
    this._fakeLastTile.remove();
    this.$tiles.unwrap();

    // Unwrap tiles
    this.tiles.forEach((tile) => {
      this.element.appendChild(tile);
    });

    this.container.remove();
  }
}

module.exports = SlotMachine;
