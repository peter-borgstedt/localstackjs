module.exports = {
  extends: [],
  env: {
    node: true,
    es6: true,
    jest: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint/eslint-plugin'
  ],
  overrides: [
    {
      files: ['*.js'],
      extends: [
        'eslint:recommended',
      ],
      rules: {},
    },
    {
      files: ['*.ts'],
      extends: [
        'plugin:@typescript-eslint/recommended'
      ],
      rules: {},
    },
  ],
  rules: {
    camelcase: 'off',
    'no-useless-constructor': 'off',
    'consistent-return': 'off',
    'no-unused-vars': 'off',
    semi: [2, 'always'] // https://code.likeagirl.io/why-the-heck-do-i-need-to-use-semi-colons-in-javascript-4f8712c82329
  }
}
