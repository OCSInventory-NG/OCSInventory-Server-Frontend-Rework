// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue';
import VueTouch from 'vue-touch';
import Trend from 'vuetrend';
import Toasted from 'vue-toasted';
import VueApexCharts from 'vue-apexcharts';
import VueComp from '@vue/composition-api';

import store from './store';
import router from './Routes';
import App from './App';
import layoutMixin from './mixins/layout';
import Widget from './components/Widget/Widget';

import axios from 'axios';
import VueAxios from 'vue-axios';

import JsonExcel from "vue-json-excel";

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import VueI18n from 'vue-i18n';
import i18n from './i18n'

import { library } from '@fortawesome/fontawesome-svg-core';
import { 
	faUserSecret, 
	faUsersCog, 
	faHome, 
	faBars, 
	faCog, 
	faPowerOff, 
	faUser, 
	faAngleRight,
	faPlus,
	faWrench,
	faCheck,
	faDesktop
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

Vue.use(VueI18n);
Vue.use(VueApexCharts)
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons)
Vue.use(VueTouch);
Vue.use(Trend);
Vue.use(Toasted, { duration: 10000 });
Vue.use(VueAxios, axios);
Vue.use(VueComp);

Vue.component('Widget', Widget);
Vue.component('apexchart', VueApexCharts);
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.component('downloadExcel', JsonExcel);

Vue.mixin(layoutMixin);

library.add({ 
	faUserSecret, 
	faUsersCog, 
	faHome, 
	faBars, 
	faCog, 
	faPowerOff, 
	faUser, 
	faAngleRight,
	faPlus,
	faWrench,
	faCheck,
	faDesktop
});

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
	el: '#app',
	store,
	router,
	i18n,
	render: h => h(App)
});
