import { createApp } from 'vue'
import App from '@/App.vue'

const app = createApp(App)

/***** Bootstrap *****/
import { createBootstrap } from 'bootstrap-vue-next'
app.use(createBootstrap())

/***** Vue Router *****/
import router from '@/route'
app.use(router)

/***** I18n *****/
import i18n from '@/i18n'
app.use(i18n)

/***** Apex Charts *****/
import VueApexCharts from 'vue3-apexcharts'
app.use(VueApexCharts)

/***** Vue Json Excel 3 *****/
import JsonExcel from 'vue-json-excel3'
app.component("DownloadExcel", JsonExcel)

/***** Vue select *****/
import vSelect from "vue-select"
app.component("VSelect", vSelect)
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
	faSquare, faSquareCheck, faFileLines, faFloppyDisk, faStar
} from '@fortawesome/free-regular-svg-icons'
app.component('FontAwesomeIcon', FontAwesomeIcon)
app.component('FontAwesomeLayers', FontAwesomeLayers)
library.add({ 
	faHome, faCircle, faUsersCog, faAngleRight, faGear, faPowerOff, faUser, faPlus,
	faMagnifyingGlass, faDownload, faSquare, faSquareCheck, faPencil, faTrashCan,
	faTriangleExclamation, faXmark, faDesktop, faWrench, faCheck, faUpload, faBoxesPacking,
	faBars, faChartSimple, faFileLines, faFloppyDisk, faStar
})

/***** Loader *****/
import Loader from '@/components/Loader/Loader.vue'
app.component("Loader", Loader)

/***** Alert *****/
import Alert from '@/components/Alert/Alert.vue'
app.component("Alert", Alert)

/***** Datatable *****/
import Datatable from '@/components/Datatable/Datatable.vue'
app.component("Datatable", Datatable)

router.isReady()

app.mount('#app')
