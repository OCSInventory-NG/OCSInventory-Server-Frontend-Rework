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
			path: '/app',
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
			],
		},
	],
});
