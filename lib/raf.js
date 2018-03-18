const _raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

module.exports = function raf (cb, timeout = 0) {
  setTimeout(() => _raf(cb), timeout);
};
