<template>
	<div class="sidebar-wrapper">
		<nav
			:class="{sidebar: true, sidebarStatic, sidebarOpened}"
			@mouseenter="sidebarMouseEnter"
			@mouseleave="sidebarMouseLeave"
		>
			<header class="logo">
				<router-link to="/app/dashboard"><span class="primary-word">OCS</span> <span class="secondary-word"> Inventory</span></router-link>
			</header>
			<ul class="nav">
				<NavLink
					:activeItem="activeItem"
					:header="$t('dashboard')"
					link="/app/dashboard"
					iconName="home"
					index="dashboard"
					isHeader
				/>
				<NavLink
					:activeItem="activeItem"
					:header="$t('usermanagement')"
					link="/app/user_management"
					iconName="users-cog"
					index="user_management"
					:childrenLinks="[
						{ header: $t('users'), link: '/app/users' },
						{ header: $t('groups'), link: '/app/groups' },
					]"
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
	created() {
		this.setActiveByRoute();
	},
	computed: {
		...mapState('layout', {
			sidebarStatic: state => state.sidebarStatic,
			sidebarOpened: state => !state.sidebarClose,
			activeItem: state => state.sidebarActiveElement,
		}),
	},
};
</script>

<!-- Sidebar styles should be scoped -->
<style src="./Sidebar.scss" lang="scss" scoped/>
