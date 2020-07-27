module.exports = {
  extends: ['plugin:prettier/recommended'],
  plugins: ['prettier'],
  env: {
    browser: true,
  },
  rules: {
    'babel/camelcase': 'off',
    'babel/quotes': 'off',
    'consistent-return': 'off',
    'import/no-unresolved': 'off',
    'import/order': 'off',
    'jsx-a11y/label-has-for': 'off',
    'max-lines-per-function': 'off',
    '@typescript-eslint/no-var-requires': 0,
  },
  overrides: [
    {
      files: '**/*.+(ts|tsx)',
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
      plugins: ['@typescript-eslint/eslint-plugin'],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'eslint-config-prettier/@typescript-eslint',
      ],
    },
  ],
}
