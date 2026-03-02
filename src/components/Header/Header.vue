<template>
	<header 
		class="navbar navbar-expand-md navbar-overlap d-print-none" 
		data-bs-theme="dark"
	>
		<div class="container-xl">
			<button 
				class="navbar-toggler" 
				type="button" 
				data-toggle="collapse" 
				data-target="#navbarMenu" 
				aria-controls="navbarMenu" 
				aria-expanded="false" 
				aria-label="Toggle navigation"
				@click="showMenu()"
			>
				<span class="navbar-toggler-icon" />
			</button>
			<h1 class="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3">
				<router-link to="/dashboard">
					<img 
						src="../../assets/img/logo-white.png"
						alt="OCS Inventory" 
						class="navbar-brand-image logo-size"
					>
				</router-link>
			</h1>

			<!-- USER SETTING / LOGOUT -->
			<div class="navbar-nav flex-row order-md-last">
				<SaveSearchModal
					:navbar="true"
					@useSaveSearch="useSaveSearch"
				/>

				<Localeswitcher />

				<BNavItemDropdown
					id="setting-dropdown"
					no-caret 
				>
					<template #button-content>
						<font-awesome-icon 
							icon="gear"
							transform="shrink-6"
							size="2x"
						/>
					</template>
					<b-dropdown-item-button @click="account">
						<font-awesome-icon 
							:icon="['fas', 'user']"
							class="mr-3"
						/>
						<p>{{ $t('title.myaccount') }}</p>
					</b-dropdown-item-button>
					<b-dropdown-divider />
					<b-dropdown-item-button @click="logout">
						<font-awesome-icon 
							:icon="['fas', 'power-off']"
							class="mr-3"
						/>
						<p>{{ $t('generic.logout') }}</p>
					</b-dropdown-item-button>

					<b-dropdown-item-button
						v-if="isSSO"
						class="d-flex align-items-center justify-content-between"
					>
						<span>SLO</span>
						<b-form-checkbox
							v-model="sloEnabled"
							switch
							@change.stop="onSLOChange"
						/>
					</b-dropdown-item-button>
				</BNavItemDropdown>
			</div>

			<Sidebar 
				:showmobilemenu="showmobilemenu"
			/>
		</div>
	</header>
</template>

<script>
export default {
	name: 'Header',
	data() {
		return {
			showmobilemenu: false,
			sloEnabled: localStorage.getItem('slo_enabled') === 'true',
			endpoint_logout: null,
			sso: false,
		}
	},
	computed: {
		isSSO() {
			return localStorage.getItem('auth_method') === 'sso';
		}
	},
	async mounted() {
		try {
			const data = await this.$api.generic.get("login/")

			if (data) {
				this.endpoint_logout = data.endpoint_logout
			}
		} catch (e) {
			console.error('Error fetching logout endpoint:', e)
		}
	},
	methods: {
		onSLOChange() {
			localStorage.setItem('slo_enabled', this.sloEnabled)
		},
		logout() {
			const authMethod = localStorage.getItem('auth_method');
			const sloEnabled = this.sloEnabled;

			localStorage.removeItem('authenticated');
			localStorage.removeItem('token_authentication');
			localStorage.removeItem('permissions');
			localStorage.removeItem('auth_method');
			localStorage.removeItem('slo_enabled');

			if(authMethod === 'sso' && sloEnabled) {
				window.location.href = this.endpoint_logout;
				return;
			}
			this.$router.push('/login');
		},
		account() {
			this.$router.push('/myaccount');
		},
		showMenu() {
			this.showmobilemenu = !this.showmobilemenu;
		},
		useSaveSearch(search) {
			localStorage.setItem('multisearch', JSON.stringify(search))
			localStorage.setItem('useSavedSearch', true)
			this.$router.push({
				name: 'Multisearch',
			});
		}
	}
}
</script>