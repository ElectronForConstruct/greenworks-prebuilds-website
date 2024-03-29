module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
    'plugin:cypress/recommended',
  ],
  plugins: [
    'vuetify',
    'cypress',
  ],
  rules: {
    // 'no-console'                     : process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 'no-debugger'                    : process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'prefer-destructuring': ['error', {
      array: false,
      object: true,
    }],
    'vuetify/no-deprecated-classes': 'error',
    'vuetify/grid-unknown-attributes': 'error',
    'vuetify/no-legacy-grid': 'error',
    'no-underscore-dangle': 0,
    'linebreak-style': 0,
    'vue/multi-word-component-names': 0,
    'vuejs-accessibility/click-events-have-key-events': 0,
    // 'vue/return-in-computed-property': 0,
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    ecmaVersion: 6,
    sourceType: 'module',
  },
};
