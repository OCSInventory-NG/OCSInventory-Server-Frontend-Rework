<template>
	<div :class="[{root: true, sidebarClose, sidebarStatic}, 'ocs-dashboard']">
		<Sidebar />
		<div class="wrap">
			<Header />
			<v-touch 
				:swipe-options="{direction: 'horizontal'}"
				class="content"
				@swipe="handleSwipe"
			>
				<breadcrumb-history/>
				<transition name="router-animation">
					<router-view />
				</transition>
				<footer class="contentFooter">
					Copyright OCS Inventory 2021
				</footer>
			</v-touch>
		</div>
	</div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
const { mapState, mapActions } = createNamespacedHelpers('layout');

import Sidebar from '@/components/Sidebar/Sidebar';
import Header from '@/components/Header/Header';
import BreadcrumbHistory from '@/components/BreadcrumbHistory/BreadcrumbHistory';

export default {
	name: 'Layout',
	components: { Sidebar, Header, BreadcrumbHistory },
	computed: {
		...mapState(["sidebarClose", "sidebarStatic"]),
	},
	created() {
		const staticSidebar = JSON.parse(localStorage.getItem('sidebarStatic'));

		if (staticSidebar) {
			this.$store.state.layout.sidebarStatic = true;
		} else if (!this.sidebarClose) {
			setTimeout(() => {
				this.switchSidebar(true);
				this.changeSidebarActive(null);
			}, 2500);
		}

		this.handleWindowResize();
		window.addEventListener('resize', this.handleWindowResize);
	},
	beforeDestroy() {
		window.removeEventListener('resize', this.handleWindowResize);
	},
	methods: {
		...mapActions(
			['switchSidebar', 'handleSwipe', 'changeSidebarActive', 'toggleSidebar']
		),
		handleWindowResize() {
			const width = window.innerWidth;

			if (width <= 768 && this.sidebarStatic) {
				this.toggleSidebar();
				this.changeSidebarActive(null);
			}
		},
	},
};
</script>
