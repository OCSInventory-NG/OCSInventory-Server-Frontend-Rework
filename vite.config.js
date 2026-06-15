import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'path'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import Components from 'unplugin-vue-components/vite'
import { BootstrapVueNextResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
	// Deployment base path. Defaults to '/'; set VITE_BASE_PATH (e.g. '/front/')
	// to serve the app under a sub-path behind a reverse proxy.
	base: process.env.VITE_BASE_PATH || '/',
	server: {
		host: '0.0.0.0',
		port: 3000
	},
	build: {
		assetsInclude: ['.htaccess'],
	},
	plugins: [
		vue(),
		VueI18nPlugin({
			include: resolve(dirname(fileURLToPath(import.meta.url)), './src/locales/**'),
			fullInstall: false,
			compositionOnly: true,
		}),
		Components({
			resolvers: [BootstrapVueNextResolver()],
		}),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
			'vue': 'vue/dist/vue.esm-bundler.js'
		}
	}
})
