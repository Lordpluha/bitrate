import fs from "node:fs";
import path from "node:path";
import dts from "rollup-plugin-dts";

function resolveDtsEntry() {
  const candidates = [".types/src/index.d.ts", ".types/index.d.ts"];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }

  // Попытка вывести путь из исходного entry src/index.ts → .types/index.d.ts
  const srcEntry = "src/index.ts";
  const inferred = path
    .join(".types", path.relative("src", srcEntry))
    .replace(/\.ts$/, ".d.ts");

  if (fs.existsSync(inferred)) return inferred;

  throw new Error(
    `d.ts entry not found.

Run "pnpm -F @spotify/ui build:types:prep" first,
and ensure tsconfig.build.json has:
{ "outDir": ".types", "rootDir": "src", "declaration": true, "emitDeclarationOnly": true }.

Expected one of:
  - .types/src/index.d.ts
  - .types/index.d.ts
  - ${inferred}`
  );
}

const input = resolveDtsEntry();

export default {
  input,
  output: { file: "dist/types/index.d.ts", format: "es" }, // ✅ один итоговый файл
  plugins: [
    dts({
      respectExternal: true,
      compilerOptions: { skipLibCheck: true },
    }),
  ],
  external: [
    /^react($|\/)/,
    /^@types\/react($|\/)/,
    /^class-variance-authority($|\/)/,
    /^clsx($|\/)/,
    /^react-hook-form($|\/)/,
    /\.css$/,
  ],
};
