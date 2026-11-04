import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // Determinism guard: domain code gets time, randomness and ids only from injected ports.
  {
    files: ['src/models/**/*.{ts,tsx}', 'src/engines/**/*.{ts,tsx}', 'src/core/**/*.{ts,tsx}', 'src/services/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: "MemberExpression[object.name='Date'][property.name='now']", message: 'Use the injected Clock.' },
        { selector: "NewExpression[callee.name='Date']", message: 'Use the injected Clock.' },
        { selector: "MemberExpression[object.name='Math'][property.name='random']", message: 'Use the injected Rng.' },
        { selector: "MemberExpression[property.name='randomUUID']", message: 'Use the injected IdGenerator.' },
        { selector: "MemberExpression[property.name='getRandomValues']", message: 'Use the injected Rng.' },
        { selector: "MemberExpression[object.name='performance'][property.name='now']", message: 'Use the injected Clock.' },
      ],
    },
  },
  // Layer boundaries (docs/phase1-plan.md §2): dependencies point inward only.
  {
    files: ['src/models/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ group: ['**/engines/**', '**/core/**', '**/services/**', '**/modules/**', '**/components/**', '**/app/**', 'react', 'react-dom', 'idb'], message: 'models may not import other layers.' }] }],
    },
  },
  {
    files: ['src/engines/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ group: ['**/core/**', '**/services/**', '**/modules/**', '**/components/**', '**/app/**', 'react', 'react-dom', 'idb'], message: 'engines may import models only.' }] }],
    },
  },
  {
    files: ['src/core/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ group: ['**/services/**', '**/modules/**', '**/components/**', '**/app/**', 'react', 'react-dom'], message: 'core may import models and engines only.' }] }],
    },
  },
  {
    files: ['src/services/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ group: ['**/modules/**', '**/components/**', '**/app/**', 'react', 'react-dom'], message: 'services may not import UI layers.' }] }],
    },
  },
  { files: ['*.{js,ts}'], languageOptions: { globals: { ...globals.node } } },
);
