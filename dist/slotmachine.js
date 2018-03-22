/*
 * jQuery Slot Machine v3.0.1
 * https://github.com/josex2r/jQuery-SlotMachineundefined
 *
 * Copyright 2014 Jose Luis Represa
 * Released under the MIT license
 */
(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
'use strict';

window.SlotMachine = require('./slot-machine');

},{"./slot-machine":3}],2:[function(require,module,exports){
"use strict";

var _raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

module.exports = function raf(cb) {
  var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  setTimeout(function () {
    return _raf(cb);
  }, timeout);
};

},{}],3:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Timer = require('./timer');
var raf = require('./raf');

var defaults = {
  active: 0, // Active element [Number]
  delay: 200, // Animation time [Number]
  auto: false, // Repeat delay [false||Number]
  spins: 5, // Number of spins when auto [Number]
  randomize: null, // Randomize function, must return a number with the selected position
  complete: null, // Callback function(result)
  stopHidden: true, // Stops animations if the element isn´t visible on the screen
  direction: 'up' // Animation direction ['up'||'down']
};
var FX_NO_TRANSITION = 'slotMachineNoTransition';
var FX_FAST = 'slotMachineBlurFast';
var FX_NORMAL = 'slotMachineBlurMedium';
var FX_SLOW = 'slotMachineBlurSlow';
var FX_TURTLE = 'slotMachineBlurTurtle';
var FX_GRADIENT = 'slotMachineGradient';
var FX_STOP = FX_GRADIENT;

