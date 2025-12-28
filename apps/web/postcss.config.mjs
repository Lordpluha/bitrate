import preset from "@spotify/ui/postcss.config";

export default {
  plugins: {
    ...preset.plugins,
    "@tailwindcss/postcss": {},
  },
};
