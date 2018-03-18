const Timer = require('./timer');
const raf = require('./raf');

const defaults = {
  active: 0, // Active element [Number]
  delay: 200, // Animation time [Number]
  auto: false, // Repeat delay [false||Number]
  spins: 5, // Number of spins when auto [Number]
  randomize: null, // Randomize function, must return a number with the selected position
  complete: null, // Callback function(result)
  stopHidden: true, // Stops animations if the element isn´t visible on the screen
  direction: 'up' // Animation direction ['up'||'down']
};
const FX_NO_TRANSITION = 'slotMachineNoTransition';
const FX_FAST = 'slotMachineBlurFast';
const FX_NORMAL = 'slotMachineBlurMedium';
const FX_SLOW = 'slotMachineBlurSlow';
const FX_TURTLE = 'slotMachineBlurTurtle';
const FX_GRADIENT = 'slotMachineGradient';
const FX_STOP = FX_GRADIENT;

module.exports = class SlotMachine {
  static get name () {
    return 'slotMachine';
  }

  constructor (element, options) {
    this.element = element[0];
    this.settings = Object.assign({}, defaults, options);
    this.defaults = defaults;

    // Slot Machine elements
    this.tiles = [].slice.call(this.element.children);
    // Container to wrap tiles
    this.container = null;
    // Min marginTop offset
    this._minTop = null;
    // Max marginTop offset
    this._maxTop = null;
    // First element (the last of the html container)
    this._fakeFirstTile = null;
    // Last element (the first of the html container)
    this._fakeLastTile = null;
    // Timeout recursive function to handle auto (settings.auto)
    this._timer = null;
    // Number of spins left before stop
    this._spinsLeft = null;
    // Future result
    this.futureActive = null;
    // Machine is running?
    this.running = false;
    // Machine is stopping?
    this.stopping = false;
    // Current active element
    this.active = this.settings.active;

    this.element.style.overflow = 'hidden';

    // Wrap elements inside container
    this.container = document.createElement('div');
    this.container.classList.add('slotMachineContainer');
    this.container.style.transition = '1s ease-in-out';
    this.element.appendChild(this.container);

    this._fakeFirstTile = this.tiles[this.tiles.length - 1].cloneNode(true);
    this.container.appendChild(this._fakeFirstTile);

    let maxTop = 0;
    this.tiles.forEach((tile) => {
      this.container.appendChild(tile);
      maxTop += tile.offsetHeight;
    });

    this._fakeLastTile = this.tiles[0].cloneNode(true);
    this.container.appendChild(this._fakeLastTile);

    // Set min top offset
    this._minTop = -this._fakeFirstTile.offsetHeight;

    // Set max top offset
    this._maxTop = -maxTop;

    // Initialize spin direction [up, down]
    this._initDirection();

    // Show active element
    this.resetPosition();

    // Start auto animation
    if (this.settings.auto !== false) {
      if (this.settings.auto === true) {
        this.shuffle();
      } else {
        this.auto();
      }
    }
  }

  _initDirection () {
    this._direction = {
      selected: this.settings.direction === 'down' ? 'down' : 'up',
      up: {
        key: 'up',
        initial: this.getTileOffset(this.active),
        first: 0,
        last: this.getTileOffset(this.tiles.length),
        to: this._maxTop,
        firstToLast: this.getTileOffset(this.tiles.length),
        lastToFirst: 0
      },
      down: {
        key: 'down',
        initial: this.getTileOffset(this.active),
        first: this.getTileOffset(this.tiles.length),
        last: 0,
        to: this._minTop,
        firstToLast: this.getTileOffset(this.tiles.length),
        lastToFirst: 0
      }
    };
  }

  /**
   * @desc PUBLIC - Get active element
   */
  get active () {
    return this._active;
  }

  /**
   * @desc PUBLIC - Get current showing element index
   * @return {Number} - Element index
   */
  get visibleTile () {
    const firstTileHeight = this.tiles[0].offsetHeight;
    const rawContainerMargin = this.container.style.transform || '';
    const matrixRegExp = /^matrix\(-?\d+,\s?-?\d+,\s?-?\d+,\s?-?\d+,\s?-?\d+,\s?(-?\d+)\)$/;
    const containerMargin = parseInt(rawContainerMargin.replace(matrixRegExp, '$1'), 10);

    return Math.abs(Math.round(containerMargin / firstTileHeight)) - 1;
  }

  /**
   * @desc PUBLIC - Get random element different than last shown
   * @param {Boolean} cantBeTheCurrent - true||undefined if cant be choosen the current element, prevents repeat
   * @return {Number} - Element index
   */
  get random () {
    return Math.floor(Math.random() * this.tiles.length);
  }

  /**
   * @desc PUBLIC - Get random element based on the custom randomize function
   * @return {Number} - Element index
   */
  get custom () {
    let choosen;

    if (typeof this.settings.randomize === 'function') {
      let index = this.settings.randomize.call(this, this.active);
      if (index < 0 || index >= this.tiles.length) {
        index = 0;
      }
      choosen = index;
    } else {
      choosen = this.random;
    }

    return choosen;
  }

  /**
   * @desc PUBLIC - Get the spin direction
   */
  get direction () {
    return this._direction[this._direction.selected];
  }

  /**
   * @desc PRIVATE - Get the previous element (no direction related)
   * @return {Number} - Element index
   */
  get _prevIndex () {
    const prevIndex = this.active - 1;

    return prevIndex < 0 ? (this.tiles.length - 1) : prevIndex;
  }

  /**
   * @desc PRIVATE - Get the next element (no direction related)
   * @return {Number} - Element index
   */
  get _nextIndex () {
    const nextIndex = this.active + 1;

    return nextIndex < this.tiles.length ? nextIndex : 0;
  }

  /**
   * @desc PUBLIC - Get the previous element dor selected direction
   * @return {Number} - Element index
   */
  get prevIndex () {
    return this.direction === 'up' ? this._nextIndex : this._prevIndex;
  }

  /**
   * @desc PUBLIC - Get the next element
   * @return {Number} - Element index
   */
  get nextIndex () {
    return this.direction === 'up' ? this._prevIndex : this._nextIndex;
  }

  /**
   * Stop animation if element is [above||below] screen, best for performance
   * @desc PRIVATE - Checks if the machine is on the screen
   * @return {Number} - Returns true if machine is on the screen
   */
  get visible () {
    const above = this.element.offsetTop > window.scrollY + window.innerHeight;
    const below = window.scrollY > this.element.innerHeight + this.element.offsetTop;

    // Stop animation if element is [above||below] screen, best for performance
    return !above && !below;
  }

  /**
   * @desc PUBLIC - Set active element
   * @param {Number} - Active element index
   */
  set active (index) {
    this._active = index;
    if (index < 0 || index >= this.tiles.length) {
      this._active = 0;
    }
  }

  /**
   * @desc PUBLIC - Set the spin direction
   */
  set direction (direction) {
    if (!this.running) {
      this.direction = direction === 'down' ? 'down' : 'up';
    }
  }

  /**
   * @desc PRIVATE - Set CSS speed cclass
   * @param string FX_SPEED - Element speed [FX_FAST_BLUR||FX_NORMAL_BLUR||FX_SLOW_BLUR||FX_STOP]
   */
  set _fxClass (FX_SPEED) {
    [...this.tiles, this._fakeLastTile, this._fakeFirstTile].forEach((tile) => {
      tile.classList.remove(FX_FAST, FX_NORMAL, FX_SLOW, FX_TURTLE);
      tile.classList.add(FX_SPEED);
    });
  }

  /**
   * @desc PRIVATE - Set CSS classes to make speed effect
   * @param string FX_SPEED - Element speed [FX_FAST_BLUR||FX_NORMAL_BLUR||FX_SLOW_BLUR||FX_STOP]
   * @param string||boolean fade - Set fade gradient effect
   */
  set _animationFX (FX_SPEED) {
    const delay = this.settings.delay / 4;

    raf(() => {
      this._fxClass = FX_SPEED;

      if (FX_SPEED === FX_STOP) {
        this.container.classList.remove(FX_GRADIENT);
      } else {
        this.container.classList.add(FX_GRADIENT);
      }
    }, delay);
  }

  /**
   * @desc PRIVATE - Set css transition delay
   * @param {Number} - Transition delay in ms
   */
  set delay (delay) {
    delay = delay / 1000;
    this._delay = delay;
    this._changeTransition();
  }

  /**
   * @desc PRIVATE - Set css transition
   * @param {String} - Transition type
   */
  set transition (transition) {
    transition = transition || 'ease-in-out';
    this._transition = transition;
    this._changeTransition();
  }

  /**
   * @desc PRIVATE - Set css transition property
   */
  _changeTransition () {
    const delay = this._delay || this.settings.delay;
    const transition = this._transition || this.settings.transition;
    this.container.style.transition = `${delay}s ${transition}`;
  }

  /**
   * @desc PRIVATE - Set container margin
   * @param {Number}||String - Active element index
   */
  _animate (margin) {
    this.container.style.transform = `matrix(1, 0, 0, 1, 0, ${margin})`;
  }

  /**
   * @desc PRIVATE - Is moving from the first element to the last
   * @return {Boolean}
   */
  _isGoingBackward () {
    return this.futureActive > this.active && this.active === 0 && this.futureActive === this.tiles.length - 1;
  }

  /**
   * @desc PRIVATE - Is moving from the last element to the first
   * @param {Boolean}
   */
  _isGoingForward () {
    return this.futureActive <= this.active && this.active === this.tiles.length - 1 && this.futureActive === 0;
  }

  /**
   * @desc PUBLIC - Get element offset top
   * @param {Number} index - Element position
   * @return {Number} - Negative offset in px
   */
  getTileOffset (index) {
    let offset = 0;

    for (let i = 0; i < index; i++) {
      offset += this.tiles[i].offsetHeight;
    }

    return this._minTop - offset;
  }

  /**
   * @desc PRIVATE - Reset active element position
   */
  resetPosition (margin) {
    this.container.classList.toggle(FX_NO_TRANSITION);
    this._animate(margin === undefined ? this.direction.initial : margin);
    // Force reflow, flushing the CSS changes
    this.container.offsetHeight;
    this.container.classList.toggle(FX_NO_TRANSITION);
  }

  /**
   * @desc PUBLIC - Changes randomize function
   * @param function|Number - Set new randomize function
   */
  setRandomize (rnd) {
    this.settings.randomize = rnd;

    if (typeof rnd === 'number') {
      this.settings.randomize = () => rnd;
    }
  }

  /**
   * @desc PUBLIC - SELECT previous element relative to the current active element
   * @return {Number} - Returns result index
   */
  prev () {
    this.futureActive = this.prevIndex;
    this.running = true;
    this.stop();

    return this.futureActive;
  }

  /**
   * @desc PUBLIC - SELECT next element relative to the current active element
   * @return {Number} - Returns result index
   */
  next () {
    this.futureActive = this.nextIndex;
    this.running = true;
    this.stop();

    return this.futureActive;
  }

  /**
   * @desc PUBLIC - Starts shuffling the elements
   * @param {Number} repeations - Number of shuffles (undefined to make infinite animation
   * @return {Number} - Returns result index
   */
  getDelayFromSpins (spins) {
    let delay = this.settings.delay;
    this._transition = 'linear';

    switch (spins) {
      case 1:
        delay /= 0.5;
        this._transition = 'ease-out';
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

  /**
   * @desc PUBLIC - Starts shuffling the elements
   * @param {Number} repeations - Number of shuffles (undefined to make infinite animation
   * @return {Number} - Returns result index
   */
  shuffle (spins, onComplete) {
    // Make spins optional
    if (typeof spins === 'function') {
      onComplete = spins;
    }
    this.running = true;
    // Perform animation
    if (!this.visible && this.settings.stopHidden === true) {
      this.stop(onComplete);
    } else {
      const delay = this.getDelayFromSpins(spins);
      this.delay = delay;
      this._animate(this.direction.to);
      raf(() => {
        if (!this.stopping && this.running) {
          const left = spins - 1;

          this.resetPosition(this.direction.first);
          if (left <= 1) {
            this.stop(onComplete);
          } else {
            // Repeat animation
            this.shuffle(left, onComplete);
          }
        }
      }, delay);
    }

    return this.futureActive;
  }

  /**
   * @desc PUBLIC - Stop shuffling the elements
   * @return {Number} - Returns result index
   */
  stop (onStop) {
    if (!this.running || this.stopping) {
      return this.futureActive;
    }

    this.running = true;
    this.stopping = true;

    if (this.futureActive === null) {
      // Get random or custom element
      this.futureActive = this.custom;
    }

    // Check direction to prevent jumping
    if (this._isGoingBackward()) {
      this.resetPosition(this.direction.firstToLast);
    } else if (this._isGoingForward()) {
      this.resetPosition(this.direction.lastToFirst);
    }

    // Update last choosen element index
    this.active = this.futureActive;

    // Perform animation
    const delay = this.getDelayFromSpins(1);
    this.delay = delay;
    this._animationFX = FX_STOP;
    this._animate(this.getTileOffset(this.active));
    raf(() => {
      this.stopping = false;
      this.running = false;
      this.futureActive = null;

      if (typeof this.settings.complete === 'function') {
        this.settings.complete.apply(this, [this.active]);
      }

      if (typeof onStop === 'function') {
        onStop.apply(this, [this.active]);
      }
    }, delay);

    return this.active;
  }

  /**
   * @desc PUBLIC - Start auto shufflings, animation stops each 3 repeations. Then restart animation recursively
   */
  auto () {
    if (!this.running) {
      this._timer = new Timer(() => {
        if (typeof this.settings.randomize !== 'function') {
          this.settings.randomize = () => this._nextIndex;
        }
        if (!this.visible && this.settings.stopHidden === true) {
          // raf(() => {
          //   this._timer.reset()
          // }, 500);
          raf(this._timer.reset.bind(this._timer), 500);
        } else {
          this.shuffle(this.settings.spins, this._timer.reset.bind(this._timer));
          // this.shuffle(this.settings.spins, () => {
          //   this._timer.reset()
          // });
        }
      }, this.settings.auto);
    }
  }
}
