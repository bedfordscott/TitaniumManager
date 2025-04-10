const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/renderer/index.tsx',
  target: 'electron-renderer',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    fallback: {
      crypto: false,
      path: false,
      fs: false,
      os: false,
      module: false,
      util: false
    }
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist/renderer'),
  },
  externals: {
    // Externalize native modules to be handled by Electron
    'argon2': 'commonjs argon2',
    'node-forge': 'commonjs node-forge',
    'fido2-lib': 'commonjs fido2-lib',
    'u2f-api': 'commonjs u2f-api',
    'webauthn-crypto': 'commonjs webauthn-crypto',
    'electron': 'commonjs electron'
  }
}; 