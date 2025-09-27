// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'no-unused-vars': [
      'warn', { varsIgnorePattern: 'e|props|emit' },
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn', { varsIgnorePattern: 'e|props|emit' },
    ],
  },
})
