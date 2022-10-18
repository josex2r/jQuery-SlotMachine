const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        test: /\.min.js(\?.*)?$/i,
      }),
    ],
  },
  entry: {
    'slotmachine': './lib/index.ts',
    'slotmachine.min': './lib/index.ts',
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    sourceMapFilename: '[file].map',
    libraryTarget: 'umd',
    library: 'SlotMachine',
    libraryExport: 'default',
    umdNamedDefine: true,
    path: path.resolve(__dirname, 'docs'),
  },
  devtool: 'source-map',
  devServer: {
    static: path.join(__dirname, 'public'),
    compress: true,
    port: 4000,
    historyApiFallback: {
      index: 'index.html',
    },
  },
  plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public' }
            ]
        })
    ]
};
