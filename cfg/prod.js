
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
    new webpack.optimize.UglifyJsPlugin({
        parallel: true,
        compress: {
            dead_code: true,
            warnings: false,
            drop_debugger: true,
            unsafe_proto: true,
            conditionals: true,
            reduce_vars: true,
            drop_console: true
        },
        output: {
            comments: false,
            beautify: false,
        }
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ]
});


module.exports = config;