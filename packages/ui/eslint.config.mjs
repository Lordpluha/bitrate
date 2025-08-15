// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { config as ReactConfig } from "@spotify/eslint/react-internal.js";
import tsParser from "@typescript-eslint/parser";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

/** ESM __dirname polyfill */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = [// pull in all of react-internal’s flat configs
...ReactConfig, // only run “project: tsconfig.lint.json” on .ts/.tsx files
{
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    parser: tsParser,
    parserOptions: {
      project: join(__dirname, "tsconfig.lint.json"),
      tsconfigRootDir: __dirname,
    },
  },
}, ...storybook.configs["flat/recommended"]];

export default config;

