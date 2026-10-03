import Datatable from "@/components/Datatable/Datatable.vue"
import AppLayout from "@/layouts/AppLayout.vue"
import PageHeader from "@/components/Header/PageHeader.vue"
import Alert from "@/components/Alert/Alert.vue"
import Loader from "@/components/Loader/Loader.vue"
import { addMenuItem, menuStore } from "@/menu/menuStore"
import { registerSlot } from "@/extensions/slotRegistry"
import { hasPermission } from "@/utils/permissions"

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
		importModule: async (url) => import(/* @vite-ignore */ new URL(url, window.location.href).href),
	}
}