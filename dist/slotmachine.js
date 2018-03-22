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
    // Randomize Function|Number
    this.randomize = this.settings.randomize;
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
    this._resetPosition();
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
    key: '_resetPosition',
    value: function _resetPosition(margin) {
      this.container.classList.toggle(FX_NO_TRANSITION);
      this._animate(margin === undefined ? this.direction.initial : margin);
      // Force reflow, flushing the CSS changes
      this.container.offsetHeight;
      this.container.classList.toggle(FX_NO_TRANSITION);
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
     * @desc PRIVATE - Starts shuffling the elements
     * @param {Number} repeations - Number of shuffles (undefined to make infinite animation
     * @return {Number} - Returns result index
     */

  }, {
    key: '_getDelayFromSpins',
    value: function _getDelayFromSpins(spins) {
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
        var delay = this._getDelayFromSpins(spins);
        this.delay = delay;
        this._animate(this.direction.to);
        raf(function () {
          if (!_this2.stopping && _this2.running) {
            var left = spins - 1;

            _this2._resetPosition(_this2.direction.first);
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
        this._resetPosition(this.direction.firstToLast);
      } else if (this._isGoingForward()) {
        this._resetPosition(this.direction.lastToFirst);
      }

      // Update last choosen element index
      this.active = this.futureActive;

      // Perform animation
      var delay = this._getDelayFromSpins(1);
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
        if (typeof _this4._randomize !== 'function') {
          _this4._randomize = function () {
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

      if (typeof this._randomize === 'function') {
        var index = this._randomize(this.active);
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
     * @desc PUBLIC - Changes randomize function
     * @param function|Number - Set new randomize function
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
    key: 'randomize',
    set: function set(rnd) {
      this._randomize = rnd;

      if (typeof rnd === 'number') {
        this._randomize = function () {
          return rnd;
        };
      }
    }

    /**
     * @desc PRIVATE - Set CSS speed cclass
     * @param string FX_SPEED - Element speed [FX_FAST_BLUR||FX_NORMAL_BLUR||FX_SLOW_BLUR||FX_STOP]
     */

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvaW5kZXguanMiLCJsaWIvcmFmLmpzIiwibGliL3Nsb3QtbWFjaGluZS5qcyIsImxpYi90aW1lci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsT0FBTyxXQUFQLEdBQXFCLFFBQVEsZ0JBQVIsQ0FBckI7Ozs7O0FDQUEsSUFBTSxPQUFPLE9BQU8scUJBQVAsSUFBZ0MsT0FBTyx3QkFBdkMsSUFBbUUsT0FBTywyQkFBMUUsSUFBeUcsT0FBTyx1QkFBN0g7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFNBQVMsR0FBVCxDQUFjLEVBQWQsRUFBK0I7QUFBQSxNQUFiLE9BQWEsdUVBQUgsQ0FBRzs7QUFDOUMsYUFBVztBQUFBLFdBQU0sS0FBSyxFQUFMLENBQU47QUFBQSxHQUFYLEVBQTJCLE9BQTNCO0FBQ0QsQ0FGRDs7Ozs7Ozs7Ozs7QUNGQSxJQUFNLFFBQVEsUUFBUSxTQUFSLENBQWQ7QUFDQSxJQUFNLE1BQU0sUUFBUSxPQUFSLENBQVo7O0FBRUEsSUFBTSxXQUFXO0FBQ2YsVUFBUSxDQURPLEVBQ0o7QUFDWCxTQUFPLEdBRlEsRUFFSDtBQUNaLFFBQU0sS0FIUyxFQUdGO0FBQ2IsU0FBTyxDQUpRLEVBSUw7QUFDVixhQUFXLElBTEksRUFLRTtBQUNqQixZQUFVLElBTkssRUFNQztBQUNoQixjQUFZLElBUEcsRUFPRztBQUNsQixhQUFXLElBUkksQ0FRQztBQVJELENBQWpCO0FBVUEsSUFBTSxtQkFBbUIseUJBQXpCO0FBQ0EsSUFBTSxVQUFVLHFCQUFoQjtBQUNBLElBQU0sWUFBWSx1QkFBbEI7QUFDQSxJQUFNLFVBQVUscUJBQWhCO0FBQ0EsSUFBTSxZQUFZLHVCQUFsQjtBQUNBLElBQU0sY0FBYyxxQkFBcEI7QUFDQSxJQUFNLFVBQVUsV0FBaEI7O0FBRUEsT0FBTyxPQUFQO0FBQUE7QUFBQTtBQUFBLHdCQUNxQjtBQUNqQixhQUFPLGFBQVA7QUFDRDtB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QUFBQTtBQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc31yZXR1cm4gZX0pKCkiLCJ3aW5kb3cuU2xvdE1hY2hpbmUgPSByZXF1aXJlKCcuL3Nsb3QtbWFjaGluZScpO1xuIiwiY29uc3QgX3JhZiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByYWYgKGNiLCB0aW1lb3V0ID0gMCkge1xuICBzZXRUaW1lb3V0KCgpID0+IF9yYWYoY2IpLCB0aW1lb3V0KTtcbn07XG4iLCJjb25zdCBUaW1lciA9IHJlcXVpcmUoJy4vdGltZXInKTtcbmNvbnN0IHJhZiA9IHJlcXVpcmUoJy4vcmFmJyk7XG5cbmNvbnN0IGRlZmF1bHRzID0ge1xuICBhY3RpdmU6IDAsIC8vIEFjdGl2ZSBlbGVtZW50IFtOdW1iZXJdXG4gIGRlbGF5OiAyMDAsIC8vIEFuaW1hdGlvbiB0aW1lIFtOdW1iZXJdXG4gIGF1dG86IGZhbHNlLCAvLyBSZXBlYXQgZGVsYXkgW2ZhbHNlfHxOdW1iZXJdXG4gIHNwaW5zOiA1LCAvLyBOdW1iZXIgb2Ygc3BpbnMgd2hlbiBhdXRvIFtOdW1iZXJdXG4gIHJhbmRvbWl6ZTogbnVsbCwgLy8gUmFuZG9taXplIGZ1bmN0aW9uLCBtdXN0IHJldHVybiBhIG51bWJlciB3aXRoIHRoZSBzZWxlY3RlZCBwb3NpdGlvblxuICBjb21wbGV0ZTogbnVsbCwgLy8gQ2FsbGJhY2sgZnVuY3Rpb24ocmVzdWx0KVxuICBzdG9wSGlkZGVuOiB0cnVlLCAvLyBTdG9wcyBhbmltYXRpb25zIGlmIHRoZSBlbGVtZW50IGlzbsK0dCB2aXNpYmxlIG9uIHRoZSBzY3JlZW5cbiAgZGlyZWN0aW9uOiAndXAnIC8vIEFuaW1hdGlvbiBkaXJlY3Rpb24gWyd1cCd8fCdkb3duJ11cbn07XG5jb25zdCBGWF9OT19UUkFOU0lUSU9OID0gJ3Nsb3RNYWNoaW5lTm9UcmFuc2l0aW9uJztcbmNvbnN0IEZYX0ZBU1QgPSAnc2xvdE1hY2hpbmVCbHVyRmFzdCc7XG5jb25zdCBGWF9OT1JNQUwgPSAnc2xvdE1hY2hpbmVCbHVyTWVkaXVtJztcbmNvbnN0IEZYX1NMT1cgPSAnc2xvdE1hY2hpbmVCbHVyU2xvdyc7XG5jb25zdCBGWF9UVVJUTEUgPSAnc2xvdE1hY2hpbmVCbHVyVHVydGxlJztcbmNvbnN0IEZYX0dSQURJRU5UID0gJ3Nsb3RNYWNoaW5lR3JhZGllbnQnO1xuY29uc3QgRlhfU1RPUCA9IEZYX0dSQURJRU5UO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNsb3RNYWNoaW5lIHtcbiAgc3RhdGljIGdldCBuYW1lICgpIHtcbiAgICByZXR1cm4gJ3Nsb3RNYWNoaW5lJztcbiAgfVxuXG4gIGNvbnN0cnVjdG9yIChlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgIHRoaXMuZGVmYXVsdHMgPSBkZWZhdWx0cztcblxuICAgIC8vIFNsb3QgTWFjaGluZSBlbGVtZW50c1xuICAgIHRoaXMudGlsZXMgPSBbXS5zbGljZS5jYWxsKHRoaXMuZWxlbWVudC5jaGlsZHJlbik7XG4gICAgLy8gQ29udGFpbmVyIHRvIHdyYXAgdGlsZXNcbiAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XG4gICAgLy8gTWluIG1hcmdpblRvcCBvZmZzZXRcbiAgICB0aGlzLl9taW5Ub3AgPSBudWxsO1xuICAgIC8vIE1heCBtYXJnaW5Ub3Agb2Zmc2V0XG4gICAgdGhpcy5fbWF4VG9wID0gbnVsbDtcbiAgICAvLyBGaXJzdCBlbGVtZW50ICh0aGUgbGFzdCBvZiB0aGUgaHRtbCBjb250YWluZXIpXG4gICAgdGhpcy5fZmFrZUZpcnN0VGlsZSA9IG51bGw7XG4gICAgLy8gTGFzdCBlbGVtZW50ICh0aGUgZmlyc3Qgb2YgdGhlIGh0bWwgY29udGFpbmVyKVxuICAgIHRoaXMuX2Zha2VMYXN0VGlsZSA9IG51bGw7XG4gICAgLy8gVGltZW91dCByZWN1cnNpdmUgZnVuY3Rpb24gdG8gaGFuZGxlIGF1dG8gKHNldHRpbmdzLmF1dG8pXG4gICAgdGhpcy5fdGltZXIgPSBudWxsO1xuICAgIC8vIE51bWJlciBvZiBzcGlucyBsZWZ0IGJlZm9yZSBzdG9wXG4gICAgdGhpcy5fc3BpbnNMZWZ0ID0gbnVsbDtcbiAgICAvLyBGdXR1cmUgcmVzdWx0XG4gICAgdGhpcy5mdXR1cmVBY3RpdmUgPSBudWxsO1xuICAgIC8vIE1hY2hpbmUgaXMgcnVubmluZz9cbiAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAvLyBNYWNoaW5lIGlzIHN0b3BwaW5nP1xuICAgIHRoaXMuc3RvcHBpbmcgPSBmYWxzZTtcbiAgICAvLyBSYW5kb21pemUgRnVuY3Rpb258TnVtYmVyXG4gICAgdGhpcy5yYW5kb21pemUgPSB0aGlzLnNldHRpbmdzLnJhbmRvbWl6ZTtcbiAgICAvLyBDdXJyZW50IGFjdGl2ZSBlbGVtZW50XG4gICAgdGhpcy5zZXR0aW5ncy5hY3RpdmUgPSBOdW1iZXIodGhpcy5zZXR0aW5ncy5hY3RpdmUpO1xuICAgIGlmIChpc05hTih0aGlzLnNldHRpbmdzLmFjdGl2ZSkgfHxcbiAgICAgIHRoaXMuc2V0dGluZ3MuYWN0aXZlIDwgMCB8fCB0aGlzLnNldHRpbmdzLmFjdGl2ZSA+PSB0aGlzLnRpbGVzLmxlbmd0aCkge1xuICAgICAgdGhpcy5zZXR0aW5ncy5hY3RpdmUgPSBkZWZhdWx0cy5hY3RpdmU7XG4gICAgfVxuICAgIHRoaXMuYWN0aXZlID0gdGhpcy5zZXR0aW5ncy5hY3RpdmU7XG4gICAgLy8gRGlzYWJsZSBvdmVyZmxvd1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuICAgIC8vIFdyYXAgZWxlbWVudHMgaW5zaWRlIGNvbnRhaW5lclxuICAgIHRoaXMuX3dyYXBUaWxlcygpO1xuICAgIC8vIFNldCBtaW4gdG9wIG9mZnNldFxuICAgIHRoaXMuX21pblRvcCA9IC10aGlzLl9mYWtlRmlyc3RUaWxlLm9mZnNldEhlaWdodDtcbiAgICAvLyBTZXQgbWF4IHRvcCBvZmZzZXRcbiAgICB0aGlzLl9tYXhUb3AgPSAtdGhpcy50aWxlcy5yZWR1Y2UoKGFjYywgdGlsZSkgPT4gKGFjYyArIHRpbGUub2Zmc2V0SGVpZ2h0KSwgMCk7XG4gICAgLy8gSW5pdGlhbGl6ZSBzcGluIGRpcmVjdGlvbiBbdXAsIGRvd25dXG4gICAgdGhpcy5faW5pdERpcmVjdGlvbigpO1xuICAgIC8vIFNob3cgYWN0aXZlIGVsZW1lbnRcbiAgICB0aGlzLl9yZXNldFBvc2l0aW9uKCk7XG4gICAgLy8gU3RhcnQgYXV0byBhbmltYXRpb25cbiAgICBpZiAodGhpcy5zZXR0aW5ncy5hdXRvICE9PSBmYWxzZSkge1xuICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuYXV0byA9PT0gdHJ1ZSkge1xuICAgICAgICB0aGlzLnNodWZmbGUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYXV0bygpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF93cmFwVGlsZXMgKCkge1xuICAgIHRoaXMuY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LmFkZCgnc2xvdE1hY2hpbmVDb250YWluZXInKTtcbiAgICB0aGlzLmNvbnRhaW5lci5zdHlsZS50cmFuc2l0aW9uID0gJzFzIGVhc2UtaW4tb3V0JztcbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5jb250YWluZXIpO1xuXG4gICAgdGhpcy5fZmFrZUZpcnN0VGlsZSA9IHRoaXMudGlsZXNbdGhpcy50aWxlcy5sZW5ndGggLSAxXS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fZmFrZUZpcnN0VGlsZSk7XG5cbiAgICB0aGlzLnRpbGVzLmZvckVhY2goKHRpbGUpID0+IHtcbiAgICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHRpbGUpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fZmFrZUxhc3RUaWxlID0gdGhpcy50aWxlc1swXS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fZmFrZUxhc3RUaWxlKTtcbiAgfVxuXG4gIF9pbml0RGlyZWN0aW9uICgpIHtcbiAgICB0aGlzLl9kaXJlY3Rpb24gPSB7XG4gICAgICBzZWxlY3RlZDogdGhpcy5zZXR0aW5ncy5kaXJlY3Rpb24gPT09ICdkb3duJyA/ICdkb3duJyA6ICd1cCcsXG4gICAgICB1cDoge1xuICAgICAgICBrZXk6ICd1cCcsXG4gICAgICAgIGluaXRpYWw6IHRoaXMuZ2V0VGlsZU9mZnNldCh0aGlzLmFjdGl2ZSksXG4gICAgICAgIGZpcnN0OiAwLFxuICAgICAgICBsYXN0OiB0aGlzLmdldFRpbGVPZmZzZXQodGhpcy50aWxlcy5sZW5ndGgpLFxuICAgICAgICB0bzogdGhpcy5fbWF4VG9wLFxuICAgICAgICBmaXJzdFRvTGFzdDogdGhpcy5nZXRUaWxlT2Zmc2V0KHRoaXMudGlsZXMubGVuZ3RoKSxcbiAgICAgICAgbGFzdFRvRmlyc3Q6IDBcbiAgICAgIH0sXG4gICAgICBkb3duOiB7XG4gICAgICAgIGtleTogJ2Rvd24nLFxuICAgICAgICBpbml0aWFsOiB0aGlzLmdldFRpbGVPZmZzZXQodGhpcy5hY3RpdmUpLFxuICAgICAgICBmaXJzdDogdGhpcy5nZXRUaWxlT2Zmc2V0KHRoaXMudGlsZXMubGVuZ3RoKSxcbiAgICAgICAgbGFzdDogMCxcbiAgICAgICAgdG86IHRoaXMuX21pblRvcCxcbiAgICAgICAgZmlyc3RUb0xhc3Q6IHRoaXMuZ2V0VGlsZU9mZnNldCh0aGlzLnRpbGVzLmxlbmd0aCksXG4gICAgICAgIGxhc3RUb0ZpcnN0OiAwXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQVUJMSUMgLSBHZXQgYWN0aXZlIGVsZW1lbnRcbiAgICovXG4gIGdldCBhY3RpdmUgKCkge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmU7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFVCTElDIC0gR2V0IGN1cnJlbnQgc2hvd2luZyBlbGVtZW50IGluZGV4XG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBFbGVtZW50IGluZGV4XG4gICAqL1xuICBnZXQgdmlzaWJsZVRpbGUgKCkge1xuICAgIGNvbnN0IGZpcnN0VGlsZUhlaWdodCA9IHRoaXMudGlsZXNbMF0ub2Zmc2V0SGVpZ2h0O1xuICAgIGNvbnN0IHJhd0NvbnRhaW5lck1hcmdpbiA9IHRoaXMuY29udGFpbmVyLnN0eWxlLnRyYW5zZm9ybSB8fCAnJztcbiAgICBjb25zdCBtYXRyaXhSZWdFeHAgPSAvXm1hdHJpeFxcKC0/XFxkKyxcXHM/LT9cXGQrLFxccz8tP1xcZCssXFxzPy0/XFxkKyxcXHM/LT9cXGQrLFxccz8oLT9cXGQrKVxcKSQvO1xuICAgIGNvbnN0IGNvbnRhaW5lck1hcmdpbiA9IHBhcnNlSW50KHJhd0NvbnRhaW5lck1hcmdpbi5yZXBsYWNlKG1hdHJpeFJlZ0V4cCwgJyQxJyksIDEwKTtcblxuICAgIHJldHVybiBNYXRoLmFicyhNYXRoLnJvdW5kKGNvbnRhaW5lck1hcmdpbiAvIGZpcnN0VGlsZUhlaWdodCkpIC0gMTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQVUJMSUMgLSBHZXQgcmFuZG9tIGVsZW1lbnQgZGlmZmVyZW50IHRoYW4gbGFzdCBzaG93blxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGNhbnRCZVRoZUN1cnJlbnQgLSB0cnVlfHx1bmRlZmluZWQgaWYgY2FudCBiZSBjaG9vc2VuIHRoZSBjdXJyZW50IGVsZW1lbnQsIHByZXZlbnRzIHJlcGVhdFxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gRWxlbWVudCBpbmRleFxuICAgKi9cbiAgZ2V0IHJhbmRvbSAoKSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMudGlsZXMubGVuZ3RoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQVUJMSUMgLSBHZXQgcmFuZG9tIGVsZW1lbnQgYmFzZWQgb24gdGhlIGN1c3RvbSByYW5kb21pemUgZnVuY3Rpb25cbiAgICogQHJldHVybiB7TnVtYmVyfSAtIEVsZW1lbnQgaW5kZXhcbiAgICovXG4gIGdldCBjdXN0b20gKCkge1xuICAgIGxldCBjaG9vc2VuO1xuXG4gICAgaWYgKHR5cGVvZiB0aGlzLl9yYW5kb21pemUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGxldCBpbmRleCA9IHRoaXMuX3JhbmRvbWl6ZSh0aGlzLmFjdGl2ZSk7XG4gICAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHRoaXMudGlsZXMubGVuZ3RoKSB7XG4gICAgICAgIGluZGV4ID0gMDtcbiAgICAgIH1cbiAgICAgIGNob29zZW4gPSBpbmRleDtcbiAgICB9IGVsc2Uge1xuICAgICAgY2hvb3NlbiA9IHRoaXMucmFuZG9tO1xuICAgIH1cblxuICAgIHJldHVybiBjaG9vc2VuO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBVQkxJQyAtIEdldCB0aGUgc3BpbiBkaXJlY3Rpb25cbiAgICovXG4gIGdldCBkaXJlY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9kaXJlY3Rpb25bdGhpcy5fZGlyZWN0aW9uLnNlbGVjdGVkXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQUklWQVRFIC0gR2V0IHRoZSBwcmV2aW91cyBlbGVtZW50IChubyBkaXJlY3Rpb24gcmVsYXRlZClcbiAgICogQHJldHVybiB7TnVtYmVyfSAtIEVsZW1lbnQgaW5kZXhcbiAgICovXG4gIGdldCBfcHJldkluZGV4ICgpIHtcbiAgICBjb25zdCBwcmV2SW5kZXggPSB0aGlzLmFjdGl2ZSAtIDE7XG5cbiAgICByZXR1cm4gcHJldkluZGV4IDwgMCA/ICh0aGlzLnRpbGVzLmxlbmd0aCAtIDEpIDogcHJldkluZGV4O1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBSSVZBVEUgLSBHZXQgdGhlIG5leHQgZWxlbWVudCAobm8gZGlyZWN0aW9uIHJlbGF0ZWQpXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBFbGVtZW50IGluZGV4XG4gICAqL1xuICBnZXQgX25leHRJbmRleCAoKSB7XG4gICAgY29uc3QgbmV4dEluZGV4ID0gdGhpcy5hY3RpdmUgKyAxO1xuXG4gICAgcmV0dXJuIG5leHRJbmRleCA8IHRoaXMudGlsZXMubGVuZ3RoID8gbmV4dEluZGV4IDogMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQVUJMSUMgLSBHZXQgdGhlIHByZXZpb3VzIGVsZW1lbnQgZG9yIHNlbGVjdGVkIGRpcmVjdGlvblxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gRWxlbWVudCBpbmRleFxuICAgKi9cbiAgZ2V0IHByZXZJbmRleCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlyZWN0aW9uLmtleSA9PT0gJ3VwJyA/IHRoaXMuX25leHRJbmRleCA6IHRoaXMuX3ByZXZJbmRleDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQVUJMSUMgLSBHZXQgdGhlIG5leHQgZWxlbWVudFxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gRWxlbWVudCBpbmRleFxuICAgKi9cbiAgZ2V0IG5leHRJbmRleCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlyZWN0aW9uLmtleSA9PT0gJ3VwJyA/IHRoaXMuX3ByZXZJbmRleCA6IHRoaXMuX25leHRJbmRleDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9wIGFuaW1hdGlvbiBpZiBlbGVtZW50IGlzIFthYm92ZXx8YmVsb3ddIHNjcmVlbiwgYmVzdCBmb3IgcGVyZm9ybWFuY2VcbiAgICogQGRlc2MgUFJJVkFURSAtIENoZWNrcyBpZiB0aGUgbWFjaGluZSBpcyBvbiB0aGUgc2NyZWVuXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBSZXR1cm5zIHRydWUgaWYgbWFjaGluZSBpcyBvbiB0aGUgc2NyZWVuXG4gICAqL1xuICBnZXQgdmlzaWJsZSAoKSB7XG4gICAgY29uc3QgcmVjdCA9IHRoaXMuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCB3aW5kb3dIZWlnaHQgPSAod2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQpO1xuICAgIGNvbnN0IHdpbmRvd1dpZHRoID0gKHdpbmRvdy5pbm5lcldpZHRoIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCk7XG4gICAgY29uc3QgdmVydEluVmlldyA9IChyZWN0LnRvcCA8PSB3aW5kb3dIZWlnaHQpICYmICgocmVjdC50b3AgKyByZWN0LmhlaWdodCkgPj0gMCk7XG4gICAgY29uc3QgaG9ySW5WaWV3ID0gKHJlY3QubGVmdCA8PSB3aW5kb3dXaWR0aCkgJiYgKChyZWN0LmxlZnQgKyByZWN0LndpZHRoKSA+PSAwKTtcblxuICAgIHJldHVybiB2ZXJ0SW5WaWV3ICYmIGhvckluVmlldztcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQVUJMSUMgLSBTZXQgYWN0aXZlIGVsZW1lbnRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IC0gQWN0aXZlIGVsZW1lbnQgaW5kZXhcbiAgICovXG4gIHNldCBhY3RpdmUgKGluZGV4KSB7XG4gICAgdGhpcy5fYWN0aXZlID0gaW5kZXg7XG4gICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLnRpbGVzLmxlbmd0aCkge1xuICAgICAgdGhpcy5fYWN0aXZlID0gMDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFVCTElDIC0gU2V0IHRoZSBzcGluIGRpcmVjdGlvblxuICAgKi9cbiAgc2V0IGRpcmVjdGlvbiAoZGlyZWN0aW9uKSB7XG4gICAgaWYgKCF0aGlzLnJ1bm5pbmcpIHtcbiAgICAgIHRoaXMuX2RpcmVjdGlvbi5zZWxlY3RlZCA9IGRpcmVjdGlvbiA9PT0gJ2Rvd24nID8gJ2Rvd24nIDogJ3VwJztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFVCTElDIC0gQ2hhbmdlcyByYW5kb21pemUgZnVuY3Rpb25cbiAgICogQHBhcmFtIGZ1bmN0aW9ufE51bWJlciAtIFNldCBuZXcgcmFuZG9taXplIGZ1bmN0aW9uXG4gICAqL1xuICBzZXQgcmFuZG9taXplIChybmQpIHtcbiAgICB0aGlzLl9yYW5kb21pemUgPSBybmQ7XG5cbiAgICBpZiAodHlwZW9mIHJuZCA9PT0gJ251bWJlcicpIHtcbiAgICAgIHRoaXMuX3JhbmRvbWl6ZSA9ICgpID0+IHJuZDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFJJVkFURSAtIFNldCBDU1Mgc3BlZWQgY2NsYXNzXG4gICAqIEBwYXJhbSBzdHJpbmcgRlhfU1BFRUQgLSBFbGVtZW50IHNwZWVkIFtGWF9GQVNUX0JMVVJ8fEZYX05PUk1BTF9CTFVSfHxGWF9TTE9XX0JMVVJ8fEZYX1NUT1BdXG4gICAqL1xuICBzZXQgX2Z4Q2xhc3MgKEZYX1NQRUVEKSB7XG4gICAgWy4uLnRoaXMudGlsZXMsIHRoaXMuX2Zha2VMYXN0VGlsZSwgdGhpcy5fZmFrZUZpcnN0VGlsZV0uZm9yRWFjaCgodGlsZSkgPT4ge1xuICAgICAgdGlsZS5jbGFzc0xpc3QucmVtb3ZlKEZYX0ZBU1QsIEZYX05PUk1BTCwgRlhfU0xPVywgRlhfVFVSVExFKTtcbiAgICAgIHRpbGUuY2xhc3NMaXN0LmFkZChGWF9TUEVFRCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFJJVkFURSAtIFNldCBDU1MgY2xhc3NlcyB0byBtYWtlIHNwZWVkIGVmZmVjdFxuICAgKiBAcGFyYW0gc3RyaW5nIEZYX1NQRUVEIC0gRWxlbWVudCBzcGVlZCBbRlhfRkFTVF9CTFVSfHxGWF9OT1JNQUxfQkxVUnx8RlhfU0xPV19CTFVSfHxGWF9TVE9QXVxuICAgKiBAcGFyYW0gc3RyaW5nfHxib29sZWFuIGZhZGUgLSBTZXQgZmFkZSBncmFkaWVudCBlZmZlY3RcbiAgICovXG4gIHNldCBfYW5pbWF0aW9uRlggKEZYX1NQRUVEKSB7XG4gICAgY29uc3QgZGVsYXkgPSB0aGlzLnNldHRpbmdzLmRlbGF5IC8gNDtcblxuICAgIHJhZigoKSA9PiB7XG4gICAgICB0aGlzLl9meENsYXNzID0gRlhfU1BFRUQ7XG5cbiAgICAgIGlmIChGWF9TUEVFRCA9PT0gRlhfU1RPUCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKEZYX0dSQURJRU5UKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoRlhfR1JBRElFTlQpO1xuICAgICAgfVxuICAgIH0sIGRlbGF5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQUklWQVRFIC0gU2V0IGNzcyB0cmFuc2l0aW9uIGRlbGF5XG4gICAqIEBwYXJhbSB7TnVtYmVyfSAtIFRyYW5zaXRpb24gZGVsYXkgaW4gbXNcbiAgICovXG4gIHNldCBkZWxheSAoZGVsYXkpIHtcbiAgICBkZWxheSA9IGRlbGF5IC8gMTAwMDtcbiAgICB0aGlzLl9kZWxheSA9IGRlbGF5O1xuICAgIHRoaXMuX2NoYW5nZVRyYW5zaXRpb24oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQUklWQVRFIC0gU2V0IGNzcyB0cmFuc2l0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSAtIFRyYW5zaXRpb24gdHlwZVxuICAgKi9cbiAgc2V0IHRyYW5zaXRpb24gKHRyYW5zaXRpb24pIHtcbiAgICB0cmFuc2l0aW9uID0gdHJhbnNpdGlvbiB8fCAnZWFzZS1pbi1vdXQnO1xuICAgIHRoaXMuX3RyYW5zaXRpb24gPSB0cmFuc2l0aW9uO1xuICAgIHRoaXMuX2NoYW5nZVRyYW5zaXRpb24oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQUklWQVRFIC0gU2V0IGNzcyB0cmFuc2l0aW9uIHByb3BlcnR5XG4gICAqL1xuICBfY2hhbmdlVHJhbnNpdGlvbiAoKSB7XG4gICAgY29uc3QgZGVsYXkgPSB0aGlzLl9kZWxheSB8fCB0aGlzLnNldHRpbmdzLmRlbGF5O1xuICAgIGNvbnN0IHRyYW5zaXRpb24gPSB0aGlzLl90cmFuc2l0aW9uIHx8IHRoaXMuc2V0dGluZ3MudHJhbnNpdGlvbjtcbiAgICB0aGlzLmNvbnRhaW5lci5zdHlsZS50cmFuc2l0aW9uID0gYCR7ZGVsYXl9cyAke3RyYW5zaXRpb259YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQUklWQVRFIC0gU2V0IGNvbnRhaW5lciBtYXJnaW5cbiAgICogQHBhcmFtIHtOdW1iZXJ9fHxTdHJpbmcgLSBBY3RpdmUgZWxlbWVudCBpbmRleFxuICAgKi9cbiAgX2FuaW1hdGUgKG1hcmdpbikge1xuICAgIHRoaXMuY29udGFpbmVyLnN0eWxlLnRyYW5zZm9ybSA9IGBtYXRyaXgoMSwgMCwgMCwgMSwgMCwgJHttYXJnaW59KWA7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFJJVkFURSAtIElzIG1vdmluZyBmcm9tIHRoZSBmaXJzdCBlbGVtZW50IHRvIHRoZSBsYXN0XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuICBfaXNHb2luZ0JhY2t3YXJkICgpIHtcbiAgICByZXR1cm4gdGhpcy5mdXR1cmVBY3RpdmUgPiB0aGlzLmFjdGl2ZSAmJiB0aGlzLmFjdGl2ZSA9PT0gMCAmJiB0aGlzLmZ1dHVyZUFjdGl2ZSA9PT0gdGhpcy50aWxlcy5sZW5ndGggLSAxO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBSSVZBVEUgLSBJcyBtb3ZpbmcgZnJvbSB0aGUgbGFzdCBlbGVtZW50IHRvIHRoZSBmaXJzdFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59XG4gICAqL1xuICBfaXNHb2luZ0ZvcndhcmQgKCkge1xuICAgIHJldHVybiB0aGlzLmZ1dHVyZUFjdGl2ZSA8PSB0aGlzLmFjdGl2ZSAmJiB0aGlzLmFjdGl2ZSA9PT0gdGhpcy50aWxlcy5sZW5ndGggLSAxICYmIHRoaXMuZnV0dXJlQWN0aXZlID09PSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBVQkxJQyAtIEdldCBlbGVtZW50IG9mZnNldCB0b3BcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4IC0gRWxlbWVudCBwb3NpdGlvblxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gTmVnYXRpdmUgb2Zmc2V0IGluIHB4XG4gICAqL1xuICBnZXRUaWxlT2Zmc2V0IChpbmRleCkge1xuICAgIGxldCBvZmZzZXQgPSAwO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbmRleDsgaSsrKSB7XG4gICAgICBvZmZzZXQgKz0gdGhpcy50aWxlc1tpXS5vZmZzZXRIZWlnaHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX21pblRvcCAtIG9mZnNldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQUklWQVRFIC0gUmVzZXQgYWN0aXZlIGVsZW1lbnQgcG9zaXRpb25cbiAgICovXG4gIF9yZXNldFBvc2l0aW9uIChtYXJnaW4pIHtcbiAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QudG9nZ2xlKEZYX05PX1RSQU5TSVRJT04pO1xuICAgIHRoaXMuX2FuaW1hdGUobWFyZ2luID09PSB1bmRlZmluZWQgPyB0aGlzLmRpcmVjdGlvbi5pbml0aWFsIDogbWFyZ2luKTtcbiAgICAvLyBGb3JjZSByZWZsb3csIGZsdXNoaW5nIHRoZSBDU1MgY2hhbmdlc1xuICAgIHRoaXMuY29udGFpbmVyLm9mZnNldEhlaWdodDtcbiAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QudG9nZ2xlKEZYX05PX1RSQU5TSVRJT04pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBVQkxJQyAtIFNFTEVDVCBwcmV2aW91cyBlbGVtZW50IHJlbGF0aXZlIHRvIHRoZSBjdXJyZW50IGFjdGl2ZSBlbGVtZW50XG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBSZXR1cm5zIHJlc3VsdCBpbmRleFxuICAgKi9cbiAgcHJldiAoKSB7XG4gICAgdGhpcy5mdXR1cmVBY3RpdmUgPSB0aGlzLnByZXZJbmRleDtcbiAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgIHRoaXMuc3RvcCgpO1xuXG4gICAgcmV0dXJuIHRoaXMuZnV0dXJlQWN0aXZlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBVQkxJQyAtIFNFTEVDVCBuZXh0IGVsZW1lbnQgcmVsYXRpdmUgdG8gdGhlIGN1cnJlbnQgYWN0aXZlIGVsZW1lbnRcbiAgICogQHJldHVybiB7TnVtYmVyfSAtIFJldHVybnMgcmVzdWx0IGluZGV4XG4gICAqL1xuICBuZXh0ICgpIHtcbiAgICB0aGlzLmZ1dHVyZUFjdGl2ZSA9IHRoaXMubmV4dEluZGV4O1xuICAgIHRoaXMucnVubmluZyA9IHRydWU7XG4gICAgdGhpcy5zdG9wKCk7XG5cbiAgICByZXR1cm4gdGhpcy5mdXR1cmVBY3RpdmU7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFJJVkFURSAtIFN0YXJ0cyBzaHVmZmxpbmcgdGhlIGVsZW1lbnRzXG4gICAqIEBwYXJhbSB7TnVtYmVyfSByZXBlYXRpb25zIC0gTnVtYmVyIG9mIHNodWZmbGVzICh1bmRlZmluZWQgdG8gbWFrZSBpbmZpbml0ZSBhbmltYXRpb25cbiAgICogQHJldHVybiB7TnVtYmVyfSAtIFJldHVybnMgcmVzdWx0IGluZGV4XG4gICAqL1xuICBfZ2V0RGVsYXlGcm9tU3BpbnMgKHNwaW5zKSB7XG4gICAgbGV0IGRlbGF5ID0gdGhpcy5zZXR0aW5ncy5kZWxheTtcbiAgICB0aGlzLl90cmFuc2l0aW9uID0gJ2xpbmVhcic7XG5cbiAgICBzd2l0Y2ggKHNwaW5zKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIGRlbGF5IC89IDAuNTtcbiAgICAgICAgdGhpcy5fdHJhbnNpdGlvbiA9ICdlYXNlLW91dCc7XG4gICAgICAgIHRoaXMuX2FuaW1hdGlvbkZYID0gRlhfVFVSVExFO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgZGVsYXkgLz0gMC43NTtcbiAgICAgICAgdGhpcy5fYW5pbWF0aW9uRlggPSBGWF9TTE9XO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgZGVsYXkgLz0gMTtcbiAgICAgICAgdGhpcy5fYW5pbWF0aW9uRlggPSBGWF9OT1JNQUw7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA0OlxuICAgICAgICBkZWxheSAvPSAxLjI1O1xuICAgICAgICB0aGlzLl9hbmltYXRpb25GWCA9IEZYX05PUk1BTDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBkZWxheSAvPSAxLjU7XG4gICAgICAgIHRoaXMuX2FuaW1hdGlvbkZYID0gRlhfRkFTVDtcbiAgICB9XG5cbiAgICByZXR1cm4gZGVsYXk7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFVCTElDIC0gU3RhcnRzIHNodWZmbGluZyB0aGUgZWxlbWVudHNcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHJlcGVhdGlvbnMgLSBOdW1iZXIgb2Ygc2h1ZmZsZXMgKHVuZGVmaW5lZCB0byBtYWtlIGluZmluaXRlIGFuaW1hdGlvblxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gUmV0dXJucyByZXN1bHQgaW5kZXhcbiAgICovXG4gIHNodWZmbGUgKHNwaW5zLCBvbkNvbXBsZXRlKSB7XG4gICAgLy8gTWFrZSBzcGlucyBvcHRpb25hbFxuICAgIGlmICh0eXBlb2Ygc3BpbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG9uQ29tcGxldGUgPSBzcGlucztcbiAgICB9XG4gICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcbiAgICAvLyBQZXJmb3JtIGFuaW1hdGlvblxuICAgIGlmICghdGhpcy52aXNpYmxlICYmIHRoaXMuc2V0dGluZ3Muc3RvcEhpZGRlbiA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5zdG9wKG9uQ29tcGxldGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBkZWxheSA9IHRoaXMuX2dldERlbGF5RnJvbVNwaW5zKHNwaW5zKTtcbiAgICAgIHRoaXMuZGVsYXkgPSBkZWxheTtcbiAgICAgIHRoaXMuX2FuaW1hdGUodGhpcy5kaXJlY3Rpb24udG8pO1xuICAgICAgcmFmKCgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnN0b3BwaW5nICYmIHRoaXMucnVubmluZykge1xuICAgICAgICAgIGNvbnN0IGxlZnQgPSBzcGlucyAtIDE7XG5cbiAgICAgICAgICB0aGlzLl9yZXNldFBvc2l0aW9uKHRoaXMuZGlyZWN0aW9uLmZpcnN0KTtcbiAgICAgICAgICBpZiAobGVmdCA8PSAxKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3Aob25Db21wbGV0ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFJlcGVhdCBhbmltYXRpb25cbiAgICAgICAgICAgIHRoaXMuc2h1ZmZsZShsZWZ0LCBvbkNvbXBsZXRlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIGRlbGF5KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5mdXR1cmVBY3RpdmU7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFVCTElDIC0gU3RvcCBzaHVmZmxpbmcgdGhlIGVsZW1lbnRzXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBSZXR1cm5zIHJlc3VsdCBpbmRleFxuICAgKi9cbiAgc3RvcCAob25TdG9wKSB7XG4gICAgaWYgKCF0aGlzLnJ1bm5pbmcgfHwgdGhpcy5zdG9wcGluZykge1xuICAgICAgcmV0dXJuIHRoaXMuZnV0dXJlQWN0aXZlO1xuICAgIH1cblxuICAgIHRoaXMucnVubmluZyA9IHRydWU7XG4gICAgdGhpcy5zdG9wcGluZyA9IHRydWU7XG5cbiAgICBpZiAodGhpcy5mdXR1cmVBY3RpdmUgPT09IG51bGwpIHtcbiAgICAgIC8vIEdldCByYW5kb20gb3IgY3VzdG9tIGVsZW1lbnRcbiAgICAgIHRoaXMuZnV0dXJlQWN0aXZlID0gdGhpcy5jdXN0b207XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZGlyZWN0aW9uIHRvIHByZXZlbnQganVtcGluZ1xuICAgIGlmICh0aGlzLl9pc0dvaW5nQmFja3dhcmQoKSkge1xuICAgICAgdGhpcy5fcmVzZXRQb3NpdGlvbih0aGlzLmRpcmVjdGlvbi5maXJzdFRvTGFzdCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9pc0dvaW5nRm9yd2FyZCgpKSB7XG4gICAgICB0aGlzLl9yZXNldFBvc2l0aW9uKHRoaXMuZGlyZWN0aW9uLmxhc3RUb0ZpcnN0KTtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgbGFzdCBjaG9vc2VuIGVsZW1lbnQgaW5kZXhcbiAgICB0aGlzLmFjdGl2ZSA9IHRoaXMuZnV0dXJlQWN0aXZlO1xuXG4gICAgLy8gUGVyZm9ybSBhbmltYXRpb25cbiAgICBjb25zdCBkZWxheSA9IHRoaXMuX2dldERlbGF5RnJvbVNwaW5zKDEpO1xuICAgIHRoaXMuZGVsYXkgPSBkZWxheTtcbiAgICB0aGlzLl9hbmltYXRpb25GWCA9IEZYX1NUT1A7XG4gICAgdGhpcy5fYW5pbWF0ZSh0aGlzLmdldFRpbGVPZmZzZXQodGhpcy5hY3RpdmUpKTtcbiAgICByYWYoKCkgPT4ge1xuICAgICAgdGhpcy5zdG9wcGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLmZ1dHVyZUFjdGl2ZSA9IG51bGw7XG5cbiAgICAgIGlmICh0eXBlb2YgdGhpcy5zZXR0aW5ncy5jb21wbGV0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnNldHRpbmdzLmNvbXBsZXRlLmFwcGx5KHRoaXMsIFt0aGlzLmFjdGl2ZV0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIG9uU3RvcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBvblN0b3AuYXBwbHkodGhpcywgW3RoaXMuYWN0aXZlXSk7XG4gICAgICB9XG4gICAgfSwgZGVsYXkpO1xuXG4gICAgcmV0dXJuIHRoaXMuYWN0aXZlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBVQkxJQyAtIFN0YXJ0IGF1dG8gc2h1ZmZsaW5ncywgYW5pbWF0aW9uIHN0b3BzIGVhY2ggMyByZXBlYXRpb25zLiBUaGVuIHJlc3RhcnQgYW5pbWF0aW9uIHJlY3Vyc2l2ZWx5XG4gICAqL1xuICBhdXRvICgpIHtcbiAgICBpZiAodGhpcy5ydW5uaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fdGltZXIgPSBuZXcgVGltZXIoKCkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLl9yYW5kb21pemUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5fcmFuZG9taXplID0gKCkgPT4gdGhpcy5fbmV4dEluZGV4O1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLnZpc2libGUgJiYgdGhpcy5zZXR0aW5ncy5zdG9wSGlkZGVuID09PSB0cnVlKSB7XG4gICAgICAgIHJhZigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fdGltZXIucmVzZXQoKVxuICAgICAgICB9LCA1MDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zaHVmZmxlKHRoaXMuc2V0dGluZ3Muc3BpbnMsICgpID0+IHtcbiAgICAgICAgICB0aGlzLl90aW1lci5yZXNldCgpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sIHRoaXMuc2V0dGluZ3MuYXV0byk7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFVCTElDIC0gRGVzdHJveSB0aGUgbWFjaGluZVxuICAgKi9cbiAgZGVzdHJveSAoKSB7XG4gICAgdGhpcy5fZmFrZUZpcnN0VGlsZS5yZW1vdmUoKTtcbiAgICB0aGlzLl9mYWtlTGFzdFRpbGUucmVtb3ZlKCk7XG4gICAgdGhpcy4kdGlsZXMudW53cmFwKCk7XG5cbiAgICAvLyBVbndyYXAgdGlsZXNcbiAgICB0aGlzLnRpbGVzLmZvckVhY2goKHRpbGUpID0+IHtcbiAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aWxlKTtcbiAgICB9KTtcblxuICAgIHRoaXMuY29udGFpbmVyLnJlbW92ZSgpO1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFRpbWVyIHtcbiAgY29uc3RydWN0b3IgKGNiLCBkZWxheSkge1xuICAgIHRoaXMuY2IgPSBjYjtcbiAgICB0aGlzLmluaXRpYWxEZWxheSA9IGRlbGF5O1xuICAgIHRoaXMuZGVsYXkgPSBkZWxheTtcbiAgICB0aGlzLnN0YXJ0VGltZSA9IG51bGw7XG4gICAgdGhpcy50aW1lciA9IG51bGw7XG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG5cbiAgICB0aGlzLnJlc3VtZSgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfc3RhcnQgKCkge1xuICAgIHRoaXMudGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5jYih0aGlzKTtcbiAgICB9LCB0aGlzLmRlbGF5KTtcbiAgfVxuXG4gIGNhbmNlbCAoKSB7XG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZXIpO1xuICB9XG5cbiAgcGF1c2UgKCkge1xuICAgIGlmICh0aGlzLnJ1bm5pbmcpIHtcbiAgICAgIHRoaXMuZGVsYXkgLT0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0aGlzLnN0YXJ0VGltZTtcbiAgICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgfVxuICB9XG5cbiAgcmVzdW1lICgpIHtcbiAgICBpZiAoIXRoaXMucnVubmluZykge1xuICAgICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcbiAgICAgIHRoaXMuc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAgIHRoaXMuX3N0YXJ0KCk7XG4gICAgfVxuICB9XG5cbiAgcmVzZXQgKCkge1xuICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgdGhpcy5kZWxheSA9IHRoaXMuaW5pdGlhbERlbGF5O1xuICAgIHRoaXMuX3N0YXJ0KCk7XG4gIH1cblxuICBhZGQgKGV4dHJhRGVsYXkpIHtcbiAgICB0aGlzLnBhdXNlKCk7XG4gICAgdGhpcy5kZWxheSArPSBleHRyYURlbGF5O1xuICAgIHRoaXMucmVzdW1lKCk7XG4gIH1cbn07XG4iXX0=
