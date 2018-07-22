/*
 * jQuery Slot Machine v4.0.0
 * https://github.com/josex2r/jQuery-SlotMachineundefined
 *
 * Copyright 2014 Jose Luis Represa
 * Released under the MIT license
 */
(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* eslint-disable no-undef */

var name = 'slotMachine';

var JQuerySlotMachine = function (_SlotMachine) {
  _inherits(JQuerySlotMachine, _SlotMachine);

  function JQuerySlotMachine() {
    _classCallCheck(this, JQuerySlotMachine);

    return _possibleConstructorReturn(this, (JQuerySlotMachine.__proto__ || Object.getPrototypeOf(JQuerySlotMachine)).apply(this, arguments));
  }

  _createClass(JQuerySlotMachine, [{
    key: 'destroy',
    value: function destroy() {
      _get(JQuerySlotMachine.prototype.__proto__ || Object.getPrototypeOf(JQuerySlotMachine.prototype), 'destroy', this).call(this);
      $.data(this.element[0], 'plugin_' + name, null);
    }
  }]);

  return JQuerySlotMachine;
}(SlotMachine);

/*
 * Create new plugin instance if needed and return it
 */


function _getInstance(element, options) {
  var machine = void 0;
  if (!$.data(element[0], 'plugin_' + name)) {
    machine = new JQuerySlotMachine(element[0], options);
    $.data(element[0], 'plugin_' + name, machine);
  } else {
    machine = $.data(element[0], 'plugin_' + name);
  }
  return machine;
}

/*
 * Chainable instance
 */
$.fn[name] = function initPlugin(options) {
  var instances = void 0;
  if (this.length === 1) {
    instances = _getInstance(this, options);
  } else {
    var $els = this;
    instances = $.map($els, function (el, index) {
      var $el = $els.eq(index);
      return _getInstance($el[0], options);
    });
  }
  return instances;
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvanF1ZXJ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0FDQUE7O0FBRUEsSUFBTSxPQUFPLGFBQWI7O0lBRU0saUI7Ozs7Ozs7Ozs7OzhCQUNPO0FBQ1Q7QUFDQSxRQUFFLElBQUYsQ0FBTyxLQUFLLE9BQUwsQ0FBYSxDQUFiLENBQVAsRUFBd0IsWUFBWSxJQUFwQyxFQUEwQyxJQUExQztBQUNEOzs7O0VBSjZCLFc7O0FBT2hDOzs7OztBQUdBLFNBQVMsWUFBVCxDQUF1QixPQUF2QixFQUFnQyxPQUFoQyxFQUF5QztBQUN2QyxNQUFJLGdCQUFKO0FBQ0EsTUFBSSxDQUFDLEVBQUUsSUFBRixDQUFPLFFBQVEsQ0FBUixDQUFQLEVBQW1CLFlBQVksSUFBL0IsQ0FBTCxFQUEyQztBQUN6QyxjQUFVLElBQUksaUJBQUosQ0FBc0IsUUFBUSxDQUFSLENBQXRCLEVBQWtDLE9BQWxDLENBQVY7QUFDQSxNQUFFLElBQUYsQ0FBTyxRQUFRLENBQVIsQ0FBUCxFQUFtQixZQUFZLElBQS9CLEVBQXFDLE9BQXJDO0FBQ0QsR0FIRCxNQUdPO0FBQ0wsY0FBVSxFQUFFLElBQUYsQ0FBTyxRQUFRLENBQVIsQ0FBUCxFQUFtQixZQUFZLElBQS9CLENBQVY7QUFDRDtBQUNELFNBQU8sT0FBUDtBQUNEOztBQUVEOzs7QUFHQSxFQUFFLEVBQUYsQ0FBSyxJQUFMLElBQWEsU0FBUyxVQUFULENBQXFCLE9BQXJCLEVBQThCO0FBQ3pDLE1BQUksa0JBQUo7QUFDQSxNQUFJLEtBQUssTUFBTCxLQUFnQixDQUFwQixFQUF1QjtBQUNyQixnQkFBWSxhQUFhLElBQWIsRUFBbUIsT0FBbkIsQ0FBWjtBQUNELEdBRkQsTUFFTztBQUNMLFFBQU0sT0FBTyxJQUFiO0FBQ0EsZ0JBQVksRUFBRSxHQUFGLENBQU0sSUFBTixFQUFZLFVBQUMsRUFBRCxFQUFLLEtBQUwsRUFBZTtBQUNyQyxVQUFNLE1BQU0sS0FBSyxFQUFMLENBQVEsS0FBUixDQUFaO0FBQ0EsYUFBTyxhQUFhLElBQUksQ0FBSixDQUFiLEVBQXFCLE9BQXJCLENBQVA7QUFDRCxLQUhXLENBQVo7QUFJRDtBQUNELFNBQU8sU0FBUDtBQUNELENBWkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfXJldHVybiBlfSkoKSIsIi8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG5cbmNvbnN0IG5hbWUgPSAnc2xvdE1hY2hpbmUnO1xuXG5jbGFzcyBKUXVlcnlTbG90TWFjaGluZSBleHRlbmRzIFNsb3RNYWNoaW5lIHtcbiAgZGVzdHJveSAoKSB7XG4gICAgc3VwZXIuZGVzdHJveSgpO1xuICAgICQuZGF0YSh0aGlzLmVsZW1lbnRbMF0sICdwbHVnaW5fJyArIG5hbWUsIG51bGwpO1xuICB9XG59XG5cbi8qXG4gKiBDcmVhdGUgbmV3IHBsdWdpbiBpbnN0YW5jZSBpZiBuZWVkZWQgYW5kIHJldHVybiBpdFxuICovXG5mdW5jdGlvbiBfZ2V0SW5zdGFuY2UgKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgbGV0IG1hY2hpbmU7XG4gIGlmICghJC5kYXRhKGVsZW1lbnRbMF0sICdwbHVnaW5fJyArIG5hbWUpKSB7XG4gICAgbWFjaGluZSA9IG5ldyBKUXVlcnlTbG90TWFjaGluZShlbGVtZW50WzBdLCBvcHRpb25zKTtcbiAgICAkLmRhdGEoZWxlbWVudFswXSwgJ3BsdWdpbl8nICsgbmFtZSwgbWFjaGluZSk7XG4gIH0gZWxzZSB7XG4gICAgbWFjaGluZSA9ICQuZGF0YShlbGVtZW50WzBdLCAncGx1Z2luXycgKyBuYW1lKTtcbiAgfVxuICByZXR1cm4gbWFjaGluZTtcbn1cblxuLypcbiAqIENoYWluYWJsZSBpbnN0YW5jZVxuICovXG4kLmZuW25hbWVdID0gZnVuY3Rpb24gaW5pdFBsdWdpbiAob3B0aW9ucykge1xuICBsZXQgaW5zdGFuY2VzO1xuICBpZiAodGhpcy5sZW5ndGggPT09IDEpIHtcbiAgICBpbnN0YW5jZXMgPSBfZ2V0SW5zdGFuY2UodGhpcywgb3B0aW9ucyk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgJGVscyA9IHRoaXM7XG4gICAgaW5zdGFuY2VzID0gJC5tYXAoJGVscywgKGVsLCBpbmRleCkgPT4ge1xuICAgICAgY29uc3QgJGVsID0gJGVscy5lcShpbmRleCk7XG4gICAgICByZXR1cm4gX2dldEluc3RhbmNlKCRlbFswXSwgb3B0aW9ucyk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGluc3RhbmNlcztcbn07XG4iXX0=
