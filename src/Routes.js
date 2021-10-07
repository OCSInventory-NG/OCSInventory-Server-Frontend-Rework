import Vue from 'vue';
import Router from 'vue-router';

import Layout from '@/components/Layout/Layout';
import Login from '@/pages/Login/Login';
import Error from '@/pages/Error/Error';

import MyAccount from '@/pages/MyAccount/MyAccount';

// Main
import Dashboard from '@/pages/Dashboard/Dashboard';

// User management
import Users from '@/pages/UserManagement/Users/Users';
import Groups from '@/pages/UserManagement/Groups/Groups';

// Configurations
import General from '@/pages/Configuration/General/General';
import Template from '@/pages/Configuration/Template/Template';
import EditTemplate from '@/pages/Configuration/Template/EditTemplate';

Vue.use(Router);

export default new Router({
	routes: [
		{
			path: '/login',
			name: 'Login',
			component: Login,
		},
		{
			path: '/error',
			name: 'Error',
			component: Error,
		},
		{
			path: '/ocsreports',
			name: 'Layout',
			component: Layout,
			children: [
				{
					path: 'my_account',
					name: 'MyAccount',
					component: MyAccount,
				},
				{
					path: 'dashboard',
					name: 'Dashboard',
					component: Dashboard,
				},
				{
					path: 'users',
					name: 'Users',
					component: Users,
				},
				{
					path: 'groups',
					name: 'Groups',
					component: Groups,
				},
				{
					path: 'general',
					name: 'General',
					component: General,
				},
				{
					path: 'templates',
					name: 'Template',
					component: Template
				},
				{
					path: 'templates/edittemplate/:id',
					name: 'EditTemplate',
					component: EditTemplate,
					props: true
				}
			],
		},
	],
});
