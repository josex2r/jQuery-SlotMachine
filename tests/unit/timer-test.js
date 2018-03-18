const chai = require('chai');
const expect = chai.expect;

const Timer = require('../../lib/timer');

describe('Timer', () => {
  it('exist', () => {
    expect(Timer).to.exist;
  });

  it('runs', () => {
    const timer = new Timer(() => {}, 0);

    expect(timer.running).to.be.true;
  });

  it('triggers callback', (callback) => {
    const timer = new Timer(() => {
      expect(timer.running).to.be.false;
      expect(true).to.be.true;
      callback();
    }, 0);
  });

  it('can be paused', () => {
    const timer = new Timer((callback) => {
      expect(timer.running).to.be.false;
      expect(false).to.be.true;
      callback();
    }, 0);

    timer.pause();
  });

  it('can be resumed', (callback) => {
    const timer = new Timer(() => {
      expect(true).to.be.true;
      callback();
    }, 0);

    timer.pause();
    timer.resume();
  });

  it('can be cancelled', () => {
    const timer = new Timer((callback) => {
      expect(timer.running).to.be.false;
      expect(false).to.be.true;
      callback();
    }, 0);

    timer.cancel();
  });

  it('can be restarted', (callback) => {
    const timer = new Timer(() => {
      expect(true).to.be.true;
      callback();
    }, 0);

    timer.cancel();
    timer.reset();
  });
});
