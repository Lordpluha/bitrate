import type { Config } from "tailwindcss";
import uiPreset from "@spotify/ui/tailwind.preset";

export default {
  presets: [uiPreset],
  content: ["./src/**/*.{ts,tsx}"],
  theme: { 
    extend: {
      keyframes: {
        wave: {
          '0%, 100%': { height: '30%' },
          '50%': { height: '100%' },
        }
      },
      animation: {
        wave: 'wave 1.2s ease-in-out infinite'
      }
    } 
  },
  plugins: [],
} satisfies Config;
