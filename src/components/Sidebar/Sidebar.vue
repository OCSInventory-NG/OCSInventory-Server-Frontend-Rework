<template>
	<div 
		id="navbarMenu" 
		class="collapse navbar-collapse"
		:class="showmobilemenu ? 'show' : ''"
	>
		<div class="d-flex flex-column flex-md-row flex-fill align-items-stretch align-items-md-center">
			<b-nav class="navbar-nav">
				<NavLink
					:is-active="activeItem"
					:header="$t('title.dashboard')"
					link="/ocsreports/dashboard"
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
					]"
					:children-links="[
						{ 
							header: $t('title.assets'), link: '/ocsreports/inventory/assets', 
							route:'Assets', column: 'general' 
						},
						{ 
							header: $t('title.ipdiscover'), link: '/ocsreports/inventory/ipdiscover', 
							route:'Ipdiscover', column: 'network' 
						},
						{ 
							header: $t('title.netdevices'), link: '/ocsreports/inventory/netdevices', 
							route:'Netdevice', column: 'network' 
						},
					]"
					link="/ocsreports/inventory"
					icon-name="desktop"
					index="inventory"
				/>
				<NavLink
					:is-active="activeItem"
					:header="$t('title.deployment')"
					:column-dividers="[
						{ header: $t('title.management'), identifier: 'management' }
					]"
					:children-links="[
						{ 
							header: $t('title.packages'), link: '/ocsreports/deployment/packages', 
							route:'Packages', column: 'management' 
						},
						{ 
							header: $t('title.history'), link: '/ocsreports/deployment/history', 
							route:'History', column: 'management' 
						},
						{ 
							header: $t('title.report'), link: '/ocsreports/deployment/report', 
							route:'Report', column: 'management' 
						}
					]"
					link="/ocsreports/deployment"
					icon-name="users-cog"
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
							header: $t('title.users'), link: '/ocsreports/usermanagement/users', 
							route:'User', column: 'management' 
						},
						{ 
							header: $t('title.groups'), link: '/ocsreports/usermanagement/groups', 
							route:'Group', column: 'management' 
						},
					]"
					link="/ocsreports/usermanagement"
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
							header: $t('title.general_configuration'), link: '/ocsreports/configurations/general', 
							route:'General', column: 'general' 
						},
						{ 
							header: $t('title.templates'), link: '/ocsreports/configurations/templates', 
							route:'Template', column: 'inventory' 
						},
						{ 
							header: $t('title.accountinfo'), link: '/ocsreports/configurations/accountinfo', 
							route:'Accountinfo', column: 'inventory' 
						},
						{ 
							header: $t('title.netgroup'), link: '/ocsreports/configurations/netgroup', 
							route:'NetworkGroup', column: 'network' 
						},
					]"
					link="/ocsreports/configurations"
					icon-name="wrench"
					index="configurations"
				/>
			</b-nav>
		</div>
	</div>
</template>

<script>
import NavLink from './NavLink/NavLink';

export default {
	name: 'Sidebar',
	components: { NavLink },
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