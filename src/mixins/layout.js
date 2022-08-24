import config from '../config'

export default {
	data: () => {
		return {
			appConfig: config.app
		}
	},
	methods: {
		decodeHtml (html) {
			const txt = document.createElement('textarea')
			txt.innerHTML = html
			return txt.value
		}
	}
}
