import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    ignores: ['node_modules/**', 'dist/**', '.next/**', 'coverage/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
];
