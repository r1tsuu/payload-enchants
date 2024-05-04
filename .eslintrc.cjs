/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:perfectionist/recommended-natural'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'simple-import-sort', 'import'],
  root: true,
  rules: {
    '@typescript-eslint/ban-ts-comment': 'error',
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        fixStyle: 'separate-type-imports',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/padding-line-between-statements': [
      'warn',
      {
        blankLine: 'always',
        next: '*',
        prev: ['const', 'let', 'var'],
      },
      {
        blankLine: 'always',
        next: ['return', 'function', 'class'],
        prev: '*',
      },
      {
        blankLine: 'always',
        next: '*',
        prev: ['function', 'class'],
      },
      {
        blankLine: 'always',
        next: 'export',
        prev: '*',
      },
      {
        blankLine: 'always',
        next: '*',
        prev: 'multiline-const',
      },
    ],
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'no-unused-vars': 'off',
    'padding-line-between-statements': 'off',
    'perfectionist/sort-imports': 'off',
    'perfectionist/sort-named-exports': 'off',
    'perfectionist/sort-named-imports': 'off',
    'prefer-const': 'error',
    'require-await': 'error',
    'simple-import-sort/exports': 'warn',
    'simple-import-sort/imports': 'warn',
    'typescript-eslint/explicit-function-return-type': 'off',
  },
};
