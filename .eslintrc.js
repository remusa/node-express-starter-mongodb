module.exports = {
  extends: ['plugin:prettier/recommended'],
  plugins: ['prettier'],
  env: {
    browser: true,
  },
  // parser: 'babel-eslint',
  rules: {
    'babel/camelcase': 'off',
    'babel/quotes': 'off',
    'consistent-return': 'off',
    'import/no-unresolved': 'off',
    'import/order': 'off',
    'max-lines-per-function': 'off',
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
      rules: {
        '@typescript-eslint/no-var-requires': 1,
        '@typescript-eslint/ban-ts-comment': 1,
      },
    },
  ],
}
