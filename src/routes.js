import Vue from 'vue'
import Router from 'vue-router'

/***** PAGES *****/
// Login
import Login from '@/pages/Login/Login'
// MyAccount
import MyAccount from '@/pages/MyAccount/MyAccount'
// Dashboard
import Dashboard from '@/pages/Dashboard/Dashboard'
// Inventory
import Assets from '@/pages/Inventory/Asset/Asset'
import Ipdiscover from '@/pages/Inventory/Ipdiscover/Ipdiscover'
// Usermanagement
import User from '@/pages/UserManagement/User/User'
import Group from '@/pages/UserManagement/Group/Group'
// Configuration
import General from '@/pages/Configuration/General/General'
import Accountinfo from '@/pages/Configuration/Accountinfo/Accountinfo'
import Template from '@/pages/Configuration/Template/Template'
import EditTemplate from '@/pages/Configuration/Template/EditTemplate'
import NetworkGroup from '@/pages/Configuration/NetworkGroup/NetworkGroup'

Vue.use(Router)

export default new Router({
	mode: 'history',
	base: '/ocsreports',
	routes: [
		{
			path: '/login',
			name: 'Login',
			component: Login,
			meta: {
				layout: 'auth'
			}
		},
		{
			path: '/myaccount',
			name: 'MyAccount',
			component: MyAccount,
		},
		{
			path: '/dashboard',
			name: 'Dashboard',
			component: Dashboard
		},
		{
			path: '/usermanagement/users',
			name: 'User',
			component: User
		},
		{
			path: '/usermanagement/groups',
			name: 'Group',
			component: Group,
		},
		{
			path: '/configurations/general',
			name: 'General',
			component: General,
		},
		{
			path: '/configurations/accountinfo',
			name: 'Accountinfo',
			component: Accountinfo
		},
		{
			path: '/configurations/templates',
			name: 'Template',
			component: Template
		},
		{
			path: '/configurations/templates/edittemplate/:id',
			name: 'EditTemplate',
			component: EditTemplate,
			props: true
		},
		{
			path: '/configurations/netgroup',
			name: 'NetworkGroup',
			component: NetworkGroup
		},
		{
			path: '/inventory/assets',
			name: 'Assets',
			component: Assets
		},
		{
			path: '/inventory/ipdiscover',
			name: 'Ipdiscover',
			component: Ipdiscover
		}	
	],
})