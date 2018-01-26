// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  env: {
    browser: true,
  },
  extends: ['airbnb-base', 'prettier'],
  plugins: ['import', 'prettier'],
  rules: {
    'import/extensions': [
      'error',
      'always',
      // hide known extensions that are resolved by webpack
      {
        js: 'never',
        ts: 'never',
      },
    ],
    // prettier compatibility
    'max-len': 0,
    'prettier/prettier': [
      'error',
      { singleQuote: true, trailingComma: 'all', printWidth: 100, tabWidth: 2 },
    ],
    // only for use with getter-setters
    'no-underscore-dangle': 0,
    // to correctly work on windows with some tools that create windows line-endings
    // this will be correct by git when committed
    'linebreak-style': 0
  },
};
