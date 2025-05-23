const path = require("path");
const fs = require("fs");
const webpack = require('webpack');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');

module.exports = function override(config, env) {
  console.log(config);

  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "assert": require.resolve("assert"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "process/browser": require.resolve("process/browser"),
      "os": require.resolve("os-browserify"),
      "vm": false,
      "url": require.resolve("url")
  })
  config.resolve.fallback = fallback;
  config.plugins = (config.plugins || []).concat([
      new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer']
      }),
      new webpack.HotModuleReplacementPlugin()
  ])

  /*
  config.plugins = (config.plugins || []).concat([
      new WasmPackPlugin({
          crateDirectory: path.resolve(__dirname, './src/tdengine/'),
      }),
  ])
  */

  if (env === 'development') {
    config.devServer = {
      ...config.devServer,
      hot: true,
      liveReload: true,
      watchFiles: ['src/**/*'],
      client: {
        webSocketURL: {
          hostname: '127.0.0.1',
          pathname: '/ws',
          port: 3001
        },
      },
      watchOptions: {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/
      }
    };
    
    // Force disabling HTTPS for local development to avoid WSL2 issues
    config.devServer.https = false;
  }

  config.module.rules.forEach(rule => {
    (rule.oneOf || []).forEach(oneOf => {
      if (oneOf.test && oneOf.test.toString().indexOf('tsx') >= 0) {
        oneOf.include = [
              oneOf.include,
              fs.realpathSync(path.resolve(__dirname, 'node_modules/web3subscriber/', 'src')),
      ]
      }
    })
  })

  const wasmExtensionRegExp = /\.wasm$/;
  config.resolve.extensions.push('.wasm');

  config.experiments = {
    asyncWebAssembly: true
  }

  config.module.rules.forEach(rule => {
    (rule.oneOf || []).forEach(oneOf => {
      if (oneOf.loader && oneOf.loader.indexOf('file-loader') >= 0) {
        oneOf.exclude.push(wasmExtensionRegExp)
      }
    })
  })


  return config
}
