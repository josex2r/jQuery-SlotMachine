/* eslint-disable no-undef */

/*
 * Create new plugin instance if needed and return it
 */
function _getInstance (element, options) {
  let machine;
  if (!$.data(element[0], 'plugin_' + SlotMachine.name)) {
    machine = new SlotMachine(element, options);
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
      return _getInstance($el, options);
    });
  }
  return instances;
};
