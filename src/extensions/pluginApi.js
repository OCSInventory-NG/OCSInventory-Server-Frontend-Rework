import Datatable from "@/components/Datatable/Datatable.vue"
import AppLayout from "@/layouts/AppLayout.vue"
import PageHeader from "@/components/Header/PageHeader.vue"
import Alert from "@/components/Alert/Alert.vue"
import Loader from "@/components/Loader/Loader.vue"
import axios from "axios"
import { addMenuItem } from "@/menu/menuStore"
import { registerSlot } from "@/extensions/slotRegistry"

export function createPluginApi({ router, i18n, config }) {
	const token = localStorage.getItem("token_authentication") || null

	const http = axios.create({
		baseURL: config.BACKEND_API_ROUTE,
	})
	http.interceptors.request.use((req) => {
		if (token) req.headers.Authorization = "Token " + token
		return req
	})

	const coreComponents = {
		Datatable,
		AppLayout,
		PageHeader,
		Alert,
		Loader
	}

	const hasPermissions = (required = []) => {
		if (!required.length) return true
		const raw = localStorage.getItem("permissions") || ""
		const perms = raw.includes(",") ? raw.split(",") : raw.split(" ")
		return required.every((p) => perms.includes(p))
	}

	return {
		addRoute: (routeRecord) => router.addRoute(routeRecord),
		addMenuItem,
		registerSlot,
		mergeI18n: (locale, messages) => i18n.global.mergeLocaleMessage(locale, messages),
		hasPermissions,
		http,
		getComponent: (name) => coreComponents[name],
		importModule: async (url) => import(/* @vite-ignore */ new URL(url, window.location.href).href),
	}
}