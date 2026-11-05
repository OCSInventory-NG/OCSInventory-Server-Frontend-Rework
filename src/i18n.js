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
	// Czech has three forms: 1, 2 to 4, 5 and more; two-form messages keep the default
	pluralRules: {
		cs: (choice, choicesLength) => {
			if (choicesLength === 3) {
				if (choice === 1) return 0
				if (choice >= 2 && choice <= 4) return 1
				return 2
			}
			return choice === 1 ? 0 : 1
		},
	},
	globalInjection: true,
	allowComposition: true,
	legacy: false
})

export default i18n

