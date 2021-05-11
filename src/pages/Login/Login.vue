<template>
	<div class="auth-page">
		<b-container>
			<div class="logo" align="center">
				<img src="../../assets/img/illu_communaute.png" class="ocs-logo"/>
			</div>
			<Widget class="widget-auth mx-auto" title="" customHeader>
				<form class="mt" @submit.prevent="login">
					<b-alert class="alert-sm" variant="danger" :show="!!errorMessage">
						{{errorMessage}}
					</b-alert>
					<div class="form-group locale-changer">
						<b-form-select v-model="$root.$i18n.locale">
							<b-form-select-option v-for="(lang, i) in langs" :key="`Lang${i}`" :value="i">{{ lang }}</b-form-select-option>
						</b-form-select>
					</div>
					<div class="form-group">
						<input class="form-control no-border" ref="email" required type="text" name="email" :placeholder="$t('username')" />
					</div>
					<div class="form-group">
						<input class="form-control no-border" ref="password" required type="password" name="password" :placeholder="$t('password')" />
					</div>
					<b-button type="submit" size="sm" class="auth-btn mb-3 login-button" variant="inverse">Login</b-button>
				</form>
			</Widget>
		</b-container>
		<footer class="auth-footer">
			Copyright OCS Inventory 2021
		</footer>
	</div>
</template>

<script>
import Widget from '@/components/Widget/Widget';
import Axios from 'axios';

export default {
	name: 'LoginPage',
	components: { Widget },
	data() {
		return {
			errorMessage: null,
			langs: {
				'fr': "Français",
				'en': "English"
			},
		};
	},
	methods: {
		login() {
			const email = this.$refs.email.value;
			const password = this.$refs.password.value;

			const loginOptions = { 
				"username": email,
				"password": password
			}

			const header = {
				"Access-Control-Allow-Origin" : "*",
				"Access-Control-Allow-Methods" : "GET,PUT,POST,DELETE,PATCH,OPTIONS",
				"Content-Type": "application/json;charset=utf-8",
			}

			Axios.post("http://172.18.26.12:8000/api-auth/token", loginOptions, { header })
				.then(response => {
					this.errorMessage = null
					localStorage.setItem('token_authentication', response.data.token)
					localStorage.setItem('authenticated', true)
					this.$router.push('/app/dashboard')
				})
				.catch(e => {
					this.errorMessage = e
				})
		},
	},
	created() {
		if (localStorage.getItem('authenticated') === 'true' && localStorage.getItem('token_authentication') !== null) {
			this.$router.push('/app/dashboard');
		}
	},
};
</script>

<style lang="scss">
.login-button {
	background-color:#20222e!important;
	color: white!important;
}

.login-button:hover {
	background-color:#961b7e!important;
	color: white!important;
	border-color: #961b7e!important;
}

.logo {
	margin-bottom: 20px;
}
</style>
