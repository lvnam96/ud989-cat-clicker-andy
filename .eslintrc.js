module.exports = {
  env: {
    es2020: true,
    browser: true,
    es6: true,
    jasmine: true
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-use-before-define': ['warn', 'nofunc'],
    'no-unused-vars': 'warn',
    'no-var': 'warn',
    'max-len': 'off',
    'no-underscore-dangle': 'off',
    'linebreak-style': 'off',
    'max-classes-per-file': 'off'
  },
};
