import { createApp } from 'vue'
import App from '@/App.vue'

/***** Bootstrap *****/
import { installBootstrapUi } from "@/ui/bootstrap"

/***** Vue Router *****/
import router from '@/route'

/***** I18n *****/
import i18n from '@/i18n'

/***** Apex Charts *****/
import VueApexCharts from 'vue3-apexcharts'

/***** Vue select *****/
import vSelect from "vue-select"
import "vue-select/dist/vue-select.css"

/***** Vue multiselect *****/
import VueMultiselect from 'vue-multiselect'
import "vue-multiselect/dist/vue-multiselect.min.css"

/***** Grid layout plus *****/
import { GridLayout, GridItem } from 'grid-layout-plus'

/***** Global components *****/
import '@/components/global'
import GlobalComponents from '@/components/global'

/***** Icons *****/
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome'
import {
	faHome, faCircle, faUsersCog, faAngleRight, faArrowsRotate, faGear, faPowerOff, faUser, faPlus,
	faMagnifyingGlass, faDownload, faPencil, faTrashCan, faTriangleExclamation,
	faXmark, faDesktop, faWrench, faCheck, faUpload, faBoxesPacking, faBars, faChartSimple,
	faSliders, faWandMagicSparkles, faEyeSlash, faCopy, faTag, faArrowUp, faUserGroup, faInfoCircle,
	faMagnifyingGlassPlus, faClockRotateLeft, faTableColumns
} from '@fortawesome/free-solid-svg-icons'
import {
	faSquare, faSquareCheck, faFileLines, faFloppyDisk, faStar, faWindowMaximize
} from '@fortawesome/free-regular-svg-icons'

/***** API (central) *****/
import { createApi } from "@/api"

/***** Extensions *****/
import { createPluginApi } from "@/extensions/pluginApi"
import { loadFrontendExtensions } from "@/extensions/loader"
import { ensureExtensionsLoaded } from "@/extensions/runtime"

async function loadConfig() {
	const response = await fetch('/config/config.json')
	if (!response.ok) {
		throw new Error('Failed to load config')
	}
	return response.json()
}

loadConfig().then(async (config) => {
	const app = createApp(App)

	// Plugins
	installBootstrapUi(app)
	app.use(router)
	app.use(i18n)
	app.use(VueApexCharts)

	// Global components
	app.component("VSelect", vSelect)
	app.component("Multiselect", VueMultiselect)
	app.component('FontAwesomeIcon', FontAwesomeIcon)
	app.component('FontAwesomeLayers', FontAwesomeLayers)
	app.component('GridLayout', GridLayout)
	app.component('GridItem', GridItem)
	app.use(GlobalComponents)

	// Icons
	library.add({
		faHome, faCircle, faUsersCog, faAngleRight, faArrowsRotate, faGear, faPowerOff, faUser, faPlus,
		faMagnifyingGlass, faDownload, faSquare, faSquareCheck, faPencil, faTrashCan,
		faTriangleExclamation, faXmark, faDesktop, faWrench, faCheck, faUpload, faBoxesPacking,
		faBars, faChartSimple, faFileLines, faFloppyDisk, faStar, faWindowMaximize, faSliders, faWandMagicSparkles,
		faEyeSlash, faCopy, faTag, faArrowUp, faUserGroup, faInfoCircle, faMagnifyingGlassPlus, faClockRotateLeft,
		faTableColumns
	})

	// Global config
	app.config.globalProperties.$config = config

	// API (axios client + 401 redirect login)
	const api = createApi(config)
	app.config.globalProperties.$api = api
	app.provide("api", api)

	// Plugin API
	const pluginApi = createPluginApi({
		router,
		i18n,
		apiClient: api.http,
	})

	// Load extensions only when authenticated and not on login
	router.beforeEach(async (to) => {
		if (to.name === "Login" || to.path === "/login") {
			return true
		}

		const token = localStorage.getItem("token_authentication")
		if (!token) {
			return true
		}

		try {
			await ensureExtensionsLoaded(() =>
				loadFrontendExtensions({
					apiClient: api.http,
					pluginApi,
					config,
				})
			)

			// Re-resolve route after dynamic addRoute()
			if (to.matched.length === 0) {
				return to.fullPath
			}
		} catch (e) {
			console.error("Error loading extensions:", e)
			return false
		}


		console.info("Extensions loaded")
		return true
	})

	// Surface errors instead of silent white page
	app.config.errorHandler = (err, instance, info) => {
		console.error("Vue error:", err, info)
	}
	window.addEventListener("unhandledrejection", (e) => {
		console.error("Unhandled promise:", e.reason)
	})

	await router.isReady()
	app.mount('#app')
}).catch((error) => {
	console.error('Error loading config:', error)
})