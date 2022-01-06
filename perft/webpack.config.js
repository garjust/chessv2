const path = require('path');

module.exports = {
  target: 'node',
  entry: './src/chess/perft',
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
              configFile: 'tsconfig.perft.json',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
};
