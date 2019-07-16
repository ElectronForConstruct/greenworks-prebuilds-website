module.exports = {
  root         : true,
  env          : {
    node: true,
  },
  extends      : [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  rules        : {
    'no-console'                     : process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger'                    : process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'prefer-destructuring'           : ['error', {
      'array' : false,
      'object': true,
    }],
    // 'vue/return-in-computed-property': 0,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
