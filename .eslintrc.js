module.exports = {
  root         : true,
  env          : {
    node: true,
  },
  extends      : [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  plugins      : [
    'vuetify',
  ],
  rules        : {
    'no-console'                     : process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger'                    : process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'prefer-destructuring'           : ['error', {
      'array' : false,
      'object': true,
    }],
    'vuetify/no-deprecated-classes'  : 'error',
    'vuetify/grid-unknown-attributes': 'error',
    'vuetify/no-legacy-grid'         : 'error',
    'no-underscore-dangle': 0,
    'linebeak-style': 0,
    // 'vue/return-in-computed-property': 0,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
