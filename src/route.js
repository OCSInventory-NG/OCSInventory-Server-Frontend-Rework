import { createWebHistory,createRouter } from "vue-router"
import AppLayout from "./layouts/AppLayout.vue"
import AuthLayout from "./layouts/AuthLayout.vue"
import { withBase } from "@/utils/basePath"

const routes = [
	{
		path: '/',
		redirect: '/dashboard'
	},
	{
		path: '/login',
		name: 'Login',
		meta: {
			layout: AuthLayout
		},
		component: () => import('@/pages/Login/Login.vue'),
	},
	{
		path: '/myaccount',
		name: 'MyAccount',
		component: () => import('@/pages/MyAccount/MyAccount.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: () => import('@/pages/Dashboard/Dashboard.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/usermanagement/users',
		name: 'User',
		component: () => import('@/pages/UserManagement/User/User.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/usermanagement/groups',
		name: 'Group',
		component: () => import('@/pages/UserManagement/Group/Group.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/configurations/general',
		name: 'General',
		component: () => import('@/pages/Configuration/General/General.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/configurations/accountinfo',
		name: 'Accountinfo',
		component: () => import('@/pages/Configuration/Accountinfo/Accountinfo.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/configurations/templates',
		name: 'Template',
		component: () => import('@/pages/Configuration/Template/Template.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/configurations/templates/:id',
		name: 'EditTemplate',
		component: () => import('@/pages/Configuration/Template/EditTemplate.vue'),		
		props: true,
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/configurations/netgroup',
		name: 'NetworkGroup',
		component: () => import('@/pages/Configuration/NetworkGroup/NetworkGroup.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/configurations/snmp',
		name: 'Snmp',
		component: () => import('@/pages/Configuration/Snmp/Snmp.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/configurations/ipdiscover',
		name: 'IpdiscoverConfig',
		component: () => import('@/pages/Configuration/Ipdiscover/Ipdiscover.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/configurations/snmp/:id',
		name: 'EditSnmpTemplate',
		component: () => import('@/pages/Configuration/Template/EditTemplate.vue'),		
		props: true,
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/configurations/authentication',
		name: 'Authentication',
		component: () => import('@/pages/Configuration/Authentication/Authentication.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/configurations/automations',
		name: 'Automation',
		component: () => import('@/pages/Configuration/Automation/Automation.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/configurations/automations/history/:id?',
		name: 'AutomationHistory',
		component: () => import('@/pages/Configuration/Automation/AutomationHistory.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/configurations/rules',
		name: 'Rule',
		component: () => import('@/pages/Configuration/Rule/Rule.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/configurations/rules/:id',
		name: 'EditRule',
		component: () => import('@/pages/Configuration/Rule/EditRule.vue'),
		props: true,
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/configurations/serverinfo',
		name: 'ServerInfo',
		component: () => import('@/pages/Configuration/ServerInfo/ServerInfo.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/inventory/assets',
		name: 'Assets',
		component: () => import('@/pages/Inventory/Asset/Asset.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/inventory/assetgroups',
		name: 'AssetGroup',
		component: () => import('@/pages/Inventory/Asset/AssetGroup.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/inventory/assetgroups/:id',
		name: 'AssetGroupDetail',
		component: () => import('@/pages/Inventory/Asset/AssetGroupDetail.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/inventory/ipdiscover',
		name: 'Ipdiscover',
		component: () => import('@/pages/Inventory/Ipdiscover/Ipdiscover.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/inventory/netdevices/:id?',
		name: 'Netdevice',
		component: () => import('@/pages/Inventory/Ipdiscover/Netdevice.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/inventory/inventory_logs/:id?',
		name: 'InventoryLog',
		component: () => import('@/pages/Inventory/Tools/InventoryLog.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/inventory/:type/:id',
		name: 'Detail',
		component: () => import('@/pages/Detail/Detail.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/inventory/multisearch',
		name: 'Multisearch',
		component: () => import('@/pages/Inventory/Tools/Multisearch.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/inventory/savedsearch',
		name: 'SavedSearch',
		component: () => import('@/pages/Inventory/Tools/SavedSearch.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/inventory/compliance',
		name: 'ComplianceDashboard',
		component: () => import('@/pages/Inventory/Tools/ComplianceDashboard.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/deployment/packages',
		name: 'Packages',
		component: () => import('@/pages/Deployment/Package.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/deployment/packages/:id',
		name: 'EditPackage',
		component: () => import('@/pages/Deployment/EditPackage.vue'),		
		props: true,
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/deployment/history',
		name: 'History',
		component: () => import('@/pages/Deployment/History.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/deployment/history/:id',
		name: 'Result',
		component: () => import('@/pages/Deployment/Result.vue'),	
		props: true,
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/configurations/categories',
		name: 'Category',
		component: () => import('@/pages/Configuration/Category/Category.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/configurations/software_mapping',
		name: 'SoftwareMapping',
		component: () => import('@/pages/Configuration/SoftwareMapping/SoftwareMapping.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/inventory/software_dictionary',
		name: 'AllSoftware',
		component: () => import('@/pages/Inventory/Asset/AllSoftware.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/configurations/extensions',
		name: 'Extension',
		component: () => import('@/pages/Configuration/Extension/Extension.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/configurations/compliance_settings',
		name: 'ComplianceSettings',
		component: () => import('@/pages/Configuration/Compliance/ComplianceSettings.vue'),
		meta: {
			layout: AppLayout
		}
	},
	{
		path: '/configurations/compliance_settings/:id',
		name: 'EditComplianceRule',
		component: () => import('@/pages/Configuration/Compliance/EditComplianceRule.vue'),
		props: true,
		meta: {
			layout: AppLayout
		}
	},

	{
		path: '/:pathMatch(.*)*',
		name: 'NotFound',
		component: () => import('@/pages/NotFound/NotFound.vue'),
		meta: {
			layout: AppLayout
		}
	}
]

const router = createRouter({
	history: createWebHistory(withBase("ocsreports")),
	routes,
})
  
export default router