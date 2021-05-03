import Vue from 'vue';
import Router from 'vue-router';

import Layout from '@/components/Layout/Layout';
import Login from '@/pages/Login/Login';
import Error from '@/pages/Error/Error';

import MyAccount from '@/pages/MyAccount/MyAccount';

import Debug from '@/pages/Debug/Debug';

// Main
import Dashboard from '@/pages/Dashboard/Dashboard';
// All computers
import AllComputers from '@/pages/AllComputers/AllComputers';

/**
 *  Inventory
 **/ 
import Multicriteria from '@/pages/Inventory/Multicriteria/Multicriteria';
import AllSoftwares from '@/pages/Inventory/AllSoftwares/AllSoftwares';
import IpDiscover from '@/pages/Inventory/IpDiscover/IpDiscover';
import SnmpInventory from '@/pages/Inventory/Snmp/Snmp';
import Groups from '@/pages/Inventory/Groups/Groups';
import CveReporting from '@/pages/Inventory/CveReporting/CveReporting';
import WebAppInventory from '@/pages/Inventory/WebAppInventory/WebAppInventory';
import ComputersPerTag from '@/pages/Inventory/ComputersPerTag/ComputersPerTag';

/**
 *  Deployment
 **/ 
import Build from '@/pages/Deployment/Build/Build';
import Activate from '@/pages/Deployment/Activate/Activate';
import AssignementRules from '@/pages/Deployment/AssignementRules/AssignementRules';

/**
 *  Configuration
 **/ 
import GeneralConfiguration from '@/pages/Configuration/GeneralConfiguration/GeneralConfiguration';
import SnmpConfiguration from '@/pages/Configuration/SnmpConfiguration/SnmpConfiguration';
import Notifications from '@/pages/Configuration/Notifications/Notifications';
import Users from '@/pages/Configuration/Users/Users';
import Blacklist from '@/pages/Configuration/Blacklist/Blacklist';
import LabelFileConfiguration from '@/pages/Configuration/LabelFileConfiguration/LabelFileConfiguration';
import StoreAgents from '@/pages/Configuration/StoreAgents/StoreAgents';

/**
 *  Manage
 **/ 
import AssetsCategroies from '@/pages/Manage/AssetsCategories/AssetsCategories';
import SoftwareCategories from '@/pages/Manage/SoftwareCategories/SoftwareCategories';
import Dictionary from '@/pages/Manage/Dictionary/Dictionary';
import AdministrativeData from '@/pages/Manage/AdministrativeData/AdministrativeData';
import NetworkScan from '@/pages/Manage/NetworkScan/NetworkScan';
import Registry from '@/pages/Manage/Registry/Registry';
import SavedSearches from '@/pages/Manage/SavedSearches/SavedSearches';
import Duplicates from '@/pages/Manage/Duplicates/Duplicates';
import LocalImport from '@/pages/Manage/LocalImport/LocalImport';

/**
 *  Extensions
 **/
import ExtensionsManager from '@/pages/Extensions/ExtensionsManager/ExtensionsManager';

/**
 *  Informations
 **/ 
import LogVisualization from '@/pages/Informations/LogVisualization/LogVisualization';
import ServerInformation from '@/pages/Informations/ServerInformation/ServerInformation';
import CveHistory from '@/pages/Informations/CveHistory/CveHistory';

/**
 *  Help
 **/ 
