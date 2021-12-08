<template>
	<b-navbar class="header d-print-none app-header">
		<b-nav>
			<b-nav-item>
				<a 
					id="barsTooltip" 
					class="d-md-down-none px-2" 
					href="#" 
					@click="toggleSidebarMethod"
				>
					<font-awesome-icon 
						:icon="['fas', 'bars']" 
						size="2x"/>
				</a>
			</b-nav-item>
		</b-nav>
		<a class="navbarBrand d-md-none">
			OCS Inventory
		</a>
		<b-nav class="ml-auto">
			<b-nav-item-dropdown 
				id="v-step-2" 
				class="settingsDropdown d-sm-down-none" 
				no-caret 
				right
			>
				<template slot="button-content">
					<font-awesome-icon 
						:icon="['fas', 'cog']" 
						size="2x"/>
				</template>
				<b-dropdown-item-button @click="account">
					<font-awesome-icon 
						:icon="['fas', 'user']"
						class="mr-3"
					/>My Account
				</b-dropdown-item-button>
				<b-dropdown-divider />
				<b-dropdown-item-button @click="logout">
					<font-awesome-icon 
						:icon="['fas', 'power-off']"
						class="mr-3"
					/>Log Out
				</b-dropdown-item-button>
			</b-nav-item-dropdown>
		</b-nav>
	</b-navbar>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
	name: 'Header',
	computed: {
		...mapState('layout', ['sidebarClose', 'sidebarStatic']),
	},
	methods: {
		...mapActions('layout', ['toggleSidebar', 'switchSidebar', 'changeSidebarActive']),
		switchSidebarMethod() {
			if (!this.sidebarClose) {
				this.switchSidebar(true);
				this.changeSidebarActive(null);
			} else {
				this.switchSidebar(false);
				const paths = this.$route.fullPath.split('/');
				paths.pop();
				this.changeSidebarActive(paths.join('/'));
			}
		},
		toggleSidebarMethod() {
			if (this.sidebarStatic) {
				this.toggleSidebar();
				this.changeSidebarActive(null);
			} else {
				this.toggleSidebar();
				const paths = this.$route.fullPath.split('/');
				paths.pop();
				this.changeSidebarActive(paths.join('/'));
			}
		},
		logout() {
			localStorage.setItem('authenticated', false);
			localStorage.removeItem('token_authentication');
			localStorage.removeItem('permissions');
			this.$router.push('/login');
		},
		account() {
			this.$router.push('/ocsreports/myaccount');
		},
	}
};
</script>
