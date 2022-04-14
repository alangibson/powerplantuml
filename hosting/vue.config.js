var webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  productionSourceMap: false,
  configureWebpack: {
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.esm.js'
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        jQuery: 'jquery',
        $: 'jquery',
        'window.jQuery': 'jquery',
        'window.$': 'jquery'
      }),
      new CopyWebpackPlugin([
        { from: 'atlassian-connect.json' }
      ])
    ],
    externals: {
      'atlassian-connect': 'AP'
    }
  }
}
