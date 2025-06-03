import { createApp } from 'vue'
import App from '@/App.vue'
/***** Bootstrap *****/
import { createBootstrap } from 'bootstrap-vue-next'
/***** Vue Router *****/
import router from '@/route'
/***** I18n *****/
import i18n from '@/i18n'
/***** Apex Charts *****/
import VueApexCharts from 'vue3-apexcharts'
/***** Vue Json Excel 3 *****/
import JsonExcel from 'vue-json-excel3'
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

/***** Icons *****/
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome'
import { 
	faHome, faCircle, faUsersCog, faAngleRight, faArrowsRotate, faGear, faPowerOff, faUser, faPlus,
	faMagnifyingGlass, faDownload, faPencil, faTrashCan, faTriangleExclamation,
	faXmark, faDesktop, faWrench, faCheck, faUpload, faBoxesPacking, faBars, faChartSimple,
	faSliders, faWandMagicSparkles, faEyeSlash
} from '@fortawesome/free-solid-svg-icons'
import {
	faSquare, faSquareCheck, faFileLines, faFloppyDisk, faStar, faWindowMaximize
} from '@fortawesome/free-regular-svg-icons'
import GlobalComponents from '@/components/global'

async function loadConfig() {
	const response = await fetch('/config/config.json');
	if (!response.ok) {
		throw new Error('Failed to load config');
	}
	return response.json();
}

loadConfig().then((config) => {
	const app = createApp(App)

	app.use(createBootstrap())
	app.use(router)
	app.use(i18n)
	app.use(VueApexCharts)
	app.component("DownloadExcel", JsonExcel)
	app.component("VSelect", vSelect)
	app.component("Multiselect", VueMultiselect)
	app.component('FontAwesomeIcon', FontAwesomeIcon)
	app.component('FontAwesomeLayers', FontAwesomeLayers)
	app.component('GridLayout', GridLayout)
	app.component('GridItem', GridItem)
	app.use(GlobalComponents)
	library.add({ 
		faHome, faCircle, faUsersCog, faAngleRight, faArrowsRotate, faGear, faPowerOff, faUser, faPlus,
		faMagnifyingGlass, faDownload, faSquare, faSquareCheck, faPencil, faTrashCan,
		faTriangleExclamation, faXmark, faDesktop, faWrench, faCheck, faUpload, faBoxesPacking,
		faBars, faChartSimple, faFileLines, faFloppyDisk, faStar, faWindowMaximize, faSliders, faWandMagicSparkles,
		faEyeSlash
	})

	router.isReady()

	app.config.globalProperties.$config = config;
	app.mount('#app')
}).catch((error) => {
	console.error('Error loading config:', error);
})
