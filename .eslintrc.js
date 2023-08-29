module.exports = {
  root: true,
  extends: ['./eslint-config'],
  overrides: [
    // Temporary overrides
    {
      files: ['dev/**/*.ts'],
      rules: {
        'import/no-relative-packages': 'off',
        'no-process-env': 'off',
      },
    },
  ],
  excludes: [
    'dev/plugin.spec.ts',
  ]
}
