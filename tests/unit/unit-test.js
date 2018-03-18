const chai = require('chai');
const expect = chai.expect;

const Timer = require('../../lib/timer');

describe('Timer', () => {
  it('exist', () => {
    expect(Timer).to.exist;
  });
});
