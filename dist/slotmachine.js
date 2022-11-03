(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("SlotMachine", [], factory);
	else if(typeof exports === 'object')
		exports["SlotMachine"] = factory();
	else
		root["SlotMachine"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ SlotMachine)
});

;// CONCATENATED MODULE: ./lib/raf.ts
function raf(cb, timeout = 0) {
    setTimeout(() => requestAnimationFrame(cb), timeout);
}

;// CONCATENATED MODULE: ./lib/dom.ts
class Container {
    constructor(container) {
        this.container = container;
        this.tiles = [];
        this.tileNodes = [];
        const tileElements = [].slice.call(this.container.children);
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
    wrapTiles() {
        this.tileNodes.forEach((tile) => {
            this.element.appendChild(tile.element);
        });
    }
    get lastTileOffset() {
        return this.tiles[0].offset;
    }
    getTileOffset(index) {
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
class Tile {
    constructor(element) {
        this.element = element;
        this.element.classList.add('slot-machine__tile');
    }
    clone() {
        const element = this.element.cloneNode(true);
        return new Tile(element);
    }
    get offset() {
        return this.element.offsetHeight;
    }
}

;// CONCATENATED MODULE: ./lib/constants.ts
function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const DEFAULTS = {
    active: 0,
    delay: 200,
    randomize: (_, max) => randomInteger(0, max),
    direction: 'up',
};
var CONTAINER_FX;
(function (CONTAINER_FX) {
    CONTAINER_FX["GRADIENT"] = "slot-machine__container--gradient";
})(CONTAINER_FX || (CONTAINER_FX = {}));
var TILE_FX;
(function (TILE_FX) {
    TILE_FX["NO_TRANSITION"] = "slot-machine__tile--no-transition";
    TILE_FX["FAST"] = "slot-machine__tile--blur-fast";
    TILE_FX["NORMAL"] = "slot-machine__tile--blur-medium";
    TILE_FX["SLOW"] = "slot-machine__tile--blur-slow";
    TILE_FX["TURTLE"] = "slot-machine__tile--blur-turtle";
    TILE_FX["STOP"] = "slot-machine__tile--gradient";
})(TILE_FX || (TILE_FX = {}));

;// CONCATENATED MODULE: ./lib/index.ts



const timeout = (delay) => new Promise((res) => setTimeout(res, delay));
class SlotMachine {
    constructor(element, options) {
        this.running = false;
        this.stopping = false;
        this.element = element;
        this.container = new Container(this.element);
        this.setOptions(options);
        this.active = this.options.active;
        this.setupBounds();
        this._resetPosition();
    }
    setOptions(options) {
        this.options = { ...DEFAULTS, ...options };
    }
    setupBounds() {
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
    set active(index) {
        if (index < 0 || index >= this.container.tiles.length || isNaN(index)) {
            index = 0;
        }
        this._active = index;
    }
    get transition() {
        return this._transition;
    }
    set transition(transition) {
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
    set _animationFX(effect) {
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
            }
            else {
                this.container.element.classList.add(CONTAINER_FX.GRADIENT);
            }
        }, delay);
    }
    _changeTransition(delay = this.options.delay, transition = this.transition) {
        this.container.element.style.transition = `${delay / 1000}s ${transition}`;
    }
    _changeTransform(margin) {
        this.container.element.style.transform = `matrix(1, 0, 0, 1, 0, ${margin})`;
    }
    _isGoingBackward() {
        return !!(this.active === 0 && this.nextActive === this.container.tiles.length - 1);
    }
    _isGoingForward() {
        return !!(this.active === this.container.tiles.length - 1 && this.nextActive === 0);
    }
    _resetPosition(margin) {
        this.container.element.classList.toggle(TILE_FX.NO_TRANSITION);
        this._changeTransform(margin !== undefined ? margin : this.bounds.initial);
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
    _getDelayFromSpins(spins) {
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
    shuffle(spins) {
        if (this.running || this.stopping) {
            return;
        }
        this.nextActive = this.options.randomize(this.active, this.container.tiles.length);
        this.remainingSpins = spins;
        return this._shuffle();
    }
    async _shuffle() {
        this.running = true;
        const delay = this._getDelayFromSpins(this.remainingSpins);
        this._changeTransition(delay);
        this._changeTransform(this.bounds.to);
        await timeout(delay);
        if (!this.stopping && this.running) {
            this.remainingSpins--;
            this._resetPosition(this.bounds.from);
            if (this.remainingSpins > 1) {
                await this._shuffle();
            }
            else {
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
        if (this._isGoingBackward()) {
            this._resetPosition(this.bounds.prevReset);
        }
        else if (this._isGoingForward()) {
            this._resetPosition(this.bounds.nextReset);
        }
        this.active = this.nextActive;
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

__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=slotmachine.js.map