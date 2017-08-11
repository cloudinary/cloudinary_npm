
const path = require('path');
const baseConfig = require('./base');

const webpack = require('webpack');
const WebpackNotifierPlugin = require('webpack-notifier');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

const config = Object.assign({}, baseConfig, {
  cache: true,
  devtool: "cheap-source-map",
  plugins: [
    new ProgressBarPlugin(),
    new WebpackNotifierPlugin({ alwaysNotify: true }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('test')
    })
  ]
});


module.exports = config;