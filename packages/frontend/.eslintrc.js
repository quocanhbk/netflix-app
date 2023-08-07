module.exports = {
  parserOptions: {
    project: './tsconfig.json',
  },
  extends: ['plugin:@next/next/recommended', '../../.eslintrc.js'],
  rules: {
    '@next/next/no-img-element': 'off',
  },
};
