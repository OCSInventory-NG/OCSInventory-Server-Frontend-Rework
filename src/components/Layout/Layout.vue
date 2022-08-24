<template>
	<div :class="[{root: true, sidebarclose, sidebarstatic}, 'ocs-dashboard']">
		<Sidebar />
		<div class="wrap">
			<Header />
			<v-touch 
				:swipe-options="{direction: 'horizontal'}"
				class="content"
				@swipe="handleSwipe"
			>
				<breadcrumb-history />
				<transition name="router-animation">
					<router-view />
				</transition>
				<footer class="contentfooter">
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
		...mapState(["sidebarclose", "sidebarstatic"]),
	},
	created() {
		const staticSidebar = JSON.parse(localStorage.getItem('sidebarstatic'));

		if (staticSidebar) {
			this.$store.state.layout.sidebarstatic = true;
		} else if (!this.sidebarclose) {
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

			if (width <= 768 && this.sidebarstatic) {
				this.toggleSidebar();
				this.changeSidebarActive(null);
			}
		},
	},
};
</script>
