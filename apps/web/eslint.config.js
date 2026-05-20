import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    'dist',
    'coverage',
    'storybook-static',
    'public/mockServiceWorker.js',
    'vitest.config.ts',
    'postcss.config.cjs',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.strict,
    ],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      /* TypeScript */
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],

      /* React */
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      /* a11y — strict already, override only when justified */

      /* Ban hardcoded hex colors outside tokens.css */
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/#[0-9a-fA-F]{3,8}\\b/]',
          message:
            'Hardcoded hex color forbidden. Use design tokens from tokens.css via Tailwind utility classes (bg-canvas, text-ink-primary, etc.).',
        },
      ],
    },
  },
  /* Allow hex in tokens, configs, and CSS-related files */
  {
    files: ['**/styles/**', '**/*.config.*', '**/tailwind.config.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
]);
