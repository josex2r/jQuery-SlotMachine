module.exports = {
  extends: 'standard',
  env: {
    jquery: true,
    browser: true,
    node: true,
    mocha: true
  },
  globals: {
    chai: true,
    expect: true
  },
  rules: {
    semi: 0,
    'no-unused-expressions': 0,
    'no-unused-vars': 1,
    'no-new': 0
  }
}
