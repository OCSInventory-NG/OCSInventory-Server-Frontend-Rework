import { createI18n } from 'vue-i18n'
import en from "./locales/en.json"
import fr from "./locales/fr.json"
import cs from "./locales/cs.json"

const i18n = createI18n({
	locale: localStorage.getItem('locale') || 'en',
	fallbackLocale: localStorage.getItem('locale') || 'en',
	messages: {
		en,
		fr,
		cs
	},
	globalInjection: true,
	allowComposition: true,
	legacy: false
})

export default i18n

