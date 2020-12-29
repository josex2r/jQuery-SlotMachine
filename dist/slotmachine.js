/*
 * jQuery Slot Machine v4.0.1
 * https://github.com/josex2r/jQuery-SlotMachineundefined
 *
 * Copyright 2014 Jose Luis Represa
 * Released under the MIT license
 */
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
      // this.$tiles.unwrap();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvaW5kZXguanMiLCJsaWIvcmFmLmpzIiwibGliL3Nsb3QtbWFjaGluZS5qcyIsImxpYi90aW1lci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsT0FBTyxXQUFQLEdBQXFCLFFBQVEsZ0JBQVIsQ0FBckI7Ozs7O0FDQUEsSUFBTSxPQUFPLE9BQU8scUJBQVAsSUFBZ0MsT0FBTyx3QkFBdkMsSUFBbUUsT0FBTywyQkFBMUUsSUFBeUcsT0FBTyx1QkFBN0g7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFNBQVMsR0FBVCxDQUFjLEVBQWQsRUFBK0I7QUFBQSxNQUFiLE9BQWEsdUVBQUgsQ0FBRzs7QUFDOUMsYUFBVztBQUFBLFdBQU0sS0FBSyxFQUFMLENBQU47QUFBQSxHQUFYLEVBQTJCLE9BQTNCO0FBQ0QsQ0FGRDs7Ozs7Ozs7Ozs7QUNGQSxJQUFNLFFBQVEsUUFBUSxTQUFSLENBQWQ7QUFDQSxJQUFNLE1BQU0sUUFBUSxPQUFSLENBQVo7O0FBRUEsSUFBTSxXQUFXO0FBQ2YsVUFBUSxDQURPLEVBQ0o7QUFDWCxTQUFPLEdBRlEsRUFFSDtBQUNaLFFBQU0sS0FIUyxFQUdGO0FBQ2IsU0FBTyxDQUpRLEVBSUw7QUFDVixhQUFXLElBTEksRUFLRTtBQUNqQixjQUFZLElBTkcsRUFNRztBQUNsQixjQUFZLElBUEcsRUFPRztBQUNsQixhQUFXLElBUkksRUFRRTtBQUNqQixjQUFZO0FBVEcsQ0FBakI7QUFXQSxJQUFNLG1CQUFtQix5QkFBekI7QUFDQSxJQUFNLFVBQVUscUJBQWhCO0FBQ0EsSUFBTSxZQUFZLHVCQUFsQjtBQUNBLElBQU0sVUFBVSxxQkFBaEI7QUFDQSxJQUFNLFlBQVksdUJBQWxCO0FBQ0EsSUFBTSxjQUFjLHFCQUFwQjtBQUNBLElBQU0sVUFBVSxXQUFoQjs7SUFFTSxXO0FBQ0osdUJBQWEsT0FBYixFQUFzQixPQUF0QixFQUErQjtBQUFBOztB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QUFBO0FBQUEsNkJBY1k7QUFBQTs7QUFDUixXQUFLLEtBQUwsR0FBYSxXQUFXLFlBQU07QUFDNUIsY0FBSyxPQUFMLEdBQWUsS0FBZjtBQUNBLGNBQUssRUFBTCxDQUFRLEtBQVI7QUFDRCxPQUhZLEVBR1YsS0FBSyxLQUhLLENBQWI7QUFJRDtBQW5CSDtBQUFBO0FBQUEsNkJBcUJZO0FBQ1IsV0FBSyxPQUFMLEdBQWUsS0FBZjtBQUNBLG1CQUFhLEtBQUssS0FBbEI7QUFDRDtBQXhCSDtBQUFBO0FBQUEsNEJBMEJXO0FBQ1AsVUFBSSxLQUFLLE9BQVQsRUFBa0I7QUFDaEIsYUFBSyxLQUFMLElBQWMsSUFBSSxJQUFKLEdBQVcsT0FBWCxLQUF1QixLQUFLLFNBQTFDO0FBQ0EsYUFBSyxNQUFMO0FBQ0Q7QUFDRjtBQS9CSDtBQUFBO0FBQUEsNkJBaUNZO0FBQ1IsVUFBSSxDQUFDLEtBQUssT0FBVixFQUFtQjtBQUNqQixhQUFLLE9BQUwsR0FBZSxJQUFmO0FBQ0EsYUFBSyxTQUFMLEdBQWlCLElBQUksSUFBSixHQUFXLE9BQVgsRUFBakI7O0FBRUEsYUFBSyxNQUFMO0FBQ0Q7QUFDRjtBQXhDSDtBQUFBO0FBQUEsNEJBMENXO0FBQ1AsV0FBSyxNQUFMO0FBQ0EsV0FBSyxLQUFMLEdBQWEsS0FBSyxZQUFsQjtBQUNBLFdBQUssTUFBTDtBQUNEO0FBOUNIO0FBQUE7QUFBQSx3QkFnRE8sVUFoRFAsRUFnRG1CO0FBQ2YsV0FBSyxLQUFMO0FBQ0EsV0FBSyxLQUFMLElBQWMsVUFBZDtBQUNBLFdBQUssTUFBTDtBQUNEO0FBcERIOztBQUFBO0FBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJ3aW5kb3cuU2xvdE1hY2hpbmUgPSByZXF1aXJlKCcuL3Nsb3QtbWFjaGluZScpO1xuIiwiY29uc3QgX3JhZiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByYWYgKGNiLCB0aW1lb3V0ID0gMCkge1xuICBzZXRUaW1lb3V0KCgpID0+IF9yYWYoY2IpLCB0aW1lb3V0KTtcbn07XG4iLCJjb25zdCBUaW1lciA9IHJlcXVpcmUoJy4vdGltZXInKTtcbmNvbnN0IHJhZiA9IHJlcXVpcmUoJy4vcmFmJyk7XG5cbmNvbnN0IGRlZmF1bHRzID0ge1xuICBhY3RpdmU6IDAsIC8vIEFjdGl2ZSBlbGVtZW50IFtOdW1iZXJdXG4gIGRlbGF5OiAyMDAsIC8vIEFuaW1hdGlvbiB0aW1lIFtOdW1iZXJdXG4gIGF1dG86IGZhbHNlLCAvLyBSZXBlYXQgZGVsYXkgW2ZhbHNlfHxOdW1iZXJdXG4gIHNwaW5zOiA1LCAvLyBOdW1iZXIgb2Ygc3BpbnMgd2hlbiBhdXRvIFtOdW1iZXJdXG4gIHJhbmRvbWl6ZTogbnVsbCwgLy8gUmFuZG9taXplIGZ1bmN0aW9uLCBtdXN0IHJldHVybiBhIG51bWJlciB3aXRoIHRoZSBzZWxlY3RlZCBwb3NpdGlvblxuICBvbkNvbXBsZXRlOiBudWxsLCAvLyBDYWxsYmFjayBmdW5jdGlvbihyZXN1bHQpXG4gIGluVmlld3BvcnQ6IHRydWUsIC8vIFN0b3BzIGFuaW1hdGlvbnMgaWYgdGhlIGVsZW1lbnQgaXNuwrR0IHZpc2libGUgb24gdGhlIHNjcmVlblxuICBkaXJlY3Rpb246ICd1cCcsIC8vIEFuaW1hdGlvbiBkaXJlY3Rpb24gWyd1cCd8fCdkb3duJ11cbiAgdHJhbnNpdGlvbjogJ2Vhc2UtaW4tb3V0J1xufTtcbmNvbnN0IEZYX05PX1RSQU5TSVRJT04gPSAnc2xvdE1hY2hpbmVOb1RyYW5zaXRpb24nO1xuY29uc3QgRlhfRkFTVCA9ICdzbG90TWFjaGluZUJsdXJGYXN0JztcbmNvbnN0IEZYX05PUk1BTCA9ICdzbG90TWFjaGluZUJsdXJNZWRpdW0nO1xuY29uc3QgRlhfU0xPVyA9ICdzbG90TWFjaGluZUJsdXJTbG93JztcbmNvbnN0IEZYX1RVUlRMRSA9ICdzbG90TWFjaGluZUJsdXJUdXJ0bGUnO1xuY29uc3QgRlhfR1JBRElFTlQgPSAnc2xvdE1hY2hpbmVHcmFkaWVudCc7XG5jb25zdCBGWF9TVE9QID0gRlhfR1JBRElFTlQ7XG5cbmNsYXNzIFNsb3RNYWNoaW5lIHtcbiAgY29uc3RydWN0b3IgKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIC8vIFNsb3QgTWFjaGluZSBlbGVtZW50c1xuICAgIHRoaXMudGlsZXMgPSBbXS5zbGljZS5jYWxsKHRoaXMuZWxlbWVudC5jaGlsZHJlbik7XG4gICAgLy8gTWFjaGluZSBpcyBydW5uaW5nP1xuICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgIC8vIE1hY2hpbmUgaXMgc3RvcHBpbmc/XG4gICAgdGhpcy5zdG9wcGluZyA9IGZhbHNlO1xuICAgIC8vIERpc2FibGUgb3ZlcmZsb3dcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcbiAgICAvLyBXcmFwIGVsZW1lbnRzIGluc2lkZSBjb250YWluZXJcbiAgICB0aGlzLl93cmFwVGlsZXMoKTtcbiAgICAvLyBTZXQgbWluIHRvcCBvZmZzZXRcbiAgICB0aGlzLl9taW5Ub3AgPSAtdGhpcy5fZmFrZUZpcnN0VGlsZS5vZmZzZXRIZWlnaHQ7XG4gICAgLy8gU2V0IG1heCB0b3Agb2Zmc2V0XG4gICAgdGhpcy5fbWF4VG9wID0gLXRoaXMudGlsZXMucmVkdWNlKChhY2MsIHRpbGUpID0+IChhY2MgKyB0aWxlLm9mZnNldEhlaWdodCksIDApO1xuICAgIC8vIENhbGwgc2V0dGVycyBpZiBuZWNjZXNhcnlcbiAgICB0aGlzLmNoYW5nZVNldHRpbmdzKE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCBvcHRpb25zKSk7XG4gICAgLy8gSW5pdGlhbGl6ZSBzcGluIGRpcmVjdGlvbiBbdXAsIGRvd25dXG4gICAgdGhpcy5fc2V0Qm91bmRzKCk7XG4gICAgLy8gU2hvdyBhY3RpdmUgZWxlbWVudFxuICAgIHRoaXMuX3Jlc2V0UG9zaXRpb24oKTtcbiAgICAvLyBTdGFydCBhdXRvIGFuaW1hdGlvblxuICAgIGlmICh0aGlzLmF1dG8gIT09IGZhbHNlKSB7XG4gICAgICB0aGlzLnJ1bigpO1xuICAgIH1cbiAgfVxuXG4gIGNoYW5nZVNldHRpbmdzIChzZXR0aW5ncykge1xuICAgIE9iamVjdC5rZXlzKHNldHRpbmdzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIC8vIFRyaWdnZXIgc2V0dGVyc1xuICAgICAgdGhpc1trZXldID0gc2V0dGluZ3Nba2V5XTtcbiAgICB9KTtcbiAgfVxuXG4gIF93cmFwVGlsZXMgKCkge1xuICAgIHRoaXMuY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LmFkZCgnc2xvdE1hY2hpbmVDb250YWluZXInKTtcbiAgICB0aGlzLmNvbnRhaW5lci5zdHlsZS50cmFuc2l0aW9uID0gJzFzIGVhc2UtaW4tb3V0JztcbiAgICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5jb250YWluZXIpO1xuXG4gICAgdGhpcy5fZmFrZUZpcnN0VGlsZSA9IHRoaXMudGlsZXNbdGhpcy50aWxlcy5sZW5ndGggLSAxXS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fZmFrZUZpcnN0VGlsZSk7XG5cbiAgICB0aGlzLnRpbGVzLmZvckVhY2goKHRpbGUpID0+IHtcbiAgICAgIHRoaXMuY29udGFpbmVyLmFwcGVuZENoaWxkKHRpbGUpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fZmFrZUxhc3RUaWxlID0gdGhpcy50aWxlc1swXS5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgdGhpcy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fZmFrZUxhc3RUaWxlKTtcbiAgfVxuXG4gIF9zZXRCb3VuZHMgKCkge1xuICAgIGNvbnN0IGluaXRpYWwgPSB0aGlzLmdldFRpbGVPZmZzZXQodGhpcy5hY3RpdmUpO1xuICAgIGNvbnN0IGZpcnN0ID0gdGhpcy5nZXRUaWxlT2Zmc2V0KHRoaXMudGlsZXMubGVuZ3RoKTtcbiAgICBjb25zdCBsYXN0ID0gdGhpcy5nZXRUaWxlT2Zmc2V0KHRoaXMudGlsZXMubGVuZ3RoKTtcblxuICAgIHRoaXMuX2JvdW5kcyA9IHtcbiAgICAgIHVwOiB7XG4gICAgICAgIGtleTogJ3VwJyxcbiAgICAgICAgaW5pdGlhbCxcbiAgICAgICAgZmlyc3Q6IDAsXG4gICAgICAgIGxhc3QsXG4gICAgICAgIHRvOiB0aGlzLl9tYXhUb3AsXG4gICAgICAgIGZpcnN0VG9MYXN0OiBsYXN0LFxuICAgICAgICBsYXN0VG9GaXJzdDogMFxuICAgICAgfSxcbiAgICAgIGRvd246IHtcbiAgICAgICAga2V5OiAnZG93bicsXG4gICAgICAgIGluaXRpYWwsXG4gICAgICAgIGZpcnN0LFxuICAgICAgICBsYXN0OiAwLFxuICAgICAgICB0bzogdGhpcy5fbWluVG9wLFxuICAgICAgICBmaXJzdFRvTGFzdDogbGFzdCxcbiAgICAgICAgbGFzdFRvRmlyc3Q6IDBcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZ2V0IGFjdGl2ZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZTtcbiAgfVxuXG4gIGdldCBkaXJlY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9kaXJlY3Rpb247XG4gIH1cblxuICBnZXQgYm91bmRzICgpIHtcbiAgICByZXR1cm4gdGhpcy5fYm91bmRzW3RoaXMuX2RpcmVjdGlvbl07XG4gIH1cblxuICBnZXQgdHJhbnNpdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RyYW5zaXRpb247XG4gIH1cblxuICBnZXQgdmlzaWJsZVRpbGUgKCkge1xuICAgIGNvbnN0IGZpcnN0VGlsZUhlaWdodCA9IHRoaXMudGlsZXNbMF0ub2Zmc2V0SGVpZ2h0O1xuICAgIGNvbnN0IHJhd0NvbnRhaW5lck1hcmdpbiA9IHRoaXMuY29udGFpbmVyLnN0eWxlLnRyYW5zZm9ybSB8fCAnJztcbiAgICBjb25zdCBtYXRyaXhSZWdFeHAgPSAvXm1hdHJpeFxcKC0/XFxkKyxcXHM/LT9cXGQrLFxccz8tP1xcZCssXFxzPy0/XFxkKyxcXHM/LT9cXGQrLFxccz8oLT9cXGQrKVxcKSQvO1xuICAgIGNvbnN0IGNvbnRhaW5lck1hcmdpbiA9IHBhcnNlSW50KHJhd0NvbnRhaW5lck1hcmdpbi5yZXBsYWNlKG1hdHJpeFJlZ0V4cCwgJyQxJyksIDEwKTtcblxuICAgIHJldHVybiBNYXRoLmFicyhNYXRoLnJvdW5kKGNvbnRhaW5lck1hcmdpbiAvIGZpcnN0VGlsZUhlaWdodCkpIC0gMTtcbiAgfVxuXG4gIGdldCByYW5kb20gKCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLnRpbGVzLmxlbmd0aCk7XG4gIH1cblxuICBnZXQgY3VzdG9tICgpIHtcbiAgICBsZXQgY2hvb3NlbjtcblxuICAgIGlmICh0aGlzLnJhbmRvbWl6ZSkge1xuICAgICAgbGV0IGluZGV4ID0gdGhpcy5yYW5kb21pemUodGhpcy5hY3RpdmUpO1xuICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLnRpbGVzLmxlbmd0aCkge1xuICAgICAgICBpbmRleCA9IDA7XG4gICAgICB9XG4gICAgICBjaG9vc2VuID0gaW5kZXg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNob29zZW4gPSB0aGlzLnJhbmRvbTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2hvb3NlbjtcbiAgfVxuXG4gIGdldCBfcHJldkluZGV4ICgpIHtcbiAgICBjb25zdCBwcmV2SW5kZXggPSB0aGlzLmFjdGl2ZSAtIDE7XG5cbiAgICByZXR1cm4gcHJldkluZGV4IDwgMCA/ICh0aGlzLnRpbGVzLmxlbmd0aCAtIDEpIDogcHJldkluZGV4O1xuICB9XG5cbiAgZ2V0IF9uZXh0SW5kZXggKCkge1xuICAgIGNvbnN0IG5leHRJbmRleCA9IHRoaXMuYWN0aXZlICsgMTtcblxuICAgIHJldHVybiBuZXh0SW5kZXggPCB0aGlzLnRpbGVzLmxlbmd0aCA/IG5leHRJbmRleCA6IDA7XG4gIH1cblxuICBnZXQgcHJldkluZGV4ICgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb24gPT09ICd1cCcgPyB0aGlzLl9uZXh0SW5kZXggOiB0aGlzLl9wcmV2SW5kZXg7XG4gIH1cblxuICBnZXQgbmV4dEluZGV4ICgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXJlY3Rpb24gPT09ICd1cCcgPyB0aGlzLl9wcmV2SW5kZXggOiB0aGlzLl9uZXh0SW5kZXg7XG4gIH1cblxuICBnZXQgdmlzaWJsZSAoKSB7XG4gICAgY29uc3QgcmVjdCA9IHRoaXMuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCB3aW5kb3dIZWlnaHQgPSAod2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQpO1xuICAgIGNvbnN0IHdpbmRvd1dpZHRoID0gKHdpbmRvdy5pbm5lcldpZHRoIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCk7XG4gICAgY29uc3QgdmVydEluVmlldyA9IChyZWN0LnRvcCA8PSB3aW5kb3dIZWlnaHQpICYmICgocmVjdC50b3AgKyByZWN0LmhlaWdodCkgPj0gMCk7XG4gICAgY29uc3QgaG9ySW5WaWV3ID0gKHJlY3QubGVmdCA8PSB3aW5kb3dXaWR0aCkgJiYgKChyZWN0LmxlZnQgKyByZWN0LndpZHRoKSA+PSAwKTtcblxuICAgIHJldHVybiB2ZXJ0SW5WaWV3ICYmIGhvckluVmlldztcbiAgfVxuXG4gIHNldCBhY3RpdmUgKGluZGV4KSB7XG4gICAgaW5kZXggPSBOdW1iZXIoaW5kZXgpO1xuICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gdGhpcy50aWxlcy5sZW5ndGggfHwgaXNOYU4oaW5kZXgpKSB7XG4gICAgICBpbmRleCA9IDA7XG4gICAgfVxuICAgIHRoaXMuX2FjdGl2ZSA9IGluZGV4O1xuICB9XG5cbiAgc2V0IGRpcmVjdGlvbiAoZGlyZWN0aW9uKSB7XG4gICAgaWYgKCF0aGlzLnJ1bm5pbmcpIHtcbiAgICAgIHRoaXMuX2RpcmVjdGlvbiA9IGRpcmVjdGlvbiA9PT0gJ2Rvd24nID8gJ2Rvd24nIDogJ3VwJztcbiAgICB9XG4gIH1cblxuICBzZXQgX2FuaW1hdGlvbkZYIChGWF9TUEVFRCkge1xuICAgIGNvbnN0IGRlbGF5ID0gdGhpcy5kZWxheSAvIDQ7XG5cbiAgICByYWYoKCkgPT4ge1xuICAgICAgWy4uLnRoaXMudGlsZXMsIHRoaXMuX2Zha2VMYXN0VGlsZSwgdGhpcy5fZmFrZUZpcnN0VGlsZV0uZm9yRWFjaCgodGlsZSkgPT4ge1xuICAgICAgICB0aWxlLmNsYXNzTGlzdC5yZW1vdmUoRlhfRkFTVCwgRlhfTk9STUFMLCBGWF9TTE9XLCBGWF9UVVJUTEUpO1xuICAgICAgICBpZiAoRlhfU1BFRUQgIT09IEZYX1NUT1ApIHtcbiAgICAgICAgICB0aWxlLmNsYXNzTGlzdC5hZGQoRlhfU1BFRUQpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKEZYX1NQRUVEID09PSBGWF9TVE9QKSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC5yZW1vdmUoRlhfR1JBRElFTlQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIuY2xhc3NMaXN0LmFkZChGWF9HUkFESUVOVCk7XG4gICAgICB9XG4gICAgfSwgZGVsYXkpO1xuICB9XG5cbiAgc2V0IHRyYW5zaXRpb24gKHRyYW5zaXRpb24pIHtcbiAgICB0aGlzLl90cmFuc2l0aW9uID0gdHJhbnNpdGlvbiB8fCAnZWFzZS1pbi1vdXQnO1xuICB9XG5cbiAgX2NoYW5nZVRyYW5zaXRpb24gKGRlbGF5ID0gdGhpcy5kZWxheSwgdHJhbnNpdGlvbiA9IHRoaXMudHJhbnNpdGlvbikge1xuICAgIHRoaXMuY29udGFpbmVyLnN0eWxlLnRyYW5zaXRpb24gPSBgJHtkZWxheSAvIDEwMDB9cyAke3RyYW5zaXRpb259YDtcbiAgfVxuXG4gIF9jaGFuZ2VUcmFuc2Zvcm0gKG1hcmdpbikge1xuICAgIHRoaXMuY29udGFpbmVyLnN0eWxlLnRyYW5zZm9ybSA9IGBtYXRyaXgoMSwgMCwgMCwgMSwgMCwgJHttYXJnaW59KWA7XG4gIH1cblxuICBfaXNHb2luZ0JhY2t3YXJkICgpIHtcbiAgICByZXR1cm4gdGhpcy5uZXh0QWN0aXZlID4gdGhpcy5hY3RpdmUgJiYgdGhpcy5hY3RpdmUgPT09IDAgJiYgdGhpcy5uZXh0QWN0aXZlID09PSB0aGlzLnRpbGVzLmxlbmd0aCAtIDE7XG4gIH1cblxuICBfaXNHb2luZ0ZvcndhcmQgKCkge1xuICAgIHJldHVybiB0aGlzLm5leHRBY3RpdmUgPD0gdGhpcy5hY3RpdmUgJiYgdGhpcy5hY3RpdmUgPT09IHRoaXMudGlsZXMubGVuZ3RoIC0gMSAmJiB0aGlzLm5leHRBY3RpdmUgPT09IDA7XG4gIH1cblxuICBnZXRUaWxlT2Zmc2V0IChpbmRleCkge1xuICAgIGxldCBvZmZzZXQgPSAwO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbmRleDsgaSsrKSB7XG4gICAgICBvZmZzZXQgKz0gdGhpcy50aWxlc1tpXS5vZmZzZXRIZWlnaHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX21pblRvcCAtIG9mZnNldDtcbiAgfVxuXG4gIF9yZXNldFBvc2l0aW9uIChtYXJnaW4pIHtcbiAgICB0aGlzLmNvbnRhaW5lci5jbGFzc0xpc3QudG9nZ2xlKEZYX05PX1RSQU5TSVRJT04pO1xuICAgIHRoaXMuX2NoYW5nZVRyYW5zZm9ybSghaXNOYU4obWFyZ2luKSA/IG1hcmdpbiA6IHRoaXMuYm91bmRzLmluaXRpYWwpO1xuICAgIC8vIEZvcmNlIHJlZmxvdywgZmx1c2hpbmcgdGhlIENTUyBjaGFuZ2VzXG4gICAgdGhpcy5jb250YWluZXIub2Zmc2V0SGVpZ2h0O1xuICAgIHRoaXMuY29udGFpbmVyLmNsYXNzTGlzdC50b2dnbGUoRlhfTk9fVFJBTlNJVElPTik7XG4gIH1cblxuICBwcmV2ICgpIHtcbiAgICB0aGlzLm5leHRBY3RpdmUgPSB0aGlzLnByZXZJbmRleDtcbiAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgIHRoaXMuc3RvcCgpO1xuXG4gICAgcmV0dXJuIHRoaXMubmV4dEFjdGl2ZTtcbiAgfVxuXG4gIG5leHQgKCkge1xuICAgIHRoaXMubmV4dEFjdGl2ZSA9IHRoaXMubmV4dEluZGV4O1xuICAgIHRoaXMucnVubmluZyA9IHRydWU7XG4gICAgdGhpcy5zdG9wKCk7XG5cbiAgICByZXR1cm4gdGhpcy5uZXh0QWN0aXZlO1xuICB9XG5cbiAgX2dldERlbGF5RnJvbVNwaW5zIChzcGlucykge1xuICAgIGxldCBkZWxheSA9IHRoaXMuZGVsYXk7XG4gICAgdGhpcy50cmFuc2l0aW9uID0gJ2xpbmVhcic7XG5cbiAgICBzd2l0Y2ggKHNwaW5zKSB7XG4gICAgICBjYXNlIDE6XG4gICAgICAgIGRlbGF5IC89IDAuNTtcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uID0gJ2Vhc2Utb3V0JztcbiAgICAgICAgdGhpcy5fYW5pbWF0aW9uRlggPSBGWF9UVVJUTEU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBkZWxheSAvPSAwLjc1O1xuICAgICAgICB0aGlzLl9hbmltYXRpb25GWCA9IEZYX1NMT1c7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBkZWxheSAvPSAxO1xuICAgICAgICB0aGlzLl9hbmltYXRpb25GWCA9IEZYX05PUk1BTDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDQ6XG4gICAgICAgIGRlbGF5IC89IDEuMjU7XG4gICAgICAgIHRoaXMuX2FuaW1hdGlvbkZYID0gRlhfTk9STUFMO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGRlbGF5IC89IDEuNTtcbiAgICAgICAgdGhpcy5fYW5pbWF0aW9uRlggPSBGWF9GQVNUO1xuICAgIH1cblxuICAgIHJldHVybiBkZWxheTtcbiAgfVxuXG4gIHNodWZmbGUgKHNwaW5zLCBvbkNvbXBsZXRlKSB7XG4gICAgLy8gTWFrZSBzcGlucyBvcHRpb25hbFxuICAgIGlmICh0eXBlb2Ygc3BpbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG9uQ29tcGxldGUgPSBzcGlucztcbiAgICB9XG4gICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcbiAgICAvLyBQZXJmb3JtIGFuaW1hdGlvblxuICAgIGlmICghdGhpcy52aXNpYmxlICYmIHRoaXMuaW5WaWV3cG9ydCA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy5zdG9wKG9uQ29tcGxldGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBkZWxheSA9IHRoaXMuX2dldERlbGF5RnJvbVNwaW5zKHNwaW5zKTtcbiAgICAgIC8vIHRoaXMuZGVsYXkgPSBkZWxheTtcbiAgICAgIHRoaXMuX2NoYW5nZVRyYW5zaXRpb24oZGVsYXkpO1xuICAgICAgdGhpcy5fY2hhbmdlVHJhbnNmb3JtKHRoaXMuYm91bmRzLnRvKTtcbiAgICAgIHJhZigoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5zdG9wcGluZyAmJiB0aGlzLnJ1bm5pbmcpIHtcbiAgICAgICAgICBjb25zdCBsZWZ0ID0gc3BpbnMgLSAxO1xuXG4gICAgICAgICAgdGhpcy5fcmVzZXRQb3NpdGlvbih0aGlzLmJvdW5kcy5maXJzdCk7XG5cbiAgICAgICAgICBpZiAobGVmdCA+IDEpIHtcbiAgICAgICAgICAgIC8vIFJlcGVhdCBhbmltYXRpb25cbiAgICAgICAgICAgIHRoaXMuc2h1ZmZsZShsZWZ0LCBvbkNvbXBsZXRlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdG9wKG9uQ29tcGxldGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgZGVsYXkpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLm5leHRBY3RpdmU7XG4gIH1cblxuICBzdG9wIChvblN0b3ApIHtcbiAgICBpZiAoIXRoaXMucnVubmluZyB8fCB0aGlzLnN0b3BwaW5nKSB7XG4gICAgICByZXR1cm4gdGhpcy5uZXh0QWN0aXZlO1xuICAgIH1cblxuICAgIHRoaXMucnVubmluZyA9IHRydWU7XG4gICAgdGhpcy5zdG9wcGluZyA9IHRydWU7XG5cbiAgICBpZiAoIU51bWJlci5pc0ludGVnZXIodGhpcy5uZXh0QWN0aXZlKSkge1xuICAgICAgLy8gR2V0IHJhbmRvbSBvciBjdXN0b20gZWxlbWVudFxuICAgICAgdGhpcy5uZXh0QWN0aXZlID0gdGhpcy5jdXN0b207XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZGlyZWN0aW9uIHRvIHByZXZlbnQganVtcGluZ1xuICAgIGlmICh0aGlzLl9pc0dvaW5nQmFja3dhcmQoKSkge1xuICAgICAgdGhpcy5fcmVzZXRQb3NpdGlvbih0aGlzLmJvdW5kcy5maXJzdFRvTGFzdCk7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9pc0dvaW5nRm9yd2FyZCgpKSB7XG4gICAgICB0aGlzLl9yZXNldFBvc2l0aW9uKHRoaXMuYm91bmRzLmxhc3RUb0ZpcnN0KTtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgbGFzdCBjaG9vc2VuIGVsZW1lbnQgaW5kZXhcbiAgICB0aGlzLmFjdGl2ZSA9IHRoaXMubmV4dEFjdGl2ZTtcblxuICAgIC8vIFBlcmZvcm0gYW5pbWF0aW9uXG4gICAgY29uc3QgZGVsYXkgPSB0aGlzLl9nZXREZWxheUZyb21TcGlucygxKTtcbiAgICAvLyB0aGlzLmRlbGF5ID0gZGVsYXk7XG4gICAgdGhpcy5fY2hhbmdlVHJhbnNpdGlvbihkZWxheSk7XG4gICAgdGhpcy5fYW5pbWF0aW9uRlggPSBGWF9TVE9QO1xuICAgIHRoaXMuX2NoYW5nZVRyYW5zZm9ybSh0aGlzLmdldFRpbGVPZmZzZXQodGhpcy5hY3RpdmUpKTtcbiAgICByYWYoKCkgPT4ge1xuICAgICAgdGhpcy5zdG9wcGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLm5leHRBY3RpdmUgPSBudWxsO1xuXG4gICAgICBpZiAodHlwZW9mIHRoaXMub25Db21wbGV0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLm9uQ29tcGxldGUodGhpcy5hY3RpdmUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIG9uU3RvcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBvblN0b3AuYXBwbHkodGhpcywgW3RoaXMuYWN0aXZlXSk7XG4gICAgICB9XG4gICAgfSwgZGVsYXkpO1xuXG4gICAgcmV0dXJuIHRoaXMuYWN0aXZlO1xuICB9XG5cbiAgcnVuICgpIHtcbiAgICBpZiAodGhpcy5ydW5uaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fdGltZXIgPSBuZXcgVGltZXIoKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLnZpc2libGUgJiYgdGhpcy5pblZpZXdwb3J0ID09PSB0cnVlKSB7XG4gICAgICAgIHJhZigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fdGltZXIucmVzZXQoKVxuICAgICAgICB9LCA1MDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zaHVmZmxlKHRoaXMuc3BpbnMsICgpID0+IHtcbiAgICAgICAgICB0aGlzLl90aW1lci5yZXNldCgpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sIHRoaXMuYXV0byk7XG4gIH1cblxuICBkZXN0cm95ICgpIHtcbiAgICB0aGlzLl9mYWtlRmlyc3RUaWxlLnJlbW92ZSgpO1xuICAgIHRoaXMuX2Zha2VMYXN0VGlsZS5yZW1vdmUoKTtcbiAgICAvLyB0aGlzLiR0aWxlcy51bndyYXAoKTtcblxuICAgIC8vIFVud3JhcCB0aWxlc1xuICAgIHRoaXMudGlsZXMuZm9yRWFjaCgodGlsZSkgPT4ge1xuICAgICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRpbGUpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5jb250YWluZXIucmVtb3ZlKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTbG90TWFjaGluZTtcbiIsIm1vZHVsZS5leHBvcnRzID0gY2xhc3MgVGltZXIge1xuICBjb25zdHJ1Y3RvciAoY2IsIGRlbGF5KSB7XG4gICAgdGhpcy5jYiA9IGNiO1xuICAgIHRoaXMuaW5pdGlhbERlbGF5ID0gZGVsYXk7XG4gICAgdGhpcy5kZWxheSA9IGRlbGF5O1xuICAgIHRoaXMuc3RhcnRUaW1lID0gbnVsbDtcbiAgICB0aGlzLnRpbWVyID0gbnVsbDtcbiAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcblxuICAgIHRoaXMucmVzdW1lKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9zdGFydCAoKSB7XG4gICAgdGhpcy50aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLmNiKHRoaXMpO1xuICAgIH0sIHRoaXMuZGVsYXkpO1xuICB9XG5cbiAgY2FuY2VsICgpIHtcbiAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lcik7XG4gIH1cblxuICBwYXVzZSAoKSB7XG4gICAgaWYgKHRoaXMucnVubmluZykge1xuICAgICAgdGhpcy5kZWxheSAtPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHRoaXMuc3RhcnRUaW1lO1xuICAgICAgdGhpcy5jYW5jZWwoKTtcbiAgICB9XG4gIH1cblxuICByZXN1bWUgKCkge1xuICAgIGlmICghdGhpcy5ydW5uaW5nKSB7XG4gICAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgICAgdGhpcy5zdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblxuICAgICAgdGhpcy5fc3RhcnQoKTtcbiAgICB9XG4gIH1cblxuICByZXNldCAoKSB7XG4gICAgdGhpcy5jYW5jZWwoKTtcbiAgICB0aGlzLmRlbGF5ID0gdGhpcy5pbml0aWFsRGVsYXk7XG4gICAgdGhpcy5fc3RhcnQoKTtcbiAgfVxuXG4gIGFkZCAoZXh0cmFEZWxheSkge1xuICAgIHRoaXMucGF1c2UoKTtcbiAgICB0aGlzLmRlbGF5ICs9IGV4dHJhRGVsYXk7XG4gICAgdGhpcy5yZXN1bWUoKTtcbiAgfVxufTtcbiJdfQ==
