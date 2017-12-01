'use strict';
/*
      ██╗    ██╗███████╗██████╗ ██████╗  █████╗  ██████╗██╗  ██╗██████╗
      ██║    ██║██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔════╝██║ ██╔╝╚════██╗
      ██║ █╗ ██║█████╗  ██████╔╝██████╔╝███████║██║     █████╔╝  █████╔╝
      ██║███╗██║██╔══╝  ██╔══██╗██╔═══╝ ██╔══██║██║     ██╔═██╗ ██╔═══╝
      ╚███╔███╔╝███████╗██████╔╝██║     ██║  ██║╚██████╗██║  ██╗███████╗
       ╚══╝╚══╝ ╚══════╝╚═════╝ ╚═╝     ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝
 */

const webpack = require('webpack');
const Path = require('path');
const DirectoryManager = require('./DirectoryManager.js');

const DIR = DirectoryManager('./');

const commonConfig = {
  entry: {
    script: DIR.src_assets + 'js/script.ts'
  },
  output: {
    filename: '[name].js'
  },
  // ファイル名解決のための設定
  resolve: {
    // 拡張子の省略
    extensions: ['.js'],
    // moduleのディレクトリ指定
    modules: ['node_modules'],
    // プラグインのpath解決
    alias: {
      modernizr$: Path.resolve(__dirname, '.modernizrrc'),
      ScrollToPlugin: 'gsap/ScrollToPlugin.js',
      EasePack: 'gsap/EasePack.js'
    }
  },
  // モジュール
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader'
      },
      {
        test: /\.modernizrrc$/,
        loader: 'modernizr-loader'
      }
    ]
  },
  // プラグイン
  plugins: [
    // ファイルを細かく分析し、まとめられるところはできるだけまとめてコードを圧縮する
    new webpack.optimize.AggressiveMergingPlugin(),
    // jQueryをグローバルに出す
    new webpack.ProvidePlugin({
      jQuery: 'jquery',
      $: 'jquery',
      jquery: 'jquery',
      'window.jQuery': 'jquery'
    })
  ]
};

// for development Config
const devConfig = Object.assign({}, commonConfig, {
  devtool: 'cheap-module-source-map'
});

// for production Config
const prodConfig = Object.assign({}, commonConfig, {
  plugins: [
    ...commonConfig.plugins,
    new webpack.optimize.UglifyJsPlugin()
  ]
});

module.exports = {
  dev: devConfig,
  prod: prodConfig
};
