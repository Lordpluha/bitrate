import jsx from '@svgr/plugin-jsx'
import svgo from '@svgr/plugin-svgo'

/**
 * Создает конфигурацию SVGR в зависимости от типа SVG
 * @param {boolean} isMonochrome - является ли SVG одноцветным
 * @param {Map<string, string>} colorVariables - mapping цветов к именам переменных
 */
export function createSvgrConfig(isMonochrome, _colorVariables = null) {
  const baseConfig = {
    plugins: [svgo, jsx],
    typescript: true,
    icon: true,
    prettier: false,
    svg: true,
    exportType: 'named',
    jsxRuntime: 'automatic',
    native: false,
    svgProps: {
      'aria-hidden': 'true',
      focusable: 'false',
    },
    expandProps: 'end',
    template: (variables, { tpl }) => {
      return tpl`
${variables.imports};


${variables.interfaces};

export const ${variables.componentName} = (${variables.props}) => (
  ${variables.jsx}
);
`
    },
  }

  const commonPlugins = [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
          cleanupIds: true,
        },
      },
    },
    {
      name: 'prefixIds',
      params: {
        prefix: (_node, info) => {
          if (!info || !info.path) {
            return 'svg'
          }

          return info.path
            .split('/')
            .pop()
            .replace('.svg', '')
            .replace(/[^a-zA-Z0-9-_]/g, '')
        },
        delim: '-',
      },
    },
    // Удаляем xmlns:xlink атрибуты
    {
      name: 'removeAttrs',
      params: {
        attrs: ['xmlns:xlink'],
      },
    },
  ]

  if (isMonochrome) {
    // Для одноцветных иконок - заменяем цвета на currentColor
    return {
      ...baseConfig,
      svgoConfig: {
        plugins: [
          ...commonPlugins,
          {
            name: 'convertColors',
            params: {
              currentColor: true,
            },
          },
        ],
      },
      replaceAttrValues: {
        '#000000': 'currentColor',
        '#000': 'currentColor',
        '#ffffff': 'currentColor',
        '#fff': 'currentColor',
        white: 'currentColor',
        black: 'currentColor',
      },
    }
  } else {
    // Для многоцветных иконок - сохраняем оригинальные цвета
    return {
      ...baseConfig,
      svgoConfig: {
        plugins: [
          ...commonPlugins.map((plugin) =>
            plugin.name === 'preset-default'
              ? {
                  ...plugin,
                  params: {
                    ...plugin.params,
                    overrides: {
                      ...plugin.params.overrides,
                      convertColors: false,
                    },
                  },
                }
              : plugin,
          ),
        ],
      },
    }
  }
}
