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
  onComplete: null, // Callback function(result)
  inViewport: true, // Stops animations if the element isn´t visible on the screen
  direction: 'up', // Animation direction ['up'||'down']
  transition: 'ease-in-out'
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
    this._maxTop = -this.tiles.reduce(function (acc, tile) {
      return acc + tile.offsetHeight;
    }, 0);
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

  _createClass(SlotMachine, [{
    key: 'changeSettings',
    value: function changeSettings(settings) {
      var _this = this;

      Object.keys(settings).forEach(function (key) {
        // Trigger setters
        _this[key] = settings[key];
      });
    }
  }, {
    key: '_wrapTiles',
    value: function _wrapTiles() {
      var _this2 = this;

      this.container = document.createElement('div');
      this.container.classList.add('slotMachineContainer');
      this.container.style.transition = '1s ease-in-out';
      this.element.appendChild(this.container);

      this._fakeFirstTile = this.tiles[this.tiles.length - 1].cloneNode(true);
      this.container.appendChild(this._fakeFirstTile);

      this.tiles.forEach(function (tile) {
        _this2.container.appendChild(tile);
      });

      this._fakeLastTile = this.tiles[0].cloneNode(true);
      this.container.appendChild(this._fakeLastTile);
    }
  }, {
    key: '_setBounds',
    value: function _setBounds() {
      var initial = this.getTileOffset(this.active);
      var first = this.getTileOffset(this.tiles.length);
      var last = this.getTileOffset(this.tiles.length);

      this._bounds = {
        up: {
          key: 'up',
          initial: initial,
          first: 0,
          last: last,
          to: this._maxTop,
          firstToLast: last,
          lastToFirst: 0
        },
        down: {
          key: 'down',
          initial: initial,
          first: first,
          last: 0,
          to: this._minTop,
          firstToLast: last,
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
      var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.delay;
      var transition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.transition;

      this.container.style.transition = delay / 1000 + 's ' + transition;
    }

    /**
     * @desc PRIVATE - Set container margin
     * @param {Number}||String - Active element index
     */

  }, {
    key: '_changeTransform',
    value: function _changeTransform(margin) {
      this.container.style.transform = 'matrix(1, 0, 0, 1, 0, ' + margin + ')';
    }

    /**
     * @desc PRIVATE - Is moving from the first element to the last
     * @return {Boolean}
     */

  }, {
    key: '_isGoingBackward',
    value: function _isGoingBackward() {
      return this.nextActive > this.active && this.active === 0 && this.nextActive === this.tiles.length - 1;
    }

    /**
     * @desc PRIVATE - Is moving from the last element to the first
     * @param {Boolean}
     */

  }, {
    key: '_isGoingForward',
    value: function _isGoingForward() {
      return this.nextActive <= this.active && this.active === this.tiles.length - 1 && this.nextActive === 0;
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
      this._changeTransform(!isNaN(margin) ? margin : this.bounds.initial);
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
      this.nextActive = this.prevIndex;
      this.running = true;
      this.stop();

      return this.nextActive;
    }

    /**
     * @desc PUBLIC - SELECT next element relative to the current active element
     * @return {Number} - Returns result index
     */

  }, {
    key: 'next',
    value: function next() {
      this.nextActive = this.nextIndex;
      this.running = true;
      this.stop();

      return this.nextActive;
    }

    /**
     * @desc PRIVATE - Starts shuffling the elements
     * @param {Number} repeations - Number of shuffles (undefined to make infinite animation
     * @return {Number} - Returns result index
     */

  }, {
    key: '_getDelayFromSpins',
    value: function _getDelayFromSpins(spins) {
      var delay = this.delay;
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

    /**
     * @desc PUBLIC - Starts shuffling the elements
     * @param {Number} repeations - Number of shuffles (undefined to make infinite animation
     * @return {Number} - Returns result index
     */

  }, {
    key: 'shuffle',
    value: function shuffle(spins, onComplete) {
      var _this3 = this;

      // Make spins optional
      if (typeof spins === 'function') {
        onComplete = spins;
      }
      this.running = true;
      // Perform animation
      if (!this.visible && this.inViewport === true) {
        this.stop(onComplete);
      } else {
        var delay = this._getDelayFromSpins(spins);
        // this.delay = delay;
        this._changeTransition(delay);
        this._changeTransform(this.bounds.to);
        raf(function () {
          if (!_this3.stopping && _this3.running) {
            var left = spins - 1;

            _this3._resetPosition(_this3.bounds.first);

            if (left > 1) {
              // Repeat animation
              _this3.shuffle(left, onComplete);
            } else {
              _this3.stop(onComplete);
            }
          }
        }, delay);
      }

      return this.nextActive;
    }

    /**
     * @desc PUBLIC - Stop shuffling the elements
     * @return {Number} - Returns result index
     */

  }, {
    key: 'stop',
    value: function stop(onStop) {
      var _this4 = this;

      if (!this.running || this.stopping) {
        return this.nextActive;
      }

      this.running = true;
      this.stopping = true;

      if (this.nextActive === null) {
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
      var delay = this._getDelayFromSpins(1);
      // this.delay = delay;
      this._changeTransition(delay);
      this._animationFX = FX_STOP;
      this._changeTransform(this.getTileOffset(this.active));
      raf(function () {
        _this4.stopping = false;
        _this4.running = false;
        _this4.nextActive = null;

        if (typeof _this4.onComplete === 'function') {
          _this4.onComplete(_this4.active);
        }

        if (typeof onStop === 'function') {
          onStop.apply(_this4, [_this4.active]);
        }
      }, delay);

      return this.active;
    }

    /**
     * @desc PUBLIC - Start run shufflings, animation stops each 3 repeations. Then restart animation recursively
     */

  }, {
    key: 'run',
    value: function run() {
      var _this5 = this;

      if (this.running) {
        return;
      }

      this._timer = new Timer(function () {
        if (typeof _this5.randomize !== 'function') {
          _this5.randomize = function () {
            return _this5._nextIndex;
          };
        }
        if (!_this5.visible && _this5.inViewport === true) {
          raf(function () {
            _this5._timer.reset();
          }, 500);
        } else {
          _this5.shuffle(_this5.spins, function () {
            _this5._timer.reset();
          });
        }
      }, this.auto);
    }

    /**
     * @desc PUBLIC - Destroy the machine
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      var _this6 = this;

      this._fakeFirstTile.remove();
      this._fakeLastTile.remove();
      this.$tiles.unwrap();

      // Unwrap tiles
      this.tiles.forEach(function (tile) {
        _this6.element.appendChild(tile);
      });

      this.container.remove();
    }
  }, {
    key: 'active',
    get: function get() {
      return this._active;
    }

    /**
     * @desc PUBLIC - Get active element
     */
    ,


    /**
     * @desc PUBLIC - Set active element
     * @param {Number} - Active element index
     */
    set: function set(index) {
      index = Number(index);
      if (index < 0 || index >= this.tiles.length || isNaN(index)) {
        index = 0;
      }
      this._active = index;
    }

    /**
     * @desc PUBLIC - Set the spin direction
     */

  }, {
    key: 'direction',
    get: function get() {
      return this._direction;
    },
    set: function set(direction) {
      if (!this.running) {
        this._direction = direction === 'down' ? 'down' : 'up';
      }
    }

    /**
     * @desc PRIVATE - Set CSS classes to make speed effect
     * @param string FX_SPEED - Element speed [FX_FAST_BLUR||FX_NORMAL_BLUR||FX_SLOW_BLUR||FX_STOP]
     * @param string||boolean fade - Set fade gradient effect
     */

  }, {
    key: 'bounds',
    get: function get() {
      return this._bounds[this._direction];
    }
  }, {
    key: 'transition',
    get: function get() {
      return this._transition;
    }

    /**
     * @desc PUBLIC - Get current showing element index
     * @return {Number} - Element index
     */
    ,


    /**
     * @desc PRIVATE - Set css transition
     * @param {String} - Transition type
     */
    set: function set(transition) {
      this._transition = transition || 'ease-in-out';
    }
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

      if (typeof this.randomize === 'function') {
        var index = this.randomize(this.active);
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
     * @desc PRIVATE - Get the previous element (no direction related)
     * @return {Number} - Element index
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
      return this.direction === 'up' ? this._nextIndex : this._prevIndex;
    }

    /**
     * @desc PUBLIC - Get the next element
     * @return {Number} - Element index
     */

  }, {
    key: 'nextIndex',
    get: function get() {
      return this.direction === 'up' ? this._prevIndex : this._nextIndex;
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
    key: '_animationFX',
    set: function set(FX_SPEED) {
      var _this7 = this;

      var delay = this.delay / 4;

      raf(function () {
        [].concat(_toConsumableArray(_this7.tiles), [_this7._fakeLastTile, _this7._fakeFirstTile]).forEach(function (tile) {
          tile.classList.remove(FX_FAST, FX_NORMAL, FX_SLOW, FX_TURTLE);
          if (FX_SPEED !== FX_STOP) {
            tile.classList.add(FX_SPEED);
          }
        });

        if (FX_SPEED === FX_STOP) {
          _this7.container.classList.remove(FX_GRADIENT);
        } else {
          _this7.container.classList.add(FX_GRADIENT);
        }
      }, delay);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvaW5kZXguanMiLCJsaWIvcmFmLmpzIiwibGliL3Nsb3QtbWFjaGluZS5qcyIsImxpYi90aW1lci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsT0FBTyxXQUFQLEdBQXFCLFFBQVEsZ0JBQVIsQ0FBckI7Ozs7O0FDQUEsSUFBTSxPQUFPLE9BQU8scUJBQVAsSUFBZ0MsT0FBTyx3QkFBdkMsSUFBbUUsT0FBTywyQkFBMUUsSUFBeUcsT0FBTyx1QkFBN0g7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFNBQVMsR0FBVCxDQUFjLEVBQWQsRUFBK0I7QUFBQSxNQUFiLE9BQWEsdUVBQUgsQ0FBRzs7QUFDOUMsYUFBVztBQUFBLFdBQU0sS0FBSyxFQUFMLENBQU47QUFBQSxHQUFYLEVBQTJCLE9BQTNCO0FBQ0QsQ0FGRDs7Ozs7Ozs7Ozs7QUNGQSxJQUFNLFFBQVEsUUFBUSxTQUFSLENBQWQ7QUFDQSxJQUFNLE1BQU0sUUFBUSxPQUFSLENBQVo7O0FBRUEsSUFBTSxXQUFXO0FBQ2YsVUFBUSxDQURPLEVBQ0o7QUFDWCxTQUFPLEdBRlEsRUFFSDtBQUNaLFFBQU0sS0FIUyxFQUdGO0FBQ2IsU0FBTyxDQUpRLEVBSUw7QUFDVixhQUFXLElBTEksRUFLRTtBQUNqQixjQUFZLElBTkcsRUFNRztBQUNsQixjQUFZLElBUEcsRUFPRztBQUNsQixhQUFXLElBUkksRUFRRTtBQUNqQixjQUFZO0FBVEcsQ0FBakI7QUFXQSxJQUFNLG1CQUFtQix5QkFBekI7QUFDQSxJQUFNLFVBQVUscUJBQWhCO0FBQ0EsSUFBTSxZQUFZLHVCQUFsQjtBQUNBLElBQU0sVUFBVSxxQkFBaEI7QUFDQSxJQUFNLFlBQVksdUJBQWxCO0FBQ0EsSUFBTSxjQUFjLHFCQUFwQjtBQUNBLElBQU0sVUFBVSxXQUFoQjs7QUFFQSxPQUFPLE9BQVA7QUFBQTtBQUFBO0FBQUEsd0JBQ3FCO0FBQ2pCLGFBQU8sYUFBUDtBQUNEO0FBSEg7O0FBS0UsdUJBQWEsT0FBYixFQUFzQixPQUF0QixFQUErQjtBQUFBOztBQUM3QixTQUFLLE9BQUwsR0FBZSxPQUFmO0FBQ0E7QUFDQSxTQUFLLEtBQUwsR0FBYSxHQUFHLEtBQUgsQ0FBUyxJQUFULENBQWMsS0FBSyxPQUFMLENBQWEsUUFBM0IsQ0FBYjtBQUNBO0FBQ0EsU0FBSyxPQUFMLEdBQWUsS0FBZjtBQUNBO0FBQ0EsU0FBSyxRQUFMLEdBQWdCLEtBQWhCO0FBQ0E7QUFDQSxTQUFLLE9BQUwsQ0FBYSxLQUFiLENBQW1CLFFBQW5CLEdBQThCLFFBQTlCO0FBQ0E7QUFDQSxTQUFLLFVBQUw7QUFDQTtBQUNBLFNBQUssT0FBTCxHQUFlLENBQUMsS0FBSyxjQUFMLENBQW9CLFlBQXBDO0FBQ0E7QUFDQSxTQUFLLE9BQUwsR0FBZSxDQUFDLEtBQUssS0FBTCxDQUFXLE1BQVgsQ0FBa0IsVUFBQyxHQUFELEVBQU0sSUFBTjtBQUFBLGFBQWdCLE1BQU0sS0FBSyxZQUEzQjtBQUFBLEtBQWxCLEVBQTRELENBQTVELENBQWhCO0FBQ0E7QUFDQSxTQUFLLGNBQUwsQ0FBb0IsT0FBTyxNQUFQLENBQWMsRUFBZCxFQUFrQixRQUFsQixFQUE0QixPQUE1QixDQUFwQjtBQUNBO0FBQ0EsU0FBSyxVQUFMO0FBQ0E7QUFDQSxTQUFLLGNBQUw7QUFDQTtBQUNBLFFBQUksS0FBSyxJQUFMLEtBQWMsS0FBbEIsRUFBeUI7QUFDdkIsV0FBSyxHQUFMO0FBQ0Q7QUFDRjs7QUEvQkg7QUFBQTtBQUFBLG1DQWlDa0IsUUFqQ2xCLEVBaUM0QjtBQUFBOztBQUN4QixhQUFPLElBQVAsQ0FBWSxRQUFaLEVBQXNCLE9BQXRCLENBQThCLFVBQUMsR0FBRCxFQUFTO0FBQ3JDO0FBQ0EsY0FBSyxHQUFMLElBQVksU0FBUyxHQUFULENBQVo7QUFDRCxPQUhEO0FBSUQ7QUF0Q0g7QUFBQTtBQUFBLGlDQXdDZ0I7QUFBQTs7QUFDWixXQUFLLFNBQUwsR0FBaUIsU0FBUyxhQUFULENBQXVCLEtBQXZCLENBQWpCO0FBQ0EsV0FBSyxTQUFMLENBQWUsU0FBZixDQUF5QixHQUF6QixDQUE2QixzQkFBN0I7QUFDQSxXQUFLLFNBQUwsQ0FBZSxLQUFmLENBQXFCLFVBQXJCLEdBQWtDLGdCQUFsQztBQUNBLFdBQUssT0FBTCxDQUFhLFdBQWIsQ0FBeUIsS0FBSyxTQUE5Qjs7QUFFQSxXQUFLLGNBQUwsR0FBc0IsS0FBSyxLQUFMLENBQVcsS0FBSyxLQUFMLENBQVcsTUFBWCxHQUFvQixDQUEvQixFQUFrQyxTQUFsQyxDQUE0QyxJQUE1QyxDQUF0QjtBQUNBLFdBQUssU0FBTCxDQUFlLFdBQWYsQ0FBMkIsS0FBSyxjQUFoQzs7QUFFQSxXQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW1CLFVBQUMsSUFBRCxFQUFVO0FBQzNCLGVBQUssU0FBTCxDQUFlLFdBQWYsQ0FBMkIsSUFBM0I7QUFDRCxPQUZEOztBQUlBLFdBQUssYUFBTCxHQUFxQixLQUFLLEtBQUwsQ0FBVyxDQUFYLEVBQWMsU0FBZCxDQUF3QixJQUF4QixDQUFyQjtBQUNBLFdBQUssU0FBTCxDQUFlLFdBQWYsQ0FBMkIsS0FBSyxhQUFoQztBQUNEO0FBdkRIO0FBQUE7QUFBQSxpQ0F5RGdCO0FBQ1osVUFBTSxVQUFVLEtBQUssYUFBTCxDQUFtQixLQUFLLE1BQXhCLENBQWhCO0FBQ0EsVUFBTSxRQUFRLEtBQUssYUFBTCxDQUFtQixLQUFLLEtBQUwsQ0FBVyxNQUE5QixDQUFkO0FBQ0EsVUFBTSxPQUFPLEtBQUssYUFBTCxDQUFtQixLQUFLLEtBQUwsQ0FBVyxNQUE5QixDQUFiOztBQUVBLFdBQUssT0FBTCxHQUFlO0FBQ2IsWUFBSTtBQUNGLGVBQUssSUFESDtBQUVGLDBCQUZFO0FBR0YsaUJBQU8sQ0FITDtBQUlGLG9CQUpFO0FBS0YsY0FBSSxLQUFLLE9BTFA7QUFNRix1QkFBYSxJQU5YO0FBT0YsdUJBQWE7QUFQWCxTQURTO0FBVWIsY0FBTTtBQUNKLGVBQUssTUFERDtBQUVKLDBCQUZJO0FBR0osc0JBSEk7QUFJSixnQkFBTSxDQUpGO0FBS0osY0FBSSxLQUFLLE9BTEw7QUFNSix1QkFBYSxJQU5UO0FBT0osdUJBQWE7QUFQVDtBQVZPLE9BQWY7QUFvQkQ7O0FBRUQ7Ozs7QUFwRkY7QUFBQTs7O0FBNFBFOzs7QUE1UEYsd0NBK1B1RTtBQUFBLFVBQWxELEtBQWtELHVFQUExQyxLQUFLLEtBQXFDO0FBQUEsVUFBOUIsVUFBOEIsdUVBQWpCLEtBQUssVUFBWTs7QUFDbkUsV0FBSyxTQUFMLENBQWUsS0FBZixDQUFxQixVQUFyQixHQUFxQyxRQUFRLElBQTdDLFVBQXNELFVBQXREO0FBQ0Q7O0FBRUQ7Ozs7O0FBblFGO0FBQUE7QUFBQSxxQ0F1UW9CLE1BdlFwQixFQXVRNEI7QUFDeEIsV0FBSyxTQUFMLENBQWUsS0FBZixDQUFxQixTQUFyQiw4QkFBMEQsTUFBMUQ7QUFDRDs7QUFFRDs7Ozs7QUEzUUY7QUFBQTtBQUFBLHVDQStRc0I7QUFDbEIsYUFBTyxLQUFLLFVBQUwsR0FBa0IsS0FBSyxNQUF2QixJQUFpQyxLQUFLLE1BQUwsS0FBZ0IsQ0FBakQsSUFBc0QsS0FBSyxVQUFMLEtBQW9CLEtBQUssS0FBTCxDQUFXLE1BQVgsR0FBb0IsQ0FBckc7QUFDRDs7QUFFRDs7Ozs7QUFuUkY7QUFBQTtBQUFBLHNDQXVScUI7QUFDakIsYUFBTyxLQUFLLFVBQUwsSUFBbUIsS0FBSyxNQUF4QixJQUFrQyxLQUFLLE1BQUwsS0FBZ0IsS0FBSyxLQUFMLENBQVcsTUFBWCxHQUFvQixDQUF0RSxJQUEyRSxLQUFLLFVBQUwsS0FBb0IsQ0FBdEc7QUFDRDs7QUFFRDs7Ozs7O0FBM1JGO0FBQUE7QUFBQSxrQ0FnU2lCLEtBaFNqQixFQWdTd0I7QUFDcEIsVUFBSSxTQUFTLENBQWI7O0FBRUEsV0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLEtBQXBCLEVBQTJCLEdBQTNCLEVBQWdDO0FBQzlCLGtCQUFVLEtBQUssS0FBTCxDQUFXLENBQVgsRUFBYyxZQUF4QjtBQUNEOztBQUVELGFBQU8sS0FBSyxPQUFMLEdBQWUsTUFBdEI7QUFDRDs7QUFFRDs7OztBQTFTRjtBQUFBO0FBQUEsbUNBNlNrQixNQTdTbEIsRUE2UzBCO0FBQ3RCLFdBQUssU0FBTCxDQUFlLFNBQWYsQ0FBeUIsTUFBekIsQ0FBZ0MsZ0JBQWhDO0FBQ0EsV0FBSyxnQkFBTCxDQUFzQixDQUFDLE1BQU0sTUFBTixDQUFELEdBQWlCLE1BQWpCLEdBQTBCLEtBQUssTUFBTCxDQUFZLE9BQTVEO0FBQ0E7QUFDQSxXQUFLLFNBQUwsQ0FBZSxZQUFmO0FBQ0EsV0FBSyxTQUFMLENBQWUsU0FBZixDQUF5QixNQUF6QixDQUFnQyxnQkFBaEM7QUFDRDs7QUFFRDs7Ozs7QUFyVEY7QUFBQTtBQUFBLDJCQXlUVTtBQUNOLFdBQUssVUFBTCxHQUFrQixLQUFLLFNBQXZCO0FBQ0EsV0FBSyxPQUFMLEdBQWUsSUFBZjtBQUNBLFdBQUssSUFBTDs7QUFFQSxhQUFPLEtBQUssVUFBWjtBQUNEOztBQUVEOzs7OztBQWpVRjtBQUFBO0FBQUEsMkJBcVVVO0FBQ04sV0FBSyxVQUFMLEdBQWtCLEtBQUssU0FBdkI7QUFDQSxXQUFLLE9BQUwsR0FBZSxJQUFmO0FBQ0EsV0FBSyxJQUFMOztBQUVBLGFBQU8sS0FBSyxVQUFaO0FBQ0Q7O0FBRUQ7Ozs7OztBQTdVRjtBQUFBO0FBQUEsdUNBa1ZzQixLQWxWdEIsRUFrVjZCO0FBQ3pCLFVBQUksUUFBUSxLQUFLLEtBQWpCO0FBQ0EsV0FBSyxVQUFMLEdBQWtCLFFBQWxCOztBQUVBLGNBQVEsS0FBUjtBQUNFLGFBQUssQ0FBTDtBQUNFLG1CQUFTLEdBQVQ7QUFDQSxlQUFLLFVBQUwsR0FBa0IsVUFBbEI7QUFDQSxlQUFLLFlBQUwsR0FBb0IsU0FBcEI7QUFDQTtBQUNGLGFBQUssQ0FBTDtBQUNFLG1CQUFTLElBQVQ7QUFDQSxlQUFLLFlBQUwsR0FBb0IsT0FBcEI7QUFDQTtBQUNGLGFBQUssQ0FBTDtBQUNFLG1CQUFTLENBQVQ7QUFDQSxlQUFLLFlBQUwsR0FBb0IsU0FBcEI7QUFDQTtBQUNGLGFBQUssQ0FBTDtBQUNFLG1CQUFTLElBQVQ7QUFDQSxlQUFLLFlBQUwsR0FBb0IsU0FBcEI7QUFDQTtBQUNGO0FBQ0UsbUJBQVMsR0FBVDtBQUNBLGVBQUssWUFBTCxHQUFvQixPQUFwQjtBQXBCSjs7QUF1QkEsYUFBTyxLQUFQO0FBQ0Q7O0FBRUQ7Ozs7OztBQWhYRjtBQUFBO0FBQUEsNEJBcVhXLEtBclhYLEVBcVhrQixVQXJYbEIsRUFxWDhCO0FBQUE7O0FBQzFCO0FBQ0EsVUFBSSxPQUFPLEtBQVAsS0FBaUIsVUFBckIsRUFBaUM7QUFDL0IscUJBQWEsS0FBYjtBQUNEO0FBQ0QsV0FBSyxPQUFMLEdBQWUsSUFBZjtBQUNBO0FBQ0EsVUFBSSxDQUFDLEtBQUssT0FBTixJQUFpQixLQUFLLFVBQUwsS0FBb0IsSUFBekMsRUFBK0M7QUFDN0MsYUFBSyxJQUFMLENBQVUsVUFBVjtBQUNELE9BRkQsTUFFTztBQUNMLFlBQU0sUUFBUSxLQUFLLGtCQUFMLENBQXdCLEtBQXhCLENBQWQ7QUFDQTtBQUNBLGFBQUssaUJBQUwsQ0FBdUIsS0FBdkI7QUFDQSxhQUFLLGdCQUFMLENBQXNCLEtBQUssTUFBTCxDQUFZLEVBQWxDO0FBQ0EsWUFBSSxZQUFNO0FBQ1IsY0FBSSxDQUFDLE9BQUssUUFBTixJQUFrQixPQUFLLE9BQTNCLEVBQW9DO0FBQ2xDLGdCQUFNLE9BQU8sUUFBUSxDQUFyQjs7QUFFQSxtQkFBSyxjQUFMLENBQW9CLE9BQUssTUFBTCxDQUFZLEtBQWhDOztBQUVBLGdCQUFJLE9BQU8sQ0FBWCxFQUFjO0FBQ1o7QUFDQSxxQkFBSyxPQUFMLENBQWEsSUFBYixFQUFtQixVQUFuQjtBQUNELGFBSEQsTUFHTztBQUNMLHFCQUFLLElBQUwsQ0FBVSxVQUFWO0FBQ0Q7QUFDRjtBQUNGLFNBYkQsRUFhRyxLQWJIO0FBY0Q7O0FBRUQsYUFBTyxLQUFLLFVBQVo7QUFDRDs7QUFFRDs7Ozs7QUF0WkY7QUFBQTtBQUFBLHlCQTBaUSxNQTFaUixFQTBaZ0I7QUFBQTs7QUFDWixVQUFJLENBQUMsS0FBSyxPQUFOLElBQWlCLEtBQUssUUFBMUIsRUFBb0M7QUFDbEMsZUFBTyxLQUFLLFVBQVo7QUFDRDs7QUFFRCxXQUFLLE9BQUwsR0FBZSxJQUFmO0FBQ0EsV0FBSyxRQUFMLEdBQWdCLElBQWhCOztBQUVBLFVBQUksS0FBSyxVQUFMLEtBQW9CLElBQXhCLEVBQThCO0FBQzVCO0FBQ0EsYUFBSyxVQUFMLEdBQWtCLEtBQUssTUFBdkI7QUFDRDs7QUFFRDtBQUNBLFVBQUksS0FBSyxnQkFBTCxFQUFKLEVBQTZCO0FBQzNCLGFBQUssY0FBTCxDQUFvQixLQUFLLE1BQUwsQ0FBWSxXQUFoQztBQUNELE9BRkQsTUFFTyxJQUFJLEtBQUssZUFBTCxFQUFKLEVBQTRCO0FBQ2pDLGFBQUssY0FBTCxDQUFvQixLQUFLLE1BQUwsQ0FBWSxXQUFoQztBQUNEOztBQUVEO0FBQ0EsV0FBSyxNQUFMLEdBQWMsS0FBSyxVQUFuQjs7QUFFQTtBQUNBLFVBQU0sUUFBUSxLQUFLLGtCQUFMLENBQXdCLENBQXhCLENBQWQ7QUFDQTtBQUNBLFdBQUssaUJBQUwsQ0FBdUIsS0FBdkI7QUFDQSxXQUFLLFlBQUwsR0FBb0IsT0FBcEI7QUFDQSxXQUFLLGdCQUFMLENBQXNCLEtBQUssYUFBTCxDQUFtQixLQUFLLE1BQXhCLENBQXRCO0FBQ0EsVUFBSSxZQUFNO0FBQ1IsZUFBSyxRQUFMLEdBQWdCLEtBQWhCO0FBQ0EsZUFBSyxPQUFMLEdBQWUsS0FBZjtBQUNBLGVBQUssVUFBTCxHQUFrQixJQUFsQjs7QUFFQSxZQUFJLE9BQU8sT0FBSyxVQUFaLEtBQTJCLFVBQS9CLEVBQTJDO0FBQ3pDLGlCQUFLLFVBQUwsQ0FBZ0IsT0FBSyxNQUFyQjtBQUNEOztBQUVELFlBQUksT0FBTyxNQUFQLEtBQWtCLFVBQXRCLEVBQWtDO0FBQ2hDLGlCQUFPLEtBQVAsU0FBbUIsQ0FBQyxPQUFLLE1BQU4sQ0FBbkI7QUFDRDtBQUNGLE9BWkQsRUFZRyxLQVpIOztBQWNBLGFBQU8sS0FBSyxNQUFaO0FBQ0Q7O0FBRUQ7Ozs7QUF4Y0Y7QUFBQTtBQUFBLDBCQTJjUztBQUFBOztBQUNMLFVBQUksS0FBSyxPQUFULEVBQWtCO0FBQ2hCO0FBQ0Q7O0FBRUQsV0FBSyxNQUFMLEdBQWMsSUFBSSxLQUFKLENBQVUsWUFBTTtBQUM1QixZQUFJLE9BQU8sT0FBSyxTQUFaLEtBQTBCLFVBQTlCLEVBQTBDO0FBQ3hDLGlCQUFLLFNBQUwsR0FBaUI7QUFBQSxtQkFBTSxPQUFLLFVBQVg7QUFBQSxXQUFqQjtBQUNEO0FBQ0QsWUFBSSxDQUFDLE9BQUssT0FBTixJQUFpQixPQUFLLFVBQUwsS0FBb0IsSUFBekMsRUFBK0M7QUFDN0MsY0FBSSxZQUFNO0FBQ1IsbUJBQUssTUFBTCxDQUFZLEtBQVo7QUFDRCxXQUZELEVBRUcsR0FGSDtBQUdELFNBSkQsTUFJTztBQUNMLGlCQUFLLE9BQUwsQ0FBYSxPQUFLLEtBQWxCLEVBQXlCLFlBQU07QUFDN0IsbUJBQUssTUFBTCxDQUFZLEtBQVo7QUFDRCxXQUZEO0FBR0Q7QUFDRixPQWJhLEVBYVgsS0FBSyxJQWJNLENBQWQ7QUFjRDs7QUFFRDs7OztBQWhlRjtBQUFBO0FBQUEsOEJBbWVhO0FBQUE7O0FBQ1QsV0FBSyxjQUFMLENBQW9CLE1BQXBCO0FBQ0EsV0FBSyxhQUFMLENBQW1CLE1BQW5CO0FBQ0EsV0FBSyxNQUFMLENBQVksTUFBWjs7QUFFQTtBQUNBLFdBQUssS0FBTCxDQUFXLE9BQVgsQ0FBbUIsVUFBQyxJQUFELEVBQVU7QUFDM0IsZUFBSyxPQUFMLENBQWEsV0FBYixDQUF5QixJQUF6QjtBQUNELE9BRkQ7O0FBSUEsV0FBSyxTQUFMLENBQWUsTUFBZjtBQUNEO0FBOWVIO0FBQUE7QUFBQSx3QkF1RmdCO0FBQ1osYUFBTyxLQUFLLE9BQVo7QUFDRDs7QUFFRDs7O0FBM0ZGOzs7QUF1TUU7Ozs7QUF2TUYsc0JBMk1jLEtBM01kLEVBMk1xQjtBQUNqQixjQUFRLE9BQU8sS0FBUCxDQUFSO0FBQ0EsVUFBSSxRQUFRLENBQVIsSUFBYSxTQUFTLEtBQUssS0FBTCxDQUFXLE1BQWpDLElBQTJDLE1BQU0sS0FBTixDQUEvQyxFQUE2RDtBQUMzRCxnQkFBUSxDQUFSO0FBQ0Q7QUFDRCxXQUFLLE9BQUwsR0FBZSxLQUFmO0FBQ0Q7O0FBRUQ7Ozs7QUFuTkY7QUFBQTtBQUFBLHdCQThGbUI7QUFDZixhQUFPLEtBQUssVUFBWjtBQUNELEtBaEdIO0FBQUEsc0JBc05pQixTQXROakIsRUFzTjRCO0FBQ3hCLFVBQUksQ0FBQyxLQUFLLE9BQVYsRUFBbUI7QUFDakIsYUFBSyxVQUFMLEdBQWtCLGNBQWMsTUFBZCxHQUF1QixNQUF2QixHQUFnQyxJQUFsRDtBQUNEO0FBQ0Y7O0FBRUQ7Ozs7OztBQTVORjtBQUFBO0FBQUEsd0JBa0dnQjtBQUNaLGFBQU8sS0FBSyxPQUFMLENBQWEsS0FBSyxVQUFsQixDQUFQO0FBQ0Q7QUFwR0g7QUFBQTtBQUFBLHdCQXNHb0I7QUFDaEIsYUFBTyxLQUFLLFdBQVo7QUFDRDs7QUFFRDs7OztBQTFHRjs7O0FBb1BFOzs7O0FBcFBGLHNCQXdQa0IsVUF4UGxCLEVBd1A4QjtBQUMxQixXQUFLLFdBQUwsR0FBbUIsY0FBYyxhQUFqQztBQUNEO0FBMVBIO0FBQUE7QUFBQSx3QkE4R3FCO0FBQ2pCLFVBQU0sa0JBQWtCLEtBQUssS0FBTCxDQUFXLENBQVgsRUFBYyxZQUF0QztBQUNBLFVBQU0scUJBQXFCLEtBQUssU0FBTCxDQUFlLEtBQWYsQ0FBcUIsU0FBckIsSUFBa0MsRUFBN0Q7QUFDQSxVQUFNLGVBQWUsa0VBQXJCO0FBQ0EsVUFBTSxrQkFBa0IsU0FBUyxtQkFBbUIsT0FBbkIsQ0FBMkIsWUFBM0IsRUFBeUMsSUFBekMsQ0FBVCxFQUF5RCxFQUF6RCxDQUF4Qjs7QUFFQSxhQUFPLEtBQUssR0FBTCxDQUFTLEtBQUssS0FBTCxDQUFXLGtCQUFrQixlQUE3QixDQUFULElBQTBELENBQWpFO0FBQ0Q7O0FBRUQ7Ozs7OztBQXZIRjtBQUFBO0FBQUEsd0JBNEhnQjtBQUNaLGFBQU8sS0FBSyxLQUFMLENBQVcsS0FBSyxNQUFMLEtBQWdCLEtBQUssS0FBTCxDQUFXLE1BQXRDLENBQVA7QUFDRDs7QUFFRDs7Ozs7QUFoSUY7QUFBQTtBQUFBLHdCQW9JZ0I7QUFDWixVQUFJLGdCQUFKOztBQUVBLFVBQUksT0FBTyxLQUFLLFNBQVosS0FBMEIsVUFBOUIsRUFBMEM7QUFDeEMsWUFBSSxRQUFRLEtBQUssU0FBTCxDQUFlLEtBQUssTUFBcEIsQ0FBWjtBQUNBLFlBQUksUUFBUSxDQUFSLElBQWEsU0FBUyxLQUFLLEtBQUwsQ0FBVyxNQUFyQyxFQUE2QztBQUMzQyxrQkFBUSxDQUFSO0FBQ0Q7QUFDRCxrQkFBVSxLQUFWO0FBQ0QsT0FORCxNQU1PO0FBQ0wsa0JBQVUsS0FBSyxNQUFmO0FBQ0Q7O0FBRUQsYUFBTyxPQUFQO0FBQ0Q7O0FBRUQ7Ozs7O0FBcEpGO0FBQUE7QUFBQSx3QkF3Sm9CO0FBQ2hCLFVBQU0sWUFBWSxLQUFLLE1BQUwsR0FBYyxDQUFoQzs7QUFFQSxhQUFPLFlBQVksQ0FBWixHQUFpQixLQUFLLEtBQUwsQ0FBVyxNQUFYLEdBQW9CLENBQXJDLEdBQTBDLFNBQWpEO0FBQ0Q7O0FBRUQ7Ozs7O0FBOUpGO0FBQUE7QUFBQSx3QkFrS29CO0FBQ2hCLFVBQU0sWUFBWSxLQUFLLE1BQUwsR0FBYyxDQUFoQzs7QUFFQSxhQUFPLFlBQVksS0FBSyxLQUFMLENBQVcsTUFBdkIsR0FBZ0MsU0FBaEMsR0FBNEMsQ0FBbkQ7QUFDRDs7QUFFRDs7Ozs7QUF4S0Y7QUFBQTtBQUFBLHdCQTRLbUI7QUFDZixhQUFPLEtBQUssU0FBTCxLQUFtQixJQUFuQixHQUEwQixLQUFLLFVBQS9CLEdBQTRDLEtBQUssVUFBeEQ7QUFDRDs7QUFFRDs7Ozs7QUFoTEY7QUFBQTtBQUFBLHdCQW9MbUI7QUFDZixhQUFPLEtBQUssU0FBTCxLQUFtQixJQUFuQixHQUEwQixLQUFLLFVBQS9CLEdBQTRDLEtBQUssVUFBeEQ7QUFDRDs7QUFFRDs7Ozs7O0FBeExGO0FBQUE7QUFBQSx3QkE2TGlCO0FBQ2IsVUFBTSxPQUFPLEtBQUssT0FBTCxDQUFhLHFCQUFiLEVBQWI7QUFDQSxVQUFNLGVBQWdCLE9BQU8sV0FBUCxJQUFzQixTQUFTLGVBQVQsQ0FBeUIsWUFBckU7QUFDQSxVQUFNLGNBQWUsT0FBTyxVQUFQLElBQXFCLFNBQVMsZUFBVCxDQUF5QixXQUFuRTtBQUNBLFVBQU0sYUFBYyxLQUFLLEdBQUwsSUFBWSxZQUFiLElBQWdDLEtBQUssR0FBTCxHQUFXLEtBQUssTUFBakIsSUFBNEIsQ0FBOUU7QUFDQSxVQUFNLFlBQWEsS0FBSyxJQUFMLElBQWEsV0FBZCxJQUFnQyxLQUFLLElBQUwsR0FBWSxLQUFLLEtBQWxCLElBQTRCLENBQTdFOztBQUVBLGFBQU8sY0FBYyxTQUFyQjtBQUNEO0FBck1IO0FBQUE7QUFBQSxzQkFpT29CLFFBak9wQixFQWlPOEI7QUFBQTs7QUFDMUIsVUFBTSxRQUFRLEtBQUssS0FBTCxHQUFhLENBQTNCOztBQUVBLFVBQUksWUFBTTtBQUNSLHFDQUFJLE9BQUssS0FBVCxJQUFnQixPQUFLLGFBQXJCLEVBQW9DLE9BQUssY0FBekMsR0FBeUQsT0FBekQsQ0FBaUUsVUFBQyxJQUFELEVBQVU7QUFDekUsZUFBSyxTQUFMLENBQWUsTUFBZixDQUFzQixPQUF0QixFQUErQixTQUEvQixFQUEwQyxPQUExQyxFQUFtRCxTQUFuRDtBQUNBLGNBQUksYUFBYSxPQUFqQixFQUEwQjtBQUN4QixpQkFBSyxTQUFMLENBQWUsR0FBZixDQUFtQixRQUFuQjtBQUNEO0FBQ0YsU0FMRDs7QUFPQSxZQUFJLGFBQWEsT0FBakIsRUFBMEI7QUFDeEIsaUJBQUssU0FBTCxDQUFlLFNBQWYsQ0FBeUIsTUFBekIsQ0FBZ0MsV0FBaEM7QUFDRCxTQUZELE1BRU87QUFDTCxpQkFBSyxTQUFMLENBQWUsU0FBZixDQUF5QixHQUF6QixDQUE2QixXQUE3QjtBQUNEO0FBQ0YsT0FiRCxFQWFHLEtBYkg7QUFjRDtBQWxQSDs7QUFBQTtBQUFBOzs7Ozs7Ozs7QUN0QkEsT0FBTyxPQUFQO0FBQ0UsaUJBQWEsRUFBYixFQUFpQixLQUFqQixFQUF3QjtBQUFBOztBQUN0QixTQUFLLEVBQUwsR0FBVSxFQUFWO0FBQ0EsU0FBSyxZQUFMLEdBQW9CLEtBQXBCO0FBQ0EsU0FBSyxLQUFMLEdBQWEsS0FBYjtBQUNBLFNBQUssU0FBTCxHQUFpQixJQUFqQjtBQUNBLFNBQUssS0FBTCxHQUFhLElBQWI7QUFDQSxTQUFLLE9BQUwsR0FBZSxLQUFmOztBQUVBLFNBQUssTUFBTDs7QUFFQSxXQUFPLElBQVA7QUFDRDs7QUFaSDtBQUFBO0FBQUEsNkJBY1k7QUFBQTs7QUFDUixXQUFLLEtBQUwsR0FBYSxXQUFXLFlBQU07QUFDNUIsY0FBSyxPQUFMLEdBQWUsS0FBZjtBQUNBLGNBQUssRUFBTDtBQUNELE9BSFksRUFHVixLQUFLLEtBSEssQ0FBYjtBQUlEO0FBbkJIO0FBQUE7QUFBQSw2QkFxQlk7QUFDUixXQUFLLE9BQUwsR0FBZSxLQUFmO0FBQ0EsbUJBQWEsS0FBSyxLQUFsQjtBQUNEO0FBeEJIO0FBQUE7QUFBQSw0QkEwQlc7QUFDUCxVQUFJLEtBQUssT0FBVCxFQUFrQjtBQUNoQixhQUFLLEtBQUwsSUFBYyxJQUFJLElBQUosR0FBVyxPQUFYLEtBQXVCLEtBQUssU0FBMUM7QUFDQSxhQUFLLE1BQUw7QUFDRDtBQUNGO0FBL0JIO0FBQUE7QUFBQSw2QkFpQ1k7QUFDUixVQUFJLENBQUMsS0FBSyxPQUFWLEVBQW1CO0FBQ2pCLGFBQUssT0FBTCxHQUFlLElBQWY7QUFDQSxhQUFLLFNBQUwsR0FBaUIsSUFBSSxJQUFKLEdBQVcsT0FBWCxFQUFqQjs7QUFFQSxhQUFLLE1BQUw7QUFDRDtBQUNGO0FBeENIO0FBQUE7QUFBQSw0QkEwQ1c7QUFDUCxXQUFLLE1BQUw7QUFDQSxXQUFLLEtBQUwsR0FBYSxLQUFLLFlBQWxCO0FBQ0EsV0FBSyxNQUFMO0FBQ0Q7QUE5Q0g7QUFBQTtBQUFBLHdCQWdETyxVQWhEUCxFQWdEbUI7QUFDZixXQUFLLEtBQUw7QUFDQSxXQUFLLEtBQUwsSUFBYyxVQUFkO0FBQ0EsV0FBSyxNQUFMO0FBQ0Q7QUFwREg7O0FBQUE7QUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9cmV0dXJuIGV9KSgpIiwid2luZG93LlNsb3RNYWNoaW5lID0gcmVxdWlyZSgnLi9zbG90LW1hY2hpbmUnKTtcbiIsImNvbnN0IF9yYWYgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcmFmIChjYiwgdGltZW91dCA9IDApIHtcbiAgc2V0VGltZW91dCgoKSA9PiBfcmFmKGNiKSwgdGltZW91dCk7XG59O1xuIiwiY29uc3QgVGltZXIgPSByZXF1aXJlKCcuL3RpbWVyJyk7XG5jb25zdCByYWYgPSByZXF1aXJlKCcuL3JhZicpO1xuXG5jb25zdCBkZWZhdWx0cyA9IHtcbiAgYWN0aXZlOiAwLCAvLyBBY3RpdmUgZWxlbWVudCBbTnVtYmVyXVxuICBkZWxheTogMjAwLCAvLyBBbmltYXRpb24gdGltZSBbTnVtYmVyXVxuICBhdXRvOiBmYWxzZSwgLy8gUmVwZWF0IGRlbGF5IFtmYWxzZXx8TnVtYmVyXVxuICBzcGluczogNSwgLy8gTnVtYmVyIG9mIHNwaW5zIHdoZW4gYXV0byBbTnVtYmVyXVxuICByYW5kb21pemU6IG51bGwsIC8vIFJhbmRvbWl6ZSBmdW5jdGlvbiwgbXVzdCByZXR1cm4gYSBudW1iZXIgd2l0aCB0aGUgc2VsZWN0ZWQgcG9zaXRpb25cbiAgb25Db21wbGV0ZTogbnVsbCwgLy8gQ2FsbGJhY2sgZnVuY3Rpb24ocmVzdWx0KVxuICBpblZpZXdwb3J0OiB0cnVlLCAvLyBTdG9wcyBhbmltYXRpb25zIGlmIHRoZSBlbGVtZW50IGlzbsK0dCB2aXNpYmxlIG9uIHRoZSBzY3JlZW5cbiAgZGlyZWN0aW9uOiAndXAnLCAvLyBBbmltYXRpb24gZGlyZWN0aW9uIFsndXAnfHwnZG93biddXG4gIHRyYW5zaXRpb246ICdlYXNlLWluLW91dCdcbn07XG5jb25zdCBGWF9OT19UUkFOU0lUSU9OID0gJ3Nsb3RNYWNoaW5lTm9UcmFuc2l0aW9uJztcbmNvbnN0IEZYX0ZBU1QgPSAnc2xvdE1hY2hpbmVCbHVyRmFzdCc7XG5jb25zdCBGWF9OT1JNQUwgPSAnc2xvdE1hY2hpbmVCbHVyTWVkaXVtJztcbmNvbnN0IEZYX1NMT1cgPSAnc2xvdE1hY2hpbmVCbHVyU2xvdyc7XG5jb25zdCBGWF9UVVJUTEUgPSAnc2xvdE1hY2hpbmVCbHVyVHVydGxlJztcbmNvbnN0IEZYX0dSQURJRU5UID0gJ3Nsb3RNYWNoaW5lR3JhZGllbnQnO1xuY29uc3QgRlhfU1RPUCA9IEZYX0dSQURJRU5UO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNsb3RNYWNoaW5lIHtcbiAgc3RhdGljIGdldCBuYW1lICgpIHtcbiAgICByZXR1cm4gJ3Nsb3RNYWNoaW5lJztcbiAgfVxuXG4gIGNvbnN0cnVjdG9yIChlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAvLyBTbG90IE1hY2hpbmUgZWxlbWVudHNcbiAgICB0aGlzLnRpbGVzID0gW10uc2xpY2UuY2FsbCh0aGlzLmVsZW1lbnQuY2hpbGRyZW4pO1xuICAgIC8vIE1hY2hpbmUgaXMgcnVubmluZz9cbiAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAvLyBNYWNoaW5lIGlzIHN0b3BwaW5nP1xuICAgIHRoaXMuc3RvcHBpbmcgPSBmYWxzZTtcbiAgICAvLyBEaXNhYmxlIG92ZXJmbG93XG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG4gICAgLy8gV3JhcCBlbGVtZW50cyBpbnNpZGUgY29udGFpbmVyXG4gICAgdGhpcy5fd3JhcFRpbGVzKCk7XG4gICAgLy8gU2V0IG1pbiB0b3Agb2Zmc2V0XG4gICAgdGhpcy5fbWluVG9wID0gLXRoaXMuX2Zha2VGaXJzdFRpbGUub2Zmc2V0SGVpZ2h0O1xuICAgIC8vIFNldCBtYXggdG9wIG9mZnNldFxuICAgIHRoaXMuX21heFRvcCA9IC10aGlzLnRpbGVzLnJlZHVjZSgoYWNjLCB0aWxlKSA9PiAoYWNjICsgdGlsZS5vZmZzZXRIZWlnaHQpLCAwKTtcbiAgICAvLyBDYWxsIHNldHRlcnMgaWYgbmVjY2VzYXJ5XG4gICAgdGhpcy5jaGFuZ2VTZXR0aW5ncyhPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cywgb3B0aW9ucykpO1xuICAgIC8vIEluaXRpYWxpemUgc3BpbiBkaXJlY3Rpb24gW3VwLCBkb3duXVxuICAgIHRoaXMuX3NldEJvdW5kcygpO1xuICAgIC8vIFNob3cgYWN0aXZlIGVsZW1lbnRcbiAgICB0aGlzLl9yZXNldFBvc2l0aW9uKCk7XG4gICAgLy8gU3RhcnQgYXV0byBhbmltYXRpb25cbiAgICBpZiAodGhpcy5hdXRvICE9PSBmYWxzZSkge1xuICAgICAgdGhpcy5ydW4oKTtcbiAgICB9XG4gIH1cblxuICBjaGFuZ2VTZXR0aW5ncyAoc2V0dGluZ3MpIHtcbiAgICBPYmplY3Qua2V5cyhzZXR0aW5ncykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAvLyBUcmlnZ2VyIHNldHRlcnNcbiAgICAgIHRoaXNba2V5XSA9IHNldHRpbmdzW2tleV07XG4gICAgfSk7XG4gIH1cblxuICBfd3JhcFRpbGVzICgpIHtcbiAgICB0aGlzLmNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ3Nsb3RNYWNoaW5lQ29udGFpbmVyJyk7XG4gICAgdGhpcy5jb250YWluZXIuc3R5bGUudHJhbnNpdGlvbiA9ICcxcyBlYXNlLWluLW91dCc7XG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuY29udGFpbmVyKTtcblxuICAgIHRoaXMuX2Zha2VGaXJzdFRpbGUgPSB0aGlzLnRpbGVzW3RoaXMudGlsZXMubGVuZ3RoIC0gMV0uY2xvbmVOb2RlKHRydWUpO1xuICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX2Zha2VGaXJzdFRpbGUpO1xuXG4gICAgdGhpcy50aWxlcy5mb3JFYWNoKCh0aWxlKSA9PiB7XG4gICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aWxlKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX2Zha2VMYXN0VGlsZSA9IHRoaXMudGlsZXNbMF0uY2xvbmVOb2RlKHRydWUpO1xuICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX2Zha2VMYXN0VGlsZSk7XG4gIH1cblxuICBfc2V0Qm91bmRzICgpIHtcbiAgICBjb25zdCBpbml0aWFsID0gdGhpcy5nZXRUaWxlT2Zmc2V0KHRoaXMuYWN0aXZlKTtcbiAgICBjb25zdCBmaXJzdCA9IHRoaXMuZ2V0VGlsZU9mZnNldCh0aGlzLnRpbGVzLmxlbmd0aCk7XG4gICAgY29uc3QgbGFzdCA9IHRoaXMuZ2V0VGlsZU9mZnNldCh0aGlzLnRpbGVzLmxlbmd0aCk7XG5cbiAgICB0aGlzLl9ib3VuZHMgPSB7XG4gICAgICB1cDoge1xuICAgICAgICBrZXk6ICd1cCcsXG4gICAgICAgIGluaXRpYWwsXG4gICAgICAgIGZpcnN0OiAwLFxuICAgICAgICBsYXN0LFxuICAgICAgICB0bzogdGhpcy5fbWF4VG9wLFxuICAgICAgICBmaXJzdFRvTGFzdDogbGFzdCxcbiAgICAgICAgbGFzdFRvRmlyc3Q6IDBcbiAgICAgIH0sXG4gICAgICBkb3duOiB7XG4gICAgICAgIGtleTogJ2Rvd24nLFxuICAgICAgICBpbml0aWFsLFxuICAgICAgICBmaXJzdCxcbiAgICAgICAgbGFzdDogMCxcbiAgICAgICAgdG86IHRoaXMuX21pblRvcCxcbiAgICAgICAgZmlyc3RUb0xhc3Q6IGxhc3QsXG4gICAgICAgIGxhc3RUb0ZpcnN0OiAwXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQVUJMSUMgLSBHZXQgYWN0aXZlIGVsZW1lbnRcbiAgICovXG4gIGdldCBhY3RpdmUgKCkge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmU7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFVCTElDIC0gR2V0IGFjdGl2ZSBlbGVtZW50XG4gICAqL1xuICBnZXQgZGlyZWN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGlyZWN0aW9uO1xuICB9XG5cbiAgZ2V0IGJvdW5kcyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2JvdW5kc1t0aGlzLl9kaXJlY3Rpb25dO1xuICB9XG5cbiAgZ2V0IHRyYW5zaXRpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl90cmFuc2l0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBVQkxJQyAtIEdldCBjdXJyZW50IHNob3dpbmcgZWxlbWVudCBpbmRleFxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gRWxlbWVudCBpbmRleFxuICAgKi9cbiAgZ2V0IHZpc2libGVUaWxlICgpIHtcbiAgICBjb25zdCBmaXJzdFRpbGVIZWlnaHQgPSB0aGlzLnRpbGVzWzBdLm9mZnNldEhlaWdodDtcbiAgICBjb25zdCByYXdDb250YWluZXJNYXJnaW4gPSB0aGlzLmNvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gfHwgJyc7XG4gICAgY29uc3QgbWF0cml4UmVnRXhwID0gL15tYXRyaXhcXCgtP1xcZCssXFxzPy0/XFxkKyxcXHM/LT9cXGQrLFxccz8tP1xcZCssXFxzPy0/XFxkKyxcXHM/KC0/XFxkKylcXCkkLztcbiAgICBjb25zdCBjb250YWluZXJNYXJnaW4gPSBwYXJzZUludChyYXdDb250YWluZXJNYXJnaW4ucmVwbGFjZShtYXRyaXhSZWdFeHAsICckMScpLCAxMCk7XG5cbiAgICByZXR1cm4gTWF0aC5hYnMoTWF0aC5yb3VuZChjb250YWluZXJNYXJnaW4gLyBmaXJzdFRpbGVIZWlnaHQpKSAtIDE7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFVCTElDIC0gR2V0IHJhbmRvbSBlbGVtZW50IGRpZmZlcmVudCB0aGFuIGxhc3Qgc2hvd25cbiAgICogQHBhcmFtIHtCb29sZWFufSBjYW50QmVUaGVDdXJyZW50IC0gdHJ1ZXx8dW5kZWZpbmVkIGlmIGNhbnQgYmUgY2hvb3NlbiB0aGUgY3VycmVudCBlbGVtZW50LCBwcmV2ZW50cyByZXBlYXRcbiAgICogQHJldHVybiB7TnVtYmVyfSAtIEVsZW1lbnQgaW5kZXhcbiAgICovXG4gIGdldCByYW5kb20gKCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLnRpbGVzLmxlbmd0aCk7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFVCTElDIC0gR2V0IHJhbmRvbSBlbGVtZW50IGJhc2VkIG9uIHRoZSBjdXN0b20gcmFuZG9taXplIGZ1bmN0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBFbGVtZW50IGluZGV4XG4gICAqL1xuICBnZXQgY3VzdG9tICgpIHtcbiAgICBsZXQgY2hvb3NlbjtcblxuICAgIGlmICh0eXBlb2YgdGhpcy5yYW5kb21pemUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGxldCBpbmRleCA9IHRoaXMucmFuZG9taXplKHRoaXMuYWN0aXZlKTtcbiAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gdGhpcy50aWxlcy5sZW5ndGgpIHtcbiAgICAgICAgaW5kZXggPSAwO1xuICAgICAgfVxuICAgICAgY2hvb3NlbiA9IGluZGV4O1xuICAgIH0gZWxzZSB7XG4gICAgICBjaG9vc2VuID0gdGhpcy5yYW5kb207XG4gICAgfVxuXG4gICAgcmV0dXJuIGNob29zZW47XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFJJVkFURSAtIEdldCB0aGUgcHJldmlvdXMgZWxlbWVudCAobm8gZGlyZWN0aW9uIHJlbGF0ZWQpXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBFbGVtZW50IGluZGV4XG4gICAqL1xuICBnZXQgX3ByZXZJbmRleCAoKSB7XG4gICAgY29uc3QgcHJldkluZGV4ID0gdGhpcy5hY3RpdmUgLSAxO1xuXG4gICAgcmV0dXJuIHByZXZJbmRleCA8IDAgPyAodGhpcy50aWxlcy5sZW5ndGggLSAxKSA6IHByZXZJbmRleDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQUklWQVRFIC0gR2V0IHRoZSBuZXh0IGVsZW1lbnQgKG5vIGRpcmVjdGlvbiByZWxhdGVkKVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gRWxlbWVudCBpbmRleFxuICAgKi9cbiAgZ2V0IF9uZXh0SW5kZXggKCkge1xuICAgIGNvbnN0IG5leHRJbmRleCA9IHRoaXMuYWN0aXZlICsgMTtcblxuICAgIHJldHVybiBuZXh0SW5kZXggPCB0aGlzLnRpbGVzLmxlbmd0aCA/IG5leHRJbmRleCA6IDA7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFVCTElDIC0gR2V0IHRoZSBwcmV2aW91cyBlbGVtZW50IGRvciBzZWxlY3RlZCBkaXJlY3Rpb25cbiAgICogQHJldHVybiB7TnVtYmVyfSAtIEVsZW1lbnQgaW5kZXhcbiAgICovXG4gIGdldCBwcmV2SW5kZXggKCkge1xuICAgIHJldHVybiB0aGlzLmRpcmVjdGlvbiA9PT0gJ3VwJyA/IHRoaXMuX25leHRJbmRleCA6IHRoaXMuX3ByZXZJbmRleDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQVUJMSUMgLSBHZXQgdGhlIG5leHQgZWxlbWVudFxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gRWxlbWVudCBpbmRleFxuICAgKi9cbiAgZ2V0IG5leHRJbmRleCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlyZWN0aW9uID09PSAndXAnID8gdGhpcy5fcHJldkluZGV4IDogdGhpcy5fbmV4dEluZGV4O1xuICB9XG5cbiAgLyoqXG4gICAqIFN0b3AgYW5pbWF0aW9uIGlmIGVsZW1lbnQgaXMgW2Fib3ZlfHxiZWxvd10gc2NyZWVuLCBiZXN0IGZvciBwZXJmb3JtYW5jZVxuICAgKiBAZGVzYyBQUklWQVRFIC0gQ2hlY2tzIGlmIHRoZSBtYWNoaW5lIGlzIG9uIHRoZSBzY3JlZW5cbiAgICogQHJldHVybiB7TnVtYmVyfSAtIFJldHVybnMgdHJ1ZSBpZiBtYWNoaW5lIGlzIG9uIHRoZSBzY3JlZW5cbiAgICovXG4gIGdldCB2aXNpYmxlICgpIHtcbiAgICBjb25zdCByZWN0ID0gdGhpcy5lbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHdpbmRvd0hlaWdodCA9ICh3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCk7XG4gICAgY29uc3Qgd2luZG93V2lkdGggPSAod2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoKTtcbiAgICBjb25zdCB2ZXJ0SW5WaWV3ID0gKHJlY3QudG9wIDw9IHdpbmRvd0hlaWdodCkgJiYgKChyZWN0LnRvcCArIHJlY3QuaGVpZ2h0KSA+PSAwKTtcbiAgICBjb25zdCBob3JJblZpZXcgPSAocmVjdC5sZWZ0IDw9IHdpbmRvd1dpZHRoKSAmJiAoKHJlY3QubGVmdCArIHJlY3Qud2lkdGgpID49IDApO1xuXG4gICAgcmV0dXJuIHZlcnRJblZpZXcgJiYgaG9ySW5WaWV3O1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBVQkxJQyAtIFNldCBhY3RpdmUgZWxlbWVudFxuICAgKiBAcGFyYW0ge051bWJlcn0gLSBBY3RpdmUgZWxlbWVudCBpbmRleFxuICAgKi9cbiAgc2V0IGFjdGl2ZSAoaW5kZXgpIHtcbiAgICBpbmRleCA9IE51bWJlcihpbmRleCk7XG4gICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLnRpbGVzLmxlbmd0aCB8fCBpc05hTihpbmRleCkpIHtcbiAgICAgIGluZGV4ID0gMDtcbiAgICB9XG4gICAgdGhpcy5fYWN0aXZlID0gaW5kZXg7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFVCTElDIC0gU2V0IHRoZSBzcGluIGRpcmVjdGlvblxuICAgKi9cbiAgc2V0IGRpcmVjdGlvbiAoZGlyZWN0aW9uKSB7XG4gICAgaWYgKCF0aGlzLnJ1bm5pbmcpIHtcbiAgICAgIHRoaXMuX2RpcmVjdGlvbiA9IGRpcmVjdGlvbiA9PT0gJ2Rvd24nID8gJ2Rvd24nIDogJ3VwJztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFJJVkFURSAtIFNldCBDU1MgY2xhc3NlcyB0byBtYWtlIHNwZWVkIGVmZmVjdFxuICAgKiBAcGFyYW0gc3RyaW5nIEZYX1NQRUVEIC0gRWxlbWVudCBzcGVlZCBbRlhfRkFTVF9CTFVSfHxGWF9OT1JNQUxfQkxVUnx8RlhfU0xPV19CTFVSfHxGWF9TVE9QXVxuICAgKiBAcGFyYW0gc3RyaW5nfHxib29sZWFuIGZhZGUgLSBTZXQgZmFkZSBncmFkaWVudCBlZmZlY3RcbiAgICovXG4gIHNldCBfYW5pbWF0aW9uRlggKEZYX1NQRUVEKSB7XG4gICAgY29uc3QgZGVsYXkgPSB0aGlzLmRlbGF5IC8gNDtcblxuICAgIHJhZigoKSA9PiB7XG4gICAgICBbLi4udGhpcy50aWxlcywgdGhpcy5fZmFrZUxhc3RUaWxlLCB0aGlzLl9mYWtlRmlyc3RUaWxlXS5mb3JFYWNoKCh0aWxlKSA9PiB7XG4gICAgICAgIHRpbGUuY2xhc3NMaXN0LnJlbW92ZShGWF9GQVNULCBGWF9OT1JNQUwsIEZYX1NMT1csIEZYX1RVUlRMRSk7XG4gICAgICAgIGlmIChGWF9TUEVFRCAhPT0gRlhfU1RPUCkge1xuICAgICAgICAgIHRpbGUuY2xhc3NMaXN0LmFkZChGWF9TUEVFRCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAoRlhfU1BFRUQgPT09IEZYX1NUT1ApIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZShGWF9HUkFESUVOVCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKEZYX0dSQURJRU5UKTtcbiAgICAgIH1cbiAgICB9LCBkZWxheSk7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFJJVkFURSAtIFNldCBjc3MgdHJhbnNpdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gLSBUcmFuc2l0aW9uIHR5cGVcbiAgICovXG4gIHNldCB0cmFuc2l0aW9uICh0cmFuc2l0aW9uKSB7XG4gICAgdGhpcy5fdHJhbnNpdGlvbiA9IHRyYW5zaXRpb24gfHwgJ2Vhc2UtaW4tb3V0JztcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQUklWQVRFIC0gU2V0IGNzcyB0cmFuc2l0aW9uIHByb3BlcnR5XG4gICAqL1xuICBfY2hhbmdlVHJhbnNpdGlvbiAoZGVsYXkgPSB0aGlzLmRlbGF5LCB0cmFuc2l0aW9uID0gdGhpcy50cmFuc2l0aW9uKSB7XG4gICAgdGhpcy5jb250YWluZXIuc3R5bGUudHJhbnNpdGlvbiA9IGAke2RlbGF5IC8gMTAwMH1zICR7dHJhbnNpdGlvbn1gO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBSSVZBVEUgLSBTZXQgY29udGFpbmVyIG1hcmdpblxuICAgKiBAcGFyYW0ge051bWJlcn18fFN0cmluZyAtIEFjdGl2ZSBlbGVtZW50IGluZGV4XG4gICAqL1xuICBfY2hhbmdlVHJhbnNmb3JtIChtYXJnaW4pIHtcbiAgICB0aGlzLmNvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSBgbWF0cml4KDEsIDAsIDAsIDEsIDAsICR7bWFyZ2lufSlgO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBSSVZBVEUgLSBJcyBtb3ZpbmcgZnJvbSB0aGUgZmlyc3QgZWxlbWVudCB0byB0aGUgbGFzdFxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cbiAgX2lzR29pbmdCYWNrd2FyZCAoKSB7XG4gICAgcmV0dXJuIHRoaXMubmV4dEFjdGl2ZSA+IHRoaXMuYWN0aXZlICYmIHRoaXMuYWN0aXZlID09PSAwICYmIHRoaXMubmV4dEFjdGl2ZSA9PT0gdGhpcy50aWxlcy5sZW5ndGggLSAxO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBSSVZBVEUgLSBJcyBtb3ZpbmcgZnJvbSB0aGUgbGFzdCBlbGVtZW50IHRvIHRoZSBmaXJzdFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59XG4gICAqL1xuICBfaXNHb2luZ0ZvcndhcmQgKCkge1xuICAgIHJldHVybiB0aGlzLm5leHRBY3RpdmUgPD0gdGhpcy5hY3RpdmUgJiYgdGhpcy5hY3RpdmUgPT09IHRoaXMudGlsZXMubGVuZ3RoIC0gMSAmJiB0aGlzLm5leHRBY3RpdmUgPT09IDA7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFVCTElDIC0gR2V0IGVsZW1lbnQgb2Zmc2V0IHRvcFxuICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXggLSBFbGVtZW50IHBvc2l0aW9uXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBOZWdhdGl2ZSBvZmZzZXQgaW4gcHhcbiAgICovXG4gIGdldFRpbGVPZmZzZXQgKGluZGV4KSB7XG4gICAgbGV0IG9mZnNldCA9IDA7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluZGV4OyBpKyspIHtcbiAgICAgIG9mZnNldCArPSB0aGlzLnRpbGVzW2ldLm9mZnNldEhlaWdodDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbWluVG9wIC0gb2Zmc2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBSSVZBVEUgLSBSZXNldCBhY3RpdmUgZWxlbWVudCBwb3NpdGlvblxuICAgKi9cbiAgX3Jlc2V0UG9zaXRpb24gKG1hcmdpbikge1xuICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC50b2dnbGUoRlhfTk9fVFJBTlNJVElPTik7XG4gICAgdGhpcy5fY2hhbmdlVHJhbnNmb3JtKCFpc05hTihtYXJnaW4pID8gbWFyZ2luIDogdGhpcy5ib3VuZHMuaW5pdGlhbCk7XG4gICAgLy8gRm9yY2UgcmVmbG93LCBmbHVzaGluZyB0aGUgQ1NTIGNoYW5nZXNcbiAgICB0aGlzLmNvbnRhaW5lci5vZmZzZXRIZWlnaHQ7XG4gICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LnRvZ2dsZShGWF9OT19UUkFOU0lUSU9OKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQVUJMSUMgLSBTRUxFQ1QgcHJldmlvdXMgZWxlbWVudCByZWxhdGl2ZSB0byB0aGUgY3VycmVudCBhY3RpdmUgZWxlbWVudFxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gUmV0dXJucyByZXN1bHQgaW5kZXhcbiAgICovXG4gIHByZXYgKCkge1xuICAgIHRoaXMubmV4dEFjdGl2ZSA9IHRoaXMucHJldkluZGV4O1xuICAgIHRoaXMucnVubmluZyA9IHRydWU7XG4gICAgdGhpcy5zdG9wKCk7XG5cbiAgICByZXR1cm4gdGhpcy5uZXh0QWN0aXZlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBVQkxJQyAtIFNFTEVDVCBuZXh0IGVsZW1lbnQgcmVsYXRpdmUgdG8gdGhlIGN1cnJlbnQgYWN0aXZlIGVsZW1lbnRcbiAgICogQHJldHVybiB7TnVtYmVyfSAtIFJldHVybnMgcmVzdWx0IGluZGV4XG4gICAqL1xuICBuZXh0ICgpIHtcbiAgICB0aGlzLm5leHRBY3RpdmUgPSB0aGlzLm5leHRJbmRleDtcbiAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgIHRoaXMuc3RvcCgpO1xuXG4gICAgcmV0dXJuIHRoaXMubmV4dEFjdGl2ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQUklWQVRFIC0gU3RhcnRzIHNodWZmbGluZyB0aGUgZWxlbWVudHNcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHJlcGVhdGlvbnMgLSBOdW1iZXIgb2Ygc2h1ZmZsZXMgKHVuZGVmaW5lZCB0byBtYWtlIGluZmluaXRlIGFuaW1hdGlvblxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gUmV0dXJucyByZXN1bHQgaW5kZXhcbiAgICovXG4gIF9nZXREZWxheUZyb21TcGlucyAoc3BpbnMpIHtcbiAgICBsZXQgZGVsYXkgPSB0aGlzLmRlbGF5O1xuICAgIHRoaXMudHJhbnNpdGlvbiA9ICdsaW5lYXInO1xuXG4gICAgc3dpdGNoIChzcGlucykge1xuICAgICAgY2FzZSAxOlxuICAgICAgICBkZWxheSAvPSAwLjU7XG4gICAgICAgIHRoaXMudHJhbnNpdGlvbiA9ICdlYXNlLW91dCc7XG4gICAgICAgIHRoaXMuX2FuaW1hdGlvbkZYID0gRlhfVFVSVExFO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgZGVsYXkgLz0gMC43NTtcbiAgICAgICAgdGhpcy5fYW5pbWF0aW9uRlggPSBGWF9TTE9XO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgZGVsYXkgLz0gMTtcbiAgICAgICAgdGhpcy5fYW5pbWF0aW9uRlggPSBGWF9OT1JNQUw7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA0OlxuICAgICAgICBkZWxheSAvPSAxLjI1O1xuICAgICAgICB0aGlzLl9hbmltYXRpb25GWCA9IEZYX05PUk1BTDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBkZWxheSAvPSAxLjU7XG4gICAgICAgIHRoaXMuX2FuaW1hdGlvbkZYID0gRlhfRkFTVDtcbiAgICB9XG5cbiAgICByZXR1cm4gZGVsYXk7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFVCTElDIC0gU3RhcnRzIHNodWZmbGluZyB0aGUgZWxlbWVudHNcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHJlcGVhdGlvbnMgLSBOdW1iZXIgb2Ygc2h1ZmZsZXMgKHVuZGVmaW5lZCB0byBtYWtlIGluZmluaXRlIGFuaW1hdGlvblxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gUmV0dXJucyByZXN1bHQgaW5kZXhcbiAgICovXG4gIHNodWZmbGUgKHNwaW5zLCBvbkNvbXBsZXRlKSB7XG4gICAgLy8gTWFrZSBzcGlucyBvcHRpb25hbFxuICAgIGlmICh0eXBlb2Ygc3BpbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG9uQ29tcGxldGUgPSBzcGlucztcbiAgICB9XG4gICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcbiAgICAvLyBQZXJmb3JtIGFuaW1hdGlvblxuICAgIGlmICghdGhpcy52aXNpYmxlICYmIHRoaXMuaW5WaWV3cG9ydCA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5zdG9wKG9uQ29tcGxldGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBkZWxheSA9IHRoaXMuX2dldERlbGF5RnJvbVNwaW5zKHNwaW5zKTtcbiAgICAgIC8vIHRoaXMuZGVsYXkgPSBkZWxheTtcbiAgICAgIHRoaXMuX2NoYW5nZVRyYW5zaXRpb24oZGVsYXkpO1xuICAgICAgdGhpcy5fY2hhbmdlVHJhbnNmb3JtKHRoaXMuYm91bmRzLnRvKTtcbiAgICAgIHJhZigoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5zdG9wcGluZyAmJiB0aGlzLnJ1bm5pbmcpIHtcbiAgICAgICAgICBjb25zdCBsZWZ0ID0gc3BpbnMgLSAxO1xuXG4gICAgICAgICAgdGhpcy5fcmVzZXRQb3NpdGlvbih0aGlzLmJvdW5kcy5maXJzdCk7XG5cbiAgICAgICAgICBpZiAobGVmdCA+IDEpIHtcbiAgICAgICAgICAgIC8vIFJlcGVhdCBhbmltYXRpb25cbiAgICAgICAgICAgIHRoaXMuc2h1ZmZsZShsZWZ0LCBvbkNvbXBsZXRlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdG9wKG9uQ29tcGxldGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgZGVsYXkpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm5leHRBY3RpdmU7XG4gIH1cblxuICAvKipcbiAgICogQGRlc2MgUFVCTElDIC0gU3RvcCBzaHVmZmxpbmcgdGhlIGVsZW1lbnRzXG4gICAqIEByZXR1cm4ge051bWJlcn0gLSBSZXR1cm5zIHJlc3VsdCBpbmRleFxuICAgKi9cbiAgc3RvcCAob25TdG9wKSB7XG4gICAgaWYgKCF0aGlzLnJ1bm5pbmcgfHwgdGhpcy5zdG9wcGluZykge1xuICAgICAgcmV0dXJuIHRoaXMubmV4dEFjdGl2ZTtcbiAgICB9XG5cbiAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgIHRoaXMuc3RvcHBpbmcgPSB0cnVlO1xuXG4gICAgaWYgKHRoaXMubmV4dEFjdGl2ZSA9PT0gbnVsbCkge1xuICAgICAgLy8gR2V0IHJhbmRvbSBvciBjdXN0b20gZWxlbWVudFxuICAgICAgdGhpcy5uZXh0QWN0aXZlID0gdGhpcy5jdXN0b207XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZGlyZWN0aW9uIHRvIHByZXZlbnQganVtcGluZ1xuICAgIGlmICh0aGlzLl9pc0dvaW5nQmFja3dhcmQoKSkge1xuICAgICAgdGhpcy5fcmVzZXRQb3NpdGlvbih0aGlzLmJvdW5kcy5maXJzdFRvTGFzdCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9pc0dvaW5nRm9yd2FyZCgpKSB7XG4gICAgICB0aGlzLl9yZXNldFBvc2l0aW9uKHRoaXMuYm91bmRzLmxhc3RUb0ZpcnN0KTtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgbGFzdCBjaG9vc2VuIGVsZW1lbnQgaW5kZXhcbiAgICB0aGlzLmFjdGl2ZSA9IHRoaXMubmV4dEFjdGl2ZTtcblxuICAgIC8vIFBlcmZvcm0gYW5pbWF0aW9uXG4gICAgY29uc3QgZGVsYXkgPSB0aGlzLl9nZXREZWxheUZyb21TcGlucygxKTtcbiAgICAvLyB0aGlzLmRlbGF5ID0gZGVsYXk7XG4gICAgdGhpcy5fY2hhbmdlVHJhbnNpdGlvbihkZWxheSk7XG4gICAgdGhpcy5fYW5pbWF0aW9uRlggPSBGWF9TVE9QO1xuICAgIHRoaXMuX2NoYW5nZVRyYW5zZm9ybSh0aGlzLmdldFRpbGVPZmZzZXQodGhpcy5hY3RpdmUpKTtcbiAgICByYWYoKCkgPT4ge1xuICAgICAgdGhpcy5zdG9wcGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLm5leHRBY3RpdmUgPSBudWxsO1xuXG4gICAgICBpZiAodHlwZW9mIHRoaXMub25Db21wbGV0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLm9uQ29tcGxldGUodGhpcy5hY3RpdmUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIG9uU3RvcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBvblN0b3AuYXBwbHkodGhpcywgW3RoaXMuYWN0aXZlXSk7XG4gICAgICB9XG4gICAgfSwgZGVsYXkpO1xuXG4gICAgcmV0dXJuIHRoaXMuYWN0aXZlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXNjIFBVQkxJQyAtIFN0YXJ0IHJ1biBzaHVmZmxpbmdzLCBhbmltYXRpb24gc3RvcHMgZWFjaCAzIHJlcGVhdGlvbnMuIFRoZW4gcmVzdGFydCBhbmltYXRpb24gcmVjdXJzaXZlbHlcbiAgICovXG4gIHJ1biAoKSB7XG4gICAgaWYgKHRoaXMucnVubmluZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3RpbWVyID0gbmV3IFRpbWVyKCgpID0+IHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5yYW5kb21pemUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5yYW5kb21pemUgPSAoKSA9PiB0aGlzLl9uZXh0SW5kZXg7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMudmlzaWJsZSAmJiB0aGlzLmluVmlld3BvcnQgPT09IHRydWUpIHtcbiAgICAgICAgcmFmKCgpID0+IHtcbiAgICAgICAgICB0aGlzLl90aW1lci5yZXNldCgpXG4gICAgICAgIH0sIDUwMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNodWZmbGUodGhpcy5zcGlucywgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX3RpbWVyLnJlc2V0KClcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSwgdGhpcy5hdXRvKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVzYyBQVUJMSUMgLSBEZXN0cm95IHRoZSBtYWNoaW5lXG4gICAqL1xuICBkZXN0cm95ICgpIHtcbiAgICB0aGlzLl9mYWtlRmlyc3RUaWxlLnJlbW92ZSgpO1xuICAgIHRoaXMuX2Zha2VMYXN0VGlsZS5yZW1vdmUoKTtcbiAgICB0aGlzLiR0aWxlcy51bndyYXAoKTtcblxuICAgIC8vIFVud3JhcCB0aWxlc1xuICAgIHRoaXMudGlsZXMuZm9yRWFjaCgodGlsZSkgPT4ge1xuICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRpbGUpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5jb250YWluZXIucmVtb3ZlKCk7XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gY2xhc3MgVGltZXIge1xuICBjb25zdHJ1Y3RvciAoY2IsIGRlbGF5KSB7XG4gICAgdGhpcy5jYiA9IGNiO1xuICAgIHRoaXMuaW5pdGlhbERlbGF5ID0gZGVsYXk7XG4gICAgdGhpcy5kZWxheSA9IGRlbGF5O1xuICAgIHRoaXMuc3RhcnRUaW1lID0gbnVsbDtcbiAgICB0aGlzLnRpbWVyID0gbnVsbDtcbiAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcblxuICAgIHRoaXMucmVzdW1lKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9zdGFydCAoKSB7XG4gICAgdGhpcy50aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLmNiKHRoaXMpO1xuICAgIH0sIHRoaXMuZGVsYXkpO1xuICB9XG5cbiAgY2FuY2VsICgpIHtcbiAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lcik7XG4gIH1cblxuICBwYXVzZSAoKSB7XG4gICAgaWYgKHRoaXMucnVubmluZykge1xuICAgICAgdGhpcy5kZWxheSAtPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHRoaXMuc3RhcnRUaW1lO1xuICAgICAgdGhpcy5jYW5jZWwoKTtcbiAgICB9XG4gIH1cblxuICByZXN1bWUgKCkge1xuICAgIGlmICghdGhpcy5ydW5uaW5nKSB7XG4gICAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgICAgdGhpcy5zdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgICAgdGhpcy5fc3RhcnQoKTtcbiAgICB9XG4gIH1cblxuICByZXNldCAoKSB7XG4gICAgdGhpcy5jYW5jZWwoKTtcbiAgICB0aGlzLmRlbGF5ID0gdGhpcy5pbml0aWFsRGVsYXk7XG4gICAgdGhpcy5fc3RhcnQoKTtcbiAgfVxuXG4gIGFkZCAoZXh0cmFEZWxheSkge1xuICAgIHRoaXMucGF1c2UoKTtcbiAgICB0aGlzLmRlbGF5ICs9IGV4dHJhRGVsYXk7XG4gICAgdGhpcy5yZXN1bWUoKTtcbiAgfVxufTtcbiJdfQ==
