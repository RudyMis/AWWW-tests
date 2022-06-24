module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'no-extend-native': 'off',
    'max-classes-per-file': 'off',
    'no-prototype-builtins': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: ['myLib', 'node_modules'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
