/** @type {import("eslint").Linter.Config} */
module.exports = {
  plugins: ['eslint-plugin-boundaries'],
  settings: {
    'boundaries/elements': [
      {
        type: 'app',
        pattern: './src/app'
      },
      {
        type: 'processes',
        pattern: './src/processes/*'
      },
      {
        type: 'views',
        pattern: './src/views/*'
      },
      {
        type: 'widgets',
        pattern: './src/widgets/*'
      },
      {
        type: 'features',
        pattern: './src/features/*'
      },
      {
        type: 'entities',
        pattern: './src/entities/*'
      },
      {
        type: 'shared',
        pattern: './src/shared'
      }
    ]
  },
  rules: {
    'boundaries/element-types': [
      2,
      {
        default: 'allow',
        rules: [
          {
            from: 'shared',
            disallow: [
              'app',
              'features',
              'entities',
              'widgets',
              'views',
              'processes'
            ],
            message:
              'Модуль нижележащего слоя (${file.type}) не может импортировать модуль вышележащего слоя (${dependency.type})'
          },
          {
            from: 'entities',
            disallow: ['app', 'features', 'widgets', 'views', 'processes'],
            message:
              'Модуль нижележащего слоя (${file.type}) не может импортировать модуль вышележащего слоя (${dependency.type})'
          },
          {
            from: 'features',
            disallow: ['app', 'widgets', 'views', 'processes'],
            message:
              'Модуль нижележащего слоя (${file.type}) не может импортировать модуль вышележащего слоя (${dependency.type})'
          },
          {
            from: 'widgets',
            disallow: ['app', 'views', 'processes'],
            message:
              'Модуль нижележащего слоя (${file.type}) не может импортировать модуль вышележащего слоя (${dependency.type})'
          },
          {
            from: 'views',
            disallow: ['app', 'processes'],
            message:
              'Модуль нижележащего слоя (${file.type}) не может импортировать модуль вышележащего слоя (${dependency.type})'
          },
          {
            from: 'processes',
            disallow: ['app'],
            message:
              'Модуль нижележащего слоя (${file.type}) не может импортировать модуль вышележащего слоя (${dependency.type})'
          }
        ]
      }
    ],
    'boundaries/entry-point': [
      2,
      {
        default: 'disallow',
        message:
          'Модуль (${file.type}) должен импортироваться через public API. Прямой импорт из ${dependency.source} запрещен',

        rules: [
          {
            target: ['shared', 'app'],
            allow: '**'
          },
          {
            target: ['features', 'entities', 'widgets', 'views', 'processes'],
            allow: [
              // Module public API
              'index.ts',
              // Module @shared public API for on-layer imports
              '@shared/index.ts'
            ]
          }
        ]
      }
    ]
  }
}