module.exports = function () {
  _createClass(SlotMachine, null, [{
    key: 'name',
    get: function get() {
      return 'slotMachine';
    }
  }]);

  function SlotMachine(element, options) {
    _classCallCheck(this, SlotMachine);

    this.element = element;
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
    this.settings.active = Number(this.settings.active);
    if (isNaN(this.settings.active) || this.settings.active < 0 || this.settings.active >= this.tiles.length) {
      this.settings.active = defaults.active;
    }
    this.active = this.settings.active;
    // Disable overflow
    this.element.style.overflow = 'hidden';
    // Wrap elements inside container
    this._wrapTiles();
    // Set min top offset
    this._minTop = -this._fakeFirstTile.offsetHeight;
    // Set max top offset
    this._maxTop = -this.tiles.reduce(function (acc, tile) {
      return acc + tile.offsetHeight;
    }, 0);
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

  _createClass(SlotMachine, [{
    key: '_wrapTiles',
    value: function _wrapTiles() {
      var _this = this;

      this.container = document.createElement('div');
      this.container.classList.add('slotMachineContainer');
      this.container.style.transition = '1s ease-in-out';
      this.element.appendChild(this.container);

      this._fakeFirstTile = this.tiles[this.tiles.length - 1].cloneNode(true);
      this.container.appendChild(this._fakeFirstTile);

      this.tiles.forEach(function (tile) {
        _this.container.appendChild(tile);
      });

      this._fakeLastTile = this.tiles[0].cloneNode(true);
      this.container.appendChild(this._fakeLastTile);
    }
  }, {
    key: '_initDirection',
    value: function _initDirection() {
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

  }, {
    key: '_changeTransition',


    /**
     * @desc PRIVATE - Set css transition property
     */
    value: function _changeTransition() {
      var delay = this._delay || this.settings.delay;
      var transition = this._transition || this.settings.transition;
      this.container.style.transition = delay + 's ' + transition;
    }

    /**
     * @desc PRIVATE - Set container margin
     * @param {Number}||String - Active element index
     */

  }, {
    key: '_animate',
    value: function _animate(margin) {
      this.container.style.transform = 'matrix(1, 0, 0, 1, 0, ' + margin + ')';
    }

    /**
     * @desc PRIVATE - Is moving from the first element to the last
     * @return {Boolean}
     */

  }, {
    key: '_isGoingBackward',
    value: function _isGoingBackward() {
      return this.futureActive > this.active && this.active === 0 && this.futureActive === this.tiles.length - 1;
    }

    /**
     * @desc PRIVATE - Is moving from the last element to the first
     * @param {Boolean}
     */

  }, {
    key: '_isGoingForward',
    value: function _isGoingForward() {
      return this.futureActive <= this.active && this.active === this.tiles.length - 1 && this.futureActive === 0;
    }

    /**
     * @desc PUBLIC - Get element offset top
     * @param {Number} index - Element position
     * @return {Number} - Negative offset in px
     */

  }, {
    key: 'getTileOffset',
    value: function getTileOffset(index) {
      var offset = 0;

      for (var i = 0; i < index; i++) {
        offset += this.tiles[i].offsetHeight;
      }

      return this._minTop - offset;
    }

    /**
     * @desc PRIVATE - Reset active element position
     */

  }, {
    key: 'resetPosition',
    value: function resetPosition(margin) {
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

  }, {
    key: 'setRandomize',
    value: function setRandomize(rnd) {
      this.settings.randomize = rnd;

      if (typeof rnd === 'number') {
        this.settings.randomize = function () {
          return rnd;
        };
      }
    }

    /**
     * @desc PUBLIC - SELECT previous element relative to the current active element
     * @return {Number} - Returns result index
     */

  }, {
    key: 'prev',
    value: function prev() {
      this.futureActive = this.prevIndex;
      this.running = true;
      this.stop();

      return this.futureActive;
    }

    /**
     * @desc PUBLIC - SELECT next element relative to the current active element
     * @return {Number} - Returns result index
     */

  }, {
    key: 'next',
    value: function next() {
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

  }, {
    key: 'getDelayFromSpins',
    value: function getDelayFromSpins(spins) {
      var delay = this.settings.delay;
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

  }, {
    key: 'shuffle',
    value: function shuffle(spins, onComplete) {
      var _this2 = this;

      // Make spins optional
      if (typeof spins === 'function') {
        onComplete = spins;
      }
      this.running = true;
      // Perform animation
      if (!this.visible && this.settings.stopHidden === true) {
        this.stop(onComplete);
      } else {
        var delay = this.getDelayFromSpins(spins);
        this.delay = delay;
        this._animate(this.direction.to);
        raf(function () {
          if (!_this2.stopping && _this2.running) {
            var left = spins - 1;

            _this2.resetPosition(_this2.direction.first);
            if (left <= 1) {
              _this2.stop(onComplete);
            } else {
              // Repeat animation
              _this2.shuffle(left, onComplete);
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

  }, {
    key: 'stop',
    value: function stop(onStop) {
      var _this3 = this;

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
      var delay = this.getDelayFromSpins(1);
      this.delay = delay;
      this._animationFX = FX_STOP;
      this._animate(this.getTileOffset(this.active));
      raf(function () {
        _this3.stopping = false;
        _this3.running = false;
        _this3.futureActive = null;

        if (typeof _this3.settings.complete === 'function') {
          _this3.settings.complete.apply(_this3, [_this3.active]);
        }

        if (typeof onStop === 'function') {
          onStop.apply(_this3, [_this3.active]);
        }
      }, delay);

      return this.active;
    }

    /**
     * @desc PUBLIC - Start auto shufflings, animation stops each 3 repeations. Then restart animation recursively
     */

  }, {
    key: 'auto',
    value: function auto() {
      var _this4 = this;

      if (this.running) {
        return;
      }

      this._timer = new Timer(function () {
        if (typeof _this4.settings.randomize !== 'function') {
          _this4.settings.randomize = function () {
            return _this4._nextIndex;
          };
        }
        if (!_this4.visible && _this4.settings.stopHidden === true) {
          raf(function () {
            _this4._timer.reset();
          }, 500);
        } else {
          _this4.shuffle(_this4.settings.spins, function () {
            _this4._timer.reset();
          });
        }
      }, this.settings.auto);
    }

    /**
     * @desc PUBLIC - Destroy the machine
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      var _this5 = this;

      this._fakeFirstTile.remove();
      this._fakeLastTile.remove();
      this.$tiles.unwrap();

      // Unwrap tiles
      this.tiles.forEach(function (tile) {
        _this5.element.appendChild(tile);
      });

      this.container.remove();
    }
  }, {
    key: 'active',
    get: function get() {
      return this._active;
    }

    /**
     * @desc PUBLIC - Get current showing element index
     * @return {Number} - Element index
     */
    ,


    /**
     * @desc PUBLIC - Set active element
     * @param {Number} - Active element index
     */
    set: function set(index) {
      this._active = index;
      if (index < 0 || index >= this.tiles.length) {
        this._active = 0;
      }
    }

    /**
     * @desc PUBLIC - Set the spin direction
     */

  }, {
    key: 'visibleTile',
    get: function get() {
      var firstTileHeight = this.tiles[0].offsetHeight;
      var rawContainerMargin = this.container.style.transform || '';
      var matrixRegExp = /^matrix\(-?\d+,\s?-?\d+,\s?-?\d+,\s?-?\d+,\s?-?\d+,\s?(-?\d+)\)$/;
      var containerMargin = parseInt(rawContainerMargin.replace(matrixRegExp, '$1'), 10);

      return Math.abs(Math.round(containerMargin / firstTileHeight)) - 1;
    }

    /**
     * @desc PUBLIC - Get random element different than last shown
     * @param {Boolean} cantBeTheCurrent - true||undefined if cant be choosen the current element, prevents repeat
     * @return {Number} - Element index
     */

  }, {
    key: 'random',
    get: function get() {
      return Math.floor(Math.random() * this.tiles.length);
    }

    /**
     * @desc PUBLIC - Get random element based on the custom randomize function
     * @return {Number} - Element index
     */

  }, {
    key: 'custom',
    get: function get() {
      var choosen = void 0;

      if (typeof this.settings.randomize === 'function') {
        var index = this.settings.randomize.call(this, this.active);
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

  }, {
    key: 'direction',
    get: function get() {
      return this._direction[this._direction.selected];
    }

    /**
     * @desc PRIVATE - Get the previous element (no direction related)
     * @return {Number} - Element index
     */
    ,
    set: function set(direction) {
      if (!this.running) {
        this._direction.selected = direction === 'down' ? 'down' : 'up';
      }
    }

    /**
     * @desc PRIVATE - Set CSS speed cclass
     * @param string FX_SPEED - Element speed [FX_FAST_BLUR||FX_NORMAL_BLUR||FX_SLOW_BLUR||FX_STOP]
     */

  }, {
    key: '_prevIndex',
    get: function get() {
      var prevIndex = this.active - 1;

      return prevIndex < 0 ? this.tiles.length - 1 : prevIndex;
    }

    /**
     * @desc PRIVATE - Get the next element (no direction related)
     * @return {Number} - Element index
     */

  }, {
    key: '_nextIndex',
    get: function get() {
      var nextIndex = this.active + 1;

      return nextIndex < this.tiles.length ? nextIndex : 0;
    }

    /**
     * @desc PUBLIC - Get the previous element dor selected direction
     * @return {Number} - Element index
     */

  }, {
    key: 'prevIndex',
    get: function get() {
      return this.direction.key === 'up' ? this._nextIndex : this._prevIndex;
    }

    /**
     * @desc PUBLIC - Get the next element
     * @return {Number} - Element index
     */

  }, {
    key: 'nextIndex',
    get: function get() {
      return this.direction.key === 'up' ? this._prevIndex : this._nextIndex;
    }

    /**
     * Stop animation if element is [above||below] screen, best for performance
     * @desc PRIVATE - Checks if the machine is on the screen
     * @return {Number} - Returns true if machine is on the screen
     */

  }, {
    key: 'visible',
    get: function get() {
      var rect = this.element.getBoundingClientRect();
      var windowHeight = window.innerHeight || document.documentElement.clientHeight;
      var windowWidth = window.innerWidth || document.documentElement.clientWidth;
      var vertInView = rect.top <= windowHeight && rect.top + rect.height >= 0;
      var horInView = rect.left <= windowWidth && rect.left + rect.width >= 0;

      return vertInView && horInView;
    }
  }, {
    key: '_fxClass',
    set: function set(FX_SPEED) {
      [].concat(_toConsumableArray(this.tiles), [this._fakeLastTile, this._fakeFirstTile]).forEach(function (tile) {
        tile.classList.remove(FX_FAST, FX_NORMAL, FX_SLOW, FX_TURTLE);
        tile.classList.add(FX_SPEED);
      });
    }

    /**
     * @desc PRIVATE - Set CSS classes to make speed effect
     * @param string FX_SPEED - Element speed [FX_FAST_BLUR||FX_NORMAL_BLUR||FX_SLOW_BLUR||FX_STOP]
     * @param string||boolean fade - Set fade gradient effect
     */

  }, {
    key: '_animationFX',
    set: function set(FX_SPEED) {
      var _this6 = this;

      var delay = this.settings.delay / 4;

      raf(function () {
        _this6._fxClass = FX_SPEED;

        if (FX_SPEED === FX_STOP) {
          _this6.container.classList.remove(FX_GRADIENT);
        } else {
          _this6.container.classList.add(FX_GRADIENT);
        }
      }, delay);
    }

    /**
     * @desc PRIVATE - Set css transition delay
     * @param {Number} - Transition delay in ms
     */

  }, {
    key: 'delay',
    set: function set(delay) {
      delay = delay / 1000;
      this._delay = delay;
      this._changeTransition();
    }

    /**
     * @desc PRIVATE - Set css transition
     * @param {String} - Transition type
     */

  }, {
    key: 'transition',
    set: function set(transition) {
      transition = transition || 'ease-in-out';
      this._transition = transition;
      this._changeTransition();
    }
  }]);

  return SlotMachine;
}();

},{"./raf":2,"./timer":4}],4:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
  function Timer(cb, delay) {
    _classCallCheck(this, Timer);

    this.cb = cb;
    this.initialDelay = delay;
    this.delay = delay;
    this.startTime = null;
    this.timer = null;
    this.running = false;

    this.resume();

    return this;
  }

  _createClass(Timer, [{
    key: "_start",
    value: function _start() {
      var _this = this;

      this.timer = setTimeout(function () {
        _this.running = false;
        _this.cb(_this);
      }, this.delay);
    }
  }, {
    key: "cancel",
    value: function cancel() {
      this.running = false;
      clearTimeout(this.timer);
    }
  }, {
    key: "pause",
    value: function pause() {
      if (this.running) {
        this.delay -= new Date().getTime() - this.startTime;
        this.cancel();
      }
    }
  }, {
    key: "resume",
    value: function resume() {
      if (!this.running) {
        this.running = true;
        this.startTime = new Date().getTime();

        this._start();
      }
    }
  }, {
    key: "reset",
    value: function reset() {
      this.cancel();
      this.delay = this.initialDelay;
      this._start();
    }
  }, {
    key: "add",
    value: function add(extraDelay) {
      this.pause();
      this.delay += extraDelay;
      this.resume();
    }
  }]);

  return Timer;
}();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvaW5kZXguanMiLCJsaWIvcmFmLmpzIiwibGliL3Nsb3QtbWFjaGluZS5qcyIsImxpYi90aW1lci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsT0FBTyxXQUFQLEdBQXFCLFFBQVEsZ0JBQVIsQ0FBckI7Ozs7O0FDQUEsSUFBTSxPQUFPLE9BQU8scUJBQVAsSUFBZ0MsT0FBTyx3QkFBdkMsSUFBbUUsT0FBTywyQkFBMUUsSUFBeUcsT0FBTyx1QkFBN0g7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFNBQVMsR0FBVCxDQUFjLEVBQWQsRUFBK0I7QUFBQSxNQUFiLE9BQWEsdUVBQUgsQ0FBRzs7QUFDOUMsYUFBVztBQUFBLFdBQU0sS0FBSyxFQUFMLENBQU47QUFBQSxHQUFYLEVBQTJCLE9BQTNCO0FBQ0QsQ0FGRDs7Ozs7Ozs7Ozs7QUNGQSxJQUFNLFFBQVEsUUFBUSxTQUFSLENBQWQ7QUFDQSxJQUFNLE1BQU0sUUFBUSxPQUFSLENBQVo7O0FBRUEsSUFBTSxXQUFXO0FBQ2YsVUFBUSxDQURPLEVBQ0o7QUFDWCxTQUFPLEdBRlEsRUFFSDtBQUNaLFFBQU0sS0FIUyxFQUdGO0FBQ2IsU0FBTyxDQUpRLEVBSUw7QUFDVixhQUFXLElBTEksRUFLRTtBQUNqQixZQUFVLElBTkssRUFNQztBQUNoQixjQUFZLElBUEcsRUFPRztBQUNsQixhQUFXLElBUkksQ0FRQztBQVJELENBQWpCO0FBVUEsSUFBTSxtQkFBbUIseUJBQXpCO0FBQ0EsSUFBTSxVQUFVLHFCQUFoQjtBQUNBLElBQU0sWUFBWSx1QkFBbEI7QUFDQSxJQUFNLFVBQVUscUJBQWhCO0FBQ0EsSUFBTSxZQUFZLHVCQUFsQjtBQUNBLElBQU0sY0FBYyxxQkFBcEI7QUFDQSxJQUFNLFVBQVUsV0FBaEI7O0FBRUEsT0FBTyxPQUFQO0FBQUE7QUFBQTtBQUFBLHdCQUNxQjtBQUNqQixhQUFPLGFBQVA7QUFDRDtB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TCxJQUFjLFVBQWQ7QUFDQSxXQUFLLE1BQUw7QUFDRDtBQXBESDs7QUFBQTtBQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc31yZXR1cm4gZX0pKCkiLCJ3aW5kb3cuU2xvdE1hY2hpbmUgPSByZXF1aXJlKCcuL3Nsb3QtbWFjaGluZScpO1xuIiwiY29uc3QgX3JhZiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByYWYgKGNiLCB0aW1lb3V0ID0gMCkge1xuICBzZXRUaW1lb3V0KCgpID0+IF9yYWYoY2IpLCB0aW1lb3V0KTtcbn07XG4iLCJjb25zdCBUaW1lciA9IHJlcXVpcmUoJy4vdGltZXInKTtcbmNvbnN0IHJhZiA9IHJlcXVpcmUoJy4vcmFmJyk7XG5cbmNvbnN0IGRlZmF1bHRzID0ge1xuICBhY3RpdmU6IDAsIC8vIEFjdGl2ZSBlbGVtZW50IFtOdW1iZXJdXG4gIGRlbGF5OiAyMDAsIC8vIEFuaW1hdGlvbiB0aW1lIFtOdW1iZXJdXG4gIGF1dG86IGZhbHNlLCAvLyBSZXBlYXQgZGVsYXkgW2ZhbHNlfHxOdW1iZXJdXG4gIHNwaW5zOiA1LCAvLyBOdW1iZXIgb2Ygc3BpbnMgd2hlbiBhdXRvIFtOdW1iZXJdXG4gIHJhbmRvbWl6ZTogbnVsbCwgLy8gUmFuZG9taXplIGZ1bmN0aW9uLCBtdXN0IHJldHVybiBhIG51bWJlciB3aXRoIHRoZSBzZWxlY3RlZCBwb3NpdGlvblxuICBjb21wbGV0ZTogbnVsbCwgLy8gQ2FsbGJhY2sgZnVuY3Rpb24ocmVzdWx0KVxuICBzdG9wSGlkZGVuOiB0cnVlLCAvLyBTdG9wcyBhbmltYXRpb25zIGlmIHRoZSBlbGVtZW50IGlzbsK0dCB2aXNpYmxlIG9uIHRoZSBzY3JlZW5cbiAgZGlyZWN0aW9uOiAndXAnIC8vIEFuaW1hdGlvbiBkaXJlY3Rpb24gWyd1cCd8fCdkb3duJ11cbn07XG5jb25zdCBGWF9OT19UUkFOU0lUSU9OID0gJ3Nsb3RNYWNoaW5lTm9UcmFuc2l0aW9uJztcbmNvbnN0IEZYX0ZBU1QgPSAnc2xvdE1hY2hpbmVCbHVyRmFzdCc7XG5jb25zdCBGWF9OT1JNQUwgPSAnc2xvdE1hY2hpbmVCbHVyTWVkaXVtJztcbmNvbnN0IEZYX1NMT1cgPSAnc2xvdE1hY2hpbmVCbHVyU2xvdyc7XG5jb25zdCBGWF9UVVJUTEUgPSAnc2xvdE1hY2hpbmVCbHVyVHVydGxlJztcbmNvbnN0IEZYX0dSQURJRU5UID0gJ3Nsb3RNYWNoaW5lR3JhZGllbnQnO1xuY29uc3QgRlhfU1RPUCA9IEZYX0dSQURJRU5UO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNsb3RNYWNoaW5lIHtcbiAgc3RhdGljIGdldCBuYW1lICgpIHtcbiAgICByZXR1cm4gJ3Nsb3RNYWNoaW5lJztcbiAgfVxuXG4gIGNvbnN0cnVjdG9yIChlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgIHRoaXMuZGVmYXVsdHMgPSBkZWZhdWx0cztcblxuICAgIC8vIFNsb3QgTWFjaGluZSBlbGVtZW50c1xuICAgIHRoaXMudGlsZXMgPSBbXS5zbGljZS5jYWxsKHRoaXMuZWxlbWVudC5jaGlsZHJlbik7XG4gICAgLy8gQ29udGFpbmVyIHRvIHdyYXAgdGlsZXNcbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgLy8gTWluIG1hcmdpblRvcCBvZmZzZXRcbiAgICB0aGlzLl9taW5Ub3AgPSBudWxsO1xuICAgIC8vIE1heCBtYXJnaW5Ub3Agb2Zmc2V0XG4gICAgdGhpcy5fbWF4VG9wID0gbnVsbDtcbiAgICAvLyBGaXJzdCBlbGVtZW50ICh0aGUgbGFzdCBvZiB0aGUgaHRtbCBjb250YWluZXIpXG4gICAgdGhpcy5fZmFrZUZpcnN0VGlsZSA9IG51bGw7XG4gICAgLy8gTGFzdCBlbGVtZW50ICh0aGUgZmlyc3Qgb2YgdGhlIGh0bWwgY29udGFpbmVyKVxuICAgIHRoaXMuX2Zha2VMYXN0VGlsZSA9IG51bGw7XG4gICAgLy8gVGltZW91dCByZWN1cnNpdmUgZnVuY3Rpb24gdG8gaGFuZGxlIGF1dG8gKHNldHRpbmdzLmF1dG8pXG4gICAgdGhpcy5fdGltZXIgPSBudWxsO1xuICAgIC8vIE51bWJlciBvZiBzcGlucyBsZWZ0IGJlZm9yZSBzdG9wXG4gICAgdGhpcy5fc3BpbnNMZWZ0ID0gbnVsbDtcbiAgICAvLyBGdXR1cmUgcmVzdWx0XG4gICAgdGhpcy5mdXR1cmVBY3RpdmUgPSBudWxsO1xuICAgIC8vIE1hY2hpbmUgaXMgcnVubmluZz9cbiAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAvLyBNYWNoaW5lIGlzIHN0b3BwaW5nP1xuICAgIHRoaXMuc3RvcHBpbmcgPSBmYWxzZTtcbiAgICAvLyBDdXJyZW50IGFjdGl2ZSBlbGVtZW50XG4gICAgdGhpcy5zZXR0aW5ncy5hY3RpdmUgPSBOdW1iZXIodGhpcy5zZXR0aW5ncy5hY3RpdmUpO1xuICAgIGlmIChpc05hTih0aGlzLnNldHRpbmdzLmFjdGl2ZSkgfHxcbiAgICAgIHRoaXMuc2V0dGluZ3MuYWN0aXZlIDwgMCB8fCB0aGlzLnNldHRpbmdzLmFjdGl2ZSA+PSB0aGlzLnRpbGVzLmxlbmd0aCkge1xuICAgICAgdGhpcy5zZXR0aW5ncy5hY3RpdmUgPSBkZWZhdWx0cy5hY3RpdmU7XG4gICAgfVxuICAgIHRoaXMuYWN0aXZlID0gdGhpcy5zZXR0aW5ncy5hY3RpdmU7XG4gICAgLy8gRGlzYWJsZSBvdmVyZmxvd1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuICAgIC8vIFdyYXAgZWxlbWVudHMgaW5zaWRlIGNvbnRhaW5lclxuICAgIHRoaXMuX3dyYXBUaWxlcygpO1xuICAgIC8vIFNldCBtaW4gdG9wIG9mZnNldFxuICAgIHRoaXMuX21pblRvcCA9IC10aGlzLl9mYWtlRmlyc3RUaWxlLm9mZnNldEhlaWdodDtcbiAgICAvLyBTZXQgbWF4IHRvcCBvZmZzZXRcbiAgICB0aGlzLl9tYXhUb3AgPSAtdGhpcy50aWxlcy5yZWR1Y2UoKGFjYywgdGlsZSkgPT4gKGFjYyArIHRpbGUub2Zmc2V0SGVpZ2h0KSwgMCk7XG4gICAgLy8gSW5pdGlhbGl6ZSBzcGluIGRpcmVjdGlvbiBbdXAsIGRvd25dXG4gICAgdGhpcy5faW5pdERpcmVjdGlvbigpO1xuICAgIC8vIFNob3cgYWN0aXZlIGVsZW1lbnRcbiAgICB0aGlzLnJlc2V0UG9zaXRpb24oKTtcbiAgICAvLyBTdGFydCBhdXRvIGFuaW1hdGlvblxuICAgIGlmICh0aGlzLnNldHRpbmdzLmF1dG8gIT09IGZhbHNlKSB7XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncy5hdXRvID09PSB0cnVlKSB7XG4gICAgICAgIHRoaXMuc2h1ZmZsZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hdXRvKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX3dyYXBUaWxlcyAoKSB7XG4gICAgdGhpcy5jb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdzbG90TWFjaGluZUNvbnRhaW5lcicpO1xuICAgIHRoaXMuY29udGFpbmVyLnN0eWxlLnRyYW5zaXRpb24gPSAnMXMgZWFzZS1pbi1vdXQnO1xuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmNvbnRhaW5lcik7XG5cbiAgICB0aGlzLl9mYWtlRmlyc3RUaWxlID0gdGhpcy50aWxlc1t0aGlzLnRpbGVzLmxlbmd0aCAtIDFdLmNsb25lTm9kZSh0cnVlKTtcbiAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9mYWtlRmlyc3RUaWxlKTtcblxuICAgIHRoaXMudGlsZXMuZm9yRWFjaCgodGlsZSkgPT4ge1xuICAgICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGlsZSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9mYWtlTGFzdFRpbGUgPSB0aGlzLnRpbGVzWzBdLmNsb25lTm9kZSh0cnVlKTtcbiAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9mYWtlTGFzdFRpbGUpO1xuICB9XG5cbiAgX2luaXREaXJlY3Rpb24gKCkge1xuICAgIHRoaXMuX2RpcmVjdGlvbiA9IHtcbiAgICAgIHNlbGVjdGVkOiB0aGlzLnNldHRpbmdzLmRpcmVjdGlvbiA9PT0gJ2Rvd24nID8gJ2Rvd24nIDogJ3VwJyxcbiAgICAgIHVwOiB7XG4gICAgICAgIGtleTogJ3VwJyxcbiAgICAgICAgaW5pdGlhbDogdGhpcy5nZXRUaWxlT2Zmc2V0KHRoaXMuYWN0aXZlKSxcbiAgICAgICAgZmlyc3Q6IDAsXG4gICAgICAgIGxhc3Q6IHRoaXMuZ2V0VGlsZU9mZnNldCh0aGlzLnRpbGVzLmxlbmd0aCksXG4gICAgICAgIHRvOiB0aGlzLl9tYXhUb3AsXG4gICAgICAgIGZpcnN0VG9MYXN0OiB0aGlzLmdldFRpbGVPZmZzZXQodGhpcy50aWxlcy5sZW5ndGgpLFxuICAgICAgICBsYXN0VG9GaXJzdDogMFxuICAgICAgfSxcbiAgICAgIGRvd246IHtcbiAgICAgICAga2V5OiAnZG93bicsXG4gICAgICAgIGluaXRpYWw6IHRoaXMuZ2V0VGlsZU9mZnNldCh0aGlzLmFjdGl2ZSksXG4gICAgICAgIGZpcnN0OiB0aGlzLmdldFRpbGVPZmZzZXQodGhpcy50aWxlcy5sZW5ndGgpLFxuICAgICAgICBsYXN0OiAwLFxuICAgICAgICB0bzogdGhpcy5fbWluVG9wLFxuICAgICAgICBmaXJzdFRvTGFzdDogdGhpcy5nZXRUaWxlT2Zmc2V0KHRoaXMudGlsZXMubGVuZ3RoKSxcbiAgICAgICAgbGFzdFRvRmlyc3Q6IDBcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBVQkxJQyAtIEdldCBhY3RpdmUgZWxlbWVudFxuICAgKi9cbiAgZ2V0IGFjdGl2ZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQVUJMSUMgLSBHZXQgY3VycmVudCBzaG93aW5nIGVsZW1lbnQgaW5kZXhcbiAgICogQHJldHVybiB7TnVtYmVyfSAtIEVsZW1lbnQgaW5kZXhcbiAgICovXG4gIGdldCB2aXNpYmxlVGlsZSAoKSB7XG4gICAgY29uc3QgZmlyc3RUaWxlSGVpZ2h0ID0gdGhpcy50aWxlc1swXS5vZmZzZXRIZWlnaHQ7XG4gICAgY29uc3QgcmF3Q29udGFpbmVyTWFyZ2luID0gdGhpcy5jb250YWluZXIuc3R5bGUudHJhbnNmb3JtIHx8ICcnO1xuICAgIGNvbnN0IG1hdHJpeFJlZ0V4cCA9IC9ebWF0cml4XFwoLT9cXGQrLFxccz8tP1xcZCssXFxzPy0/XFxkKyxcXHM/LT9cXGQrLFxccz8tP1xcZCssXFxzPygtP1xcZCspXFwpJC87XG4gICAgY29uc3QgY29udGFpbmVyTWFyZ2luID0gcGFyc2VJbnQocmF3Q29udGFpbmVyTWFyZ2luLnJlcGxhY2UobWF0cml4UmVnRXhwLCAnJDEnKSwgMTApO1xuXG4gICAgcmV0dXJuIE1hdGguYWJzKE1hdGgucm91bmQoY29udGFpbmVyTWFyZ2luIC8gZmlyc3RUaWxlSGVpZ2h0KSkgLSAxO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBVQkxJQyAtIEdldCByYW5kb20gZWxlbWVudCBkaWZmZXJlbnQgdGhhbiBsYXN0IHNob3duXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FudEJlVGhlQ3VycmVudCAtIHRydWV8fHVuZGVmaW5lZCBpZiBjYW50IGJlIGNob29zZW4gdGhlIGN1cnJlbnQgZWxlbWVudCwgcHJldmVudHMgcmVwZWF0XG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBFbGVtZW50IGluZGV4XG4gICAqL1xuICBnZXQgcmFuZG9tICgpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy50aWxlcy5sZW5ndGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBVQkxJQyAtIEdldCByYW5kb20gZWxlbWVudCBiYXNlZCBvbiB0aGUgY3VzdG9tIHJhbmRvbWl6ZSBmdW5jdGlvblxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gRWxlbWVudCBpbmRleFxuICAgKi9cbiAgZ2V0IGN1c3RvbSAoKSB7XG4gICAgbGV0IGNob29zZW47XG5cbiAgICBpZiAodHlwZW9mIHRoaXMuc2V0dGluZ3MucmFuZG9taXplID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBsZXQgaW5kZXggPSB0aGlzLnNldHRpbmdzLnJhbmRvbWl6ZS5jYWxsKHRoaXMsIHRoaXMuYWN0aXZlKTtcbiAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gdGhpcy50aWxlcy5sZW5ndGgpIHtcbiAgICAgICAgaW5kZXggPSAwO1xuICAgICAgfVxuICAgICAgY2hvb3NlbiA9IGluZGV4O1xuICAgIH0gZWxzZSB7XG4gICAgICBjaG9vc2VuID0gdGhpcy5yYW5kb207XG4gICAgfVxuXG4gICAgcmV0dXJuIGNob29zZW47XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFVCTElDIC0gR2V0IHRoZSBzcGluIGRpcmVjdGlvblxuICAgKi9cbiAgZ2V0IGRpcmVjdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RpcmVjdGlvblt0aGlzLl9kaXJlY3Rpb24uc2VsZWN0ZWRdO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBSSVZBVEUgLSBHZXQgdGhlIHByZXZpb3VzIGVsZW1lbnQgKG5vIGRpcmVjdGlvbiByZWxhdGVkKVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gRWxlbWVudCBpbmRleFxuICAgKi9cbiAgZ2V0IF9wcmV2SW5kZXggKCkge1xuICAgIGNvbnN0IHByZXZJbmRleCA9IHRoaXMuYWN0aXZlIC0gMTtcblxuICAgIHJldHVybiBwcmV2SW5kZXggPCAwID8gKHRoaXMudGlsZXMubGVuZ3RoIC0gMSkgOiBwcmV2SW5kZXg7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFJJVkFURSAtIEdldCB0aGUgbmV4dCBlbGVtZW50IChubyBkaXJlY3Rpb24gcmVsYXRlZClcbiAgICogQHJldHVybiB7TnVtYmVyfSAtIEVsZW1lbnQgaW5kZXhcbiAgICovXG4gIGdldCBfbmV4dEluZGV4ICgpIHtcbiAgICBjb25zdCBuZXh0SW5kZXggPSB0aGlzLmFjdGl2ZSArIDE7XG5cbiAgICByZXR1cm4gbmV4dEluZGV4IDwgdGhpcy50aWxlcy5sZW5ndGggPyBuZXh0SW5kZXggOiAwO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBVQkxJQyAtIEdldCB0aGUgcHJldmlvdXMgZWxlbWVudCBkb3Igc2VsZWN0ZWQgZGlyZWN0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBFbGVtZW50IGluZGV4XG4gICAqL1xuICBnZXQgcHJldkluZGV4ICgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb24ua2V5ID09PSAndXAnID8gdGhpcy5fbmV4dEluZGV4IDogdGhpcy5fcHJldkluZGV4O1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBVQkxJQyAtIEdldCB0aGUgbmV4dCBlbGVtZW50XG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBFbGVtZW50IGluZGV4XG4gICAqL1xuICBnZXQgbmV4dEluZGV4ICgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb24ua2V5ID09PSAndXAnID8gdGhpcy5fcHJldkluZGV4IDogdGhpcy5fbmV4dEluZGV4O1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgYW5pbWF0aW9uIGlmIGVsZW1lbnQgaXMgW2Fib3ZlfHxiZWxvd10gc2NyZWVuLCBiZXN0IGZvciBwZXJmb3JtYW5jZVxuICAgKiBAZGVzYyBQUklWQVRFIC0gQ2hlY2tzIGlmIHRoZSBtYWNoaW5lIGlzIG9uIHRoZSBzY3JlZW5cbiAgICogQHJldHVybiB7TnVtYmVyfSAtIFJldHVybnMgdHJ1ZSBpZiBtYWNoaW5lIGlzIG9uIHRoZSBzY3JlZW5cbiAgICovXG4gIGdldCB2aXNpYmxlICgpIHtcbiAgICBjb25zdCByZWN0ID0gdGhpcy5lbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHdpbmRvd0hlaWdodCA9ICh3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCk7XG4gICAgY29uc3Qgd2luZG93V2lkdGggPSAod2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoKTtcbiAgICBjb25zdCB2ZXJ0SW5WaWV3ID0gKHJlY3QudG9wIDw9IHdpbmRvd0hlaWdodCkgJiYgKChyZWN0LnRvcCArIHJlY3QuaGVpZ2h0KSA+PSAwKTtcbiAgICBjb25zdCBob3JJblZpZXcgPSAocmVjdC5sZWZ0IDw9IHdpbmRvd1dpZHRoKSAmJiAoKHJlY3QubGVmdCArIHJlY3Qud2lkdGgpID49IDApO1xuXG4gICAgcmV0dXJuIHZlcnRJblZpZXcgJiYgaG9ySW5WaWV3O1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBVQkxJQyAtIFNldCBhY3RpdmUgZWxlbWVudFxuICAgKiBAcGFyYW0ge051bWJlcn0gLSBBY3RpdmUgZWxlbWVudCBpbmRleFxuICAgKi9cbiAgc2V0IGFjdGl2ZSAoaW5kZXgpIHtcbiAgICB0aGlzLl9hY3RpdmUgPSBpbmRleDtcbiAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHRoaXMudGlsZXMubGVuZ3RoKSB7XG4gICAgICB0aGlzLl9hY3RpdmUgPSAwO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQVUJMSUMgLSBTZXQgdGhlIHNwaW4gZGlyZWN0aW9uXG4gICAqL1xuICBzZXQgZGlyZWN0aW9uIChkaXJlY3Rpb24pIHtcbiAgICBpZiAoIXRoaXMucnVubmluZykge1xuICAgICAgdGhpcy5fZGlyZWN0aW9uLnNlbGVjdGVkID0gZGlyZWN0aW9uID09PSAnZG93bicgPyAnZG93bicgOiAndXAnO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQUklWQVRFIC0gU2V0IENTUyBzcGVlZCBjY2xhc3NcbiAgICogQHBhcmFtIHN0cmluZyBGWF9TUEVFRCAtIEVsZW1lbnQgc3BlZWQgW0ZYX0ZBU1RfQkxVUnx8RlhfTk9STUFMX0JMVVJ8fEZYX1NMT1dfQkxVUnx8RlhfU1RPUF1cbiAgICovXG4gIHNldCBfZnhDbGFzcyAoRlhfU1BFRUQpIHtcbiAgICBbLi4udGhpcy50aWxlcywgdGhpcy5fZmFrZUxhc3RUaWxlLCB0aGlzLl9mYWtlRmlyc3RUaWxlXS5mb3JFYWNoKCh0aWxlKSA9PiB7XG4gICAgICB0aWxlLmNsYXNzTGlzdC5yZW1vdmUoRlhfRkFTVCwgRlhfTk9STUFMLCBGWF9TTE9XLCBGWF9UVVJUTEUpO1xuICAgICAgdGlsZS5jbGFzc0xpc3QuYWRkKEZYX1NQRUVEKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQUklWQVRFIC0gU2V0IENTUyBjbGFzc2VzIHRvIG1ha2Ugc3BlZWQgZWZmZWN0XG4gICAqIEBwYXJhbSBzdHJpbmcgRlhfU1BFRUQgLSBFbGVtZW50IHNwZWVkIFtGWF9GQVNUX0JMVVJ8fEZYX05PUk1BTF9CTFVSfHxGWF9TTE9XX0JMVVJ8fEZYX1NUT1BdXG4gICAqIEBwYXJhbSBzdHJpbmd8fGJvb2xlYW4gZmFkZSAtIFNldCBmYWRlIGdyYWRpZW50IGVmZmVjdFxuICAgKi9cbiAgc2V0IF9hbmltYXRpb25GWCAoRlhfU1BFRUQpIHtcbiAgICBjb25zdCBkZWxheSA9IHRoaXMuc2V0dGluZ3MuZGVsYXkgLyA0O1xuXG4gICAgcmFmKCgpID0+IHtcbiAgICAgIHRoaXMuX2Z4Q2xhc3MgPSBGWF9TUEVFRDtcblxuICAgICAgaWYgKEZYX1NQRUVEID09PSBGWF9TVE9QKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoRlhfR1JBRElFTlQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LmFkZChGWF9HUkFESUVOVCk7XG4gICAgICB9XG4gICAgfSwgZGVsYXkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBSSVZBVEUgLSBTZXQgY3NzIHRyYW5zaXRpb24gZGVsYXlcbiAgICogQHBhcmFtIHtOdW1iZXJ9IC0gVHJhbnNpdGlvbiBkZWxheSBpbiBtc1xuICAgKi9cbiAgc2V0IGRlbGF5IChkZWxheSkge1xuICAgIGRlbGF5ID0gZGVsYXkgLyAxMDAwO1xuICAgIHRoaXMuX2RlbGF5ID0gZGVsYXk7XG4gICAgdGhpcy5fY2hhbmdlVHJhbnNpdGlvbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBSSVZBVEUgLSBTZXQgY3NzIHRyYW5zaXRpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IC0gVHJhbnNpdGlvbiB0eXBlXG4gICAqL1xuICBzZXQgdHJhbnNpdGlvbiAodHJhbnNpdGlvbikge1xuICAgIHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uIHx8ICdlYXNlLWluLW91dCc7XG4gICAgdGhpcy5fdHJhbnNpdGlvbiA9IHRyYW5zaXRpb247XG4gICAgdGhpcy5fY2hhbmdlVHJhbnNpdGlvbigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBSSVZBVEUgLSBTZXQgY3NzIHRyYW5zaXRpb24gcHJvcGVydHlcbiAgICovXG4gIF9jaGFuZ2VUcmFuc2l0aW9uICgpIHtcbiAgICBjb25zdCBkZWxheSA9IHRoaXMuX2RlbGF5IHx8IHRoaXMuc2V0dGluZ3MuZGVsYXk7XG4gICAgY29uc3QgdHJhbnNpdGlvbiA9IHRoaXMuX3RyYW5zaXRpb24gfHwgdGhpcy5zZXR0aW5ncy50cmFuc2l0aW9uO1xuICAgIHRoaXMuY29udGFpbmVyLnN0eWxlLnRyYW5zaXRpb24gPSBgJHtkZWxheX1zICR7dHJhbnNpdGlvbn1gO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBSSVZBVEUgLSBTZXQgY29udGFpbmVyIG1hcmdpblxuICAgKiBAcGFyYW0ge051bWJlcn18fFN0cmluZyAtIEFjdGl2ZSBlbGVtZW50IGluZGV4XG4gICAqL1xuICBfYW5pbWF0ZSAobWFyZ2luKSB7XG4gICAgdGhpcy5jb250YWluZXIuc3R5bGUudHJhbnNmb3JtID0gYG1hdHJpeCgxLCAwLCAwLCAxLCAwLCAke21hcmdpbn0pYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQUklWQVRFIC0gSXMgbW92aW5nIGZyb20gdGhlIGZpcnN0IGVsZW1lbnQgdG8gdGhlIGxhc3RcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG4gIF9pc0dvaW5nQmFja3dhcmQgKCkge1xuICAgIHJldHVybiB0aGlzLmZ1dHVyZUFjdGl2ZSA+IHRoaXMuYWN0aXZlICYmIHRoaXMuYWN0aXZlID09PSAwICYmIHRoaXMuZnV0dXJlQWN0aXZlID09PSB0aGlzLnRpbGVzLmxlbmd0aCAtIDE7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFJJVkFURSAtIElzIG1vdmluZyBmcm9tIHRoZSBsYXN0IGVsZW1lbnQgdG8gdGhlIGZpcnN0XG4gICAqIEBwYXJhbSB7Qm9vbGVhbn1cbiAgICovXG4gIF9pc0dvaW5nRm9yd2FyZCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZnV0dXJlQWN0aXZlIDw9IHRoaXMuYWN0aXZlICYmIHRoaXMuYWN0aXZlID09PSB0aGlzLnRpbGVzLmxlbmd0aCAtIDEgJiYgdGhpcy5mdXR1cmVBY3RpdmUgPT09IDA7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFVCTElDIC0gR2V0IGVsZW1lbnQgb2Zmc2V0IHRvcFxuICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggLSBFbGVtZW50IHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBOZWdhdGl2ZSBvZmZzZXQgaW4gcHhcbiAgICovXG4gIGdldFRpbGVPZmZzZXQgKGluZGV4KSB7XG4gICAgbGV0IG9mZnNldCA9IDA7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluZGV4OyBpKyspIHtcbiAgICAgIG9mZnNldCArPSB0aGlzLnRpbGVzW2ldLm9mZnNldEhlaWdodDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbWluVG9wIC0gb2Zmc2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBSSVZBVEUgLSBSZXNldCBhY3RpdmUgZWxlbWVudCBwb3NpdGlvblxuICAgKi9cbiAgcmVzZXRQb3NpdGlvbiAobWFyZ2luKSB7XG4gICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LnRvZ2dsZShGWF9OT19UUkFOU0lUSU9OKTtcbiAgICB0aGlzLl9hbmltYXRlKG1hcmdpbiA9PT0gdW5kZWZpbmVkID8gdGhpcy5kaXJlY3Rpb24uaW5pdGlhbCA6IG1hcmdpbik7XG4gICAgLy8gRm9yY2UgcmVmbG93LCBmbHVzaGluZyB0aGUgQ1NTIGNoYW5nZXNcbiAgICB0aGlzLmNvbnRhaW5lci5vZmZzZXRIZWlnaHQ7XG4gICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LnRvZ2dsZShGWF9OT19UUkFOU0lUSU9OKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQVUJMSUMgLSBDaGFuZ2VzIHJhbmRvbWl6ZSBmdW5jdGlvblxuICAgKiBAcGFyYW0gZnVuY3Rpb258TnVtYmVyIC0gU2V0IG5ldyByYW5kb21pemUgZnVuY3Rpb25cbiAgICovXG4gIHNldFJhbmRvbWl6ZSAocm5kKSB7XG4gICAgdGhpcy5zZXR0aW5ncy5yYW5kb21pemUgPSBybmQ7XG5cbiAgICBpZiAodHlwZW9mIHJuZCA9PT0gJ251bWJlcicpIHtcbiAgICAgIHRoaXMuc2V0dGluZ3MucmFuZG9taXplID0gKCkgPT4gcm5kO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQVUJMSUMgLSBTRUxFQ1QgcHJldmlvdXMgZWxlbWVudCByZWxhdGl2ZSB0byB0aGUgY3VycmVudCBhY3RpdmUgZWxlbWVudFxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gUmV0dXJucyByZXN1bHQgaW5kZXhcbiAgICovXG4gIHByZXYgKCkge1xuICAgIHRoaXMuZnV0dXJlQWN0aXZlID0gdGhpcy5wcmV2SW5kZXg7XG4gICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcbiAgICB0aGlzLnN0b3AoKTtcblxuICAgIHJldHVybiB0aGlzLmZ1dHVyZUFjdGl2ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQVUJMSUMgLSBTRUxFQ1QgbmV4dCBlbGVtZW50IHJlbGF0aXZlIHRvIHRoZSBjdXJyZW50IGFjdGl2ZSBlbGVtZW50XG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBSZXR1cm5zIHJlc3VsdCBpbmRleFxuICAgKi9cbiAgbmV4dCAoKSB7XG4gICAgdGhpcy5mdXR1cmVBY3RpdmUgPSB0aGlzLm5leHRJbmRleDtcbiAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgIHRoaXMuc3RvcCgpO1xuXG4gICAgcmV0dXJuIHRoaXMuZnV0dXJlQWN0aXZlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBVQkxJQyAtIFN0YXJ0cyBzaHVmZmxpbmcgdGhlIGVsZW1lbnRzXG4gICAqIEBwYXJhbSB7TnVtYmVyfSByZXBlYXRpb25zIC0gTnVtYmVyIG9mIHNodWZmbGVzICh1bmRlZmluZWQgdG8gbWFrZSBpbmZpbml0ZSBhbmltYXRpb25cbiAgICogQHJldHVybiB7TnVtYmVyfSAtIFJldHVybnMgcmVzdWx0IGluZGV4XG4gICAqL1xuICBnZXREZWxheUZyb21TcGlucyAoc3BpbnMpIHtcbiAgICBsZXQgZGVsYXkgPSB0aGlzLnNldHRpbmdzLmRlbGF5O1xuICAgIHRoaXMuX3RyYW5zaXRpb24gPSAnbGluZWFyJztcblxuICAgIHN3aXRjaCAoc3BpbnMpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgZGVsYXkgLz0gMC41O1xuICAgICAgICB0aGlzLl90cmFuc2l0aW9uID0gJ2Vhc2Utb3V0JztcbiAgICAgICAgdGhpcy5fYW5pbWF0aW9uRlggPSBGWF9UVVJUTEU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBkZWxheSAvPSAwLjc1O1xuICAgICAgICB0aGlzLl9hbmltYXRpb25GWCA9IEZYX1NMT1c7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBkZWxheSAvPSAxO1xuICAgICAgICB0aGlzLl9hbmltYXRpb25GWCA9IEZYX05PUk1BTDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDQ6XG4gICAgICAgIGRlbGF5IC89IDEuMjU7XG4gICAgICAgIHRoaXMuX2FuaW1hdGlvbkZYID0gRlhfTk9STUFMO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGRlbGF5IC89IDEuNTtcbiAgICAgICAgdGhpcy5fYW5pbWF0aW9uRlggPSBGWF9GQVNUO1xuICAgIH1cblxuICAgIHJldHVybiBkZWxheTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQVUJMSUMgLSBTdGFydHMgc2h1ZmZsaW5nIHRoZSBlbGVtZW50c1xuICAgKiBAcGFyYW0ge051bWJlcn0gcmVwZWF0aW9ucyAtIE51bWJlciBvZiBzaHVmZmxlcyAodW5kZWZpbmVkIHRvIG1ha2UgaW5maW5pdGUgYW5pbWF0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBSZXR1cm5zIHJlc3VsdCBpbmRleFxuICAgKi9cbiAgc2h1ZmZsZSAoc3BpbnMsIG9uQ29tcGxldGUpIHtcbiAgICAvLyBNYWtlIHNwaW5zIG9wdGlvbmFsXG4gICAgaWYgKHR5cGVvZiBzcGlucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgb25Db21wbGV0ZSA9IHNwaW5zO1xuICAgIH1cbiAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgIC8vIFBlcmZvcm0gYW5pbWF0aW9uXG4gICAgaWYgKCF0aGlzLnZpc2libGUgJiYgdGhpcy5zZXR0aW5ncy5zdG9wSGlkZGVuID09PSB0cnVlKSB7XG4gICAgICB0aGlzLnN0b3Aob25Db21wbGV0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGRlbGF5ID0gdGhpcy5nZXREZWxheUZyb21TcGlucyhzcGlucyk7XG4gICAgICB0aGlzLmRlbGF5ID0gZGVsYXk7XG4gICAgICB0aGlzLl9hbmltYXRlKHRoaXMuZGlyZWN0aW9uLnRvKTtcbiAgICAgIHJhZigoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5zdG9wcGluZyAmJiB0aGlzLnJ1bm5pbmcpIHtcbiAgICAgICAgICBjb25zdCBsZWZ0ID0gc3BpbnMgLSAxO1xuXG4gICAgICAgICAgdGhpcy5yZXNldFBvc2l0aW9uKHRoaXMuZGlyZWN0aW9uLmZpcnN0KTtcbiAgICAgICAgICBpZiAobGVmdCA8PSAxKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3Aob25Db21wbGV0ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFJlcGVhdCBhbmltYXRpb25cbiAgICAgICAgICAgIHRoaXMuc2h1ZmZsZShsZWZ0LCBvbkNvbXBsZXRlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIGRlbGF5KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5mdXR1cmVBY3RpdmU7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFVCTElDIC0gU3RvcCBzaHVmZmxpbmcgdGhlIGVsZW1lbnRzXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBSZXR1cm5zIHJlc3VsdCBpbmRleFxuICAgKi9cbiAgc3RvcCAob25TdG9wKSB7XG4gICAgaWYgKCF0aGlzLnJ1bm5pbmcgfHwgdGhpcy5zdG9wcGluZykge1xuICAgICAgcmV0dXJuIHRoaXMuZnV0dXJlQWN0aXZlO1xuICAgIH1cblxuICAgIHRoaXMucnVubmluZyA9IHRydWU7XG4gICAgdGhpcy5zdG9wcGluZyA9IHRydWU7XG5cbiAgICBpZiAodGhpcy5mdXR1cmVBY3RpdmUgPT09IG51bGwpIHtcbiAgICAgIC8vIEdldCByYW5kb20gb3IgY3VzdG9tIGVsZW1lbnRcbiAgICAgIHRoaXMuZnV0dXJlQWN0aXZlID0gdGhpcy5jdXN0b207XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZGlyZWN0aW9uIHRvIHByZXZlbnQganVtcGluZ1xuICAgIGlmICh0aGlzLl9pc0dvaW5nQmFja3dhcmQoKSkge1xuICAgICAgdGhpcy5yZXNldFBvc2l0aW9uKHRoaXMuZGlyZWN0aW9uLmZpcnN0VG9MYXN0KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2lzR29pbmdGb3J3YXJkKCkpIHtcbiAgICAgIHRoaXMucmVzZXRQb3NpdGlvbih0aGlzLmRpcmVjdGlvbi5sYXN0VG9GaXJzdCk7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIGxhc3QgY2hvb3NlbiBlbGVtZW50IGluZGV4XG4gICAgdGhpcy5hY3RpdmUgPSB0aGlzLmZ1dHVyZUFjdGl2ZTtcblxuICAgIC8vIFBlcmZvcm0gYW5pbWF0aW9uXG4gICAgY29uc3QgZGVsYXkgPSB0aGlzLmdldERlbGF5RnJvbVNwaW5zKDEpO1xuICAgIHRoaXMuZGVsYXkgPSBkZWxheTtcbiAgICB0aGlzLl9hbmltYXRpb25GWCA9IEZYX1NUT1A7XG4gICAgdGhpcy5fYW5pbWF0ZSh0aGlzLmdldFRpbGVPZmZzZXQodGhpcy5hY3RpdmUpKTtcbiAgICByYWYoKCkgPT4ge1xuICAgICAgdGhpcy5zdG9wcGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLmZ1dHVyZUFjdGl2ZSA9IG51bGw7XG5cbiAgICAgIGlmICh0eXBlb2YgdGhpcy5zZXR0aW5ncy5jb21wbGV0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnNldHRpbmdzLmNvbXBsZXRlLmFwcGx5KHRoaXMsIFt0aGlzLmFjdGl2ZV0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIG9uU3RvcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBvblN0b3AuYXBwbHkodGhpcywgW3RoaXMuYWN0aXZlXSk7XG4gICAgICB9XG4gICAgfSwgZGVsYXkpO1xuXG4gICAgcmV0dXJuIHRoaXMuYWN0aXZlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBVQkxJQyAtIFN0YXJ0IGF1dG8gc2h1ZmZsaW5ncywgYW5pbWF0aW9uIHN0b3BzIGVhY2ggMyByZXBlYXRpb25zLiBUaGVuIHJlc3RhcnQgYW5pbWF0aW9uIHJlY3Vyc2l2ZWx5XG4gICAqL1xuICBhdXRvICgpIHtcbiAgICBpZiAodGhpcy5ydW5uaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fdGltZXIgPSBuZXcgVGltZXIoKCkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnNldHRpbmdzLnJhbmRvbWl6ZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnNldHRpbmdzLnJhbmRvbWl6ZSA9ICgpID0+IHRoaXMuX25leHRJbmRleDtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy52aXNpYmxlICYmIHRoaXMuc2V0dGluZ3Muc3RvcEhpZGRlbiA9PT0gdHJ1ZSkge1xuICAgICAgICByYWYoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX3RpbWVyLnJlc2V0KClcbiAgICAgICAgfSwgNTAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2h1ZmZsZSh0aGlzLnNldHRpbmdzLnNwaW5zLCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fdGltZXIucmVzZXQoKVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LCB0aGlzLnNldHRpbmdzLmF1dG8pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBVQkxJQyAtIERlc3Ryb3kgdGhlIG1hY2hpbmVcbiAgICovXG4gIGRlc3Ryb3kgKCkge1xuICAgIHRoaXMuX2Zha2VGaXJzdFRpbGUucmVtb3ZlKCk7XG4gICAgdGhpcy5fZmFrZUxhc3RUaWxlLnJlbW92ZSgpO1xuICAgIHRoaXMuJHRpbGVzLnVud3JhcCgpO1xuXG4gICAgLy8gVW53cmFwIHRpbGVzXG4gICAgdGhpcy50aWxlcy5mb3JFYWNoKCh0aWxlKSA9PiB7XG4gICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGlsZSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmNvbnRhaW5lci5yZW1vdmUoKTtcbiAgfVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBUaW1lciB7XG4gIGNvbnN0cnVjdG9yIChjYiwgZGVsYXkpIHtcbiAgICB0aGlzLmNiID0gY2I7XG4gICAgdGhpcy5pbml0aWFsRGVsYXkgPSBkZWxheTtcbiAgICB0aGlzLmRlbGF5ID0gZGVsYXk7XG4gICAgdGhpcy5zdGFydFRpbWUgPSBudWxsO1xuICAgIHRoaXMudGltZXIgPSBudWxsO1xuICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuXG4gICAgdGhpcy5yZXN1bWUoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX3N0YXJ0ICgpIHtcbiAgICB0aGlzLnRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuY2IodGhpcyk7XG4gICAgfSwgdGhpcy5kZWxheSk7XG4gIH1cblxuICBjYW5jZWwgKCkge1xuICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVyKTtcbiAgfVxuXG4gIHBhdXNlICgpIHtcbiAgICBpZiAodGhpcy5ydW5uaW5nKSB7XG4gICAgICB0aGlzLmRlbGF5IC09IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdGhpcy5zdGFydFRpbWU7XG4gICAgICB0aGlzLmNhbmNlbCgpO1xuICAgIH1cbiAgfVxuXG4gIHJlc3VtZSAoKSB7XG4gICAgaWYgKCF0aGlzLnJ1bm5pbmcpIHtcbiAgICAgIHRoaXMucnVubmluZyA9IHRydWU7XG4gICAgICB0aGlzLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgICB0aGlzLl9zdGFydCgpO1xuICAgIH1cbiAgfVxuXG4gIHJlc2V0ICgpIHtcbiAgICB0aGlzLmNhbmNlbCgpO1xuICAgIHRoaXMuZGVsYXkgPSB0aGlzLmluaXRpYWxEZWxheTtcbiAgICB0aGlzLl9zdGFydCgpO1xuICB9XG5cbiAgYWRkIChleHRyYURlbGF5KSB7XG4gICAgdGhpcy5wYXVzZSgpO1xuICAgIHRoaXMuZGVsYXkgKz0gZXh0cmFEZWxheTtcbiAgICB0aGlzLnJlc3VtZSgpO1xuICB9XG59O1xuIl19
