const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const Dotenv = require('dotenv-webpack')

require('travelfunds-env')

const frontendRoot = 'src'
const backendUrl = process.env.DEVSERVER_PROXY_URL

module.exports = {
  devtool: process.env.NODE_ENV === 'development'
    ? 'eval-source-map'
    : 'source-map',
  entry: [
    'babel-polyfill',
    'whatwg-fetch',
    `./${frontendRoot}/index.js`
  ],
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: '/',
    filename: '[name].js'
  },
  devServer: {
    hot: true,
    contentBase: path.join(__dirname, frontendRoot),
    proxy: {
      '/': {
        target: backendUrl,
        changeOrigin: true,
        // Prevent production build from interferring with style-loader
        pathRewrite: { '^/build/bundle.css': '/build/blank.css' },
        // Forward webpack dev server's host so AuthCAS can generate the
        // correct callback URL.
        onProxyReq: (proxyReq, req) =>
          proxyReq.setHeader('X-Forwarded-Host', req.headers.host)
      }
    }
  },
  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname, frontendRoot)
    ]
  },
  module: {
    rules: [
      { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
      { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              query: { modules: true, localIdentName: '[name]__[local]___[hash:base64:5]' }
            },
            'sass-loader'
          ]
        })
      },
      { test: /\.(png|jpg|gif)$/, loader: 'file-loader' }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].css',
      // Disabling causes ETP to fallback and style-loader to inject CSS in
      // <head><style></head>, allowing hot reloading
      disable: process.env.NODE_ENV === 'development'
    }),
    new Dotenv({
      // Import environment set by travelfunds-env
      silent: true,
      systemvars: true
    }),
    new HtmlWebpackPlugin({
      title: 'Travel Funds'
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
}
