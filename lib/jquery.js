/* eslint-disable no-undef */

class JQuerySlotMachine extends SlotMachine {
  destroy () {
    super.destroy();
    $.data(this.element[0], 'plugin_' + this.name, null);
  }
}

/*
 * Create new plugin instance if needed and return it
 */
function _getInstance (element, options) {
  let machine;
  if (!$.data(element[0], 'plugin_' + SlotMachine.name)) {
    machine = new JQuerySlotMachine(element[0], options);
    $.data(element[0], 'plugin_' + machine.name, machine);
  } else {
    machine = $.data(element[0], 'plugin_' + SlotMachine.name);
  }
  return machine;
}

/*
 * Chainable instance
 */
$.fn[SlotMachine.name] = function initPlugin (options) {
  let instances;
  if (this.length === 1) {
    instances = _getInstance(this, options);
  } else {
    const $els = this;
    instances = $.map($els, (el, index) => {
      const $el = $els.eq(index);
      return _getInstance($el[0], options);
    });
  }
  return instances;
};
