// Workaround for webpack 5 strict ESM resolution. Required because
// @atlaskit/pragmatic-drag-and-drop (transitive dep of @mui/x-scheduler)
// uses bare specifiers in its .mjs files. Without this, CRA's webpack
// throws "Module not found: ...failed to resolve only because it was
// resolved as fully specified".
module.exports = {
  webpack: {
    configure: (config) => {
      config.module.rules.push({
        test: /\.m?js$/,
        resolve: { fullySpecified: false },
      });
      return config;
    },
  },
};
