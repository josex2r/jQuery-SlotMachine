module.exports = class Timer {
  constructor (cb, delay) {
    this.cb = cb;
    this.initialDelay = delay;
    this.delay = delay;
    this.startTime = null;
    this.timer = null;
    this.running = false;

    this.resume();

    return this;
  }

  _start () {
    this.timer = setTimeout(() => {
      this.running = false;
      this.cb(this);
    }, this.delay);
  }

  cancel () {
    this.running = false;
    clearTimeout(this.timer);
  }

  pause () {
    if (this.running) {
      this.delay -= new Date().getTime() - this.startTime;
      this.cancel();
    }
  }

  resume () {
    if (!this.running) {
      this.running = true;
      this.startTime = new Date().getTime();

      this._start();
    }
  }

  reset () {
    this.cancel();
    this.delay = this.initialDelay;
    this._start();
  }

  add (extraDelay) {
    this.pause();
    this.delay += extraDelay;
    this.resume();
  }
};
