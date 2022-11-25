<template>
	<div 
		id="navbar-menu" 
		class="collapse navbar-collapse"
	>
		<div class="d-flex flex-column flex-md-row flex-fill align-items-stretch align-items-md-center">
			<b-nav class="navbar-nav">
				<NavLink
					:active-item="activeItem"
					:header="$t('dashboard')"
					link="/ocsreports/dashboard"
					icon-name="home"
					index="dashboard"
					is-header
				/>
				<NavLink
					:active-item="activeItem"
					:header="$t('inventory')"
					:children-links="[
						{ header: $t('assets'), link: '/ocsreports/inventory/assets' },
						{ header: $t('network'), link: 'networkinventory', main: 'network'},
						{ header: $t('ipdiscover'), link: '/ocsreports/inventory/ipdiscover' },
					]"
					link="/ocsreports/inventory"
					icon-name="desktop"
					index="inventory"
				/>
				<NavLink
					:active-item="activeItem"
					:header="$t('usermanagement')"
					:children-links="[
						{ header: $t('users'), link: '/ocsreports/usermanagement/users' },
						{ header: $t('groups'), link: '/ocsreports/usermanagement/groups' },
					]"
					link="/ocsreports/usermanagement"
					icon-name="users-cog"
					index="usermanagement"
				/>
				<NavLink
					:active-item="activeItem"
					:header="$t('configurations')"
					:children-links="[
						{ header: $t('general'), link: '/ocsreports/configurations/general' },
						{ header: $t('system'), link: 'systemconfig', main: 'system'},
						{ header: $t('templates'), link: '/ocsreports/configurations/templates' },
						{ header: $t('inventory'), link: 'inventoryconfig', main: 'inventory'},
						{ header: $t('accountinfo'), link: '/ocsreports/configurations/accountinfo' },
						{ header: $t('network'), link: 'networkconfig', main: 'network'},
						{ header: $t('netgroup'), link: '/ocsreports/configurations/netgroup' },
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
	components: { NavLink }
}
</script>