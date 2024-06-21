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
/***** Icons *****/
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome'
import { 
	faHome, faCircle, faUsersCog, faAngleRight, faGear, faPowerOff, faUser, faPlus,
	faMagnifyingGlass, faDownload, faPencil, faTrashCan, faTriangleExclamation,
	faXmark, faDesktop, faWrench, faCheck, faUpload, faBoxesPacking, faBars, faChartSimple
} from '@fortawesome/free-solid-svg-icons'
import {
	faSquare, faSquareCheck, faFileLines, faFloppyDisk, faStar, faWindowMaximize
} from '@fortawesome/free-regular-svg-icons'

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
	app.component('FontAwesomeIcon', FontAwesomeIcon)
	app.component('FontAwesomeLayers', FontAwesomeLayers)
	library.add({ 
		faHome, faCircle, faUsersCog, faAngleRight, faGear, faPowerOff, faUser, faPlus,
		faMagnifyingGlass, faDownload, faSquare, faSquareCheck, faPencil, faTrashCan,
		faTriangleExclamation, faXmark, faDesktop, faWrench, faCheck, faUpload, faBoxesPacking,
		faBars, faChartSimple, faFileLines, faFloppyDisk, faStar, faWindowMaximize
	})

	router.isReady()

	console.log(app.config)
	console.log(config)

	app.config.globalProperties.$config = config;
	app.mount('#app')
}).catch((error) => {
	console.error('Error loading config:', error);
})
