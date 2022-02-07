import typeScriptPlugin from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import cleanupPlugin from "rollup-plugin-cleanup";
import copyPlugin from "rollup-plugin-copy";
import progressPlugin from "rollup-plugin-progress";
import packageJSON from "./lib/package.json";

const EXTERNALS = Object.keys({
  ...packageJSON.dependencies,
  ...packageJSON.peerDependencies,
});

const EXTERNALS_REGEX = new RegExp(EXTERNALS.join("|"));

export default defineConfig({
  input: ["lib/src/index.tsx", "lib/src/server.tsx"],
  external: EXTERNALS_REGEX,
  output: {
    entryFileNames: "[name].js",
    dir: "build",
    format: "cjs",
    sourcemap: true,
    exports: "named",
  },
  plugins: [
    progressPlugin(),
    typeScriptPlugin({ tsconfig: "lib/tsconfig.json" }),
    copyPlugin({
      targets: [
        { src: "lib/package.json", dest: "build" },
        { src: "lib/src/types.d.ts", dest: "build" },
        { src: "README.md", dest: "build" },
        { src: "LICENSE", dest: "build" },
      ],
    }),
    cleanupPlugin({ extensions: ["js", "ts"] }),
  ],
});
