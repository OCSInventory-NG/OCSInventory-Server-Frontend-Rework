import Datatable from "@/components/Datatable/Datatable.vue"
import AppLayout from "@/layouts/AppLayout.vue"
import PageHeader from "@/components/Header/PageHeader.vue"
import Alert from "@/components/Alert/Alert.vue"
import Loader from "@/components/Loader/Loader.vue"
import { addMenuItem, menuStore } from "@/menu/menuStore"
import { registerSlot } from "@/extensions/slotRegistry"
import { hasPermission } from "@/utils/permissions"
import { withBase } from "@/utils/basePath"

export function createPluginApi({ router, i18n, apiClient }) {
	const coreComponents = {
		Datatable,
		AppLayout,
		PageHeader,
		Alert,
		Loader
	}

	// map, not every: each check is recorded for the debug mode
	const hasPermissions = (required = []) => required.map(hasPermission).every(Boolean)

	return {
		addRoute: (routeRecord) => router.addRoute(routeRecord),
		addMenuItem,
		addMenuChildItem: (groupIndex, item) => {
			const group = menuStore.items.find((m) => m.index === groupIndex)
			if (group && Array.isArray(group.children)) {
				group.children.push(item)
			}
		},
		registerSlot,
		mergeI18n: (locale, messages) => i18n.global.mergeLocaleMessage(locale, messages),
		hasPermissions,
		http: apiClient,
		getComponent: (name) => coreComponents[name],
		// A root-relative path (e.g. "/extensions/foo/bar.js") must go through
		// withBase so it resolves under the deployment prefix, same as the
		// initial plugin.js load in loader.js - otherwise it 404s as soon as
		// the app is served from a non-root base path.
		importModule: async (url) => {
			const resolved = url.startsWith("/") ? withBase(url) : url
			return import(/* @vite-ignore */ new URL(resolved, window.location.href).href)
		},
		withBase,
	}
}