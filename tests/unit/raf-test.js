const chai = require('chai');
const expect = chai.expect;

global.window = {
  requestAnimationFrame (cb) {
    cb();
  }
};

const raf = require('../../lib/raf');

describe('raf', () => {
  after(() => {
    global.window = undefined;
  })

  it('exist', () => {
    expect(raf).to.exist;
  });

  it('runs', (callback) => {
    raf(() => {
      expect(true).to.be.true;
      callback();
    }, 0);
  });

  it('runs after delay', (callback) => {
    let called = false;

    raf(() => {
      called = true;
      expect(true).to.be.true;
      callback();
    }, 10);

    expect(called).to.be.false;
  });
});
