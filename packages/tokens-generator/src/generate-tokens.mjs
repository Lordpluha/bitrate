#!/usr/bin/env node

/**
 * CSS Generator from Design Tokens
 * Can be used as a module or CLI tool
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Utilities
const toKebabCase = (str) => str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const cssBuilder = {
  header: (title, description) => [
    '/**',
    ` * ${title}`,
    ` * ${description}`,
    ' */',
    '@theme {',
  ],

  section: (title, entries, formatter) => {
    if (!entries) return [];
    const lines = [`  /* ${title} */`];
    Object.entries(entries).forEach(([key, value]) => {
      lines.push(formatter(key, value));
    });
    lines.push('');
    return lines;
  },

  close: () => ['}'],

  build: (parts) => parts.flat().join('\n'),
};

/**
 * Create generators with tokens data
 */
function createGenerators(tokens, config) {
  return {
    palette: () => {
      const parts = [
        ...config.palette.scales.map(({ name, key }) =>
          cssBuilder.section(name, tokens.palette[key], (shade, value) =>
            `  --color-${key}-${shade}: ${value};`
          )
        ),
        cssBuilder.section('Pure Colors', tokens.palette.pure, (name, value) =>
          `  --color-${name}: ${value};`
        ),
      ];

      return parts;
    },

  layout: () => {
    const createFormatter = (section) => {
      return (key, value) => {
        // Custom format function
        if (section.format) {
          const result = section.format(key, value);
          const varKey = section.transformKey === 'kebab' ? toKebabCase(result.key) : result.key;
          const comment = result.comment ? `  /* ${result.comment} */` : '';
          return `  --${section.prefix}-${varKey}: ${result.value};${comment}`;
        }

        // Default formatter
        const varKey = section.transformKey === 'kebab' ? toKebabCase(key) : key;
        return `  --${section.prefix}-${varKey}: ${value};`;
      };
    };

    return config.layout.sections.map((section) =>
      cssBuilder.section(section.name, tokens[section.tokenKey], createFormatter(section))
    );
  },

  typography: () => {
    if (!tokens.typography) return [];

    const createFormatter = (section) => {
      return (key, value) => {
        if (section.format) {
          const result = section.format(key, value);
          const comment = result.comment ? `  /* ${result.comment} */` : '';
          return `  --${section.prefix}-${result.key}: ${result.value};${comment}`;
        }
        return `  --${section.prefix}-${key}: ${value};`;
      };
    };

    const mainSections = config.typography.sections.map((section) =>
      cssBuilder.section(section.name, tokens.typography?.[section.tokenKey], createFormatter(section))
    );

    const semanticParts = (config.typography.semantic.enabled && tokens.typography?.semantic) ? [
      '  /* Semantic Typography Tokens */',
      '',
      ...Object.entries(tokens.typography.semantic).flatMap(([element, props]) => {
        const elementName = config.typography.semantic.transformKey === 'kebab' ? toKebabCase(element) : element;
        return [
          `  /* ${capitalize(element)} */`,
          ...Object.entries(props).map(([prop, value]) => {
            const propName = config.typography.semantic.transformKey === 'kebab' ? toKebabCase(prop) : prop;
            return `  --${config.typography.semantic.prefix}-${elementName}-${propName}: ${value};`;
          }),
          '',
        ];
      }),
    ] : [];

    return [...mainSections, semanticParts];
  },

  themes: () => {
    if (!tokens.themes) return '';

    const buildTheme = (theme, selector = '@theme') => {
      if (!theme) return [];
      const lines = [selector === '@theme' ? '@theme {' : `${selector} {`];

      Object.entries(config.themes.groups).forEach(([group, keys]) => {
        lines.push(`  /* ${group} */`);
        keys.forEach((key) => {
          if (theme[key]) {
            lines.push(`  --${config.themes.prefix}-${key}: ${theme[key]};`);
          }
        });
        lines.push('');
      });

      lines.push('}');
      return lines;
    };

    const parts = [
      ...config.themes.imports.map(file => `@import "${file}";`),
      '',
      '/**',
      ' * Semantic Theme Tokens',
      ' * These tokens reference the palette and provide semantic meaning.',
      ' */',
      '',
      '/**',
      ' * Dark Theme (Default)',
      ' */',
      ...buildTheme(tokens.themes.dark),
      '',
      '/**',
      ' * Light Theme',
      ' */',
      ...buildTheme(tokens.themes.light, ':root.light'),
    ];

    return parts.join('\n');
  },
};
}

/**
 * Main generation function - can be used as module export
 * @param {Object} config - Configuration object
 */
export async function generateTokens(config) {
  // Resolve paths
  const tokensPath = isAbsolute(config.paths.tokens)
    ? config.paths.tokens
    : resolve(process.cwd(), config.paths.tokens);

  const outputDir = isAbsolute(config.paths.output)
    ? config.paths.output
    : resolve(process.cwd(), config.paths.output);

  // Read tokens
  const tokens = JSON.parse(readFileSync(tokensPath, 'utf-8'));

  // Create generators with tokens
  const generators = createGenerators(tokens, config);

  console.log('🎨 Generating CSS files from tokens...\n');

  // Ensure output directory exists
  mkdirSync(outputDir, { recursive: true });

  Object.entries(config.files).forEach(([filename, fileConfig]) => {
    const generatorFn = generators[fileConfig.generator];
    if (!generatorFn) {
      throw new Error(`Generator "${fileConfig.generator}" not found for file "${filename}"`);
    }

    let content;

    if (fileConfig.generator === 'themes') {
      // Themes generator returns a string
      content = generatorFn();
    } else {
      // Other generators return arrays that need to be wrapped
      const { title, description } = fileConfig.header;
      const parts = [
        cssBuilder.header(title, description),
        ...generatorFn(),
        cssBuilder.close(),
      ];
      content = cssBuilder.build(parts);
    }

    const filePath = join(outputDir, filename);
    writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Generated ${filename}`);
  });

  console.log(`\n✨ All CSS files generated successfully in ${outputDir}`);
}

// CLI Mode - run directly if this file is executed
const __filename = fileURLToPath(import.meta.url);
if (import.meta.url === `file://${process.argv[1]}`) {
  const __dirname = dirname(__filename);

  // Import default config
  const { default: defaultConfig } = await import('./generate-tokens.config.mjs');

  // Set absolute paths for local usage
  defaultConfig.paths.tokens = join(__dirname, defaultConfig.paths.tokens);
  defaultConfig.paths.output = join(__dirname, defaultConfig.paths.output);

  try {
    await generateTokens(defaultConfig);
  } catch (error) {
    console.error('❌ Error generating CSS files:', error);
    process.exit(1);
  }
}
