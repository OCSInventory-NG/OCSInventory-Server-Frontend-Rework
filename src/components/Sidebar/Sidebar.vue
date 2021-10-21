<template>
	<div class="sidebar-wrapper">
		<nav
			:class="{sidebar: true, sidebarStatic, sidebarOpened}"
			@mouseenter="sidebarMouseEnter"
			@mouseleave="sidebarMouseLeave"
		>
			<header class="logo">
				<router-link to="/ocsreports/dashboard">
					<span class="primary-word">OCS</span>
					<span class="secondary-word"> Inventory</span>
				</router-link>
			</header>
			<ul class="nav">
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
						{ header: $t('templates'), link: '/ocsreports/configurations/templates' },
					]"
					link="/ocsreports/configurations"
					icon-name="wrench"
					index="configurations"
				/>
			</ul>
		</nav>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import isScreen from '@/core/screenHelper';
import NavLink from './NavLink/NavLink';

export default {
	name: 'Sidebar',
	components: { NavLink },
	computed: {
		...mapState('layout', {
			sidebarStatic: state => state.sidebarStatic,
			sidebarOpened: state => !state.sidebarClose,
			activeItem: state => state.sidebarActiveElement,
		}),
	},
	created() {
		this.setActiveByRoute();
	},
	methods: {
		...mapActions('layout', ['changeSidebarActive', 'switchSidebar']),
		setActiveByRoute() {
			const paths = this.$route.fullPath.split('/');
			paths.pop();
			this.changeSidebarActive(paths.join('/'));
		},
		sidebarMouseEnter() {
			if (!this.sidebarStatic && (isScreen('lg') || isScreen('xl'))) {
				this.switchSidebar(false);
				this.setActiveByRoute();
			}
		},
		sidebarMouseLeave() {
			if (!this.sidebarStatic && (isScreen('lg') || isScreen('xl'))) {
				this.switchSidebar(true);
				this.changeSidebarActive(null);
			}
		},
	},
};
</script>
