/**
 * Token Generator Configuration
 * Define how tokens should be transformed into CSS
 */

export default {
  // Input/Output paths
  paths: {
    tokens: '../../tokens/tokens.json',
    output: '../src/styles',
  },

  // Color palette configuration
  palette: {
    scales: [
      { name: 'Green Scale (Spotify Brand)', key: 'green' },
      { name: 'Neutral Scale (Grays)', key: 'neutral' },
      { name: 'Blue Scale', key: 'blue' },
      { name: 'Red Scale', key: 'red' },
      { name: 'Orange Scale', key: 'orange' },
      { name: 'Purple Scale', key: 'purple' },
    ],
    pureColors: ['white', 'black'],
  },

  // Layout sections configuration
  layout: {
    sections: [
      {
        name: 'Spacing Scale (rem-based for accessibility)',
        tokenKey: 'spacing',
        prefix: 'spacing',
        format: (key, value) => {
          if (key === '0') return { key: '0', value: '0', comment: null };
          if (key === 'px') return { key: 'px', value: '1px', comment: null };
          const name = key.replace('.', '_');
          const comment = value !== '0' ? `${parseFloat(value) * 16}px` : null;
          return { key: name, value, comment };
        },
      },
      {
        name: 'Border Radius',
        tokenKey: 'border-radius',
        prefix: 'radius',
        format: (key, value) => ({
          key,
          value,
          comment: value !== '0' && value !== '9999px' ? `${parseFloat(value) * 16}px` : null,
        }),
      },
      {
        name: 'Border Width',
        tokenKey: 'border-width',
        prefix: 'border',
      },
      {
        name: 'Container Widths',
        tokenKey: 'container',
        prefix: 'container',
        format: (key, value) => ({
          key,
          value,
          comment: value !== '100%' ? `${parseFloat(value) * 16}px` : null,
        }),
      },
      {
        name: 'Breakpoints (for media queries)',
        tokenKey: 'breakpoints',
        prefix: 'breakpoint',
        format: (key, value) => ({ key, value: `${value}px`, comment: null }),
      },
      {
        name: 'Z-Index Layers',
        tokenKey: 'z-index',
        prefix: 'z',
        transformKey: 'none',
      },
      {
        name: 'Shadows',
        tokenKey: 'shadows',
        prefix: 'shadow',
      },
      {
        name: 'Opacity',
        tokenKey: 'opacity',
        prefix: 'opacity',
      },
      {
        name: 'Aspect Ratios',
        tokenKey: 'aspect-ratio',
        prefix: 'aspect',
      },
    ],
  },

  // Typography sections configuration
  typography: {
    sections: [
      {
        name: 'Font Families',
        tokenKey: 'font-family',
        prefix: 'font',
      },
      {
        name: 'Font Sizes',
        tokenKey: 'font-size',
        prefix: 'text',
        format: (key, value) => ({
          key,
          value,
          comment: `${parseFloat(value) * 16}px`,
        }),
      },
      {
        name: 'Font Weights',
        tokenKey: 'font-weight',
        prefix: 'font',
      },
      {
        name: 'Line Heights',
        tokenKey: 'line-height',
        prefix: 'leading',
      },
      {
        name: 'Letter Spacing',
        tokenKey: 'letter-spacing',
        prefix: 'tracking',
      },
    ],
    semantic: {
      enabled: true,
      prefix: 'typography',
      transformKey: 'none',
    },
  },

  // Theme groups configuration
  themes: {
    imports: [
      './palette.css',
      './typography.css',
      './layout.css',
      './animations.css',
    ],
    groups: {
      'Background': [
        'background',
        'background-elevated',
        'background-tinted',
        'background-secondary',
        'background-highlight',
        'background-pressed',
      ],
      'Foreground': ['foreground', 'foreground-secondary'],
      'Text': ['text', 'text-secondary', 'text-subdued', 'text-muted', 'text-contrast'],
      'Primary (Brand)': ['primary', 'primary-hover', 'primary-active', 'primary-foreground'],
      'Secondary': ['secondary', 'secondary-hover', 'secondary-foreground'],
      'Accent': ['accent', 'accent-foreground'],
      'Semantic States': [
        'success',
        'success-foreground',
        'error',
        'error-foreground',
        'warning',
        'warning-foreground',
        'info',
        'info-foreground',
      ],
      'Destructive': ['destructive', 'destructive-foreground'],
      'Muted': ['muted', 'muted-foreground'],
      'Border & Input': ['border', 'border-subtle', 'input', 'ring'],
      'Card & Popover': ['card', 'card-foreground', 'popover', 'popover-foreground'],
      'Charts': ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'],
    },
    prefix: 'color',
  },

  // Files to generate
  files: {
    'palette.css': {
      header: {
        title: 'Base Color Palette',
        description: 'These are the raw colors without semantic meaning. Use theme tokens for actual implementation.',
      },
      generator: 'palette',
    },
    'layout.css': {
      header: {
        title: 'Layout System',
        description: 'Spacing, sizing, borders, shadows, and layout utilities',
      },
      generator: 'layout',
    },
    'typography.css': {
      header: {
        title: 'Typography System',
        description: 'Font families, sizes, weights, line heights, and letter spacing',
      },
      generator: 'typography',
    },
    'themes.css': {
      generator: 'themes',
    },
  },
};
