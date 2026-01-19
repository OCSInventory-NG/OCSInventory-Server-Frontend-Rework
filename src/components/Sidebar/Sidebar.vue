<template>
	<div 
		id="navbarMenu" 
		class="collapse navbar-collapse"
		:class="showmobilemenu ? 'show' : ''"
	>
		<div class="d-flex flex-column flex-md-row flex-fill align-items-stretch align-items-md-center">
			<BNav class="navbar-nav">
				<NavLink
					:is-active="activeItem"
					:header="$t('title.dashboard')"
					link="/dashboard"
					icon-name="home"
					index="dashboard"
					is-header
				/>
				<NavLink
					:is-active="activeItem"
					:header="$t('title.inventory')"
					:column-dividers="[
						{ header: $t('title.general'), identifier: 'general' },
						{ header: $t('title.network'), identifier: 'network' },
						{ header: $t('title.tools'), identifier: 'tools' },
					]"
					:children-links="[
						{ 
							header: $t('title.assets'), link: '/inventory/assets', 
							route:'Assets', column: 'general' 
						},
						{ 
							header: $t('title.assetgroups'), link: '/inventory/assetgroups', 
							route:'AssetGroup', column: 'general' 
						},
						{ 
							header: $t('title.ipdiscover'), link: '/inventory/ipdiscover', 
							route:'Ipdiscover', column: 'network' 
						},
						{ 
							header: $t('title.netdevices'), link: '/inventory/netdevices', 
							route:'Netdevice', column: 'network' 
						},
						{ 
							header: $t('title.multisearch'), link: '/inventory/multisearch', 
							route:'Multisearch', column: 'tools' 
						},
						{ 
							header: $t('title.savedsearch'), link: '/inventory/savedsearch', 
							route:'SavedSearch', column: 'tools' 
						},
						{ 
							header: $t('title.inventory_logs'), link: '/inventory/inventory_logs', 
							route:'InventoryLog', column: 'tools' 
						},
						{ 
							header: $t('title.software_dictionary'), link: '/inventory/software_dictionary', 
							route:'AllSoftware', column: 'general' 
						}
					]"
					link="/inventory"
					icon-name="desktop"
					index="inventory"
				/>
				<NavLink
					:is-active="activeItem"
					:header="$t('title.deployment')"
					:column-dividers="[
						{ header: $t('title.general'), identifier: 'general' }
					]"
					:children-links="[
						{ 
							header: $t('title.packages'), link: '/deployment/packages', 
							route:'Packages', column: 'general' 
						},
						{ 
							header: $t('title.history'), link: '/deployment/history', 
							route:'History', column: 'general' 
						}
					]"
					link="/deployment"
					icon-name="boxes-packing"
					index="deployment"
				/>
				<NavLink
					:is-active="activeItem"
					:header="$t('title.usermanagement')"
					:column-dividers="[
						{ header: $t('title.management'), identifier: 'management' }
					]"
					:children-links="[
						{ 
							header: $t('title.users'), link: '/usermanagement/users', 
							route:'User', column: 'management' 
						},
						{ 
							header: $t('title.groups'), link: '/usermanagement/groups', 
							route:'Group', column: 'management' 
						},
					]"
					link="/usermanagement"
					icon-name="users-cog"
					index="usermanagement"
				/>
				<NavLink
					:is-active="activeItem"
					:header="$t('title.configurations')"
					:column-dividers="[
						{ header: $t('title.general'), identifier: 'general' },
						{ header: $t('title.inventory'), identifier: 'inventory' },
						{ header: $t('title.network'), identifier: 'network' },
					]"
					:children-links="[
						{ 
							header: $t('title.general_configuration'), link: '/configurations/general', 
							route:'General', column: 'general' 
						},
						{
							header: $t('title.authentication'), link: '/configurations/authentication', 
							route:'Authentication', column: 'general'
						},
						{
							header: $t('title.automations'), link: '/configurations/automations', 
							route:'Automation', column: 'general'
						},
						{ 
							header: $t('title.templates'), link: '/configurations/templates', 
							route:'Template', column: 'inventory' 
						},
						{ 
							header: $t('title.category'), link: '/configurations/categories', 
							route:'Category', column: 'inventory' 
						},
						{ 
							header: $t('title.accountinfo'), link: '/configurations/accountinfo', 
							route:'Accountinfo', column: 'inventory' 
						},
						{ 
							header: $t('title.netgroup'), link: '/configurations/netgroup', 
							route:'NetworkGroup', column: 'network' 
						},
						{ 
							header: $t('title.rules'), link: '/configurations/rules', 
							route:'Rule', column: 'inventory' 
						},
						{ 
							header: $t('title.snmp'), link: '/configurations/snmp', 
							route:'Snmp', column: 'network' 
						},
						{ 
							header: $t('title.ipdiscover'), link: '/configurations/ipdiscover', 
							route:'IpdiscoverConfig', column: 'network' 
						},
						{ 
							header: $t('title.software_mapping'), link: '/configurations/software_mapping', 
							route:'SoftwareMapping', column: 'inventory' 
						}
					]"
					link="/configurations"
					icon-name="wrench"
					index="configurations"
				/>
			</BNav>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Sidebar',
	props: {
		showmobilemenu: { type: Boolean, default: false }
	},
	data() {
		return {
			activeItem: this.$route.name
		}
	},
}
</script>