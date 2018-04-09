const path = require('path');

module.exports = {
  devServer: {
    contentBase: './',
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        test: /.ts$/,
        loader: 'ts-loader',
      },
      {
        test: /\.(glsl|txt)$/,
        use: 'raw-loader',
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, '../'),
    filename: 'bundle.js',
  },
};
