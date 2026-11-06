import { createI18n } from 'vue-i18n'

const DEFAULT_LOCALE = 'en'

// Every src/locales/<code>.json file is picked up automatically:
// adding a language only requires dropping its file in that folder.
const localeFiles = import.meta.glob('./locales/*.json', { eager: true, import: 'default' })

const messages = Object.fromEntries(
	Object.entries(localeFiles).map(([path, content]) => [
		path.match(/([^/]+)\.json$/)[1],
		content
	])
)

// Language name written in the language itself (e.g. "Français", "Čeština")
function getLocaleName(code) {
	try {
		const name = new Intl.DisplayNames([code], { type: 'language' }).of(code)
		return name.charAt(0).toLocaleUpperCase(code) + name.slice(1)
	} catch {
		return code
	}
}

export const supportedLocales = Object.keys(messages)
	.map((code) => ({ value: code, text: getLocaleName(code) }))
	.sort((a, b) => a.text.localeCompare(b.text))

function getInitialLocale() {
	const stored = localStorage.getItem('locale')
	if (stored && messages[stored]) {
		return stored
	}
	const browser = navigator.language?.split('-')[0]
	return messages[browser] ? browser : DEFAULT_LOCALE
}

const i18n = createI18n({
	locale: getInitialLocale(),
	fallbackLocale: DEFAULT_LOCALE,
	messages,
	globalInjection: true,
	allowComposition: true,
	legacy: false
})

export default i18n
