import preset from '@spotify/ui-react/postcss.config';

export default {
  plugins: {
    ...preset.plugins,
    '@tailwindcss/postcss': {},
  },
};
