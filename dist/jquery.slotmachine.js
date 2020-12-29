/*
 * jQuery Slot Machine v4.0.1
 * https://github.com/josex2r/jQuery-SlotMachineundefined
 *
 * Copyright 2014 Jose Luis Represa
 * Released under the MIT license
 */
(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvanF1ZXJ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0FDQUE7O0FBRUEsSUFBTSxPQUFPLGFBQWI7O0lBRU0saUI7Ozs7Ozs7Ozs7OzhCQUNPO0FBQ1Q7QUFDQSxRQUFFLElBQUYsQ0FBTyxLQUFLLE9BQUwsQ0FBYSxDQUFiLENBQVAsRUFBd0IsWUFBWSxJQUFwQyxFQUEwQyxJQUExQztBQUNEOzs7O0VBSjZCLFc7O0FBT2hDOzs7OztBQUdBLFNBQVMsWUFBVCxDQUF1QixPQUF2QixFQUFnQyxPQUFoQyxFQUF5QztBQUN2QyxNQUFJLGdCQUFKO0FBQ0EsTUFBSSxDQUFDLEVBQUUsSUFBRixDQUFPLFFBQVEsQ0FBUixDQUFQLEVBQW1CLFlBQVksSUFBL0IsQ0FBTCxFQUEyQztBQUN6QyxjQUFVLElBQUksaUJBQUosQ0FBc0IsUUFBUSxDQUFSLENBQXRCLEVBQWtDLE9BQWxDLENBQVY7QUFDQSxNQUFFLElBQUYsQ0FBTyxRQUFRLENBQVIsQ0FBUCxFQUFtQixZQUFZLElBQS9CLEVBQXFDLE9BQXJDO0FBQ0QsR0FIRCxNQUdPO0FBQ0wsY0FBVSxFQUFFLElBQUYsQ0FBTyxRQUFRLENBQVIsQ0FBUCxFQUFtQixZQUFZLElBQS9CLENBQVY7QUFDRDtBQUNELFNBQU8sT0FBUDtBQUNEOztBQUVEOzs7QUFHQSxFQUFFLEVBQUYsQ0FBSyxJQUFMLElBQWEsU0FBUyxVQUFULENBQXFCLE9BQXJCLEVBQThCO0FBQ3pDLE1BQUksa0JBQUo7QUFDQSxNQUFJLEtBQUssTUFBTCxLQUFnQixDQUFwQixFQUF1QjtBQUNyQixnQkFBWSxhQUFhLElBQWIsRUFBbUIsT0FBbkIsQ0FBWjtBQUNELEdBRkQsTUFFTztBQUNMLFFBQU0sT0FBTyxJQUFiO0FBQ0EsZ0JBQVksRUFBRSxHQUFGLENBQU0sSUFBTixFQUFZLFVBQUMsRUFBRCxFQUFLLEtBQUwsRUFBZTtBQUNyQyxVQUFNLE1BQU0sS0FBSyxFQUFMLENBQVEsS0FBUixDQUFaO0FBQ0EsYUFBTyxhQUFhLElBQUksQ0FBSixDQUFiLEVBQXFCLE9BQXJCLENBQVA7QUFDRCxLQUhXLENBQVo7QUFJRDtBQUNELFNBQU8sU0FBUDtBQUNELENBWkQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKiBlc2xpbnQtZGlzYWJsZSBuby11bmRlZiAqL1xuXG5jb25zdCBuYW1lID0gJ3Nsb3RNYWNoaW5lJztcblxuY2xhc3MgSlF1ZXJ5U2xvdE1hY2hpbmUgZXh0ZW5kcyBTbG90TWFjaGluZSB7XG4gIGRlc3Ryb3kgKCkge1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgICAkLmRhdGEodGhpcy5lbGVtZW50WzBdLCAncGx1Z2luXycgKyBuYW1lLCBudWxsKTtcbiAgfVxufVxuXG4vKlxuICogQ3JlYXRlIG5ldyBwbHVnaW4gaW5zdGFuY2UgaWYgbmVlZGVkIGFuZCByZXR1cm4gaXRcbiAqL1xuZnVuY3Rpb24gX2dldEluc3RhbmNlIChlbGVtZW50LCBvcHRpb25zKSB7XG4gIGxldCBtYWNoaW5lO1xuICBpZiAoISQuZGF0YShlbGVtZW50WzBdLCAncGx1Z2luXycgKyBuYW1lKSkge1xuICAgIG1hY2hpbmUgPSBuZXcgSlF1ZXJ5U2xvdE1hY2hpbmUoZWxlbWVudFswXSwgb3B0aW9ucyk7XG4gICAgJC5kYXRhKGVsZW1lbnRbMF0sICdwbHVnaW5fJyArIG5hbWUsIG1hY2hpbmUpO1xuICB9IGVsc2Uge1xuICAgIG1hY2hpbmUgPSAkLmRhdGEoZWxlbWVudFswXSwgJ3BsdWdpbl8nICsgbmFtZSk7XG4gIH1cbiAgcmV0dXJuIG1hY2hpbmU7XG59XG5cbi8qXG4gKiBDaGFpbmFibGUgaW5zdGFuY2VcbiAqL1xuJC5mbltuYW1lXSA9IGZ1bmN0aW9uIGluaXRQbHVnaW4gKG9wdGlvbnMpIHtcbiAgbGV0IGluc3RhbmNlcztcbiAgaWYgKHRoaXMubGVuZ3RoID09PSAxKSB7XG4gICAgaW5zdGFuY2VzID0gX2dldEluc3RhbmNlKHRoaXMsIG9wdGlvbnMpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0ICRlbHMgPSB0aGlzO1xuICAgIGluc3RhbmNlcyA9ICQubWFwKCRlbHMsIChlbCwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0ICRlbCA9ICRlbHMuZXEoaW5kZXgpO1xuICAgICAgcmV0dXJuIF9nZXRJbnN0YW5jZSgkZWxbMF0sIG9wdGlvbnMpO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBpbnN0YW5jZXM7XG59O1xuIl19
