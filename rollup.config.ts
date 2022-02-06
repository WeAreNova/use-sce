import commonjsPlugin from "@rollup/plugin-commonjs";
import typeScriptPlugin from "@rollup/plugin-typescript";
import path from "path";
import { defineConfig } from "rollup";
import analyzerPlugin from "rollup-plugin-analyzer";
import cleanupPlugin from "rollup-plugin-cleanup";
import copyPlugin from "rollup-plugin-copy";
import progressPlugin from "rollup-plugin-progress";
import packageJSON from "./lib/package.json";

const EXTERNALS = Object.keys({
  ...packageJSON.dependencies,
  ...packageJSON.peerDependencies,
});

const EXTERNALS_REGEX = new RegExp(EXTERNALS.join("|"));

const getFullExtension = (entry) => entry.match(/index(\..+)$/)[1];

export default defineConfig({
  input: "lib/src/index.ts",
  external: EXTERNALS_REGEX,
  output: [
    {
      entryFileNames: (info) =>
        info.isEntry ? path.basename(packageJSON.module) : info.name + getFullExtension(packageJSON.module),
      dir: "build",
      format: "esm",
      sourcemap: true,
      preserveModules: true,
    },
    {
      entryFileNames: (info) =>
        info.isEntry ? path.basename(packageJSON.main) : info.name + getFullExtension(packageJSON.main),
      dir: "build",
      format: "cjs",
      sourcemap: true,
      exports: "named",
      preserveModules: true,
    },
  ],
  plugins: [
    progressPlugin(),
    commonjsPlugin(),
    typeScriptPlugin({ tsconfig: "lib/tsconfig.json", outDir: "build" }),
    copyPlugin({
      targets: [
        { src: "lib/package.json", dest: "build" },
        { src: "README.md", dest: "build" },
        { src: "LICENSE", dest: "build" },
      ],
    }),
    cleanupPlugin({ extensions: ["js", "jsx", "ts", "tsx"] }),
    analyzerPlugin(),
  ],
});
