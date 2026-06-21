import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'node_modules/**'],
  },
  {
    rules: {
      // react-hooks v7 set-state-in-effect is brand-new and treats common
      // hydration/data-fetch patterns as antipatterns. Keeping as a warning
      // surfaces the signal without blocking CI.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]

export default config
