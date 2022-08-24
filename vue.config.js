const publicPath = process.env.NODE_ENV === 'production' ? './' : './'

module.exports = {
	devServer: {
		host: '172.18.25.12',
		port: 3000
	},
	publicPath,
	productionSourceMap: false,
	pluginOptions: {
		i18n: {
			locale: 'en',
			fallbackLocale: 'en',
			localeDir: 'locales',
			enableInSFC: false,
			enableLegacy: false
		}
	}
}
