const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: '172.18.25.12',
    port: 3000
  },
  pluginOptions: {
    i18n: {
      locales: 'en',
      fallbackLocale: 'en',
      localdir: 'locales',
      enableInSFC: false,
      enableLegacy: false
    }
  }
})
