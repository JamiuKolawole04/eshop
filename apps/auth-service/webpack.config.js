const { NxAppWebpackPlugin } = require("@nx/webpack/app-plugin");
const { join } = require("node:path");

module.exports = {
  output: {
    path: join(__dirname, "dist"),
    clean: true,
    ...(process.env.NODE_ENV !== "production" && {
      devtoolModuleFilenameTemplate: "[absolute-resource-path]",
    }),
  },
  // resolve: {
  //   alias: {
  //     "@generated": resolve(__dirname, "../../generated"),
  //   },
  //   extensions: [".ts", ".js", ".json"],
  // },
  plugins: [
    new NxAppWebpackPlugin({
      target: "node",
      compiler: "swc",
      main: "./src/main.ts",
      tsConfig: "./tsconfig.app.json",
      assets: ["./src/assets"],
      optimization: false,
      outputHashing: "none",
      generatePackageJson: true,
      sourceMaps: true,
    }),
  ],
};
