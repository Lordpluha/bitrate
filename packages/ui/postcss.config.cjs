/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    "postcss-import": {},
    tailwindcss: { config: "./tailwind.preset.cjs" },
    "postcss-nested": {},
    autoprefixer: {}
  }
};