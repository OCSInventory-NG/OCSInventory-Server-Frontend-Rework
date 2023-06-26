<template>
	<header 
		class="navbar navbar-expand-md navbar-overlap d-print-none" 
		data-bs-theme="dark"
	>
		<div class="container-xl">
			<button 
				class="navbar-toggler" 
				type="button" 
				data-bs-toggle="collapse" 
				data-bs-target="#navbar-menu"
			>
				<span class="navbar-toggler-icon" />
			</button>
			<h1 class="navbar-brand navbar-brand-autodark d-none-navbar-horizontal pe-0 pe-md-3">
				<a href="/ocsreports/dashboard">
					<img 
						src="../../assets/logo-white.png"
						alt="OCS Inventory" 
						class="navbar-brand-image logo-size"
					>
				</a>
			</h1>

			<!-- USER SETTING / LOGOUT -->
			<div class="navbar-nav flex-row order-md-last">
				<b-nav-item-dropdown
					id="setting-dropdown"
					no-caret 
				>
					<template slot="button-content">
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
						<p>{{ $t('myaccount') }}</p>
					</b-dropdown-item-button>
					<b-dropdown-divider />
					<b-dropdown-item-button @click="logout">
						<font-awesome-icon 
							:icon="['fas', 'power-off']"
							class="mr-3"
						/>
						<p>{{ $t('logout') }}</p>
					</b-dropdown-item-button>
				</b-nav-item-dropdown>
			</div>

			<Sidebar />
		</div>
	</header>
</template>

<script>
import Sidebar from '@/components/Sidebar/Sidebar'

export default {
	name: 'Header',
	components: { Sidebar },
	methods: {
		logout() {
			localStorage.setItem('authenticated', false);
			localStorage.removeItem('token_authentication');
			localStorage.removeItem('permissions');
			this.$router.push('/login');
		},
		account() {
			this.$router.push('/myaccount');
		},
	}
}
</script>