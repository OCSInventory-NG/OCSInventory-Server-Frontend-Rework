<template>
	<div 
		id="navbar-menu" 
		class="collapse navbar-collapse"
	>
		<div class="d-flex flex-column flex-md-row flex-fill align-items-stretch align-items-md-center">
			<b-nav class="navbar-nav">
				<NavLink
					:is-active="activeItem"
					:header="$t('dashboard')"
					link="/ocsreports/dashboard"
					icon-name="home"
					index="dashboard"
					is-header
				/>
				<NavLink
					:is-active="activeItem"
					:header="$t('inventory')"
					:column-dividers="[
						{ header: $t('general'), identifier: 'general' },
						{ header: $t('network'), identifier: 'network' },
					]"
					:children-links="[
						{ 
							header: $t('assets'), link: '/ocsreports/inventory/assets', 
							route:'Assets', column: 'general' 
						},
						{ 
							header: $t('ipdiscover'), link: '/ocsreports/inventory/ipdiscover', 
							route:'Ipdiscover', column: 'network' 
						},
					]"
					link="/ocsreports/inventory"
					icon-name="desktop"
					index="inventory"
				/>
				<NavLink
					:is-active="activeItem"
					:header="$t('usermanagement')"
					:column-dividers="[
						{ header: $t('management'), identifier: 'management' }
					]"
					:children-links="[
						{ 
							header: $t('users'), link: '/ocsreports/usermanagement/users', 
							route:'User', column: 'management' 
						},
						{ 
							header: $t('groups'), link: '/ocsreports/usermanagement/groups', 
							route:'Group', column: 'management' 
						},
					]"
					link="/ocsreports/usermanagement"
					icon-name="users-cog"
					index="usermanagement"
				/>
				<NavLink
					:is-active="activeItem"
					:header="$t('configurations')"
					:column-dividers="[
						{ header: $t('general'), identifier: 'general' },
						{ header: $t('system'), identifier: 'system' },
						{ header: $t('inventory'), identifier: 'inventory' },
						{ header: $t('network'), identifier: 'network' },
					]"
					:children-links="[
						{ 
							header: $t('general'), link: '/ocsreports/configurations/general', 
							route:'General', column: 'general' 
						},
						{ 
							header: $t('templates'), link: '/ocsreports/configurations/templates', 
							route:'Template', column: 'system' 
						},
						{ 
							header: $t('accountinfo'), link: '/ocsreports/configurations/accountinfo', 
							route:'Accountinfo', column: 'inventory' 
						},
						{ 
							header: $t('netgroup'), link: '/ocsreports/configurations/netgroup', 
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
	data() {
		return {
			activeItem: this.$route.name
		}
	},
}
</script>