module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'plugin:vue/essential',
  ],
  env: {
    browser: true,
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-param-reassign': 0,
    'max-len': 0,
  }
};
