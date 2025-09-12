module.exports = {
  trailingComma: 'none',
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  jsxSingleQuote: true,
  arrowParens: 'avoid',
  printWidth: 80,
  singleAttributePerLine: true,
  quoteProps: 'as-needed',
  bracketSpacing: true,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: [
    // React and external packages
    '^react',
    '^next',
    '^@?\\w',
    // Storybook
    // FSD layers
    '^@app/(.*)$',
    '^@processes/(.*)$',
    '^@views/(.*)$',
    '^@widgets/(.*)$',
    '^@features/(.*)$',
    '^@entities/(.*)$',
    '^@shared/(.*)$',
    // Parent imports
    '^\\.\\.(?!/?$)',
    '^\\.\\./?$',
    // Other relative imports
    '^\\./(?=.*/)(?!/?$)',
    '^\\.(?!/?$)',
    '^\\./?$',
    // Style imports
    '^.+\\.css$',
    '^.+\\.scss$'
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true
}
