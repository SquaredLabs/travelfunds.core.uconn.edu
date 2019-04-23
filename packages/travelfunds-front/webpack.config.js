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
    `./${frontendRoot}/index.js`
  ],
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: '/',
    filename: '[name].[hash].js'
  },
  devServer: {
    hot: true,
    contentBase: path.join(__dirname, frontendRoot),
    historyApiFallback: true,
    proxy: {
      '/api': backendUrl,
      '/login': backendUrl,
      '/logout': backendUrl
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
      { test: /\.(png|jpg|gif|svg)$/, loader: 'file-loader' }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: '[name].[hash].css',
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
