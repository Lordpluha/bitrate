/** @type {import('@svgr/core').Config} */
module.exports = {
  filenameCase: 'pascal',
  typescript: true,
  icon: true,
  svgo: true,
  outDir: 'src/icons/svgr',
  exportType: 'named',
  index: true,
  prettier: false,
  svgProps: {
    'aria-hidden': 'true',
    focusable: 'false'
  },
  expandProps: 'end',
  svgoConfig: {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeViewBox: false
          }
        }
      },
      {
        name: 'prefixIds',
        params: {
          prefix: (node, info) => {
            if (!info || !info.path) {
              return 'svg'
            }

            return info.path
              .split('/')
              .pop()
              .replace('.svg', '')
              .replace(/[^a-zA-Z0-9-_]/g, '')
          },
          delim: '-'
        }
      },
      {
        name: 'convertColors',
        params: {
          currentColor: false
        }
      }
    ]
  },
  replaceAttrValues: {
    '#000000': 'currentColor',
    '#000': 'currentColor',
    '#ffffff': 'currentColor',
    '#fff': 'currentColor',
    white: 'currentColor',
    black: 'currentColor'
  },
  indexTemplate: filePaths => {
    const exportEntries = filePaths.map(filePath => {
      const basename = filePath.path
        .replace(/\\/g, '/')
        .split('/')
        .pop()
        .replace(/\.(ts|tsx)$/, '')
      return `export * from './${basename}'`
    })
    return exportEntries.join('\n')
  },
  template: (variables, { tpl }) => {
    return tpl`
${variables.imports};

${variables.interfaces};

export const ${variables.componentName} = (${variables.props}) => (
  ${variables.jsx}
);
`
  }
}
