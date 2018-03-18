(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Timer = require('./timer');

/*
 * jQuery Slot Machine v3.0.1
 * https:// github.com/josex2r/jQuery-SlotMachine
 *
 * Copyright 2014 Jose Luis Represa
 * Released under the MIT license
 */
(function init($, window, document, undefined) {

    var pluginName = 'slotMachine',
        defaults = {
        active: 0, // Active element [Number]
        delay: 200, // Animation time [Number]
        auto: false, // Repeat delay [false||Number]
        spins: 5, // Number of spins when auto [Number]
        randomize: null, // Randomize function, must return a number with the selected position
        complete: null, // Callback function(result)
        stopHidden: true, // Stops animations if the element isn´t visible on the screen
        direction: 'up' // Animation direction ['up'||'down']
    },
        FX_NO_TRANSITION = 'slotMachineNoTransition',
        FX_FAST = 'slotMachineBlurFast',
        FX_NORMAL = 'slotMachineBlurMedium',
        FX_SLOW = 'slotMachineBlurSlow',
        FX_TURTLE = 'slotMachineBlurTurtle',
        FX_GRADIENT = 'slotMachineGradient',
        FX_STOP = FX_GRADIENT;

    /**
     * @desc Class - Makes Slot Machine animation effect
     * @param DOM element - Html element
     * @param object settings - Plugin configuration params
     * @return jQuery node - Returns jQuery selector with some new functions (shuffle, stop, next, auto, active)
     */

    var SlotMachine = function () {
        function SlotMachine(element, options) {
            _classCallCheck(this, SlotMachine);

            this.element = element;
            this.settings = $.extend({}, defaults, options);
            this.defaults = defaults;
            this.name = pluginName;

            // jQuery selector
            this.$slot = $(element);
            // Slot Machine elements
            this.$tiles = this.$slot.children();
            // Container to wrap $tiles
            this.$container = null;
            // Min marginTop offset
            this._minTop = null;
            // Max marginTop offset
            this._maxTop = null;
            // First element (the last of the html container)
            this._$fakeFirstTile = null;
            // Last element (the first of the html container)
            this._$fakeLastTile = null;
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

            this.$slot.css('overflow', 'hidden');

            // Wrap elements inside $container
            this.$container = this.$tiles.wrapAll('<div class="slotMachineContainer" />').parent();
            this.$container.css('transition', '1s ease-in-out');

            // Set max top offset
            this._maxTop = -this.$container.height();

            // Create fake tiles to prevent empty offset
            this._initFakeTiles();

            // Set min top offset
            this._minTop = -this._$fakeFirstTile.outerHeight();

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
            key: '_initFakeTiles',
            value: function _initFakeTiles() {
                // Add the last element behind the first to prevent the jump effect
                this._$fakeFirstTile = this.$tiles.last().clone();
                this._$fakeLastTile = this.$tiles.first().clone();
                // Add fake titles to the DOM
                this.$container.prepend(this._$fakeFirstTile);
                this.$container.append(this._$fakeLastTile);
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
                        last: this.getTileOffset(this.$tiles.length),
                        to: this._maxTop,
                        firstToLast: this.getTileOffset(this.$tiles.length),
                        lastToFirst: 0
                    },
                    down: {
                        key: 'down',
                        initial: this.getTileOffset(this.active),
                        first: this.getTileOffset(this.$tiles.length),
                        last: 0,
                        to: this._minTop,
                        firstToLast: this.getTileOffset(this.$tiles.length),
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
                var delay = this._delay || this.settings.delay,
                    transition = this._transition || this.settings.transition;
                this.$container.css('transition', delay + 's ' + transition);
            }

            /**
             * @desc PRIVATE - Set container margin
             * @param {Number}||String - Active element index
             */

        }, {
            key: '_animate',
            value: function _animate(margin) {
                this.$container.css('transform', 'matrix(1, 0, 0, 1, 0, ' + margin + ')');
            }

            /**
             * @desc PRIVATE - Is moving from the first element to the last
             * @return {Boolean}
             */

        }, {
            key: '_isGoingBackward',
            value: function _isGoingBackward() {
                return this.futureActive > this.active && this.active === 0 && this.futureActive === this.$tiles.length - 1;
            }

            /**
             * @desc PRIVATE - Is moving from the last element to the first
             * @param {Boolean}
             */

        }, {
            key: '_isGoingForward',
            value: function _isGoingForward() {
                return this.futureActive <= this.active && this.active === this.$tiles.length - 1 && this.futureActive === 0;
            }

            /**
             * @desc PUBLIC - Custom setTimeout using requestAnimationFrame
             * @param function cb - Callback
             * @param {Number} timeout - Timeout delay
             */

        }, {
            key: 'raf',
            value: function raf(cb, timeout) {
                var _raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame,
                    startTime = new Date().getTime(),
                    _rafHandler = function _rafHandler() {
                    var drawStart = new Date().getTime(),
                        diff = drawStart - startTime;

                    if (diff < timeout) {
                        _raf(_rafHandler);
                    } else if (typeof cb === 'function') {
                        cb();
                    }
                };

                _raf(_rafHandler);
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
                    offset += this.$tiles.eq(i).outerHeight();
                }

                return this._minTop - offset;
            }

            /**
             * @desc PRIVATE - Reset active element position
             */

        }, {
            key: 'resetPosition',
            value: function resetPosition(margin) {
                this.$container.toggleClass(FX_NO_TRANSITION);
                this._animate(margin === undefined ? this.direction.initial : margin);
                // Force reflow, flushing the CSS changes
                this.$container[0].offsetHeight;
                this.$container.toggleClass(FX_NO_TRANSITION);
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
                var _this = this;

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
                    this.raf(function () {
                        if (!_this.stopping && _this.running) {
                            var left = spins - 1;

                            _this.resetPosition(_this.direction.first);
                            if (left <= 1) {
                                _this.stop(onComplete);
                            } else {
                                // Repeat animation
                                _this.shuffle(left, onComplete);
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
                var _this2 = this;

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
                this.raf(function () {
                    _this2.stopping = false;
                    _this2.running = false;
                    _this2.futureActive = null;

                    if (typeof _this2.settings.complete === 'function') {
                        _this2.settings.complete.apply(_this2, [_this2.active]);
                    }

                    if (typeof onStop === 'function') {
                        onStop.apply(_this2, [_this2.active]);
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
                var _this3 = this;

                if (!this.running) {
                    this._timer = new Timer(function () {
                        if (typeof _this3.settings.randomize !== 'function') {
                            _this3.settings.randomize = function () {
                                return _this3._nextIndex;
                            };
                        }
                        if (!_this3.visible && _this3.settings.stopHidden === true) {
                            _this3.raf(_this3._timer.reset.bind(_this3._timer), 500);
                        } else {
                            _this3.shuffle(_this3.settings.spins, _this3._timer.reset.bind(_this3._timer));
                        }
                    }, this.settings.auto);
                }
            }

            /**
             * @desc PUBLIC - Destroy the machine
             */

        }, {
            key: 'destroy',
            value: function destroy() {
                this._$fakeFirstTile.remove();
                this._$fakeLastTile.remove();
                this.$tiles.unwrap();
                $.data(this.element[0], 'plugin_' + pluginName, null);
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
                if (index < 0 || index >= this.$tiles.length) {
                    this._active = 0;
                }
            }

            /**
             * @desc PUBLIC - Set the spin direction
             */

        }, {
            key: 'visibleTile',
            get: function get() {
                var firstTileHeight = this.$tiles.first().height(),
                    rawContainerMargin = this.$container.css('transform'),
                    matrixRegExp = /^matrix\(-?\d+,\s?-?\d+,\s?-?\d+,\s?-?\d+,\s?-?\d+,\s?(-?\d+)\)$/,
                    containerMargin = parseInt(rawContainerMargin.replace(matrixRegExp, '$1'), 10);

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
                return Math.floor(Math.random() * this.$tiles.length);
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
                    if (index < 0 || index >= this.$tiles.length) {
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
                    this.direction = direction === 'down' ? 'down' : 'up';
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

                return prevIndex < 0 ? this.$tiles.length - 1 : prevIndex;
            }

            /**
             * @desc PRIVATE - Get the next element (no direction related)
             * @return {Number} - Element index
             */

        }, {
            key: '_nextIndex',
            get: function get() {
                var nextIndex = this.active + 1;

                return nextIndex < this.$tiles.length ? nextIndex : 0;
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
                var $window = $(window),
                    above = this.$slot.offset().top > $window.scrollTop() + $window.height(),
                    below = $window.scrollTop() > this.$slot.height() + this.$slot.offset().top;

                // Stop animation if element is [above||below] screen, best for performance
                return !above && !below;
            }
        }, {
            key: '_fxClass',
            set: function set(FX_SPEED) {
                var classes = [FX_FAST, FX_NORMAL, FX_SLOW, FX_TURTLE].join(' ');

                this.$tiles.add(this._$fakeFirstTile).add(this._$fakeLastTile).removeClass(classes).addClass(FX_SPEED);
            }

            /**
             * @desc PRIVATE - Set CSS classes to make speed effect
             * @param string FX_SPEED - Element speed [FX_FAST_BLUR||FX_NORMAL_BLUR||FX_SLOW_BLUR||FX_STOP]
             * @param string||boolean fade - Set fade gradient effect
             */

        }, {
            key: '_animationFX',
            set: function set(FX_SPEED) {
                var delay = this.settings.delay / 4,
                    $elements = this.$slot.add(this.$tiles).add(this._$fakeFirstTile).add(this._$fakeLastTile);

                this.raf(function cb() {
                    this._fxClass = FX_SPEED;

                    if (FX_SPEED === FX_STOP) {
                        $elements.removeClass(FX_GRADIENT);
                    } else {
                        $elements.addClass(FX_GRADIENT);
                    }
                }.bind(this), delay);
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

    /*
    * Create new plugin instance if needed and return it
    */


    function _getInstance(element, options) {
        var machine = void 0;
        if (!$.data(element[0], 'plugin_' + pluginName)) {
            machine = new SlotMachine(element, options);
            $.data(element[0], 'plugin_' + pluginName, machine);
        } else {
            machine = $.data(element[0], 'plugin_' + pluginName);
        }
        return machine;
    }

    /*
    * Chainable instance
    */
    $.fn[pluginName] = function initPlugin(options) {
        var instances = void 0;
        if (this.length === 1) {
            instances = _getInstance(this, options);
        } else {
            var $els = this;
            instances = $.map($els, function (el, index) {
                var $el = $els.eq(index);
                return _getInstance($el, options);
            });
        }
        return instances;
    };
})(jQuery, window, document);

},{"./timer":2}],2:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
  function Timer(cb, delay) {
    _classCallCheck(this, Timer);

    this.cb = cb;
    this.initialDelay = delay;
    this.delay = delay;
    this.deferred = jQuery.Deferred();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvaW5kZXguanMiLCJsaWIvdGltZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQSxJQUFNLFFBQVEsUUFBUSxTQUFSLENBQWQ7O0FBRUE7Ozs7Ozs7QUFPQSxDQUFDLFNBQVMsSUFBVCxDQUFjLENBQWQsRUFBaUIsTUFBakIsRUFBeUIsUUFBekIsRUFBbUMsU0FBbkMsRUFBOEM7O0FBRS9DLFFBQU0sYUFBYSxhQUFuQjtBQUFBLFFBQ0ksV0FBVztBQUNQLGdCQUFRLENBREQsRUFDSTtBQUNYLGVBQU8sR0FGQSxFQUVLO0FBQ1osY0FBTSxLQUhDLEVBR007QUFDbkIsZUFBTyxDQUpNLEVBSUg7QUFDSixtQkFBVyxJQUxKLEVBS1U7QUFDakIsa0JBQVUsSUFOSCxFQU1TO0FBQ2hCLG9CQUFZLElBUEwsRUFPVztBQUNsQixtQkFBVyxJQVJKLENBUVM7QUFSVCxLQURmO0FBQUEsUUFXSSxtQkFBbUIseUJBWHZCO0FBQUEsUUFZSSxVQUFVLHFCQVpkO0FBQUEsUUFhSSxZQUFZLHVCQWJoQjtBQUFBLFFBY0ksVUFBVSxxQkFkZDtBQUFBLFFBZUksWUFBWSx1QkFmaEI7QUFBQSxRQWdCSSxjQUFjLHFCQWhCbEI7QUFBQSxRQWlCSSxVQUFVLFdBakJkOztBQW1CQTs7Ozs7OztBQXJCK0MsUUEyQnpDLFdBM0J5QztBQTRCM0MsNkJBQWEsT0FBYixFQUFzQixPQUF0QixFQUErQjtBQUFBOztBQUMzQixpQkFBSyxPQUFMLEdBQWUsT0FBZjtBQUNBLGlCQUFLLFFBQUwsR0FBZ0IsRUFBRSxNQUFGLENBQVMsRUFBVCxFQUFhLFFBQWIsRUFBdUIsT0FBdkIsQ0FBaEI7QUFDQSxpQkFBSyxRQUFMLEdBQWdCLFFBQWhCO0FBQ0EsaUJBQUssSUFBTCxHQUFZLFVBQVo7O0FBRUE7QUFDQSxpQkFBSyxLQUFMLEdBQWEsRUFBRSxPQUFGLENBQWI7QUFDQTtBQUNBLGlCQUFL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QixJQUFqQjtBQUNBLFNBQUssS0FBTCxHQUFhLElBQWI7QUFDQSxTQUFLLE9BQUwsR0FBZSxLQUFmOztBQUVBLFNBQUssTUFBTDs7QUFFQSxXQUFPLElBQVA7QUFDRDs7QUFiSDtBQUFBO0FBQUEsNkJBZVk7QUFBQTs7QUFDUixXQUFLLEtBQUwsR0FBYSxXQUFXLFlBQU07QUFDNUIsY0FBSyxFQUFMO0FBQ0QsT0FGWSxFQUVWLEtBQUssS0FGSyxDQUFiO0FBR0Q7QUFuQkg7QUFBQTtBQUFBLDZCQXFCWTtBQUNSLFdBQUssT0FBTCxHQUFlLEtBQWY7QUFDQSxtQkFBYSxLQUFLLEtBQWxCO0FBQ0Q7QUF4Qkg7QUFBQTtBQUFBLDRCQTBCVztBQUNQLFVBQUksS0FBSyxPQUFULEVBQWtCO0FBQ2hCLGFBQUssS0FBTCxJQUFjLElBQUksSUFBSixHQUFXLE9BQVgsS0FBdUIsS0FBSyxTQUExQztBQUNBLGFBQUssTUFBTDtBQUNEO0FBQ0Y7QUEvQkg7QUFBQTtBQUFBLDZCQWlDWTtBQUNSLFVBQUksQ0FBQyxLQUFLLE9BQVYsRUFBbUI7QUFDakIsYUFBSyxPQUFMLEdBQWUsSUFBZjtBQUNBLGFBQUssU0FBTCxHQUFpQixJQUFJLElBQUosR0FBVyxPQUFYLEVBQWpCOztBQUVBLGFBQUssTUFBTDtBQUNEO0FBQ0Y7QUF4Q0g7QUFBQTtBQUFBLDRCQTBDVztBQUNQLFdBQUssTUFBTDtBQUNBLFdBQUssS0FBTCxHQUFhLEtBQUssWUFBbEI7QUFDQSxXQUFLLE1BQUw7QUFDRDtBQTlDSDtBQUFBO0FBQUEsd0JBZ0RPLFVBaERQLEVBZ0RtQjtBQUNmLFdBQUssS0FBTDtBQUNBLFdBQUssS0FBTCxJQUFjLFVBQWQ7QUFDQSxXQUFLLE1BQUw7QUFDRDtBQXBESDs7QUFBQTtBQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc31yZXR1cm4gZX0pKCkiLCJjb25zdCBUaW1lciA9IHJlcXVpcmUoJy4vdGltZXInKTtcblxuLypcbiAqIGpRdWVyeSBTbG90IE1hY2hpbmUgdjMuMC4xXG4gKiBodHRwczovLyBnaXRodWIuY29tL2pvc2V4MnIvalF1ZXJ5LVNsb3RNYWNoaW5lXG4gKlxuICogQ29weXJpZ2h0IDIwMTQgSm9zZSBMdWlzIFJlcHJlc2FcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG4oZnVuY3Rpb24gaW5pdCgkLCB3aW5kb3csIGRvY3VtZW50LCB1bmRlZmluZWQpIHtcblxuY29uc3QgcGx1Z2luTmFtZSA9ICdzbG90TWFjaGluZScsXG4gICAgZGVmYXVsdHMgPSB7XG4gICAgICAgIGFjdGl2ZTogMCwgLy8gQWN0aXZlIGVsZW1lbnQgW051bWJlcl1cbiAgICAgICAgZGVsYXk6IDIwMCwgLy8gQW5pbWF0aW9uIHRpbWUgW051bWJlcl1cbiAgICAgICAgYXV0bzogZmFsc2UsIC8vIFJlcGVhdCBkZWxheSBbZmFsc2V8fE51bWJlcl1cblx0XHRzcGluczogNSwgLy8gTnVtYmVyIG9mIHNwaW5zIHdoZW4gYXV0byBbTnVtYmVyXVxuICAgICAgICByYW5kb21pemU6IG51bGwsIC8vIFJhbmRvbWl6ZSBmdW5jdGlvbiwgbXVzdCByZXR1cm4gYSBudW1iZXIgd2l0aCB0aGUgc2VsZWN0ZWQgcG9zaXRpb25cbiAgICAgICAgY29tcGxldGU6IG51bGwsIC8vIENhbGxiYWNrIGZ1bmN0aW9uKHJlc3VsdClcbiAgICAgICAgc3RvcEhpZGRlbjogdHJ1ZSwgLy8gU3RvcHMgYW5pbWF0aW9ucyBpZiB0aGUgZWxlbWVudCBpc27CtHQgdmlzaWJsZSBvbiB0aGUgc2NyZWVuXG4gICAgICAgIGRpcmVjdGlvbjogJ3VwJyAvLyBBbmltYXRpb24gZGlyZWN0aW9uIFsndXAnfHwnZG93biddXG4gICAgfSxcbiAgICBGWF9OT19UUkFOU0lUSU9OID0gJ3Nsb3RNYWNoaW5lTm9UcmFuc2l0aW9uJyxcbiAgICBGWF9GQVNUID0gJ3Nsb3RNYWNoaW5lQmx1ckZhc3QnLFxuICAgIEZYX05PUk1BTCA9ICdzbG90TWFjaGluZUJsdXJNZWRpdW0nLFxuICAgIEZYX1NMT1cgPSAnc2xvdE1hY2hpbmVCbHVyU2xvdycsXG4gICAgRlhfVFVSVExFID0gJ3Nsb3RNYWNoaW5lQmx1clR1cnRsZScsXG4gICAgRlhfR1JBRElFTlQgPSAnc2xvdE1hY2hpbmVHcmFkaWVudCcsXG4gICAgRlhfU1RPUCA9IEZYX0dSQURJRU5UO1xuXG4vKipcbiAqIEBkZXNjIENsYXNzIC0gTWFrZXMgU2xvdCBNYWNoaW5lIGFuaW1hdGlvbiBlZmZlY3RcbiAqIEBwYXJhbSBET00gZWxlbWVudCAtIEh0bWwgZWxlbWVudFxuICogQHBhcmFtIG9iamVjdCBzZXR0aW5ncyAtIFBsdWdpbiBjb25maWd1cmF0aW9uIHBhcmFtc1xuICogQHJldHVybiBqUXVlcnkgbm9kZSAtIFJldHVybnMgalF1ZXJ5IHNlbGVjdG9yIHdpdGggc29tZSBuZXcgZnVuY3Rpb25zIChzaHVmZmxlLCBzdG9wLCBuZXh0LCBhdXRvLCBhY3RpdmUpXG4gKi9cbmNsYXNzIFNsb3RNYWNoaW5lIHtcbiAgICBjb25zdHJ1Y3RvciAoZWxlbWVudCwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgICAgICB0aGlzLnNldHRpbmdzID0gJC5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5kZWZhdWx0cyA9IGRlZmF1bHRzO1xuICAgICAgICB0aGlzLm5hbWUgPSBwbHVnaW5OYW1lO1xuXG4gICAgICAgIC8vIGpRdWVyeSBzZWxlY3RvclxuICAgICAgICB0aGlzLiRzbG90ID0gJChlbGVtZW50KTtcbiAgICAgICAgLy8gU2xvdCBNYWNoaW5lIGVsZW1lbnRzXG4gICAgICAgIHRoaXMuJHRpbGVzID0gdGhpcy4kc2xvdC5jaGlsZHJlbigpO1xuICAgICAgICAvLyBDb250YWluZXIgdG8gd3JhcCAkdGlsZXNcbiAgICAgICAgdGhpcy4kY29udGFpbmVyID0gbnVsbDtcbiAgICAgICAgLy8gTWluIG1hcmdpblRvcCBvZmZzZXRcbiAgICAgICAgdGhpcy5fbWluVG9wID0gbnVsbDtcbiAgICAgICAgLy8gTWF4IG1hcmdpblRvcCBvZmZzZXRcbiAgICAgICAgdGhpcy5fbWF4VG9wID0gbnVsbDtcbiAgICAgICAgLy8gRmlyc3QgZWxlbWVudCAodGhlIGxhc3Qgb2YgdGhlIGh0bWwgY29udGFpbmVyKVxuICAgICAgICB0aGlzLl8kZmFrZUZpcnN0VGlsZSA9IG51bGw7XG4gICAgICAgIC8vIExhc3QgZWxlbWVudCAodGhlIGZpcnN0IG9mIHRoZSBodG1sIGNvbnRhaW5lcilcbiAgICAgICAgdGhpcy5fJGZha2VMYXN0VGlsZSA9IG51bGw7XG4gICAgICAgIC8vIFRpbWVvdXQgcmVjdXJzaXZlIGZ1bmN0aW9uIHRvIGhhbmRsZSBhdXRvIChzZXR0aW5ncy5hdXRvKVxuICAgICAgICB0aGlzLl90aW1lciA9IG51bGw7XG4gICAgICAgIC8vIE51bWJlciBvZiBzcGlucyBsZWZ0IGJlZm9yZSBzdG9wXG4gICAgICAgIHRoaXMuX3NwaW5zTGVmdCA9IG51bGw7XG4gICAgICAgIC8vIEZ1dHVyZSByZXN1bHRcbiAgICAgICAgdGhpcy5mdXR1cmVBY3RpdmUgPSBudWxsO1xuICAgICAgICAvLyBNYWNoaW5lIGlzIHJ1bm5pbmc/XG4gICAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgICAgICAvLyBNYWNoaW5lIGlzIHN0b3BwaW5nP1xuICAgICAgICB0aGlzLnN0b3BwaW5nID0gZmFsc2U7XG4gICAgICAgIC8vIEN1cnJlbnQgYWN0aXZlIGVsZW1lbnRcbiAgICAgICAgdGhpcy5hY3RpdmUgPSB0aGlzLnNldHRpbmdzLmFjdGl2ZTtcblxuICAgICAgICB0aGlzLiRzbG90LmNzcygnb3ZlcmZsb3cnLCAnaGlkZGVuJyk7XG5cbiAgICAgICAgLy8gV3JhcCBlbGVtZW50cyBpbnNpZGUgJGNvbnRhaW5lclxuICAgICAgICB0aGlzLiRjb250YWluZXIgPSB0aGlzLiR0aWxlcy53cmFwQWxsKCc8ZGl2IGNsYXNzPVwic2xvdE1hY2hpbmVDb250YWluZXJcIiAvPicpLnBhcmVudCgpO1xuICAgICAgICB0aGlzLiRjb250YWluZXIuY3NzKCd0cmFuc2l0aW9uJywgJzFzIGVhc2UtaW4tb3V0Jyk7XG5cbiAgICAgICAgLy8gU2V0IG1heCB0b3Agb2Zmc2V0XG4gICAgICAgIHRoaXMuX21heFRvcCA9IC10aGlzLiRjb250YWluZXIuaGVpZ2h0KCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGZha2UgdGlsZXMgdG8gcHJldmVudCBlbXB0eSBvZmZzZXRcbiAgICAgICAgdGhpcy5faW5pdEZha2VUaWxlcygpO1xuXG4gICAgICAgIC8vIFNldCBtaW4gdG9wIG9mZnNldFxuICAgICAgICB0aGlzLl9taW5Ub3AgPSAtdGhpcy5fJGZha2VGaXJzdFRpbGUub3V0ZXJIZWlnaHQoKTtcblxuICAgICAgICAvLyBJbml0aWFsaXplIHNwaW4gZGlyZWN0aW9uIFt1cCwgZG93bl1cbiAgICAgICAgdGhpcy5faW5pdERpcmVjdGlvbigpO1xuXG4gICAgICAgIC8vIFNob3cgYWN0aXZlIGVsZW1lbnRcbiAgICAgICAgdGhpcy5yZXNldFBvc2l0aW9uKCk7XG5cbiAgICAgICAgLy8gU3RhcnQgYXV0byBhbmltYXRpb25cbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuYXV0byAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmF1dG8gPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNodWZmbGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hdXRvKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfaW5pdEZha2VUaWxlcyAoKSB7XG4gICAgICAgIC8vIEFkZCB0aGUgbGFzdCBlbGVtZW50IGJlaGluZCB0aGUgZmlyc3QgdG8gcHJldmVudCB0aGUganVtcCBlZmZlY3RcbiAgICAgICAgdGhpcy5fJGZha2VGaXJzdFRpbGUgPSB0aGlzLiR0aWxlcy5sYXN0KCkuY2xvbmUoKTtcbiAgICAgICAgdGhpcy5fJGZha2VMYXN0VGlsZSA9IHRoaXMuJHRpbGVzLmZpcnN0KCkuY2xvbmUoKTtcbiAgICAgICAgLy8gQWRkIGZha2UgdGl0bGVzIHRvIHRoZSBET01cbiAgICAgICAgdGhpcy4kY29udGFpbmVyLnByZXBlbmQodGhpcy5fJGZha2VGaXJzdFRpbGUpO1xuICAgICAgICB0aGlzLiRjb250YWluZXIuYXBwZW5kKHRoaXMuXyRmYWtlTGFzdFRpbGUpO1xuICAgIH1cblxuICAgIF9pbml0RGlyZWN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fZGlyZWN0aW9uID0ge1xuICAgICAgICAgICAgc2VsZWN0ZWQ6IHRoaXMuc2V0dGluZ3MuZGlyZWN0aW9uID09PSAnZG93bicgPyAnZG93bicgOiAndXAnLFxuICAgICAgICAgICAgdXA6IHtcbiAgICAgICAgICAgICAgICBrZXk6ICd1cCcsXG4gICAgICAgICAgICAgICAgaW5pdGlhbDogdGhpcy5nZXRUaWxlT2Zmc2V0KHRoaXMuYWN0aXZlKSxcbiAgICAgICAgICAgICAgICBmaXJzdDogMCxcbiAgICAgICAgICAgICAgICBsYXN0OiB0aGlzLmdldFRpbGVPZmZzZXQodGhpcy4kdGlsZXMubGVuZ3RoKSxcbiAgICAgICAgICAgICAgICB0bzogdGhpcy5fbWF4VG9wLFxuICAgICAgICAgICAgICAgIGZpcnN0VG9MYXN0OiB0aGlzLmdldFRpbGVPZmZzZXQodGhpcy4kdGlsZXMubGVuZ3RoKSxcbiAgICAgICAgICAgICAgICBsYXN0VG9GaXJzdDogMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRvd246IHtcbiAgICAgICAgICAgICAgICBrZXk6ICdkb3duJyxcbiAgICAgICAgICAgICAgICBpbml0aWFsOiB0aGlzLmdldFRpbGVPZmZzZXQodGhpcy5hY3RpdmUpLFxuICAgICAgICAgICAgICAgIGZpcnN0OiB0aGlzLmdldFRpbGVPZmZzZXQodGhpcy4kdGlsZXMubGVuZ3RoKSxcbiAgICAgICAgICAgICAgICBsYXN0OiAwLFxuICAgICAgICAgICAgICAgIHRvOiB0aGlzLl9taW5Ub3AsXG4gICAgICAgICAgICAgICAgZmlyc3RUb0xhc3Q6IHRoaXMuZ2V0VGlsZU9mZnNldCh0aGlzLiR0aWxlcy5sZW5ndGgpLFxuICAgICAgICAgICAgICAgIGxhc3RUb0ZpcnN0OiAwXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGRlc2MgUFVCTElDIC0gR2V0IGFjdGl2ZSBlbGVtZW50XG4gICAgICovXG4gICAgZ2V0IGFjdGl2ZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hY3RpdmU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGRlc2MgUFVCTElDIC0gR2V0IGN1cnJlbnQgc2hvd2luZyBlbGVtZW50IGluZGV4XG4gICAgICogQHJldHVybiB7TnVtYmVyfSAtIEVsZW1lbnQgaW5kZXhcbiAgICAgKi9cbiAgICBnZXQgdmlzaWJsZVRpbGUgKCkge1xuICAgICAgICBjb25zdCBmaXJzdFRpbGVIZWlnaHQgPSB0aGlzLiR0aWxlcy5maXJzdCgpLmhlaWdodCgpLFxuICAgICAgICAgICAgcmF3Q29udGFpbmVyTWFyZ2luID0gdGhpcy4kY29udGFpbmVyLmNzcygndHJhbnNmb3JtJyksXG4gICAgICAgICAgICBtYXRyaXhSZWdFeHAgPSAvXm1hdHJpeFxcKC0/XFxkKyxcXHM/LT9cXGQrLFxccz8tP1xcZCssXFxzPy0/XFxkKyxcXHM/LT9cXGQrLFxccz8oLT9cXGQrKVxcKSQvLFxuICAgICAgICAgICAgY29udGFpbmVyTWFyZ2luID0gcGFyc2VJbnQocmF3Q29udGFpbmVyTWFyZ2luLnJlcGxhY2UobWF0cml4UmVnRXhwLCAnJDEnKSwgMTApO1xuXG4gICAgICAgIHJldHVybiBNYXRoLmFicyhNYXRoLnJvdW5kKGNvbnRhaW5lck1hcmdpbiAvIGZpcnN0VGlsZUhlaWdodCkpIC0gMTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZGVzYyBQVUJMSUMgLSBHZXQgcmFuZG9tIGVsZW1lbnQgZGlmZmVyZW50IHRoYW4gbGFzdCBzaG93blxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gY2FudEJlVGhlQ3VycmVudCAtIHRydWV8fHVuZGVmaW5lZCBpZiBjYW50IGJlIGNob29zZW4gdGhlIGN1cnJlbnQgZWxlbWVudCwgcHJldmVudHMgcmVwZWF0XG4gICAgICogQHJldHVybiB7TnVtYmVyfSAtIEVsZW1lbnQgaW5kZXhcbiAgICAgKi9cbiAgICBnZXQgcmFuZG9tICgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMuJHRpbGVzLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGRlc2MgUFVCTElDIC0gR2V0IHJhbmRvbSBlbGVtZW50IGJhc2VkIG9uIHRoZSBjdXN0b20gcmFuZG9taXplIGZ1bmN0aW9uXG4gICAgICogQHJldHVybiB7TnVtYmVyfSAtIEVsZW1lbnQgaW5kZXhcbiAgICAgKi9cbiAgICBnZXQgY3VzdG9tICgpIHtcbiAgICAgICAgbGV0IGNob29zZW47XG5cbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnNldHRpbmdzLnJhbmRvbWl6ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5zZXR0aW5ncy5yYW5kb21pemUuY2FsbCh0aGlzLCB0aGlzLmFjdGl2ZSk7XG4gICAgICAgICAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHRoaXMuJHRpbGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNob29zZW4gPSBpbmRleDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNob29zZW4gPSB0aGlzLnJhbmRvbTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjaG9vc2VuO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBkZXNjIFBVQkxJQyAtIEdldCB0aGUgc3BpbiBkaXJlY3Rpb25cbiAgICAgKi9cbiAgICBnZXQgZGlyZWN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RpcmVjdGlvblt0aGlzLl9kaXJlY3Rpb24uc2VsZWN0ZWRdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBkZXNjIFBSSVZBVEUgLSBHZXQgdGhlIHByZXZpb3VzIGVsZW1lbnQgKG5vIGRpcmVjdGlvbiByZWxhdGVkKVxuICAgICAqIEByZXR1cm4ge051bWJlcn0gLSBFbGVtZW50IGluZGV4XG4gICAgICovXG4gICAgZ2V0IF9wcmV2SW5kZXggKCkge1xuICAgICAgICBjb25zdCBwcmV2SW5kZXggPSB0aGlzLmFjdGl2ZSAtIDE7XG5cbiAgICAgICAgcmV0dXJuIHByZXZJbmRleCA8IDAgPyAodGhpcy4kdGlsZXMubGVuZ3RoIC0gMSkgOiBwcmV2SW5kZXg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGRlc2MgUFJJVkFURSAtIEdldCB0aGUgbmV4dCBlbGVtZW50IChubyBkaXJlY3Rpb24gcmVsYXRlZClcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gRWxlbWVudCBpbmRleFxuICAgICAqL1xuICAgIGdldCBfbmV4dEluZGV4ICgpIHtcbiAgICAgICAgY29uc3QgbmV4dEluZGV4ID0gdGhpcy5hY3RpdmUgKyAxO1xuXG4gICAgICAgIHJldHVybiBuZXh0SW5kZXggPCB0aGlzLiR0aWxlcy5sZW5ndGggPyBuZXh0SW5kZXggOiAwO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBkZXNjIFBVQkxJQyAtIEdldCB0aGUgcHJldmlvdXMgZWxlbWVudCBkb3Igc2VsZWN0ZWQgZGlyZWN0aW9uXG4gICAgICogQHJldHVybiB7TnVtYmVyfSAtIEVsZW1lbnQgaW5kZXhcbiAgICAgKi9cbiAgICBnZXQgcHJldkluZGV4ICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlyZWN0aW9uID09PSAndXAnID8gdGhpcy5fbmV4dEluZGV4IDogdGhpcy5fcHJldkluZGV4O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBkZXNjIFBVQkxJQyAtIEdldCB0aGUgbmV4dCBlbGVtZW50XG4gICAgICogQHJldHVybiB7TnVtYmVyfSAtIEVsZW1lbnQgaW5kZXhcbiAgICAgKi9cbiAgICBnZXQgbmV4dEluZGV4ICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlyZWN0aW9uID09PSAndXAnID8gdGhpcy5fcHJldkluZGV4IDogdGhpcy5fbmV4dEluZGV4O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFN0b3AgYW5pbWF0aW9uIGlmIGVsZW1lbnQgaXMgW2Fib3ZlfHxiZWxvd10gc2NyZWVuLCBiZXN0IGZvciBwZXJmb3JtYW5jZVxuICAgICAqIEBkZXNjIFBSSVZBVEUgLSBDaGVja3MgaWYgdGhlIG1hY2hpbmUgaXMgb24gdGhlIHNjcmVlblxuICAgICAqIEByZXR1cm4ge051bWJlcn0gLSBSZXR1cm5zIHRydWUgaWYgbWFjaGluZSBpcyBvbiB0aGUgc2NyZWVuXG4gICAgICovXG4gICAgZ2V0IHZpc2libGUgKCkge1xuICAgICAgICBjb25zdCAkd2luZG93ID0gJCh3aW5kb3cpLFxuICAgICAgICAgICAgYWJvdmUgPSB0aGlzLiRzbG90Lm9mZnNldCgpLnRvcCA+ICR3aW5kb3cuc2Nyb2xsVG9wKCkgKyAkd2luZG93LmhlaWdodCgpLFxuICAgICAgICAgICAgYmVsb3cgPSAkd2luZG93LnNjcm9sbFRvcCgpID4gdGhpcy4kc2xvdC5oZWlnaHQoKSArIHRoaXMuJHNsb3Qub2Zmc2V0KCkudG9wO1xuXG4gICAgICAgIC8vIFN0b3AgYW5pbWF0aW9uIGlmIGVsZW1lbnQgaXMgW2Fib3ZlfHxiZWxvd10gc2NyZWVuLCBiZXN0IGZvciBwZXJmb3JtYW5jZVxuICAgICAgICByZXR1cm4gIWFib3ZlICYmICFiZWxvdztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZGVzYyBQVUJMSUMgLSBTZXQgYWN0aXZlIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gLSBBY3RpdmUgZWxlbWVudCBpbmRleFxuICAgICAqL1xuICAgIHNldCBhY3RpdmUgKGluZGV4KSB7XG4gICAgICAgIHRoaXMuX2FjdGl2ZSA9IGluZGV4O1xuICAgICAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHRoaXMuJHRpbGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5fYWN0aXZlID0gMDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBkZXNjIFBVQkxJQyAtIFNldCB0aGUgc3BpbiBkaXJlY3Rpb25cbiAgICAgKi9cbiAgICBzZXQgZGlyZWN0aW9uIChkaXJlY3Rpb24pIHtcbiAgICAgICAgaWYgKCF0aGlzLnJ1bm5pbmcpIHtcbiAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uID09PSAnZG93bicgPyAnZG93bicgOiAndXAnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGRlc2MgUFJJVkFURSAtIFNldCBDU1Mgc3BlZWQgY2NsYXNzXG4gICAgICogQHBhcmFtIHN0cmluZyBGWF9TUEVFRCAtIEVsZW1lbnQgc3BlZWQgW0ZYX0ZBU1RfQkxVUnx8RlhfTk9STUFMX0JMVVJ8fEZYX1NMT1dfQkxVUnx8RlhfU1RPUF1cbiAgICAgKi9cbiAgICBzZXQgX2Z4Q2xhc3MgKEZYX1NQRUVEKSB7XG4gICAgICAgIGNvbnN0IGNsYXNzZXMgPSBbRlhfRkFTVCwgRlhfTk9STUFMLCBGWF9TTE9XLCBGWF9UVVJUTEVdLmpvaW4oJyAnKTtcblxuICAgICAgICB0aGlzLiR0aWxlc1xuICAgICAgICAgICAgLmFkZCh0aGlzLl8kZmFrZUZpcnN0VGlsZSlcbiAgICAgICAgICAgIC5hZGQodGhpcy5fJGZha2VMYXN0VGlsZSlcbiAgICAgICAgICAgIC5yZW1vdmVDbGFzcyhjbGFzc2VzKVxuICAgICAgICAgICAgLmFkZENsYXNzKEZYX1NQRUVEKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZGVzYyBQUklWQVRFIC0gU2V0IENTUyBjbGFzc2VzIHRvIG1ha2Ugc3BlZWQgZWZmZWN0XG4gICAgICogQHBhcmFtIHN0cmluZyBGWF9TUEVFRCAtIEVsZW1lbnQgc3BlZWQgW0ZYX0ZBU1RfQkxVUnx8RlhfTk9STUFMX0JMVVJ8fEZYX1NMT1dfQkxVUnx8RlhfU1RPUF1cbiAgICAgKiBAcGFyYW0gc3RyaW5nfHxib29sZWFuIGZhZGUgLSBTZXQgZmFkZSBncmFkaWVudCBlZmZlY3RcbiAgICAgKi9cbiAgICBzZXQgX2FuaW1hdGlvbkZYIChGWF9TUEVFRCkge1xuICAgICAgICBjb25zdCBkZWxheSA9IHRoaXMuc2V0dGluZ3MuZGVsYXkgLyA0LFxuICAgICAgICAgICAgJGVsZW1lbnRzID0gdGhpcy4kc2xvdFxuICAgICAgICAgICAgICAgIC5hZGQodGhpcy4kdGlsZXMpXG4gICAgICAgICAgICAgICAgLmFkZCh0aGlzLl8kZmFrZUZpcnN0VGlsZSlcbiAgICAgICAgICAgICAgICAuYWRkKHRoaXMuXyRmYWtlTGFzdFRpbGUpO1xuXG4gICAgICAgIHRoaXMucmFmKGZ1bmN0aW9uIGNiICgpIHtcbiAgICAgICAgICAgIHRoaXMuX2Z4Q2xhc3MgPSBGWF9TUEVFRDtcblxuICAgICAgICAgICAgaWYgKEZYX1NQRUVEID09PSBGWF9TVE9QKSB7XG4gICAgICAgICAgICAgICAgJGVsZW1lbnRzLnJlbW92ZUNsYXNzKEZYX0dSQURJRU5UKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJGVsZW1lbnRzLmFkZENsYXNzKEZYX0dSQURJRU5UKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpLCBkZWxheSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGRlc2MgUFJJVkFURSAtIFNldCBjc3MgdHJhbnNpdGlvbiBkZWxheVxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSAtIFRyYW5zaXRpb24gZGVsYXkgaW4gbXNcbiAgICAgKi9cbiAgICBzZXQgZGVsYXkgKGRlbGF5KSB7XG4gICAgICAgIGRlbGF5ID0gZGVsYXkgLyAxMDAwO1xuICAgICAgICB0aGlzLl9kZWxheSA9IGRlbGF5O1xuICAgICAgICB0aGlzLl9jaGFuZ2VUcmFuc2l0aW9uKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGRlc2MgUFJJVkFURSAtIFNldCBjc3MgdHJhbnNpdGlvblxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSAtIFRyYW5zaXRpb24gdHlwZVxuICAgICAqL1xuICAgIHNldCB0cmFuc2l0aW9uICh0cmFuc2l0aW9uKSB7XG4gICAgICAgIHRyYW5zaXRpb24gPSB0cmFuc2l0aW9uIHx8ICdlYXNlLWluLW91dCc7XG4gICAgICAgIHRoaXMuX3RyYW5zaXRpb24gPSB0cmFuc2l0aW9uO1xuICAgICAgICB0aGlzLl9jaGFuZ2VUcmFuc2l0aW9uKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGRlc2MgUFJJVkFURSAtIFNldCBjc3MgdHJhbnNpdGlvbiBwcm9wZXJ0eVxuICAgICAqL1xuICAgIF9jaGFuZ2VUcmFuc2l0aW9uICgpIHtcbiAgICAgICAgY29uc3QgZGVsYXkgPSB0aGlzLl9kZWxheSB8fCB0aGlzLnNldHRpbmdzLmRlbGF5LFxuICAgICAgICAgICAgdHJhbnNpdGlvbiA9IHRoaXMuX3RyYW5zaXRpb24gfHwgdGhpcy5zZXR0aW5ncy50cmFuc2l0aW9uO1xuICAgICAgICB0aGlzLiRjb250YWluZXIuY3NzKCd0cmFuc2l0aW9uJywgYCR7ZGVsYXl9cyAke3RyYW5zaXRpb259YCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGRlc2MgUFJJVkFURSAtIFNldCBjb250YWluZXIgbWFyZ2luXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9fHxTdHJpbmcgLSBBY3RpdmUgZWxlbWVudCBpbmRleFxuICAgICAqL1xuICAgIF9hbmltYXRlIChtYXJnaW4pIHtcbiAgICAgICAgdGhpcy4kY29udGFpbmVyLmNzcygndHJhbnNmb3JtJywgYG1hdHJpeCgxLCAwLCAwLCAxLCAwLCAke21hcmdpbn0pYCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGRlc2MgUFJJVkFURSAtIElzIG1vdmluZyBmcm9tIHRoZSBmaXJzdCBlbGVtZW50IHRvIHRoZSBsYXN0XG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBfaXNHb2luZ0JhY2t3YXJkICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZnV0dXJlQWN0aXZlID4gdGhpcy5hY3RpdmUgJiYgdGhpcy5hY3RpdmUgPT09IDAgJiYgdGhpcy5mdXR1cmVBY3RpdmUgPT09IHRoaXMuJHRpbGVzLmxlbmd0aCAtIDE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGRlc2MgUFJJVkFURSAtIElzIG1vdmluZyBmcm9tIHRoZSBsYXN0IGVsZW1lbnQgdG8gdGhlIGZpcnN0XG4gICAgICogQHBhcmFtIHtCb29sZWFufVxuICAgICAqL1xuICAgIF9pc0dvaW5nRm9yd2FyZCAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZ1dHVyZUFjdGl2ZSA8PSB0aGlzLmFjdGl2ZSAmJiB0aGlzLmFjdGl2ZSA9PT0gdGhpcy4kdGlsZXMubGVuZ3RoIC0gMSAmJiB0aGlzLmZ1dHVyZUFjdGl2ZSA9PT0gMDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAZGVzYyBQVUJMSUMgLSBDdXN0b20gc2V0VGltZW91dCB1c2luZyByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbiAgICAgKiBAcGFyYW0gZnVuY3Rpb24gY2IgLSBDYWxsYmFja1xuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lb3V0IC0gVGltZW91dCBkZWxheVxuICAgICAqL1xuICAgIHJhZiAoY2IsIHRpbWVvdXQpIHtcbiAgICAgICAgY29uc3QgX3JhZiA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSxcbiAgICAgICAgICAgIHN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxuICAgICAgICAgICAgX3JhZkhhbmRsZXIgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZHJhd1N0YXJ0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCksXG4gICAgICAgICAgICAgICAgICAgIGRpZmYgPSBkcmF3U3RhcnQgLSBzdGFydFRpbWU7XG5cbiAgICAgICAgICAgICAgICBpZiAoZGlmZiA8IHRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgX3JhZihfcmFmSGFuZGxlcik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBjYigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgX3JhZihfcmFmSGFuZGxlcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGRlc2MgUFVCTElDIC0gR2V0IGVsZW1lbnQgb2Zmc2V0IHRvcFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleCAtIEVsZW1lbnQgcG9zaXRpb25cbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gTmVnYXRpdmUgb2Zmc2V0IGluIHB4XG4gICAgICovXG4gICAgZ2V0VGlsZU9mZnNldCAoaW5kZXgpIHtcbiAgICAgICAgbGV0IG9mZnNldCA9IDA7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbmRleDsgaSsrKSB7XG4gICAgICAgICAgICBvZmZzZXQgKz0gdGhpcy4kdGlsZXMuZXEoaSkub3V0ZXJIZWlnaHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9taW5Ub3AgLSBvZmZzZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGRlc2MgUFJJVkFURSAtIFJlc2V0IGFjdGl2ZSBlbGVtZW50IHBvc2l0aW9uXG4gICAgICovXG4gICAgcmVzZXRQb3NpdGlvbiAobWFyZ2luKSB7XG4gICAgICAgIHRoaXMuJGNvbnRhaW5lci50b2dnbGVDbGFzcyhGWF9OT19UUkFOU0lUSU9OKTtcbiAgICAgICAgdGhpcy5fYW5pbWF0ZShtYXJnaW4gPT09IHVuZGVmaW5lZCA/IHRoaXMuZGlyZWN0aW9uLmluaXRpYWwgOiBtYXJnaW4pO1xuICAgICAgICAvLyBGb3JjZSByZWZsb3csIGZsdXNoaW5nIHRoZSBDU1MgY2hhbmdlc1xuICAgICAgICB0aGlzLiRjb250YWluZXJbMF0ub2Zmc2V0SGVpZ2h0O1xuICAgICAgICB0aGlzLiRjb250YWluZXIudG9nZ2xlQ2xhc3MoRlhfTk9fVFJBTlNJVElPTik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGRlc2MgUFVCTElDIC0gQ2hhbmdlcyByYW5kb21pemUgZnVuY3Rpb25cbiAgICAgKiBAcGFyYW0gZnVuY3Rpb258TnVtYmVyIC0gU2V0IG5ldyByYW5kb21pemUgZnVuY3Rpb25cbiAgICAgKi9cbiAgICBzZXRSYW5kb21pemUgKHJuZCkge1xuICAgICAgICB0aGlzLnNldHRpbmdzLnJhbmRvbWl6ZSA9IHJuZDtcblxuICAgICAgICBpZiAodHlwZW9mIHJuZCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucmFuZG9taXplID0gKCkgPT4gcm5kO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGRlc2MgUFVCTElDIC0gU0VMRUNUIHByZXZpb3VzIGVsZW1lbnQgcmVsYXRpdmUgdG8gdGhlIGN1cnJlbnQgYWN0aXZlIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gUmV0dXJucyByZXN1bHQgaW5kZXhcbiAgICAgKi9cbiAgICBwcmV2ICgpIHtcbiAgICAgICAgdGhpcy5mdXR1cmVBY3RpdmUgPSB0aGlzLnByZXZJbmRleDtcbiAgICAgICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zdG9wKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZnV0dXJlQWN0aXZlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBkZXNjIFBVQkxJQyAtIFNFTEVDVCBuZXh0IGVsZW1lbnQgcmVsYXRpdmUgdG8gdGhlIGN1cnJlbnQgYWN0aXZlIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9IC0gUmV0dXJucyByZXN1bHQgaW5kZXhcbiAgICAgKi9cbiAgICBuZXh0ICgpIHtcbiAgICAgICAgdGhpcy5mdXR1cmVBY3RpdmUgPSB0aGlzLm5leHRJbmRleDtcbiAgICAgICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zdG9wKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZnV0dXJlQWN0aXZlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBkZXNjIFBVQkxJQyAtIFN0YXJ0cyBzaHVmZmxpbmcgdGhlIGVsZW1lbnRzXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHJlcGVhdGlvbnMgLSBOdW1iZXIgb2Ygc2h1ZmZsZXMgKHVuZGVmaW5lZCB0byBtYWtlIGluZmluaXRlIGFuaW1hdGlvblxuICAgICAqIEByZXR1cm4ge051bWJlcn0gLSBSZXR1cm5zIHJlc3VsdCBpbmRleFxuICAgICAqL1xuICAgIGdldERlbGF5RnJvbVNwaW5zIChzcGlucykge1xuICAgICAgICBsZXQgZGVsYXkgPSB0aGlzLnNldHRpbmdzLmRlbGF5O1xuICAgICAgICB0aGlzLl90cmFuc2l0aW9uID0gJ2xpbmVhcic7XG5cbiAgICAgICAgc3dpdGNoIChzcGlucykge1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGRlbGF5IC89IDAuNTtcbiAgICAgICAgICAgICAgICB0aGlzLl90cmFuc2l0aW9uID0gJ2Vhc2Utb3V0JztcbiAgICAgICAgICAgICAgICB0aGlzLl9hbmltYXRpb25GWCA9IEZYX1RVUlRMRTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBkZWxheSAvPSAwLjc1O1xuICAgICAgICAgICAgICAgIHRoaXMuX2FuaW1hdGlvbkZYID0gRlhfU0xPVztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICBkZWxheSAvPSAxO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FuaW1hdGlvbkZYID0gRlhfTk9STUFMO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIGRlbGF5IC89IDEuMjU7XG4gICAgICAgICAgICAgICAgdGhpcy5fYW5pbWF0aW9uRlggPSBGWF9OT1JNQUw7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGRlbGF5IC89IDEuNTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hbmltYXRpb25GWCA9IEZYX0ZBU1Q7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGVsYXk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGRlc2MgUFVCTElDIC0gU3RhcnRzIHNodWZmbGluZyB0aGUgZWxlbWVudHNcbiAgICAgKiBAcGFyYW0ge051bWJlcn0gcmVwZWF0aW9ucyAtIE51bWJlciBvZiBzaHVmZmxlcyAodW5kZWZpbmVkIHRvIG1ha2UgaW5maW5pdGUgYW5pbWF0aW9uXG4gICAgICogQHJldHVybiB7TnVtYmVyfSAtIFJldHVybnMgcmVzdWx0IGluZGV4XG4gICAgICovXG4gICAgc2h1ZmZsZSAoc3BpbnMsIG9uQ29tcGxldGUpIHtcbiAgICAgICAgLy8gTWFrZSBzcGlucyBvcHRpb25hbFxuICAgICAgICBpZiAodHlwZW9mIHNwaW5zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBvbkNvbXBsZXRlID0gc3BpbnM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgLy8gUGVyZm9ybSBhbmltYXRpb25cbiAgICAgICAgaWYgKCF0aGlzLnZpc2libGUgJiYgdGhpcy5zZXR0aW5ncy5zdG9wSGlkZGVuID09PSB0cnVlKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3Aob25Db21wbGV0ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBkZWxheSA9IHRoaXMuZ2V0RGVsYXlGcm9tU3BpbnMoc3BpbnMpO1xuICAgICAgICAgICAgdGhpcy5kZWxheSA9IGRlbGF5O1xuICAgICAgICAgICAgdGhpcy5fYW5pbWF0ZSh0aGlzLmRpcmVjdGlvbi50byk7XG4gICAgICAgICAgICB0aGlzLnJhZigoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLnN0b3BwaW5nICYmIHRoaXMucnVubmluZykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsZWZ0ID0gc3BpbnMgLSAxO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzZXRQb3NpdGlvbih0aGlzLmRpcmVjdGlvbi5maXJzdCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsZWZ0IDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RvcChvbkNvbXBsZXRlKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlcGVhdCBhbmltYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2h1ZmZsZShsZWZ0LCBvbkNvbXBsZXRlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIGRlbGF5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmZ1dHVyZUFjdGl2ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAqIEBkZXNjIFBVQkxJQyAtIFN0b3Agc2h1ZmZsaW5nIHRoZSBlbGVtZW50c1xuICAgICogQHJldHVybiB7TnVtYmVyfSAtIFJldHVybnMgcmVzdWx0IGluZGV4XG4gICAgKi9cbiAgICBzdG9wIChvblN0b3ApIHtcbiAgICAgICAgaWYgKCF0aGlzLnJ1bm5pbmcgfHwgdGhpcy5zdG9wcGluZykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZnV0dXJlQWN0aXZlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zdG9wcGluZyA9IHRydWU7XG5cbiAgICAgICAgaWYgKHRoaXMuZnV0dXJlQWN0aXZlID09PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBHZXQgcmFuZG9tIG9yIGN1c3RvbSBlbGVtZW50XG4gICAgICAgICAgICB0aGlzLmZ1dHVyZUFjdGl2ZSA9IHRoaXMuY3VzdG9tO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgZGlyZWN0aW9uIHRvIHByZXZlbnQganVtcGluZ1xuICAgICAgICBpZiAodGhpcy5faXNHb2luZ0JhY2t3YXJkKCkpIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXRQb3NpdGlvbih0aGlzLmRpcmVjdGlvbi5maXJzdFRvTGFzdCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNHb2luZ0ZvcndhcmQoKSkge1xuICAgICAgICAgICAgdGhpcy5yZXNldFBvc2l0aW9uKHRoaXMuZGlyZWN0aW9uLmxhc3RUb0ZpcnN0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVwZGF0ZSBsYXN0IGNob29zZW4gZWxlbWVudCBpbmRleFxuICAgICAgICB0aGlzLmFjdGl2ZSA9IHRoaXMuZnV0dXJlQWN0aXZlO1xuXG4gICAgICAgIC8vIFBlcmZvcm0gYW5pbWF0aW9uXG4gICAgICAgIGNvbnN0IGRlbGF5ID0gdGhpcy5nZXREZWxheUZyb21TcGlucygxKTtcbiAgICAgICAgdGhpcy5kZWxheSA9IGRlbGF5O1xuICAgICAgICB0aGlzLl9hbmltYXRpb25GWCA9IEZYX1NUT1A7XG4gICAgICAgIHRoaXMuX2FuaW1hdGUodGhpcy5nZXRUaWxlT2Zmc2V0KHRoaXMuYWN0aXZlKSk7XG4gICAgICAgIHRoaXMucmFmKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc3RvcHBpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5mdXR1cmVBY3RpdmUgPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuc2V0dGluZ3MuY29tcGxldGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldHRpbmdzLmNvbXBsZXRlLmFwcGx5KHRoaXMsIFt0aGlzLmFjdGl2ZV0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIG9uU3RvcCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIG9uU3RvcC5hcHBseSh0aGlzLCBbdGhpcy5hY3RpdmVdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZGVsYXkpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAqIEBkZXNjIFBVQkxJQyAtIFN0YXJ0IGF1dG8gc2h1ZmZsaW5ncywgYW5pbWF0aW9uIHN0b3BzIGVhY2ggMyByZXBlYXRpb25zLiBUaGVuIHJlc3RhcnQgYW5pbWF0aW9uIHJlY3Vyc2l2ZWx5XG4gICAgKi9cbiAgICBhdXRvICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnJ1bm5pbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX3RpbWVyID0gbmV3IFRpbWVyKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuc2V0dGluZ3MucmFuZG9taXplICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MucmFuZG9taXplID0gKCkgPT4gdGhpcy5fbmV4dEluZGV4O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMudmlzaWJsZSAmJiB0aGlzLnNldHRpbmdzLnN0b3BIaWRkZW4gPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yYWYodGhpcy5fdGltZXIucmVzZXQuYmluZCh0aGlzLl90aW1lciksIDUwMCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaHVmZmxlKHRoaXMuc2V0dGluZ3Muc3BpbnMsIHRoaXMuX3RpbWVyLnJlc2V0LmJpbmQodGhpcy5fdGltZXIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0aGlzLnNldHRpbmdzLmF1dG8pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQGRlc2MgUFVCTElDIC0gRGVzdHJveSB0aGUgbWFjaGluZVxuICAgICAqL1xuICAgIGRlc3Ryb3kgKCkge1xuICAgICAgICB0aGlzLl8kZmFrZUZpcnN0VGlsZS5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy5fJGZha2VMYXN0VGlsZS5yZW1vdmUoKTtcbiAgICAgICAgdGhpcy4kdGlsZXMudW53cmFwKCk7XG4gICAgICAgICQuZGF0YSh0aGlzLmVsZW1lbnRbMF0sICdwbHVnaW5fJyArIHBsdWdpbk5hbWUsIG51bGwpO1xuICAgIH1cbn1cblxuLypcbiogQ3JlYXRlIG5ldyBwbHVnaW4gaW5zdGFuY2UgaWYgbmVlZGVkIGFuZCByZXR1cm4gaXRcbiovXG5mdW5jdGlvbiBfZ2V0SW5zdGFuY2UoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIGxldCBtYWNoaW5lO1xuICAgIGlmICghJC5kYXRhKGVsZW1lbnRbMF0sICdwbHVnaW5fJyArIHBsdWdpbk5hbWUpKSB7XG4gICAgICAgIG1hY2hpbmUgPSBuZXcgU2xvdE1hY2hpbmUoZWxlbWVudCwgb3B0aW9ucyk7XG4gICAgICAgICQuZGF0YShlbGVtZW50WzBdLCAncGx1Z2luXycgKyBwbHVnaW5OYW1lLCBtYWNoaW5lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBtYWNoaW5lID0gJC5kYXRhKGVsZW1lbnRbMF0sICdwbHVnaW5fJyArIHBsdWdpbk5hbWUpO1xuICAgIH1cbiAgICByZXR1cm4gbWFjaGluZTtcbn1cblxuLypcbiogQ2hhaW5hYmxlIGluc3RhbmNlXG4qL1xuJC5mbltwbHVnaW5OYW1lXSA9IGZ1bmN0aW9uIGluaXRQbHVnaW4ob3B0aW9ucykge1xuICAgIGxldCBpbnN0YW5jZXM7XG4gICAgaWYgKHRoaXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIGluc3RhbmNlcyA9IF9nZXRJbnN0YW5jZSh0aGlzLCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuXHRcdGNvbnN0ICRlbHMgPSB0aGlzO1xuICAgICAgICBpbnN0YW5jZXMgPSAkLm1hcCgkZWxzLCAoZWwsIGluZGV4KSA9PiB7XG5cdFx0XHRjb25zdCAkZWwgPSAkZWxzLmVxKGluZGV4KTtcbiAgICAgICAgICAgIHJldHVybiBfZ2V0SW5zdGFuY2UoJGVsLCBvcHRpb25zKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBpbnN0YW5jZXM7XG59O1xuXG59KShqUXVlcnksIHdpbmRvdywgZG9jdW1lbnQpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBUaW1lciB7XG4gIGNvbnN0cnVjdG9yIChjYiwgZGVsYXkpIHtcbiAgICB0aGlzLmNiID0gY2I7XG4gICAgdGhpcy5pbml0aWFsRGVsYXkgPSBkZWxheTtcbiAgICB0aGlzLmRlbGF5ID0gZGVsYXk7XG4gICAgdGhpcy5kZWZlcnJlZCA9IGpRdWVyeS5EZWZlcnJlZCgpO1xuICAgIHRoaXMuc3RhcnRUaW1lID0gbnVsbDtcbiAgICB0aGlzLnRpbWVyID0gbnVsbDtcbiAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcblxuICAgIHRoaXMucmVzdW1lKCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9zdGFydCAoKSB7XG4gICAgdGhpcy50aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5jYih0aGlzKTtcbiAgICB9LCB0aGlzLmRlbGF5KTtcbiAgfVxuXG4gIGNhbmNlbCAoKSB7XG4gICAgdGhpcy5ydW5uaW5nID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZXIpO1xuICB9XG5cbiAgcGF1c2UgKCkge1xuICAgIGlmICh0aGlzLnJ1bm5pbmcpIHtcbiAgICAgIHRoaXMuZGVsYXkgLT0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0aGlzLnN0YXJ0VGltZTtcbiAgICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgfVxuICB9XG5cbiAgcmVzdW1lICgpIHtcbiAgICBpZiAoIXRoaXMucnVubmluZykge1xuICAgICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcbiAgICAgIHRoaXMuc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cbiAgICAgIHRoaXMuX3N0YXJ0KCk7XG4gICAgfVxuICB9XG5cbiAgcmVzZXQgKCkge1xuICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgdGhpcy5kZWxheSA9IHRoaXMuaW5pdGlhbERlbGF5O1xuICAgIHRoaXMuX3N0YXJ0KCk7XG4gIH1cblxuICBhZGQgKGV4dHJhRGVsYXkpIHtcbiAgICB0aGlzLnBhdXNlKCk7XG4gICAgdGhpcy5kZWxheSArPSBleHRyYURlbGF5O1xuICAgIHRoaXMucmVzdW1lKCk7XG4gIH1cbn07XG4iXX0=
