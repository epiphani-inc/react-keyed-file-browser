const path = require('path')
const NodeExternals = require('webpack-node-externals')

module.exports = {
  devtool: "source-map",
  entry: './src/index.js',
  output: {
    devtoolLineToLine: true,
    sourceMapFilename: "react-keyed-file-browser.js.map",
    path: path.join(__dirname, '/dist'),
    filename: 'react-keyed-file-browser.js',
    library: 'react-keyed-file-browser',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: ['babel-loader'],
        include: path.join(__dirname, './src/'),
      },
      {
        test: /.*\.sass*/,
        loader: ['style-loader', 'css-loader', 'sass-loader'],
        include: path.join(__dirname, '/src'),
      },
    ],
  },
  externals: NodeExternals(),
}