import Wiki from '@/pages/Help/Wiki/Wiki';
import Irc from '@/pages/Help/Irc/Irc';
import Qa from '@/pages/Help/Qa/Qa';
import OcsProfessional from '@/pages/Help/OcsProfessional/OcsProfessional';

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
					path: 'debug',
					name: 'Debug',
					component: Debug,
				},
				{
					path: 'dashboard',
					name: 'Dashboard',
					component: Dashboard,
				},
				{
					path: 'all_computers',
					name: 'AllComputers',
					component: AllComputers,
				},
				{
					path: 'inventory',
					name: 'Inventory',
					children: [
						{
							path: 'multicriteria',
							name: 'Multicriteria',
							component: Multicriteria,
						},
						{
							path: 'all_softwares',
							name: 'AllSoftwares',
							component: AllSoftwares,
						},
						{
							path: 'ipdiscover',
							name: 'IpDiscover',
							component: IpDiscover,
						},
						{
							path: 'snmp_inventory',
							name: 'SnmpInventory',
							component: SnmpInventory,
						},
						{
							path: 'groups',
							name: 'Groups',
							component: Groups,
						},
						{
							path: 'cve_reporting',
							name: 'CveReporting',
							component: CveReporting,
						},
						{
							path: 'web_app_inventory',
							name: 'WebAppInventory',
							component: WebAppInventory,
						},
						{
							path: 'computers_per_tag',
							name: 'ComputersPerTag',
							component: ComputersPerTag,
						},
					],
				},
				{
					path: 'deployment',
					name: 'Deployment',
					children: [
						{
							path: 'build',
							name: 'Build',
							component: Build,
						},
						{
							path: 'activate',
							name: 'Activate',
							component: Activate,
						},
						{
							path: 'assignement_rules',
							name: 'AssignementRules',
							component: AssignementRules,
						},
					],
				},
				{
					path: 'configuration',
					name: 'Configuration',
					children: [
						{
							path: 'general_configuration',
							name: 'GeneralConfiguration',
							component: GeneralConfiguration,
						},
						{
							path: 'snmp_configuration',
							name: 'SnmpConfiguration',
							component: SnmpConfiguration,
						},
						{
							path: 'notifications',
							name: 'Notifications',
							component: Notifications,
						},
						{
							path: 'users',
							name: 'Users',
							component: Users,
						},
						{
							path: 'blacklist',
							name: 'Blacklist',
							component: Blacklist,
						},
						{
							path: 'label_file_configuration',
							name: 'LabelFileConfiguration',
							component: LabelFileConfiguration,
						},
						{
							path: 'store_agents',
							name: 'StoreAgents',
							component: StoreAgents,
						},
					],
				},
				{
					path: 'manage',
					name: 'Manage',
					children: [
						{
							path: 'assets_categories',
							name: 'AssetsCategroies',
							component: AssetsCategroies,
						},
						{
							path: 'software_categories',
							name: 'SoftwareCategories',
							component: SoftwareCategories,
						},
						{
							path: 'dictionary',
							name: 'Dictionary',
							component: Dictionary,
						},
						{
							path: 'administrative_data',
							name: 'AdministrativeData',
							component: AdministrativeData,
						},
						{
							path: 'network_scan',
							name: 'NetworkScan',
							component: NetworkScan,
						},
						{
							path: 'registry',
							name: 'Registry',
							component: Registry,
						},
						{
							path: 'saved_searches',
							name: 'SavedSearches',
							component: SavedSearches,
						},
						{
							path: 'duplicates',
							name: 'Duplicates',
							component: Duplicates,
						},
						{
							path: 'local_import',
							name: 'LocalImport',
							component: LocalImport,
						},
					],
				},
				{
					path: 'extensions',
					name: 'Extensions',
					children: [
						{
							path: 'extensions_manager',
							name: 'ExtensionsManager',
							component: ExtensionsManager,
						},
					],
				},
				{
					path: 'informations',
					name: 'Informations',
					children: [
						{
							path: 'log_visualization',
							name: 'LogVisualization',
							component: LogVisualization,
						},
						{
							path: 'server_information',
							name: 'ServerInformation',
							component: ServerInformation,
						},
						{
							path: 'cve_history',
							name: 'CveHistory',
							component: CveHistory,
						},
					],
				},
				{
					path: 'help',
					name: 'Help',
					children: [
						{
							path: 'wiki',
							name: 'Wiki',
							component: Wiki,
						},
						{
							path: 'irc',
							name: 'Irc',
							component: Irc,
						},
						{
							path: 'qa',
							name: 'Qa',
							component: Qa,
						},
						{
							path: 'ocs_professional',
							name: 'OcsProfessional',
							component: OcsProfessional,
						},
					],
				},
			],
		},
	],
});
