import type { Config } from "tailwindcss";
import config from "@spotify/ui/tailwind.config";

// const webConfig = {
//   ...config,
//   presets: [config],
//   theme: {
//     extend: {
//       colors: {
//         test: {
//           100: "#f2e8e5",
//           200: "#eaddd7",
//           300: "#e0cec7",
//           400: "#d2bab0",
//           500: "#bfa094",
//           600: "#a18072",
//           700: "#977669",
//           800: "#846358",
//           900: "#43302b",
//         },
//       },
//     },
//   },
// } satisfies Config;

// export default webConfig;


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // content: [
  //   "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  //   "./src/views/**/*.{js,ts,jsx,tsx,mdx}",
  //   "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  //   "./src/entities/**/*.{js,ts,jsx,tsx,mdx}",
  //   "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
  // ],
  mode: "jit",
  theme: {
    extend: {
      fontFamily: {
        nunito: ["Nunito", "sans-serif"],
        sourceSans3: ["Source Sans 3", "sans-serif"],
      },
      colors: {
        "black-100": "#2B2C35",
        "primary-blue": {
          DEFAULT: "#2B59FF",
          100: "#F5F8FF",
        },
        "secondary-orange": "#f79761",
        "light-white": {
          DEFAULT: "rgba(59,60,152,0.03)",
          100: "rgba(59,60,152,0.02)",
        },
        grey: "#747A88",
      },
      theme: {
        screens: {
          xs: '480px',
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
          'max-xs': { max: '479px' },
          'max-sm': { max: '639px' },
          'max-md': { max: '767px' },
          'max-lg': { max: '1023px' },
          'max-xl': { max: '1279px' },
          'max-2xl': { max: '1535px' },
        },
      },
      backgroundImage: {
        'pattern': "url('/pattern.png')",
        'hero-bg': "url('/hero-bg.png')"
      }
    },
  },
  plugins: [],
};
