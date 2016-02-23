/*! SlotMachine - v3.0.0 - 2016-02-23
* https://github.com/josex2r/jQuery-SlotMachine
* Copyright (c) 2016 Jose Luis Represa; Licensed MIT */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * jQuery Slot Machine v2.3.1
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

    var Timer = (function () {
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
            key: '_start',
            value: function _start() {
                this.timer = setTimeout((function cb() {
                    this.cb.call(this);
                }).bind(this), this.delay);
            }
        }, {
            key: 'cancel',
            value: function cancel() {
                this.running = false;
                clearTimeout(this.timer);
            }
        }, {
            key: 'pause',
            value: function pause() {
                if (this.running) {
                    this.delay -= new Date().getTime() - this.startTime;
                    this.cancel();
                }
            }
        }, {
            key: 'resume',
            value: function resume() {
                if (!this.running) {
                    this.running = true;
                    this.startTime = new Date().getTime();

                    this._start();
                }
            }
        }, {
            key: 'reset',
            value: function reset() {
                this.cancel();
                this.delay = this.initialDelay;
                this._start();
            }
        }, {
            key: 'add',
            value: function add(extraDelay) {
                this.pause();
                this.delay += extraDelay;
                this.resume();
            }
        }]);

        return Timer;
    })();

    /**
     * @desc Class - Makes Slot Machine animation effect
     * @param DOM element - Html element
     * @param object settings - Plugin configuration params
     * @return jQuery node - Returns jQuery selector with some new functions (shuffle, stop, next, auto, active)
     */

    var SlotMachine = (function () {
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
            // Callback function
            this._oncompleteStack = [this.settings.complete];
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
                this._oncompleteStack.push(onComplete);
                this.running = true;
                // Perform animation
                if (!this.visible && this.settings.stopHidden === true) {
                    this.stop();
                } else {
                    var delay = this.getDelayFromSpins(spins);
                    this.delay = delay;
                    this._animate(this.direction.to);
                    this.raf(function () {
                        if (!_this.stopping && _this.running) {
                            var left = spins - 1;

                            _this.resetPosition(_this.direction.first);
                            if (left <= 1) {
                                _this.stop();
                            } else {
                                // Repeat animation
                                _this.shuffle(left);
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
            value: function stop() {
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

                    _this2._oncompleteStack.filter(function (fn) {
                        return typeof fn === 'function';
                    }).forEach(function (fn) {
                        fn.apply(_this2, [_this2.active]);
                    });
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

                this.raf((function cb() {
                    this._fxClass = FX_SPEED;

                    if (FX_SPEED === FX_STOP) {
                        $elements.removeClass(FX_GRADIENT);
                    } else {
                        $elements.addClass(FX_GRADIENT);
                    }
                }).bind(this), delay);
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
    })();

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
        var _this4 = this;

        var instances = void 0;
        if (this.length === 1) {
            instances = _getInstance(this, options);
        } else {
            (function () {
                var $els = _this4;
                instances = $.map($els, function (el, index) {
                    var $el = $els.eq(index);
                    return _getInstance($el, options);
                });
            })();
        }
        return instances;
    };
})(jQuery, window, document);
