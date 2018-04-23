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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvaW5kZXguanMiLCJsaWIvcmFmLmpzIiwibGliL3Nsb3QtbWFjaGluZS5qcyIsImxpYi90aW1lci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsT0FBTyxXQUFQLEdBQXFCLFFBQVEsZ0JBQVIsQ0FBckI7Ozs7O0FDQUEsSUFBTSxPQUFPLE9BQU8scUJBQVAsSUFBZ0MsT0FBTyx3QkFBdkMsSUFBbUUsT0FBTywyQkFBMUUsSUFBeUcsT0FBTyx1QkFBN0g7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFNBQVMsR0FBVCxDQUFjLEVBQWQsRUFBK0I7QUFBQSxNQUFiLE9BQWEsdUVBQUgsQ0FBRzs7QUFDOUMsYUFBVztBQUFBLFdBQU0sS0FBSyxFQUFMLENBQU47QUFBQSxHQUFYLEVBQTJCLE9BQTNCO0FBQ0QsQ0FGRDs7Ozs7Ozs7Ozs7QUNGQSxJQUFNLFFBQVEsUUFBUSxTQUFSLENBQWQ7QUFDQSxJQUFNLE1BQU0sUUFBUSxPQUFSLENBQVo7O0FBRUEsSUFBTSxXQUFXO0FBQ2YsVUFBUSxDQURPLEVBQ0o7QUFDWCxTQUFPLEdBRlEsRUFFSDtBQUNaLFFBQU0sS0FIUyxFQUdGO0FBQ2IsU0FBTyxDQUpRLEVBSUw7QUFDVixhQUFXLElBTEksRUFLRTtBQUNqQixjQUFZLElBTkcsRUFNRztBQUNsQixjQUFZLElBUEcsRUFPRztBQUNsQixhQUFXLElBUkksRUFRRTtBQUNqQixjQUFZO0FBVEcsQ0FBakI7QUFXQSxJQUFNLG1CQUFtQix5QkFBekI7QUFDQSxJQUFNLFVBQVUscUJBQWhCO0FBQ0EsSUFBTSxZQUFZLHVCQUFsQjtBQUNBLElBQU0sVUFBVSxxQkFBaEI7QUFDQSxJQUFNLFlBQVksdUJBQWxCO0FBQ0EsSUFBTSxjQUFjLHFCQUFwQjtBQUNBLElBQU0sVUFBVSxXQUFoQjs7QUFFQSxPQUFPLE9BQVA7QUFBQTtBQUFBO0FBQUEsd0JBQ3FCO0FBQ2pCLGFBQU8s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QUssU0FBMUM7QUFDQSxhQUFLLE1BQUw7QUFDRDtBQUNGO0FBL0JIO0FBQUE7QUFBQSw2QkFpQ1k7QUFDUixVQUFJLENBQUMsS0FBSyxPQUFWLEVBQW1CO0FBQ2pCLGFBQUssT0FBTCxHQUFlLElBQWY7QUFDQSxhQUFLLFNBQUwsR0FBaUIsSUFBSSxJQUFKLEdBQVcsT0FBWCxFQUFqQjs7QUFFQSxhQUFLLE1BQUw7QUFDRDtBQUNGO0FBeENIO0FBQUE7QUFBQSw0QkEwQ1c7QUFDUCxXQUFLLE1BQUw7QUFDQSxXQUFLLEtBQUwsR0FBYSxLQUFLLFlBQWxCO0FBQ0EsV0FBSyxNQUFMO0FBQ0Q7QUE5Q0g7QUFBQTtBQUFBLHdCQWdETyxVQWhEUCxFQWdEbUI7QUFDZixXQUFLLEtBQUw7QUFDQSxXQUFLLEtBQUwsSUFBYyxVQUFkO0FBQ0EsV0FBSyxNQUFMO0FBQ0Q7QUFwREg7O0FBQUE7QUFBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9cmV0dXJuIGV9KSgpIiwid2luZG93LlNsb3RNYWNoaW5lID0gcmVxdWlyZSgnLi9zbG90LW1hY2hpbmUnKTtcbiIsImNvbnN0IF9yYWYgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcmFmIChjYiwgdGltZW91dCA9IDApIHtcbiAgc2V0VGltZW91dCgoKSA9PiBfcmFmKGNiKSwgdGltZW91dCk7XG59O1xuIiwiY29uc3QgVGltZXIgPSByZXF1aXJlKCcuL3RpbWVyJyk7XG5jb25zdCByYWYgPSByZXF1aXJlKCcuL3JhZicpO1xuXG5jb25zdCBkZWZhdWx0cyA9IHtcbiAgYWN0aXZlOiAwLCAvLyBBY3RpdmUgZWxlbWVudCBbTnVtYmVyXVxuICBkZWxheTogMjAwLCAvLyBBbmltYXRpb24gdGltZSBbTnVtYmVyXVxuICBhdXRvOiBmYWxzZSwgLy8gUmVwZWF0IGRlbGF5IFtmYWxzZXx8TnVtYmVyXVxuICBzcGluczogNSwgLy8gTnVtYmVyIG9mIHNwaW5zIHdoZW4gYXV0byBbTnVtYmVyXVxuICByYW5kb21pemU6IG51bGwsIC8vIFJhbmRvbWl6ZSBmdW5jdGlvbiwgbXVzdCByZXR1cm4gYSBudW1iZXIgd2l0aCB0aGUgc2VsZWN0ZWQgcG9zaXRpb25cbiAgb25Db21wbGV0ZTogbnVsbCwgLy8gQ2FsbGJhY2sgZnVuY3Rpb24ocmVzdWx0KVxuICBpblZpZXdwb3J0OiB0cnVlLCAvLyBTdG9wcyBhbmltYXRpb25zIGlmIHRoZSBlbGVtZW50IGlzbsK0dCB2aXNpYmxlIG9uIHRoZSBzY3JlZW5cbiAgZGlyZWN0aW9uOiAndXAnLCAvLyBBbmltYXRpb24gZGlyZWN0aW9uIFsndXAnfHwnZG93biddXG4gIHRyYW5zaXRpb246ICdlYXNlLWluLW91dCdcbn07XG5jb25zdCBGWF9OT19UUkFOU0lUSU9OID0gJ3Nsb3RNYWNoaW5lTm9UcmFuc2l0aW9uJztcbmNvbnN0IEZYX0ZBU1QgPSAnc2xvdE1hY2hpbmVCbHVyRmFzdCc7XG5jb25zdCBGWF9OT1JNQUwgPSAnc2xvdE1hY2hpbmVCbHVyTWVkaXVtJztcbmNvbnN0IEZYX1NMT1cgPSAnc2xvdE1hY2hpbmVCbHVyU2xvdyc7XG5jb25zdCBGWF9UVVJUTEUgPSAnc2xvdE1hY2hpbmVCbHVyVHVydGxlJztcbmNvbnN0IEZYX0dSQURJRU5UID0gJ3Nsb3RNYWNoaW5lR3JhZGllbnQnO1xuY29uc3QgRlhfU1RPUCA9IEZYX0dSQURJRU5UO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNsb3RNYWNoaW5lIHtcbiAgc3RhdGljIGdldCBuYW1lICgpIHtcbiAgICByZXR1cm4gJ3Nsb3RNYWNoaW5lJztcbiAgfVxuXG4gIGNvbnN0cnVjdG9yIChlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICAvLyBTbG90IE1hY2hpbmUgZWxlbWVudHNcbiAgICB0aGlzLnRpbGVzID0gW10uc2xpY2UuY2FsbCh0aGlzLmVsZW1lbnQuY2hpbGRyZW4pO1xuICAgIC8vIE1hY2hpbmUgaXMgcnVubmluZz9cbiAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAvLyBNYWNoaW5lIGlzIHN0b3BwaW5nP1xuICAgIHRoaXMuc3RvcHBpbmcgPSBmYWxzZTtcbiAgICAvLyBEaXNhYmxlIG92ZXJmbG93XG4gICAgdGhpcy5lbGVtZW50LnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG4gICAgLy8gV3JhcCBlbGVtZW50cyBpbnNpZGUgY29udGFpbmVyXG4gICAgdGhpcy5fd3JhcFRpbGVzKCk7XG4gICAgLy8gU2V0IG1pbiB0b3Agb2Zmc2V0XG4gICAgdGhpcy5fbWluVG9wID0gLXRoaXMuX2Zha2VGaXJzdFRpbGUub2Zmc2V0SGVpZ2h0O1xuICAgIC8vIFNldCBtYXggdG9wIG9mZnNldFxuICAgIHRoaXMuX21heFRvcCA9IC10aGlzLnRpbGVzLnJlZHVjZSgoYWNjLCB0aWxlKSA9PiAoYWNjICsgdGlsZS5vZmZzZXRIZWlnaHQpLCAwKTtcbiAgICAvLyBDYWxsIHNldHRlcnMgaWYgbmVjY2VzYXJ5XG4gICAgdGhpcy5jaGFuZ2VTZXR0aW5ncyhPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cywgb3B0aW9ucykpO1xuICAgIC8vIEluaXRpYWxpemUgc3BpbiBkaXJlY3Rpb24gW3VwLCBkb3duXVxuICAgIHRoaXMuX3NldEJvdW5kcygpO1xuICAgIC8vIFNob3cgYWN0aXZlIGVsZW1lbnRcbiAgICB0aGlzLl9yZXNldFBvc2l0aW9uKCk7XG4gICAgLy8gU3RhcnQgYXV0byBhbmltYXRpb25cbiAgICBpZiAodGhpcy5hdXRvICE9PSBmYWxzZSkge1xuICAgICAgdGhpcy5ydW4oKTtcbiAgICB9XG4gIH1cblxuICBjaGFuZ2VTZXR0aW5ncyAoc2V0dGluZ3MpIHtcbiAgICBPYmplY3Qua2V5cyhzZXR0aW5ncykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAvLyBUcmlnZ2VyIHNldHRlcnNcbiAgICAgIHRoaXNba2V5XSA9IHNldHRpbmdzW2tleV07XG4gICAgfSk7XG4gIH1cblxuICBfd3JhcFRpbGVzICgpIHtcbiAgICB0aGlzLmNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ3Nsb3RNYWNoaW5lQ29udGFpbmVyJyk7XG4gICAgdGhpcy5jb250YWluZXIuc3R5bGUudHJhbnNpdGlvbiA9ICcxcyBlYXNlLWluLW91dCc7XG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuY29udGFpbmVyKTtcblxuICAgIHRoaXMuX2Zha2VGaXJzdFRpbGUgPSB0aGlzLnRpbGVzW3RoaXMudGlsZXMubGVuZ3RoIC0gMV0uY2xvbmVOb2RlKHRydWUpO1xuICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX2Zha2VGaXJzdFRpbGUpO1xuXG4gICAgdGhpcy50aWxlcy5mb3JFYWNoKCh0aWxlKSA9PiB7XG4gICAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aWxlKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX2Zha2VMYXN0VGlsZSA9IHRoaXMudGlsZXNbMF0uY2xvbmVOb2RlKHRydWUpO1xuICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuX2Zha2VMYXN0VGlsZSk7XG4gIH1cblxuICBfc2V0Qm91bmRzICgpIHtcbiAgICBjb25zdCBpbml0aWFsID0gdGhpcy5nZXRUaWxlT2Zmc2V0KHRoaXMuYWN0aXZlKTtcbiAgICBjb25zdCBmaXJzdCA9IHRoaXMuZ2V0VGlsZU9mZnNldCh0aGlzLnRpbGVzLmxlbmd0aCk7XG4gICAgY29uc3QgbGFzdCA9IHRoaXMuZ2V0VGlsZU9mZnNldCh0aGlzLnRpbGVzLmxlbmd0aCk7XG5cbiAgICB0aGlzLl9ib3VuZHMgPSB7XG4gICAgICB1cDoge1xuICAgICAgICBrZXk6ICd1cCcsXG4gICAgICAgIGluaXRpYWwsXG4gICAgICAgIGZpcnN0OiAwLFxuICAgICAgICBsYXN0LFxuICAgICAgICB0bzogdGhpcy5fbWF4VG9wLFxuICAgICAgICBmaXJzdFRvTGFzdDogbGFzdCxcbiAgICAgICAgbGFzdFRvRmlyc3Q6IDBcbiAgICAgIH0sXG4gICAgICBkb3duOiB7XG4gICAgICAgIGtleTogJ2Rvd24nLFxuICAgICAgICBpbml0aWFsLFxuICAgICAgICBmaXJzdCxcbiAgICAgICAgbGFzdDogMCxcbiAgICAgICAgdG86IHRoaXMuX21pblRvcCxcbiAgICAgICAgZmlyc3RUb0xhc3Q6IGxhc3QsXG4gICAgICAgIGxhc3RUb0ZpcnN0OiAwXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGdldCBhY3RpdmUgKCkge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmU7XG4gIH1cblxuICBnZXQgZGlyZWN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fZGlyZWN0aW9uO1xuICB9XG5cbiAgZ2V0IGJvdW5kcyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2JvdW5kc1t0aGlzLl9kaXJlY3Rpb25dO1xuICB9XG5cbiAgZ2V0IHRyYW5zaXRpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl90cmFuc2l0aW9uO1xuICB9XG5cbiAgZ2V0IHZpc2libGVUaWxlICgpIHtcbiAgICBjb25zdCBmaXJzdFRpbGVIZWlnaHQgPSB0aGlzLnRpbGVzWzBdLm9mZnNldEhlaWdodDtcbiAgICBjb25zdCByYXdDb250YWluZXJNYXJnaW4gPSB0aGlzLmNvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gfHwgJyc7XG4gICAgY29uc3QgbWF0cml4UmVnRXhwID0gL15tYXRyaXhcXCgtP1xcZCssXFxzPy0/XFxkKyxcXHM/LT9cXGQrLFxccz8tP1xcZCssXFxzPy0/XFxkKyxcXHM/KC0/XFxkKylcXCkkLztcbiAgICBjb25zdCBjb250YWluZXJNYXJnaW4gPSBwYXJzZUludChyYXdDb250YWluZXJNYXJnaW4ucmVwbGFjZShtYXRyaXhSZWdFeHAsICckMScpLCAxMCk7XG5cbiAgICByZXR1cm4gTWF0aC5hYnMoTWF0aC5yb3VuZChjb250YWluZXJNYXJnaW4gLyBmaXJzdFRpbGVIZWlnaHQpKSAtIDE7XG4gIH1cblxuICBnZXQgcmFuZG9tICgpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy50aWxlcy5sZW5ndGgpO1xuICB9XG5cbiAgZ2V0IGN1c3RvbSAoKSB7XG4gICAgbGV0IGNob29zZW47XG5cbiAgICBpZiAodGhpcy5yYW5kb21pemUpIHtcbiAgICAgIGxldCBpbmRleCA9IHRoaXMucmFuZG9taXplKHRoaXMuYWN0aXZlKTtcbiAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gdGhpcy50aWxlcy5sZW5ndGgpIHtcbiAgICAgICAgaW5kZXggPSAwO1xuICAgICAgfVxuICAgICAgY2hvb3NlbiA9IGluZGV4O1xuICAgIH0gZWxzZSB7XG4gICAgICBjaG9vc2VuID0gdGhpcy5yYW5kb207XG4gICAgfVxuXG4gICAgcmV0dXJuIGNob29zZW47XG4gIH1cblxuICBnZXQgX3ByZXZJbmRleCAoKSB7XG4gICAgY29uc3QgcHJldkluZGV4ID0gdGhpcy5hY3RpdmUgLSAxO1xuXG4gICAgcmV0dXJuIHByZXZJbmRleCA8IDAgPyAodGhpcy50aWxlcy5sZW5ndGggLSAxKSA6IHByZXZJbmRleDtcbiAgfVxuXG4gIGdldCBfbmV4dEluZGV4ICgpIHtcbiAgICBjb25zdCBuZXh0SW5kZXggPSB0aGlzLmFjdGl2ZSArIDE7XG5cbiAgICByZXR1cm4gbmV4dEluZGV4IDwgdGhpcy50aWxlcy5sZW5ndGggPyBuZXh0SW5kZXggOiAwO1xuICB9XG5cbiAgZ2V0IHByZXZJbmRleCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlyZWN0aW9uID09PSAndXAnID8gdGhpcy5fbmV4dEluZGV4IDogdGhpcy5fcHJldkluZGV4O1xuICB9XG5cbiAgZ2V0IG5leHRJbmRleCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlyZWN0aW9uID09PSAndXAnID8gdGhpcy5fcHJldkluZGV4IDogdGhpcy5fbmV4dEluZGV4O1xuICB9XG5cbiAgZ2V0IHZpc2libGUgKCkge1xuICAgIGNvbnN0IHJlY3QgPSB0aGlzLmVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3Qgd2luZG93SGVpZ2h0ID0gKHdpbmRvdy5pbm5lckhlaWdodCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0KTtcbiAgICBjb25zdCB3aW5kb3dXaWR0aCA9ICh3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgpO1xuICAgIGNvbnN0IHZlcnRJblZpZXcgPSAocmVjdC50b3AgPD0gd2luZG93SGVpZ2h0KSAmJiAoKHJlY3QudG9wICsgcmVjdC5oZWlnaHQpID49IDApO1xuICAgIGNvbnN0IGhvckluVmlldyA9IChyZWN0LmxlZnQgPD0gd2luZG93V2lkdGgpICYmICgocmVjdC5sZWZ0ICsgcmVjdC53aWR0aCkgPj0gMCk7XG5cbiAgICByZXR1cm4gdmVydEluVmlldyAmJiBob3JJblZpZXc7XG4gIH1cblxuICBzZXQgYWN0aXZlIChpbmRleCkge1xuICAgIGluZGV4ID0gTnVtYmVyKGluZGV4KTtcbiAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHRoaXMudGlsZXMubGVuZ3RoIHx8IGlzTmFOKGluZGV4KSkge1xuICAgICAgaW5kZXggPSAwO1xuICAgIH1cbiAgICB0aGlzLl9hY3RpdmUgPSBpbmRleDtcbiAgfVxuXG4gIHNldCBkaXJlY3Rpb24gKGRpcmVjdGlvbikge1xuICAgIGlmICghdGhpcy5ydW5uaW5nKSB7XG4gICAgICB0aGlzLl9kaXJlY3Rpb24gPSBkaXJlY3Rpb24gPT09ICdkb3duJyA/ICdkb3duJyA6ICd1cCc7XG4gICAgfVxuICB9XG5cbiAgc2V0IF9hbmltYXRpb25GWCAoRlhfU1BFRUQpIHtcbiAgICBjb25zdCBkZWxheSA9IHRoaXMuZGVsYXkgLyA0O1xuXG4gICAgcmFmKCgpID0+IHtcbiAgICAgIFsuLi50aGlzLnRpbGVzLCB0aGlzLl9mYWtlTGFzdFRpbGUsIHRoaXMuX2Zha2VGaXJzdFRpbGVdLmZvckVhY2goKHRpbGUpID0+IHtcbiAgICAgICAgdGlsZS5jbGFzc0xpc3QucmVtb3ZlKEZYX0ZBU1QsIEZYX05PUk1BTCwgRlhfU0xPVywgRlhfVFVSVExFKTtcbiAgICAgICAgaWYgKEZYX1NQRUVEICE9PSBGWF9TVE9QKSB7XG4gICAgICAgICAgdGlsZS5jbGFzc0xpc3QuYWRkKEZYX1NQRUVEKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChGWF9TUEVFRCA9PT0gRlhfU1RPUCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QucmVtb3ZlKEZYX0dSQURJRU5UKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoRlhfR1JBRElFTlQpO1xuICAgICAgfVxuICAgIH0sIGRlbGF5KTtcbiAgfVxuXG4gIHNldCB0cmFuc2l0aW9uICh0cmFuc2l0aW9uKSB7XG4gICAgdGhpcy5fdHJhbnNpdGlvbiA9IHRyYW5zaXRpb24gfHwgJ2Vhc2UtaW4tb3V0JztcbiAgfVxuXG4gIF9jaGFuZ2VUcmFuc2l0aW9uIChkZWxheSA9IHRoaXMuZGVsYXksIHRyYW5zaXRpb24gPSB0aGlzLnRyYW5zaXRpb24pIHtcbiAgICB0aGlzLmNvbnRhaW5lci5zdHlsZS50cmFuc2l0aW9uID0gYCR7ZGVsYXkgLyAxMDAwfXMgJHt0cmFuc2l0aW9ufWA7XG4gIH1cblxuICBfY2hhbmdlVHJhbnNmb3JtIChtYXJnaW4pIHtcbiAgICB0aGlzLmNvbnRhaW5lci5zdHlsZS50cmFuc2Zvcm0gPSBgbWF0cml4KDEsIDAsIDAsIDEsIDAsICR7bWFyZ2lufSlgO1xuICB9XG5cbiAgX2lzR29pbmdCYWNrd2FyZCAoKSB7XG4gICAgcmV0dXJuIHRoaXMubmV4dEFjdGl2ZSA+IHRoaXMuYWN0aXZlICYmIHRoaXMuYWN0aXZlID09PSAwICYmIHRoaXMubmV4dEFjdGl2ZSA9PT0gdGhpcy50aWxlcy5sZW5ndGggLSAxO1xuICB9XG5cbiAgX2lzR29pbmdGb3J3YXJkICgpIHtcbiAgICByZXR1cm4gdGhpcy5uZXh0QWN0aXZlIDw9IHRoaXMuYWN0aXZlICYmIHRoaXMuYWN0aXZlID09PSB0aGlzLnRpbGVzLmxlbmd0aCAtIDEgJiYgdGhpcy5uZXh0QWN0aXZlID09PSAwO1xuICB9XG5cbiAgZ2V0VGlsZU9mZnNldCAoaW5kZXgpIHtcbiAgICBsZXQgb2Zmc2V0ID0gMDtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5kZXg7IGkrKykge1xuICAgICAgb2Zmc2V0ICs9IHRoaXMudGlsZXNbaV0ub2Zmc2V0SGVpZ2h0O1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9taW5Ub3AgLSBvZmZzZXQ7XG4gIH1cblxuICBfcmVzZXRQb3NpdGlvbiAobWFyZ2luKSB7XG4gICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LnRvZ2dsZShGWF9OT19UUkFOU0lUSU9OKTtcbiAgICB0aGlzLl9jaGFuZ2VUcmFuc2Zvcm0oIWlzTmFOKG1hcmdpbikgPyBtYXJnaW4gOiB0aGlzLmJvdW5kcy5pbml0aWFsKTtcbiAgICAvLyBGb3JjZSByZWZsb3csIGZsdXNoaW5nIHRoZSBDU1MgY2hhbmdlc1xuICAgIHRoaXMuY29udGFpbmVyLm9mZnNldEhlaWdodDtcbiAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QudG9nZ2xlKEZYX05PX1RSQU5TSVRJT04pO1xuICB9XG5cbiAgcHJldiAoKSB7XG4gICAgdGhpcy5uZXh0QWN0aXZlID0gdGhpcy5wcmV2SW5kZXg7XG4gICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcbiAgICB0aGlzLnN0b3AoKTtcblxuICAgIHJldHVybiB0aGlzLm5leHRBY3RpdmU7XG4gIH1cblxuICBuZXh0ICgpIHtcbiAgICB0aGlzLm5leHRBY3RpdmUgPSB0aGlzLm5leHRJbmRleDtcbiAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgIHRoaXMuc3RvcCgpO1xuXG4gICAgcmV0dXJuIHRoaXMubmV4dEFjdGl2ZTtcbiAgfVxuXG4gIF9nZXREZWxheUZyb21TcGlucyAoc3BpbnMpIHtcbiAgICBsZXQgZGVsYXkgPSB0aGlzLmRlbGF5O1xuICAgIHRoaXMudHJhbnNpdGlvbiA9ICdsaW5lYXInO1xuXG4gICAgc3dpdGNoIChzcGlucykge1xuICAgICAgY2FzZSAxOlxuICAgICAgICBkZWxheSAvPSAwLjU7XG4gICAgICAgIHRoaXMudHJhbnNpdGlvbiA9ICdlYXNlLW91dCc7XG4gICAgICAgIHRoaXMuX2FuaW1hdGlvbkZYID0gRlhfVFVSVExFO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgZGVsYXkgLz0gMC43NTtcbiAgICAgICAgdGhpcy5fYW5pbWF0aW9uRlggPSBGWF9TTE9XO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgZGVsYXkgLz0gMTtcbiAgICAgICAgdGhpcy5fYW5pbWF0aW9uRlggPSBGWF9OT1JNQUw7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA0OlxuICAgICAgICBkZWxheSAvPSAxLjI1O1xuICAgICAgICB0aGlzLl9hbmltYXRpb25GWCA9IEZYX05PUk1BTDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBkZWxheSAvPSAxLjU7XG4gICAgICAgIHRoaXMuX2FuaW1hdGlvbkZYID0gRlhfRkFTVDtcbiAgICB9XG5cbiAgICByZXR1cm4gZGVsYXk7XG4gIH1cblxuICBzaHVmZmxlIChzcGlucywgb25Db21wbGV0ZSkge1xuICAgIC8vIE1ha2Ugc3BpbnMgb3B0aW9uYWxcbiAgICBpZiAodHlwZW9mIHNwaW5zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBvbkNvbXBsZXRlID0gc3BpbnM7XG4gICAgfVxuICAgIHRoaXMucnVubmluZyA9IHRydWU7XG4gICAgLy8gUGVyZm9ybSBhbmltYXRpb25cbiAgICBpZiAoIXRoaXMudmlzaWJsZSAmJiB0aGlzLmluVmlld3BvcnQgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuc3RvcChvbkNvbXBsZXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZGVsYXkgPSB0aGlzLl9nZXREZWxheUZyb21TcGlucyhzcGlucyk7XG4gICAgICAvLyB0aGlzLmRlbGF5ID0gZGVsYXk7XG4gICAgICB0aGlzLl9jaGFuZ2VUcmFuc2l0aW9uKGRlbGF5KTtcbiAgICAgIHRoaXMuX2NoYW5nZVRyYW5zZm9ybSh0aGlzLmJvdW5kcy50byk7XG4gICAgICByYWYoKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuc3RvcHBpbmcgJiYgdGhpcy5ydW5uaW5nKSB7XG4gICAgICAgICAgY29uc3QgbGVmdCA9IHNwaW5zIC0gMTtcblxuICAgICAgICAgIHRoaXMuX3Jlc2V0UG9zaXRpb24odGhpcy5ib3VuZHMuZmlyc3QpO1xuXG4gICAgICAgICAgaWYgKGxlZnQgPiAxKSB7XG4gICAgICAgICAgICAvLyBSZXBlYXQgYW5pbWF0aW9uXG4gICAgICAgICAgICB0aGlzLnNodWZmbGUobGVmdCwgb25Db21wbGV0ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3RvcChvbkNvbXBsZXRlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIGRlbGF5KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5uZXh0QWN0aXZlO1xuICB9XG5cbiAgc3RvcCAob25TdG9wKSB7XG4gICAgaWYgKCF0aGlzLnJ1bm5pbmcgfHwgdGhpcy5zdG9wcGluZykge1xuICAgICAgcmV0dXJuIHRoaXMubmV4dEFjdGl2ZTtcbiAgICB9XG5cbiAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgIHRoaXMuc3RvcHBpbmcgPSB0cnVlO1xuXG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKHRoaXMubmV4dEFjdGl2ZSkpIHtcbiAgICAgIC8vIEdldCByYW5kb20gb3IgY3VzdG9tIGVsZW1lbnRcbiAgICAgIHRoaXMubmV4dEFjdGl2ZSA9IHRoaXMuY3VzdG9tO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGRpcmVjdGlvbiB0byBwcmV2ZW50IGp1bXBpbmdcbiAgICBpZiAodGhpcy5faXNHb2luZ0JhY2t3YXJkKCkpIHtcbiAgICAgIHRoaXMuX3Jlc2V0UG9zaXRpb24odGhpcy5ib3VuZHMuZmlyc3RUb0xhc3QpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5faXNHb2luZ0ZvcndhcmQoKSkge1xuICAgICAgdGhpcy5fcmVzZXRQb3NpdGlvbih0aGlzLmJvdW5kcy5sYXN0VG9GaXJzdCk7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIGxhc3QgY2hvb3NlbiBlbGVtZW50IGluZGV4XG4gICAgdGhpcy5hY3RpdmUgPSB0aGlzLm5leHRBY3RpdmU7XG5cbiAgICAvLyBQZXJmb3JtIGFuaW1hdGlvblxuICAgIGNvbnN0IGRlbGF5ID0gdGhpcy5fZ2V0RGVsYXlGcm9tU3BpbnMoMSk7XG4gICAgLy8gdGhpcy5kZWxheSA9IGRlbGF5O1xuICAgIHRoaXMuX2NoYW5nZVRyYW5zaXRpb24oZGVsYXkpO1xuICAgIHRoaXMuX2FuaW1hdGlvbkZYID0gRlhfU1RPUDtcbiAgICB0aGlzLl9jaGFuZ2VUcmFuc2Zvcm0odGhpcy5nZXRUaWxlT2Zmc2V0KHRoaXMuYWN0aXZlKSk7XG4gICAgcmFmKCgpID0+IHtcbiAgICAgIHRoaXMuc3RvcHBpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5uZXh0QWN0aXZlID0gbnVsbDtcblxuICAgICAgaWYgKHR5cGVvZiB0aGlzLm9uQ29tcGxldGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5vbkNvbXBsZXRlKHRoaXMuYWN0aXZlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBvblN0b3AgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgb25TdG9wLmFwcGx5KHRoaXMsIFt0aGlzLmFjdGl2ZV0pO1xuICAgICAgfVxuICAgIH0sIGRlbGF5KTtcblxuICAgIHJldHVybiB0aGlzLmFjdGl2ZTtcbiAgfVxuXG4gIHJ1biAoKSB7XG4gICAgaWYgKHRoaXMucnVubmluZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3RpbWVyID0gbmV3IFRpbWVyKCgpID0+IHtcbiAgICAgIGlmICghdGhpcy52aXNpYmxlICYmIHRoaXMuaW5WaWV3cG9ydCA9PT0gdHJ1ZSkge1xuICAgICAgICByYWYoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuX3RpbWVyLnJlc2V0KClcbiAgICAgICAgfSwgNTAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2h1ZmZsZSh0aGlzLnNwaW5zLCAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fdGltZXIucmVzZXQoKVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LCB0aGlzLmF1dG8pO1xuICB9XG5cbiAgZGVzdHJveSAoKSB7XG4gICAgdGhpcy5fZmFrZUZpcnN0VGlsZS5yZW1vdmUoKTtcbiAgICB0aGlzLl9mYWtlTGFzdFRpbGUucmVtb3ZlKCk7XG4gICAgdGhpcy4kdGlsZXMudW53cmFwKCk7XG5cbiAgICAvLyBVbndyYXAgdGlsZXNcbiAgICB0aGlzLnRpbGVzLmZvckVhY2goKHRpbGUpID0+IHtcbiAgICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aWxlKTtcbiAgICB9KTtcblxuICAgIHRoaXMuY29udGFpbmVyLnJlbW92ZSgpO1xuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFRpbWVyIHtcbiAgY29uc3RydWN0b3IgKGNiLCBkZWxheSkge1xuICAgIHRoaXMuY2IgPSBjYjtcbiAgICB0aGlzLmluaXRpYWxEZWxheSA9IGRlbGF5O1xuICAgIHRoaXMuZGVsYXkgPSBkZWxheTtcbiAgICB0aGlzLnN0YXJ0VGltZSA9IG51bGw7XG4gICAgdGhpcy50aW1lciA9IG51bGw7XG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG5cbiAgICB0aGlzLnJlc3VtZSgpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfc3RhcnQgKCkge1xuICAgIHRoaXMudGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5jYih0aGlzKTtcbiAgICB9LCB0aGlzLmRlbGF5KTtcbiAgfVxuXG4gIGNhbmNlbCAoKSB7XG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZXIpO1xuICB9XG5cbiAgcGF1c2UgKCkge1xuICAgIGlmICh0aGlzLnJ1bm5pbmcpIHtcbiAgICAgIHRoaXMuZGVsYXkgLT0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0aGlzLnN0YXJ0VGltZTtcbiAgICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgfVxuICB9XG5cbiAgcmVzdW1lICgpIHtcbiAgICBpZiAoIXRoaXMucnVubmluZykge1xuICAgICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcbiAgICAgIHRoaXMuc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAgIHRoaXMuX3N0YXJ0KCk7XG4gICAgfVxuICB9XG5cbiAgcmVzZXQgKCkge1xuICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgdGhpcy5kZWxheSA9IHRoaXMuaW5pdGlhbERlbGF5O1xuICAgIHRoaXMuX3N0YXJ0KCk7XG4gIH1cblxuICBhZGQgKGV4dHJhRGVsYXkpIHtcbiAgICB0aGlzLnBhdXNlKCk7XG4gICAgdGhpcy5kZWxheSArPSBleHRyYURlbGF5O1xuICAgIHRoaXMucmVzdW1lKCk7XG4gIH1cbn07XG4iXX0=
