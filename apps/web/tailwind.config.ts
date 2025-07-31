import type { Config } from "tailwindcss";
import config from "@spotify/ui/tailwind.config";

const webConfig = {
  ...config,
  presets: [config],
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
} satisfies Config;

export default webConfig;

