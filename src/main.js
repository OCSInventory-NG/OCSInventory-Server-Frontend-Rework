/* eslint-disable */ 
import Vue from 'vue'
import router from './routes'
import App from './App'

/***** BOOTSTRAP *****/
import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue)

/***** VUE-SELECT *****/
import vSelect from "vue-select";
Vue.component("v-select", vSelect);
import "vue-select/dist/vue-select.css";

/***** AXIOS *****/
import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.use(VueAxios, axios)

/***** I18N *****/
import i18n from './i18n'
Vue.use(i18n)

/***** JSON/EXCEL *****/
import JsonExcel from "vue-json-excel"
Vue.component('downloadExcel', JsonExcel)

/***** APEX CHARTS *****/
import VueApexCharts from 'vue-apexcharts'
Vue.use(VueApexCharts)
Vue.component('apexchart', VueApexCharts)

/***** ICONS *****/
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon, FontAwesomeLayers } from '@fortawesome/vue-fontawesome'
import { 
	faHome, faCircle, faUsersCog, faAngleRight, faGear, faPowerOff, faUser, faPlus,
	faMagnifyingGlass, faDownload, faPencil, faTrashCan, faTriangleExclamation,
	faXmark, faDesktop, faWrench, faCheck, faUpload, faBoxesPacking
} from '@fortawesome/free-solid-svg-icons'
import {
	faSquare, faSquareCheck
} from '@fortawesome/free-regular-svg-icons'
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('font-awesome-layers', FontAwesomeLayers)
library.add({ 
	faHome, faCircle, faUsersCog, faAngleRight, faGear, faPowerOff, faUser, faPlus,
	faMagnifyingGlass, faDownload, faSquare, faSquareCheck, faPencil, faTrashCan,
	faTriangleExclamation, faXmark, faDesktop, faWrench, faCheck, faUpload, faBoxesPacking
})

Vue.config.productionTip = false

new Vue({
	router,
	i18n,
	axios,
	render: h => h(App),
}).$mount('#app')
