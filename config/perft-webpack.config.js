const path = require('path');

module.exports = {
  target: 'node',
  entry: path.resolve(__dirname, '../src/script/perft'),
  mode: 'production',
  module: {
    rules: [
      // {
      //   use: {
      //     loader: 'babel-loader',
      //     options: {
      //       presets: ['@babel/preset-env', '@babel/typescript'],
      //     },
      //   },
      // },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.script.json',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  experiments: {
    topLevelAwait: true,
  },
  output: {
    filename: 'perft.js',
    path: path.resolve(__dirname, '../dist'),
  },
};
