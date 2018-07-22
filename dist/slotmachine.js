/*
 * jQuery Slot Machine v4.0.0
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

var SlotMachine = function () {
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
  }, {
    key: '_changeTransition',
    value: function _changeTransition() {
      var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.delay;
      var transition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.transition;

      this.container.style.transition = delay / 1000 + 's ' + transition;
    }
  }, {
    key: '_changeTransform',
    value: function _changeTransform(margin) {
      this.container.style.transform = 'matrix(1, 0, 0, 1, 0, ' + margin + ')';
    }
  }, {
    key: '_isGoingBackward',
    value: function _isGoingBackward() {
      return this.nextActive > this.active && this.active === 0 && this.nextActive === this.tiles.length - 1;
    }
  }, {
    key: '_isGoingForward',
    value: function _isGoingForward() {
      return this.nextActive <= this.active && this.active === this.tiles.length - 1 && this.nextActive === 0;
    }
  }, {
    key: 'getTileOffset',
    value: function getTileOffset(index) {
      var offset = 0;

      for (var i = 0; i < index; i++) {
        offset += this.tiles[i].offsetHeight;
      }

      return this._minTop - offset;
    }
  }, {
    key: '_resetPosition',
    value: function _resetPosition(margin) {
      this.container.classList.toggle(FX_NO_TRANSITION);
      this._changeTransform(!isNaN(margin) ? margin : this.bounds.initial);
      // Force reflow, flushing the CSS changes
      this.container.offsetHeight;
      this.container.classList.toggle(FX_NO_TRANSITION);
    }
  }, {
    key: 'prev',
    value: function prev() {
      this.nextActive = this.prevIndex;
      this.running = true;
      this.stop();

      return this.nextActive;
    }
  }, {
    key: 'next',
    value: function next() {
      this.nextActive = this.nextIndex;
      this.running = true;
      this.stop();

      return this.nextActive;
    }
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
  }, {
    key: 'stop',
    value: function stop(onStop) {
      var _this4 = this;

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
  }, {
    key: 'run',
    value: function run() {
      var _this5 = this;

      if (this.running) {
        return;
      }

      this._timer = new Timer(function () {
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
    },
    set: function set(index) {
      index = Number(index);
      if (index < 0 || index >= this.tiles.length || isNaN(index)) {
        index = 0;
      }
      this._active = index;
    }
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
  }, {
    key: 'bounds',
    get: function get() {
      return this._bounds[this._direction];
    }
  }, {
    key: 'transition',
    get: function get() {
      return this._transition;
    },
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
  }, {
    key: 'random',
    get: function get() {
      return Math.floor(Math.random() * this.tiles.length);
    }
  }, {
    key: 'custom',
    get: function get() {
      var choosen = void 0;

      if (this.randomize) {
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
  }, {
    key: '_prevIndex',
    get: function get() {
      var prevIndex = this.active - 1;

      return prevIndex < 0 ? this.tiles.length - 1 : prevIndex;
    }
  }, {
    key: '_nextIndex',
    get: function get() {
      var nextIndex = this.active + 1;

      return nextIndex < this.tiles.length ? nextIndex : 0;
    }
  }, {
    key: 'prevIndex',
    get: function get() {
      return this.direction === 'up' ? this._nextIndex : this._prevIndex;
    }
  }, {
    key: 'nextIndex',
    get: function get() {
      return this.direction === 'up' ? this._prevIndex : this._nextIndex;
    }
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

module.exports = SlotMachine;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvaW5kZXguanMiLCJsaWIvcmFmLmpzIiwibGliL3Nsb3QtbWFjaGluZS5qcyIsImxpYi90aW1lci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsT0FBTyxXQUFQLEdBQXFCLFFBQVEsZ0JBQVIsQ0FBckI7Ozs7O0FDQUEsSUFBTSxPQUFPLE9BQU8scUJBQVAsSUFBZ0MsT0FBTyx3QkFBdkMsSUFBbUUsT0FBTywyQkFBMUUsSUFBeUcsT0FBTyx1QkFBN0g7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFNBQVMsR0FBVCxDQUFjLEVBQWQsRUFBK0I7QUFBQSxNQUFiLE9BQWEsdUVBQUgsQ0FBRzs7QUFDOUMsYUFBVztBQUFBLFdBQU0sS0FBSyxFQUFMLENBQU47QUFBQSxHQUFYLEVBQTJCLE9BQTNCO0FBQ0QsQ0FGRDs7Ozs7Ozs7Ozs7QUNGQSxJQUFNLFFBQVEsUUFBUSxTQUFSLENBQWQ7QUFDQSxJQUFNLE1BQU0sUUFBUSxPQUFSLENBQVo7O0FBRUEsSUFBTSxXQUFXO0FBQ2YsVUFBUSxDQURPLEVBQ0o7QUFDWCxTQUFPLEdBRlEsRUFFSDtBQUNaLFFBQU0sS0FIUyxFQUdGO0FBQ2IsU0FBTyxDQUpRLEVBSUw7QUFDVixhQUFXLElBTEksRUFLRTtBQUNqQixjQUFZLElBTkcsRUFNRztBQUNsQixjQUFZLElBUEcsRUFPRztBQUNsQixhQUFXLElBUkksRUFRRTtBQUNqQixjQUFZO0FBVEcsQ0FBakI7QUFXQSxJQUFNLG1CQUFtQix5QkFBekI7QUFDQSxJQUFNLFVBQVUscUJBQWhCO0FBQ0EsSUFBTSxZQUFZLHVCQUFsQjtBQUNBLElBQU0sVUFBVSxxQkFBaEI7QUFDQSxJQUFNLFlBQVksdUJBQWxCO0FBQ0EsSUFBTSxjQUFjLHFCQUFwQjtBQUNBLElBQU0sVUFBVSxXQUFoQjs7SUFFTSxXO0FBQ0osdUJBQWEsT0FBYixFQUFzQixPQUF0QixFQUErQjtBQUFBOztB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Q0Q7O0FBWkg7QUFBQTtBQUFBLDZCQWNZO0FBQUE7O0FBQ1IsV0FBSyxLQUFMLEdBQWEsV0FBVyxZQUFNO0FBQzVCLGNBQUssT0FBTCxHQUFlLEtBQWY7QUFDQSxjQUFLLEVBQUw7QUFDRCxPQUhZLEVBR1YsS0FBSyxLQUhLLENBQWI7QUFJRDtBQW5CSDtBQUFBO0FBQUEsNkJBcUJZO0FBQ1IsV0FBSyxPQUFMLEdBQWUsS0FBZjtBQUNBLG1CQUFhLEtBQUssS0FBbEI7QUFDRDtBQXhCSDtBQUFBO0FBQUEsNEJBMEJXO0FBQ1AsVUFBSSxLQUFLLE9BQVQsRUFBa0I7QUFDaEIsYUFBSyxLQUFMLElBQWMsSUFBSSxJQUFKLEdBQVcsT0FBWCxLQUF1QixLQUFLLFNBQTFDO0FBQ0EsYUFBSyxNQUFMO0FBQ0Q7QUFDRjtBQS9CSDtBQUFBO0FBQUEsNkJBaUNZO0FBQ1IsVUFBSSxDQUFDLEtBQUssT0FBVixFQUFtQjtBQUNqQixhQUFLLE9BQUwsR0FBZSxJQUFmO0FBQ0EsYUFBSyxTQUFMLEdBQWlCLElBQUksSUFBSixHQUFXLE9BQVgsRUFBakI7O0FBRUEsYUFBSyxNQUFMO0FBQ0Q7QUFDRjtBQXhDSDtBQUFBO0FBQUEsNEJBMENXO0FBQ1AsV0FBSyxNQUFMO0FBQ0EsV0FBSyxLQUFMLEdBQWEsS0FBSyxZQUFsQjtBQUNBLFdBQUssTUFBTDtBQUNEO0FBOUNIO0FBQUE7QUFBQSx3QkFnRE8sVUFoRFAsRUFnRG1CO0FBQ2YsV0FBSyxLQUFMO0FBQ0EsV0FBSyxLQUFMLElBQWMsVUFBZDtBQUNBLFdBQUssTUFBTDtBQUNEO0FBcERIOztBQUFBO0FBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfXJldHVybiBlfSkoKSIsIndpbmRvdy5TbG90TWFjaGluZSA9IHJlcXVpcmUoJy4vc2xvdC1tYWNoaW5lJyk7XG4iLCJjb25zdCBfcmFmID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHJhZiAoY2IsIHRpbWVvdXQgPSAwKSB7XG4gIHNldFRpbWVvdXQoKCkgPT4gX3JhZihjYiksIHRpbWVvdXQpO1xufTtcbiIsImNvbnN0IFRpbWVyID0gcmVxdWlyZSgnLi90aW1lcicpO1xuY29uc3QgcmFmID0gcmVxdWlyZSgnLi9yYWYnKTtcblxuY29uc3QgZGVmYXVsdHMgPSB7XG4gIGFjdGl2ZTogMCwgLy8gQWN0aXZlIGVsZW1lbnQgW051bWJlcl1cbiAgZGVsYXk6IDIwMCwgLy8gQW5pbWF0aW9uIHRpbWUgW051bWJlcl1cbiAgYXV0bzogZmFsc2UsIC8vIFJlcGVhdCBkZWxheSBbZmFsc2V8fE51bWJlcl1cbiAgc3BpbnM6IDUsIC8vIE51bWJlciBvZiBzcGlucyB3aGVuIGF1dG8gW051bWJlcl1cbiAgcmFuZG9taXplOiBudWxsLCAvLyBSYW5kb21pemUgZnVuY3Rpb24sIG11c3QgcmV0dXJuIGEgbnVtYmVyIHdpdGggdGhlIHNlbGVjdGVkIHBvc2l0aW9uXG4gIG9uQ29tcGxldGU6IG51bGwsIC8vIENhbGxiYWNrIGZ1bmN0aW9uKHJlc3VsdClcbiAgaW5WaWV3cG9ydDogdHJ1ZSwgLy8gU3RvcHMgYW5pbWF0aW9ucyBpZiB0aGUgZWxlbWVudCBpc27CtHQgdmlzaWJsZSBvbiB0aGUgc2NyZWVuXG4gIGRpcmVjdGlvbjogJ3VwJywgLy8gQW5pbWF0aW9uIGRpcmVjdGlvbiBbJ3VwJ3x8J2Rvd24nXVxuICB0cmFuc2l0aW9uOiAnZWFzZS1pbi1vdXQnXG59O1xuY29uc3QgRlhfTk9fVFJBTlNJVElPTiA9ICdzbG90TWFjaGluZU5vVHJhbnNpdGlvbic7XG5jb25zdCBGWF9GQVNUID0gJ3Nsb3RNYWNoaW5lQmx1ckZhc3QnO1xuY29uc3QgRlhfTk9STUFMID0gJ3Nsb3RNYWNoaW5lQmx1ck1lZGl1bSc7XG5jb25zdCBGWF9TTE9XID0gJ3Nsb3RNYWNoaW5lQmx1clNsb3cnO1xuY29uc3QgRlhfVFVSVExFID0gJ3Nsb3RNYWNoaW5lQmx1clR1cnRsZSc7XG5jb25zdCBGWF9HUkFESUVOVCA9ICdzbG90TWFjaGluZUdyYWRpZW50JztcbmNvbnN0IEZYX1NUT1AgPSBGWF9HUkFESUVOVDtcblxuY2xhc3MgU2xvdE1hY2hpbmUge1xuICBjb25zdHJ1Y3RvciAoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgLy8gU2xvdCBNYWNoaW5lIGVsZW1lbnRzXG4gICAgdGhpcy50aWxlcyA9IFtdLnNsaWNlLmNhbGwodGhpcy5lbGVtZW50LmNoaWxkcmVuKTtcbiAgICAvLyBNYWNoaW5lIGlzIHJ1bm5pbmc/XG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgLy8gTWFjaGluZSBpcyBzdG9wcGluZz9cbiAgICB0aGlzLnN0b3BwaW5nID0gZmFsc2U7XG4gICAgLy8gRGlzYWJsZSBvdmVyZmxvd1xuICAgIHRoaXMuZWxlbWVudC5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuICAgIC8vIFdyYXAgZWxlbWVudHMgaW5zaWRlIGNvbnRhaW5lclxuICAgIHRoaXMuX3dyYXBUaWxlcygpO1xuICAgIC8vIFNldCBtaW4gdG9wIG9mZnNldFxuICAgIHRoaXMuX21pblRvcCA9IC10aGlzLl9mYWtlRmlyc3RUaWxlLm9mZnNldEhlaWdodDtcbiAgICAvLyBTZXQgbWF4IHRvcCBvZmZzZXRcbiAgICB0aGlzLl9tYXhUb3AgPSAtdGhpcy50aWxlcy5yZWR1Y2UoKGFjYywgdGlsZSkgPT4gKGFjYyArIHRpbGUub2Zmc2V0SGVpZ2h0KSwgMCk7XG4gICAgLy8gQ2FsbCBzZXR0ZXJzIGlmIG5lY2Nlc2FyeVxuICAgIHRoaXMuY2hhbmdlU2V0dGluZ3MoT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIG9wdGlvbnMpKTtcbiAgICAvLyBJbml0aWFsaXplIHNwaW4gZGlyZWN0aW9uIFt1cCwgZG93bl1cbiAgICB0aGlzLl9zZXRCb3VuZHMoKTtcbiAgICAvLyBTaG93IGFjdGl2ZSBlbGVtZW50XG4gICAgdGhpcy5fcmVzZXRQb3NpdGlvbigpO1xuICAgIC8vIFN0YXJ0IGF1dG8gYW5pbWF0aW9uXG4gICAgaWYgKHRoaXMuYXV0byAhPT0gZmFsc2UpIHtcbiAgICAgIHRoaXMucnVuKCk7XG4gICAgfVxuICB9XG5cbiAgY2hhbmdlU2V0dGluZ3MgKHNldHRpbmdzKSB7XG4gICAgT2JqZWN0LmtleXMoc2V0dGluZ3MpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgLy8gVHJpZ2dlciBzZXR0ZXJzXG4gICAgICB0aGlzW2tleV0gPSBzZXR0aW5nc1trZXldO1xuICAgIH0pO1xuICB9XG5cbiAgX3dyYXBUaWxlcyAoKSB7XG4gICAgdGhpcy5jb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdzbG90TWFjaGluZUNvbnRhaW5lcicpO1xuICAgIHRoaXMuY29udGFpbmVyLnN0eWxlLnRyYW5zaXRpb24gPSAnMXMgZWFzZS1pbi1vdXQnO1xuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmNvbnRhaW5lcik7XG5cbiAgICB0aGlzLl9mYWtlRmlyc3RUaWxlID0gdGhpcy50aWxlc1t0aGlzLnRpbGVzLmxlbmd0aCAtIDFdLmNsb25lTm9kZSh0cnVlKTtcbiAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9mYWtlRmlyc3RUaWxlKTtcblxuICAgIHRoaXMudGlsZXMuZm9yRWFjaCgodGlsZSkgPT4ge1xuICAgICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGlsZSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9mYWtlTGFzdFRpbGUgPSB0aGlzLnRpbGVzWzBdLmNsb25lTm9kZSh0cnVlKTtcbiAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLl9mYWtlTGFzdFRpbGUpO1xuICB9XG5cbiAgX3NldEJvdW5kcyAoKSB7XG4gICAgY29uc3QgaW5pdGlhbCA9IHRoaXMuZ2V0VGlsZU9mZnNldCh0aGlzLmFjdGl2ZSk7XG4gICAgY29uc3QgZmlyc3QgPSB0aGlzLmdldFRpbGVPZmZzZXQodGhpcy50aWxlcy5sZW5ndGgpO1xuICAgIGNvbnN0IGxhc3QgPSB0aGlzLmdldFRpbGVPZmZzZXQodGhpcy50aWxlcy5sZW5ndGgpO1xuXG4gICAgdGhpcy5fYm91bmRzID0ge1xuICAgICAgdXA6IHtcbiAgICAgICAga2V5OiAndXAnLFxuICAgICAgICBpbml0aWFsLFxuICAgICAgICBmaXJzdDogMCxcbiAgICAgICAgbGFzdCxcbiAgICAgICAgdG86IHRoaXMuX21heFRvcCxcbiAgICAgICAgZmlyc3RUb0xhc3Q6IGxhc3QsXG4gICAgICAgIGxhc3RUb0ZpcnN0OiAwXG4gICAgICB9LFxuICAgICAgZG93bjoge1xuICAgICAgICBrZXk6ICdkb3duJyxcbiAgICAgICAgaW5pdGlhbCxcbiAgICAgICAgZmlyc3QsXG4gICAgICAgIGxhc3Q6IDAsXG4gICAgICAgIHRvOiB0aGlzLl9taW5Ub3AsXG4gICAgICAgIGZpcnN0VG9MYXN0OiBsYXN0LFxuICAgICAgICBsYXN0VG9GaXJzdDogMFxuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBnZXQgYWN0aXZlICgpIHtcbiAgICByZXR1cm4gdGhpcy5fYWN0aXZlO1xuICB9XG5cbiAgZ2V0IGRpcmVjdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RpcmVjdGlvbjtcbiAgfVxuXG4gIGdldCBib3VuZHMgKCkge1xuICAgIHJldHVybiB0aGlzLl9ib3VuZHNbdGhpcy5fZGlyZWN0aW9uXTtcbiAgfVxuXG4gIGdldCB0cmFuc2l0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fdHJhbnNpdGlvbjtcbiAgfVxuXG4gIGdldCB2aXNpYmxlVGlsZSAoKSB7XG4gICAgY29uc3QgZmlyc3RUaWxlSGVpZ2h0ID0gdGhpcy50aWxlc1swXS5vZmZzZXRIZWlnaHQ7XG4gICAgY29uc3QgcmF3Q29udGFpbmVyTWFyZ2luID0gdGhpcy5jb250YWluZXIuc3R5bGUudHJhbnNmb3JtIHx8ICcnO1xuICAgIGNvbnN0IG1hdHJpeFJlZ0V4cCA9IC9ebWF0cml4XFwoLT9cXGQrLFxccz8tP1xcZCssXFxzPy0/XFxkKyxcXHM/LT9cXGQrLFxccz8tP1xcZCssXFxzPygtP1xcZCspXFwpJC87XG4gICAgY29uc3QgY29udGFpbmVyTWFyZ2luID0gcGFyc2VJbnQocmF3Q29udGFpbmVyTWFyZ2luLnJlcGxhY2UobWF0cml4UmVnRXhwLCAnJDEnKSwgMTApO1xuXG4gICAgcmV0dXJuIE1hdGguYWJzKE1hdGgucm91bmQoY29udGFpbmVyTWFyZ2luIC8gZmlyc3RUaWxlSGVpZ2h0KSkgLSAxO1xuICB9XG5cbiAgZ2V0IHJhbmRvbSAoKSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMudGlsZXMubGVuZ3RoKTtcbiAgfVxuXG4gIGdldCBjdXN0b20gKCkge1xuICAgIGxldCBjaG9vc2VuO1xuXG4gICAgaWYgKHRoaXMucmFuZG9taXplKSB7XG4gICAgICBsZXQgaW5kZXggPSB0aGlzLnJhbmRvbWl6ZSh0aGlzLmFjdGl2ZSk7XG4gICAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHRoaXMudGlsZXMubGVuZ3RoKSB7XG4gICAgICAgIGluZGV4ID0gMDtcbiAgICAgIH1cbiAgICAgIGNob29zZW4gPSBpbmRleDtcbiAgICB9IGVsc2Uge1xuICAgICAgY2hvb3NlbiA9IHRoaXMucmFuZG9tO1xuICAgIH1cblxuICAgIHJldHVybiBjaG9vc2VuO1xuICB9XG5cbiAgZ2V0IF9wcmV2SW5kZXggKCkge1xuICAgIGNvbnN0IHByZXZJbmRleCA9IHRoaXMuYWN0aXZlIC0gMTtcblxuICAgIHJldHVybiBwcmV2SW5kZXggPCAwID8gKHRoaXMudGlsZXMubGVuZ3RoIC0gMSkgOiBwcmV2SW5kZXg7XG4gIH1cblxuICBnZXQgX25leHRJbmRleCAoKSB7XG4gICAgY29uc3QgbmV4dEluZGV4ID0gdGhpcy5hY3RpdmUgKyAxO1xuXG4gICAgcmV0dXJuIG5leHRJbmRleCA8IHRoaXMudGlsZXMubGVuZ3RoID8gbmV4dEluZGV4IDogMDtcbiAgfVxuXG4gIGdldCBwcmV2SW5kZXggKCkge1xuICAgIHJldHVybiB0aGlzLmRpcmVjdGlvbiA9PT0gJ3VwJyA/IHRoaXMuX25leHRJbmRleCA6IHRoaXMuX3ByZXZJbmRleDtcbiAgfVxuXG4gIGdldCBuZXh0SW5kZXggKCkge1xuICAgIHJldHVybiB0aGlzLmRpcmVjdGlvbiA9PT0gJ3VwJyA/IHRoaXMuX3ByZXZJbmRleCA6IHRoaXMuX25leHRJbmRleDtcbiAgfVxuXG4gIGdldCB2aXNpYmxlICgpIHtcbiAgICBjb25zdCByZWN0ID0gdGhpcy5lbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHdpbmRvd0hlaWdodCA9ICh3aW5kb3cuaW5uZXJIZWlnaHQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCk7XG4gICAgY29uc3Qgd2luZG93V2lkdGggPSAod2luZG93LmlubmVyV2lkdGggfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoKTtcbiAgICBjb25zdCB2ZXJ0SW5WaWV3ID0gKHJlY3QudG9wIDw9IHdpbmRvd0hlaWdodCkgJiYgKChyZWN0LnRvcCArIHJlY3QuaGVpZ2h0KSA+PSAwKTtcbiAgICBjb25zdCBob3JJblZpZXcgPSAocmVjdC5sZWZ0IDw9IHdpbmRvd1dpZHRoKSAmJiAoKHJlY3QubGVmdCArIHJlY3Qud2lkdGgpID49IDApO1xuXG4gICAgcmV0dXJuIHZlcnRJblZpZXcgJiYgaG9ySW5WaWV3O1xuICB9XG5cbiAgc2V0IGFjdGl2ZSAoaW5kZXgpIHtcbiAgICBpbmRleCA9IE51bWJlcihpbmRleCk7XG4gICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLnRpbGVzLmxlbmd0aCB8fCBpc05hTihpbmRleCkpIHtcbiAgICAgIGluZGV4ID0gMDtcbiAgICB9XG4gICAgdGhpcy5fYWN0aXZlID0gaW5kZXg7XG4gIH1cblxuICBzZXQgZGlyZWN0aW9uIChkaXJlY3Rpb24pIHtcbiAgICBpZiAoIXRoaXMucnVubmluZykge1xuICAgICAgdGhpcy5fZGlyZWN0aW9uID0gZGlyZWN0aW9uID09PSAnZG93bicgPyAnZG93bicgOiAndXAnO1xuICAgIH1cbiAgfVxuXG4gIHNldCBfYW5pbWF0aW9uRlggKEZYX1NQRUVEKSB7XG4gICAgY29uc3QgZGVsYXkgPSB0aGlzLmRlbGF5IC8gNDtcblxuICAgIHJhZigoKSA9PiB7XG4gICAgICBbLi4udGhpcy50aWxlcywgdGhpcy5fZmFrZUxhc3RUaWxlLCB0aGlzLl9mYWtlRmlyc3RUaWxlXS5mb3JFYWNoKCh0aWxlKSA9PiB7XG4gICAgICAgIHRpbGUuY2xhc3NMaXN0LnJlbW92ZShGWF9GQVNULCBGWF9OT1JNQUwsIEZYX1NMT1csIEZYX1RVUlRMRSk7XG4gICAgICAgIGlmIChGWF9TUEVFRCAhPT0gRlhfU1RPUCkge1xuICAgICAgICAgIHRpbGUuY2xhc3NMaXN0LmFkZChGWF9TUEVFRCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAoRlhfU1BFRUQgPT09IEZYX1NUT1ApIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LnJlbW92ZShGWF9HUkFESUVOVCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QuYWRkKEZYX0dSQURJRU5UKTtcbiAgICAgIH1cbiAgICB9LCBkZWxheSk7XG4gIH1cblxuICBzZXQgdHJhbnNpdGlvbiAodHJhbnNpdGlvbikge1xuICAgIHRoaXMuX3RyYW5zaXRpb24gPSB0cmFuc2l0aW9uIHx8ICdlYXNlLWluLW91dCc7XG4gIH1cblxuICBfY2hhbmdlVHJhbnNpdGlvbiAoZGVsYXkgPSB0aGlzLmRlbGF5LCB0cmFuc2l0aW9uID0gdGhpcy50cmFuc2l0aW9uKSB7XG4gICAgdGhpcy5jb250YWluZXIuc3R5bGUudHJhbnNpdGlvbiA9IGAke2RlbGF5IC8gMTAwMH1zICR7dHJhbnNpdGlvbn1gO1xuICB9XG5cbiAgX2NoYW5nZVRyYW5zZm9ybSAobWFyZ2luKSB7XG4gICAgdGhpcy5jb250YWluZXIuc3R5bGUudHJhbnNmb3JtID0gYG1hdHJpeCgxLCAwLCAwLCAxLCAwLCAke21hcmdpbn0pYDtcbiAgfVxuXG4gIF9pc0dvaW5nQmFja3dhcmQgKCkge1xuICAgIHJldHVybiB0aGlzLm5leHRBY3RpdmUgPiB0aGlzLmFjdGl2ZSAmJiB0aGlzLmFjdGl2ZSA9PT0gMCAmJiB0aGlzLm5leHRBY3RpdmUgPT09IHRoaXMudGlsZXMubGVuZ3RoIC0gMTtcbiAgfVxuXG4gIF9pc0dvaW5nRm9yd2FyZCAoKSB7XG4gICAgcmV0dXJuIHRoaXMubmV4dEFjdGl2ZSA8PSB0aGlzLmFjdGl2ZSAmJiB0aGlzLmFjdGl2ZSA9PT0gdGhpcy50aWxlcy5sZW5ndGggLSAxICYmIHRoaXMubmV4dEFjdGl2ZSA9PT0gMDtcbiAgfVxuXG4gIGdldFRpbGVPZmZzZXQgKGluZGV4KSB7XG4gICAgbGV0IG9mZnNldCA9IDA7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluZGV4OyBpKyspIHtcbiAgICAgIG9mZnNldCArPSB0aGlzLnRpbGVzW2ldLm9mZnNldEhlaWdodDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbWluVG9wIC0gb2Zmc2V0O1xuICB9XG5cbiAgX3Jlc2V0UG9zaXRpb24gKG1hcmdpbikge1xuICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC50b2dnbGUoRlhfTk9fVFJBTlNJVElPTik7XG4gICAgdGhpcy5fY2hhbmdlVHJhbnNmb3JtKCFpc05hTihtYXJnaW4pID8gbWFyZ2luIDogdGhpcy5ib3VuZHMuaW5pdGlhbCk7XG4gICAgLy8gRm9yY2UgcmVmbG93LCBmbHVzaGluZyB0aGUgQ1NTIGNoYW5nZXNcbiAgICB0aGlzLmNvbnRhaW5lci5vZmZzZXRIZWlnaHQ7XG4gICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LnRvZ2dsZShGWF9OT19UUkFOU0lUSU9OKTtcbiAgfVxuXG4gIHByZXYgKCkge1xuICAgIHRoaXMubmV4dEFjdGl2ZSA9IHRoaXMucHJldkluZGV4O1xuICAgIHRoaXMucnVubmluZyA9IHRydWU7XG4gICAgdGhpcy5zdG9wKCk7XG5cbiAgICByZXR1cm4gdGhpcy5uZXh0QWN0aXZlO1xuICB9XG5cbiAgbmV4dCAoKSB7XG4gICAgdGhpcy5uZXh0QWN0aXZlID0gdGhpcy5uZXh0SW5kZXg7XG4gICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcbiAgICB0aGlzLnN0b3AoKTtcblxuICAgIHJldHVybiB0aGlzLm5leHRBY3RpdmU7XG4gIH1cblxuICBfZ2V0RGVsYXlGcm9tU3BpbnMgKHNwaW5zKSB7XG4gICAgbGV0IGRlbGF5ID0gdGhpcy5kZWxheTtcbiAgICB0aGlzLnRyYW5zaXRpb24gPSAnbGluZWFyJztcblxuICAgIHN3aXRjaCAoc3BpbnMpIHtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgZGVsYXkgLz0gMC41O1xuICAgICAgICB0aGlzLnRyYW5zaXRpb24gPSAnZWFzZS1vdXQnO1xuICAgICAgICB0aGlzLl9hbmltYXRpb25GWCA9IEZYX1RVUlRMRTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGRlbGF5IC89IDAuNzU7XG4gICAgICAgIHRoaXMuX2FuaW1hdGlvbkZYID0gRlhfU0xPVztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGRlbGF5IC89IDE7XG4gICAgICAgIHRoaXMuX2FuaW1hdGlvbkZYID0gRlhfTk9STUFMO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNDpcbiAgICAgICAgZGVsYXkgLz0gMS4yNTtcbiAgICAgICAgdGhpcy5fYW5pbWF0aW9uRlggPSBGWF9OT1JNQUw7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZGVsYXkgLz0gMS41O1xuICAgICAgICB0aGlzLl9hbmltYXRpb25GWCA9IEZYX0ZBU1Q7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlbGF5O1xuICB9XG5cbiAgc2h1ZmZsZSAoc3BpbnMsIG9uQ29tcGxldGUpIHtcbiAgICAvLyBNYWtlIHNwaW5zIG9wdGlvbmFsXG4gICAgaWYgKHR5cGVvZiBzcGlucyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgb25Db21wbGV0ZSA9IHNwaW5zO1xuICAgIH1cbiAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgIC8vIFBlcmZvcm0gYW5pbWF0aW9uXG4gICAgaWYgKCF0aGlzLnZpc2libGUgJiYgdGhpcy5pblZpZXdwb3J0ID09PSB0cnVlKSB7XG4gICAgICB0aGlzLnN0b3Aob25Db21wbGV0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGRlbGF5ID0gdGhpcy5fZ2V0RGVsYXlGcm9tU3BpbnMoc3BpbnMpO1xuICAgICAgLy8gdGhpcy5kZWxheSA9IGRlbGF5O1xuICAgICAgdGhpcy5fY2hhbmdlVHJhbnNpdGlvbihkZWxheSk7XG4gICAgICB0aGlzLl9jaGFuZ2VUcmFuc2Zvcm0odGhpcy5ib3VuZHMudG8pO1xuICAgICAgcmFmKCgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnN0b3BwaW5nICYmIHRoaXMucnVubmluZykge1xuICAgICAgICAgIGNvbnN0IGxlZnQgPSBzcGlucyAtIDE7XG5cbiAgICAgICAgICB0aGlzLl9yZXNldFBvc2l0aW9uKHRoaXMuYm91bmRzLmZpcnN0KTtcblxuICAgICAgICAgIGlmIChsZWZ0ID4gMSkge1xuICAgICAgICAgICAgLy8gUmVwZWF0IGFuaW1hdGlvblxuICAgICAgICAgICAgdGhpcy5zaHVmZmxlKGxlZnQsIG9uQ29tcGxldGUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN0b3Aob25Db21wbGV0ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCBkZWxheSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubmV4dEFjdGl2ZTtcbiAgfVxuXG4gIHN0b3AgKG9uU3RvcCkge1xuICAgIGlmICghdGhpcy5ydW5uaW5nIHx8IHRoaXMuc3RvcHBpbmcpIHtcbiAgICAgIHJldHVybiB0aGlzLm5leHRBY3RpdmU7XG4gICAgfVxuXG4gICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcbiAgICB0aGlzLnN0b3BwaW5nID0gdHJ1ZTtcblxuICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcih0aGlzLm5leHRBY3RpdmUpKSB7XG4gICAgICAvLyBHZXQgcmFuZG9tIG9yIGN1c3RvbSBlbGVtZW50XG4gICAgICB0aGlzLm5leHRBY3RpdmUgPSB0aGlzLmN1c3RvbTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBkaXJlY3Rpb24gdG8gcHJldmVudCBqdW1waW5nXG4gICAgaWYgKHRoaXMuX2lzR29pbmdCYWNrd2FyZCgpKSB7XG4gICAgICB0aGlzLl9yZXNldFBvc2l0aW9uKHRoaXMuYm91bmRzLmZpcnN0VG9MYXN0KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2lzR29pbmdGb3J3YXJkKCkpIHtcbiAgICAgIHRoaXMuX3Jlc2V0UG9zaXRpb24odGhpcy5ib3VuZHMubGFzdFRvRmlyc3QpO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSBsYXN0IGNob29zZW4gZWxlbWVudCBpbmRleFxuICAgIHRoaXMuYWN0aXZlID0gdGhpcy5uZXh0QWN0aXZlO1xuXG4gICAgLy8gUGVyZm9ybSBhbmltYXRpb25cbiAgICBjb25zdCBkZWxheSA9IHRoaXMuX2dldERlbGF5RnJvbVNwaW5zKDEpO1xuICAgIC8vIHRoaXMuZGVsYXkgPSBkZWxheTtcbiAgICB0aGlzLl9jaGFuZ2VUcmFuc2l0aW9uKGRlbGF5KTtcbiAgICB0aGlzLl9hbmltYXRpb25GWCA9IEZYX1NUT1A7XG4gICAgdGhpcy5fY2hhbmdlVHJhbnNmb3JtKHRoaXMuZ2V0VGlsZU9mZnNldCh0aGlzLmFjdGl2ZSkpO1xuICAgIHJhZigoKSA9PiB7XG4gICAgICB0aGlzLnN0b3BwaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMubmV4dEFjdGl2ZSA9IG51bGw7XG5cbiAgICAgIGlmICh0eXBlb2YgdGhpcy5vbkNvbXBsZXRlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMub25Db21wbGV0ZSh0aGlzLmFjdGl2ZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2Ygb25TdG9wID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIG9uU3RvcC5hcHBseSh0aGlzLCBbdGhpcy5hY3RpdmVdKTtcbiAgICAgIH1cbiAgICB9LCBkZWxheSk7XG5cbiAgICByZXR1cm4gdGhpcy5hY3RpdmU7XG4gIH1cblxuICBydW4gKCkge1xuICAgIGlmICh0aGlzLnJ1bm5pbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl90aW1lciA9IG5ldyBUaW1lcigoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMudmlzaWJsZSAmJiB0aGlzLmluVmlld3BvcnQgPT09IHRydWUpIHtcbiAgICAgICAgcmFmKCgpID0+IHtcbiAgICAgICAgICB0aGlzLl90aW1lci5yZXNldCgpXG4gICAgICAgIH0sIDUwMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNodWZmbGUodGhpcy5zcGlucywgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX3RpbWVyLnJlc2V0KClcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSwgdGhpcy5hdXRvKTtcbiAgfVxuXG4gIGRlc3Ryb3kgKCkge1xuICAgIHRoaXMuX2Zha2VGaXJzdFRpbGUucmVtb3ZlKCk7XG4gICAgdGhpcy5fZmFrZUxhc3RUaWxlLnJlbW92ZSgpO1xuICAgIHRoaXMuJHRpbGVzLnVud3JhcCgpO1xuXG4gICAgLy8gVW53cmFwIHRpbGVzXG4gICAgdGhpcy50aWxlcy5mb3JFYWNoKCh0aWxlKSA9PiB7XG4gICAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGlsZSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmNvbnRhaW5lci5yZW1vdmUoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNsb3RNYWNoaW5lO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBUaW1lciB7XG4gIGNvbnN0cnVjdG9yIChjYiwgZGVsYXkpIHtcbiAgICB0aGlzLmNiID0gY2I7XG4gICAgdGhpcy5pbml0aWFsRGVsYXkgPSBkZWxheTtcbiAgICB0aGlzLmRlbGF5ID0gZGVsYXk7XG4gICAgdGhpcy5zdGFydFRpbWUgPSBudWxsO1xuICAgIHRoaXMudGltZXIgPSBudWxsO1xuICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuXG4gICAgdGhpcy5yZXN1bWUoKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX3N0YXJ0ICgpIHtcbiAgICB0aGlzLnRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuY2IodGhpcyk7XG4gICAgfSwgdGhpcy5kZWxheSk7XG4gIH1cblxuICBjYW5jZWwgKCkge1xuICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVyKTtcbiAgfVxuXG4gIHBhdXNlICgpIHtcbiAgICBpZiAodGhpcy5ydW5uaW5nKSB7XG4gICAgICB0aGlzLmRlbGF5IC09IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gdGhpcy5zdGFydFRpbWU7XG4gICAgICB0aGlzLmNhbmNlbCgpO1xuICAgIH1cbiAgfVxuXG4gIHJlc3VtZSAoKSB7XG4gICAgaWYgKCF0aGlzLnJ1bm5pbmcpIHtcbiAgICAgIHRoaXMucnVubmluZyA9IHRydWU7XG4gICAgICB0aGlzLnN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgICB0aGlzLl9zdGFydCgpO1xuICAgIH1cbiAgfVxuXG4gIHJlc2V0ICgpIHtcbiAgICB0aGlzLmNhbmNlbCgpO1xuICAgIHRoaXMuZGVsYXkgPSB0aGlzLmluaXRpYWxEZWxheTtcbiAgICB0aGlzLl9zdGFydCgpO1xuICB9XG5cbiAgYWRkIChleHRyYURlbGF5KSB7XG4gICAgdGhpcy5wYXVzZSgpO1xuICAgIHRoaXMuZGVsYXkgKz0gZXh0cmFEZWxheTtcbiAgICB0aGlzLnJlc3VtZSgpO1xuICB9XG59O1xuIl19
