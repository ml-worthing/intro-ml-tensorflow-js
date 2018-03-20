const ClosureCompilerPlugin = require('webpack-closure-compiler');
const merge = require('webpack-merge')
const webpackConfig = require('./webpack.config')

module.exports = merge(webpackConfig, {
  plugins: [
    new ClosureCompilerPlugin({
      compiler: {
        language_in: 'ECMASCRIPT6',
        language_out: 'ECMASCRIPT6',
        compilation_level: 'ADVANCED'
      },
      concurrency: 3,
    })
  ]
})
