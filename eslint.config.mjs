import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

// Flat config (Next 16 removed `next lint`; ESLint CLI runs this directly).
// Mirrors the old .eslintrc.json (next/core-web-vitals + next/typescript +
// CommonJS allowance for Node config files) and .eslintignore (docs/).
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ['**/*.config.js', '**/*.config.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    // Jest mocks legitimately use require() inside test bodies
    files: ['**/__tests__/**', '**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    // react-hooks v6 rules that did not exist under the previous toolchain
    // (eslint 8 / eslint-config-next 15). Kept at 'warn' for upgrade parity —
    // the violations are pre-existing code, tracked as W.4 lint debt, not new.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/static-components': 'warn',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'coverage/**',
    'docs/**',
    'cypress/**',
  ]),
])
