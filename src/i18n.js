import { createI18n } from 'vue-i18n'
import en from "./locales/en.json"
import fr from "./locales/fr.json"

/*function loadLocaleMessages() {
	const locales = import.meta.glob('./locales/*.json')
	const messages = {}

	for(const locale in locales) {
		const matched = locale.match(/([A-Za-z0-9-_]+)\./i)
		if (matched && matched.length > 1) {
			const lang = matched[1]
			messages[lang] = locales(locale)
		}
	}

	return messages
}*/

const i18n = createI18n({
	locale: localStorage.getItem('locale') || import.meta.env.VITE_APP_I18N_LOCALE || 'en',
	fallbackLocale: localStorage.getItem('locale') || import.meta.env.VITE_APP_I18N_FALLBACK_LOCALE || 'en',
	messages: {
		en,
		fr
	},
	globalInjection: true,
    allowComposition: true,
    legacy: false
})

export default i18n

