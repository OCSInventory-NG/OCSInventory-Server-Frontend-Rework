export const baseMenu = [
	{
		type: "header",
		index: "dashboard",
		headerKey: "title.dashboard",
		link: "/dashboard",
		icon: "home",
	},
	{
		type: "group",
		index: "inventory",
		headerKey: "title.inventory",
		link: "/inventory",
		icon: "desktop",
		columnDividers: [
			{
				headerKey: "title.general",
				identifier: "general",
			},
			{
				headerKey: "title.network",
				identifier: "network",
			},
			{
				headerKey: "title.tools",
				identifier: "tools",
			},
		],
		children: [
			{
				headerKey: "title.assets",
				link: "/inventory/assets",
				route: "Assets",
				column: "general",
			},
			{
				headerKey: "title.assetgroups",
				link: "/inventory/assetgroups",
				route: "AssetGroup",
				column: "general",
			},
			{
				headerKey: "title.ipdiscover",
				link: "/inventory/ipdiscover",
				route: "Ipdiscover",
				column: "network",
			},
			{
				headerKey: "title.netdevices",
				link: "/inventory/netdevices",
				route: "Netdevice",
				column: "network",
			},
			{
				headerKey: "title.multisearch",
				link: "/inventory/multisearch",
				route: "Multisearch",
				column: "tools",
			},
			{
				headerKey: "title.savedsearch",
				link: "/inventory/savedsearch",
				route: "SavedSearch",
				column: "tools",
			},
			{
				headerKey: "title.inventory_logs",
				link: "/inventory/inventory_logs",
				route: "InventoryLog",
				column: "tools",
			},
			{
				headerKey: "title.software_dictionary",
				link: "/inventory/software_dictionary",
				route: "AllSoftware",
				column: "general",
			},
		],
	},
	{
		type: "group",
		index: "deployment",
		headerKey: "title.deployment",
		link: "/deployment",
		icon: "boxes-packing",
		columnDividers: [
			{
				headerKey: "title.general",
				identifier: "general",
			},
		],
		children: [
			{
				headerKey: "title.packages",
				link: "/deployment/packages",
				route: "Packages",
				column: "general",
			},
			{
				headerKey: "title.history",
				link: "/deployment/history",
				route: "History",
				column: "general",
			},
		],
	},
	{
		type: "group",
		index: "usermanagement",
		headerKey: "title.usermanagement",
		link: "/usermanagement",
		icon: "users-cog",
		columnDividers: [
			{
				headerKey: "title.management",
				identifier: "management",
			},
		],
		children: [
			{
				headerKey: "title.users",
				link: "/usermanagement/users",
				route: "User",
				column: "management",
			},
			{
				headerKey: "title.groups",
				link: "/usermanagement/groups",
				route: "Group",
				column: "management",
			},
		],
	},
	{
		type: "group",
		index: "configurations",
		headerKey: "title.configurations",
		link: "/configurations",
		icon: "wrench",
		columnDividers: [
			{
				headerKey: "title.general",
				identifier: "general",
			},
			{
				headerKey: "title.inventory",
				identifier: "inventory",
			},
			{
				headerKey: "title.network",
				identifier: "network",
			},
		],
		children: [
			{
				headerKey: "title.general_configuration",
				link: "/configurations/general",
				route: "General",
				column: "general",
			},
			{
				headerKey: "title.authentication",
				link: "/configurations/authentication",
				route: "Authentication",
				column: "general",
			},
			{
				headerKey: "title.automations",
				link: "/configurations/automations",
				route: "Automation",
				column: "general",
			},
			{
				headerKey: "title.templates",
				link: "/configurations/templates",
				route: "Template",
				column: "inventory",
			},
			{
				headerKey: "title.category",
				link: "/configurations/categories",
				route: "Category",
				column: "inventory",
			},
			{
				headerKey: "title.accountinfo",
				link: "/configurations/accountinfo",
				route: "Accountinfo",
				column: "inventory",
			},
			{
				headerKey: "title.netgroup",
				link: "/configurations/netgroup",
				route: "NetworkGroup",
				column: "network",
			},
			{
				headerKey: "title.rules",
				link: "/configurations/rules",
				route: "Rule",
				column: "inventory",
			},
			{
				headerKey: "title.snmp",
				link: "/configurations/snmp",
				route: "Snmp",
				column: "network",
			},
			{
				headerKey: "title.ipdiscover",
				link: "/configurations/ipdiscover",
				route: "IpdiscoverConfig",
				column: "network",
			},
			{
				headerKey: "title.software_mapping",
				link: "/configurations/software_mapping",
				route: "SoftwareMapping",
				column: "inventory",
			},
			{
				headerKey: "title.extensions",
				link: "/configurations/extensions",
				route: "Extension",
				column: "general",
			},
		],
	},
]
