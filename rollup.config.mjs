import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/ragToolkit.ts",
  output: [
    {
      dir: "dist/cjs",
      format: "cjs",
      sourcemap: true,
      entryFileNames: "[name].cjs.js"
    },
    {
      dir: "dist/esm",
      format: "esm",
      sourcemap: true,
      entryFileNames: "[name].esm.js"
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    babel({ babelHelpers: "bundled" }),
    json(),
    typescript()
  ],
  external: ["react", "react-dom"]
};
