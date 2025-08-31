import type { Config } from "tailwindcss";
import uiPreset from "@spotify/ui/tailwind.preset";

export default {
  presets: [uiPreset],
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
} satisfies Config;
