/*! SlotMachine - v2.3.0 - 2015-12-22
* https://github.com/josex2r/jQuery-SlotMachine
* Copyright (c) 2015 Jose Luis Represa; Licensed MIT */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * jQuery Slot Machine v2.1.0
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
        FX_FAST = 'slotMachineBlurFast',
        FX_NORMAL = 'slotMachineBlurMedium',
        FX_SLOW = 'slotMachineBlurSlow',
        FX_GRADIENT = 'slotMachineGradient',
        FX_STOP = FX_GRADIENT;

    // Set required styles, filters and masks
    $(document).ready(function documentReady() {

        var slotMachineBlurFilterFastString = '<svg version="1.1" xmlns="http:// www.w3.org/2000/svg" width="0" height="0">' + '<filter id="slotMachineBlurFilterFast">' + '<feGaussianBlur stdDeviation="5" />' + '</filter>' + '</svg>#slotMachineBlurFilterFast';

        var slotMachineBlurFilterMediumString = '<svg version="1.1" xmlns="http:// www.w3.org/2000/svg" width="0" height="0">' + '<filter id="slotMachineBlurFilterMedium">' + '<feGaussianBlur stdDeviation="3" />' + '</filter>' + '</svg>#slotMachineBlurFilterMedium';

        var slotMachineBlurFilterSlowString = '<svg version="1.1" xmlns="http:// www.w3.org/2000/svg" width="0" height="0">' + '<filter id="slotMachineBlurFilterSlow">' + '<feGaussianBlur stdDeviation="1" />' + '</filter>' + '</svg>#slotMachineBlurFilterSlow';

        var slotMachineFadeMaskString = '<svg version="1.1" xmlns="http:// www.w3.org/2000/svg" width="0" height="0">' + '<mask id="slotMachineFadeMask" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">' + '<linearGradient id="slotMachineFadeGradient" gradientUnits="objectBoundingBox" x="0" y="0">' + '<stop stop-color="white" stop-opacity="0" offset="0"></stop>' + '<stop stop-color="white" stop-opacity="1" offset="0.25"></stop>' + '<stop stop-color="white" stop-opacity="1" offset="0.75"></stop>' + '<stop stop-color="white" stop-opacity="0" offset="1"></stop>' + '</linearGradient>' + '<rect x="0" y="-1" width="1" height="1" transform="rotate(90)" fill="url(#slotMachineFadeGradient)"></rect>' + '</mask>' + '</svg>#slotMachineFadeMask';

        // CSS classes
        $('body').append('<style>' + ('.' + FX_FAST + '{-webkit-filter: blur(5px);-moz-filter: blur(5px);-o-filter: blur(5px);-ms-filter: blur(5px);filter: blur(5px);filter: url("data:image/svg+xml;utf8,' + slotMachineBlurFilterFastString + '");filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius="5")}') + ('.' + FX_NORMAL + '{-webkit-filter: blur(3px);-moz-filter: blur(3px);-o-filter: blur(3px);-ms-filter: blur(3px);filter: blur(3px);filter: url("data:image/svg+xml;utf8,' + slotMachineBlurFilterMediumString + '");filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius="3")}') + ('.' + FX_SLOW + '{-webkit-filter: blur(1px);-moz-filter: blur(1px);-o-filter: blur(1px);-ms-filter: blur(1px);filter: blur(1px);filter: url("data:image/svg+xml;utf8,' + slotMachineBlurFilterSlowString + '");filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius="1")}') + ('.' + FX_GRADIENT + '{') + '-webkit-mask-image: -webkit-gradient(linear, left top, left bottom, color-stop(0%, rgba(0,0,0,0)), color-stop(25%, rgba(0,0,0,1)), color-stop(75%, rgba(0,0,0,1)), color-stop(100%, rgba(0,0,0,0)) );' + ('mask: url("data:image/svg+xml;utf8,' + slotMachineFadeMaskString + '");') + '}' + '</style>');
    });

    // Required easing functions
    if (typeof $.easing.easeOutBounce !== 'function') {
        // From jQuery easing, extend jQuery animations functions
        $.extend($.easing, {
            easeOutBounce: function easeOutBounce(x, t, b, c, d) {
                if ((t /= d) < 1 / 2.75) {
                    return c * (7.5625 * t * t) + b;
                } else if (t < 2 / 2.75) {
                    return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
                } else if (t < 2.5 / 2.75) {
                    return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
                } else {
                    return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
                }
            }
        });
    }

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

            // Set max top offset
            this._maxTop = -this.$container.height();

            // Create fake tiles to prevent empty offset
            this._initFakeTiles();

            // Set min top offset
            this._minTop = -this._$fakeFirstTile.outerHeight();

            // Initialize spin direction [up, down]
            this._initDirection();

            // Show active element
            this._marginTop = this.direction.initial;

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
            key: 'raf',

            /**
             * @desc PUBLIC - Custom setTimeout using requestAnimationFrame
             * @param function cb - Callback
             * @param {Number} timeout - Timeout delay
             */
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
            key: '_resetPosition',
            value: function _resetPosition() {
                this._marginTop = this.direction.initial;
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
                this.stop(false);

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
                this.stop(false);

                return this.futureActive;
            }

            /**
             * @desc PUBLIC - Starts shuffling the elements
             * @param {Number} repeations - Number of shuffles (undefined to make infinite animation
             * @return {Number} - Returns result index
             */

        }, {
            key: 'shuffle',
            value: function shuffle(spins, onComplete) {
                var delay = this.settings.delay;

                if (onComplete) {
                    this._oncompleteStack[1] = onComplete;
                }
                if (this.futureActive === null) {
                    // Get random or custom element
                    this.futureActive = this.custom;
                }
                this.running = true;
                this._fade = true;

                // Decreasing spin
                if (typeof spins === 'number') {
                    // Change delay and speed
                    switch (spins) {
                        case 1:
                        case 2:
                            this._animationFX = FX_SLOW;
                            break;
                        case 3:
                        case 4:
                            this._animationFX = FX_NORMAL;
                            delay /= 1.5;
                            break;
                        default:
                            this._animationFX = FX_FAST;
                            delay /= 2;
                    }
                    // Infinite spin
                } else {
                        // Set animation effects
                        this._animationFX = FX_FAST;
                        delay /= 2;
                    }

                // Perform animation
                if (!this.visible && this.settings.stopHidden === true) {
                    this.stop();
                } else {
                    this.$container.animate({
                        marginTop: this.direction.to
                    }, delay, 'linear', (function cb() {
                        // Reset top position
                        this._marginTop = this.direction.first;

                        if (spins - 1 <= 0) {
                            this.stop();
                        } else {
                            // Repeat animation
                            this.shuffle(spins - 1);
                        }
                    }).bind(this));
                }

                return this.futureActive;
            }

            /**
            * @desc PUBLIC - Stop shuffling the elements
            * @return {Number} - Returns result index
            */

        }, {
            key: 'stop',
            value: function stop(showGradient) {
                if (!this.running) {
                    return;
                } else if (this.stopping) {
                    return this.futureActive;
                }

                // Stop animation NOW!!!!!!!
                this.$container.clearQueue().stop(true, false);

                this._fade = showGradient === undefined ? true : showGradient;
                this._animationFX = FX_SLOW;
                this.running = true;
                this.stopping = true;
                // Set current active element
                this.active = this.visibleTile;

                // Check direction to prevent jumping
                if (this.futureActive > this.active) {
                    // We are moving to the prev (first to last)
                    if (this.active === 0 && this.futureActive === this.$tiles.length - 1) {
                        this._marginTop = this.direction.firstToLast;
                    }
                    // We are moving to the next (last to first)
                } else if (this.active === this.$tiles.length - 1 && this.futureActive === 0) {
                        this._marginTop = this.direction.lastToFirst;
                    }

                // Update last choosen element index
                this.active = this.futureActive;

                // Get delay
                var delay = this.settings.delay * 3;

                // Perform animation
                this.$container.animate({
                    marginTop: this.getTileOffset(this.active)
                }, delay, 'easeOutBounce', (function cb() {

                    this.stopping = false;
                    this.running = false;
                    this.futureActive = null;

                    if (typeof this._oncompleteStack[0] === 'function') {
                        this._oncompleteStack[0].apply(this, [this.active]);
                    }
                    if (typeof this._oncompleteStack[1] === 'function') {
                        this._oncompleteStack[1].apply(this, [this.active]);
                    }
                }).bind(this));

                // Disable blur
                this.raf((function cb() {
                    this._fade = false;
                    this._animationFX = FX_STOP;
                }).bind(this), delay / 1.75);

                return this.active;
            }

            /**
            * @desc PUBLIC - Start auto shufflings, animation stops each 3 repeations. Then restart animation recursively
            */

        }, {
            key: 'auto',
            value: function auto() {
                if (!this.running) {
                    this._timer = new Timer((function cb() {
                        if (typeof this.settings.randomize !== 'function') {
                            this.futureActive = this.next;
                        }
                        if (!this.visible && this.settings.stopHidden === true) {
                            this.raf((function cb2() {
                                this._timer.reset();
                            }).bind(this), 500);
                        } else {
                            this.shuffle(this.settings.spins, (function cb2() {
                                this._timer.reset();
                            }).bind(this));
                        }
                    }).bind(this), this.settings.auto);
                }
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
                    rawContainerMargin = this.$container.css('margin-top'),
                    containerMargin = parseInt(rawContainerMargin.replace(/px/, ''), 10);

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
                return this.direction === 'up' ? this._prevIndex : this._nextIndex;
            }

            /**
             * @desc PUBLIC - Get the next element
             * @return {Number} - Element index
             */

        }, {
            key: 'nextIndex',
            get: function get() {
                return this.direction === 'up' ? this._nextIndex : this._prevIndex;
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
                var classes = [FX_FAST, FX_NORMAL, FX_SLOW].join(' ');

                this.$tiles.removeClass(classes).addClass(FX_SPEED);
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
                    $elements = this.$slot.add(this.$tiles);

                this.raf((function cb() {
                    this._fxClass = FX_SPEED;

                    if (this.fade !== true || FX_SPEED === FX_STOP) {
                        $elements.removeClass(FX_GRADIENT);
                    } else {
                        $elements.addClass(FX_GRADIENT);
                    }
                }).bind(this), delay);
            }

            /**
             * @desc PRIVATE - Set container margin
             * @param {Number}||String - Active element index
             */

        }, {
            key: '_marginTop',
            set: function set(margin) {
                this.$container.css('margin-top', margin);
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
        var _this = this;

        var instances = void 0;
        if (this.length === 1) {
            instances = _getInstance(this, options);
        } else {
            (function () {
                var $els = _this;
                instances = $.map($els, function mapValue(el, index) {
                    var $el = $els.eq(index);
                    return _getInstance($el, options);
                });
            })();
        }
        return instances;
    };
})(jQuery, window, document);
