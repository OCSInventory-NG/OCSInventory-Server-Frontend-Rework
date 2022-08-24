import Vue from 'vue'
import Router from 'vue-router'

import Layout from '@/components/Layout/Layout'
import Login from '@/pages/Login/Login'
import Error from '@/pages/Error/Error'

import MyAccount from '@/pages/MyAccount/MyAccount'

// Main
import Dashboard from '@/pages/Dashboard/Dashboard'

// Inventory
import Assets from '@/pages/Inventory/Assets/Assets'
import Ipdiscover from '@/pages/Inventory/Ipdiscover/Ipdiscover'

// User management
import Users from '@/pages/UserManagement/Users/Users'
import Groups from '@/pages/UserManagement/Groups/Groups'

// Configurations
import General from '@/pages/Configuration/General/General'
import Template from '@/pages/Configuration/Template/Template'
import EditTemplate from '@/pages/Configuration/Template/EditTemplate'
import Accountinfo from '@/pages/Configuration/Accountinfo/Accountinfo'

Vue.use(Router)

export default new Router({
	routes: [
		{
			path: '/login',
			name: 'Login',
			component: Login
		},
		{
			path: '/error',
			name: 'Error',
			component: Error
		},
		{
			path: '/ocsreports',
			name: 'Layout',
			component: Layout,
			children: [
				{
					path: 'myaccount',
					name: 'MyAccount',
					component: MyAccount
				},
				{
					path: 'dashboard',
					name: 'Dashboard',
					component: Dashboard
				},
				{
					path: 'usermanagement/users',
					name: 'Users',
					component: Users
				},
				{
					path: 'usermanagement/groups',
					name: 'Groups',
					component: Groups
				},
				{
					path: 'configurations/general',
					name: 'General',
					component: General
				},
				{
					path: 'configurations/templates',
					name: 'Template',
					component: Template
				},
				{
					path: 'configurations/templates/edittemplate/:id',
					name: 'EditTemplate',
					component: EditTemplate,
					props: true
				},
				{
					path: 'configurations/accountinfo',
					name: 'Accountinfo',
					component: Accountinfo
				},
				{
					path: 'inventory/assets',
					name: 'Assets',
					component: Assets
				},
				{
					path: 'inventory/ipdiscover',
					name: 'Ipdiscover',
					component: Ipdiscover
				}
			]
		}
	]
})
