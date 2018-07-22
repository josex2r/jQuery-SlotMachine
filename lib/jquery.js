/* eslint-disable no-undef */

const name = 'slotMachine';

class JQuerySlotMachine extends SlotMachine {
  destroy () {
    super.destroy();
    $.data(this.element[0], 'plugin_' + name, null);
  }
}

/*
 * Create new plugin instance if needed and return it
 */
function _getInstance (element, options) {
  let machine;
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
$.fn[name] = function initPlugin (options) {
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
