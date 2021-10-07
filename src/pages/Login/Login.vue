<template>
	<div class="auth-page">
		<b-container>
			<div 
				class="logo" 
				align="center"
			>
				<img 
					src="../../assets/img/illu_communaute.png" 
					class="ocs-logo"
				>
			</div>
			<Widget 
				class="widget-auth mx-auto" 
				title="" 
				custom-header
			>
				<form 
					class="mt" 
					@submit.prevent="login"
				>
					<b-alert 
						:show="!!errorMessage" 
						class="alert-sm" 
						variant="danger"
					>
						{{ errorMessage }}
					</b-alert>
					<div class="form-group locale-changer login-form-group">
						<b-form-select v-model="$root.$i18n.locale">
							<b-form-select-option 
								v-for="(lang, i) in langs" 
								:key="`Lang${i}`" 
								:value="i"
							>
								{{ lang }}
							</b-form-select-option>
						</b-form-select>
					</div>
					<div class="form-group login-form-group">
						<input 
							ref="email" 
							:placeholder="$t('username')" 
							class="form-control no-border" 
							required 
							type="text" 
							name="email"
						>
					</div>
					<div class="form-group login-form-group">
						<input 
							ref="password" 
							:placeholder="$t('password')" 
							class="form-control no-border" 
							required 
							type="password" 
							name="password"
						>
					</div>
					<b-button 
						type="submit" 
						size="sm" 
						class="auth-btn mb-3" 
						variant="inverse"
					>
						Login
					</b-button>
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
import i18n from '../../i18n';

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
	created() {
		if (localStorage.getItem('authenticated') === 'true'
		&& localStorage.getItem('token_authentication') !== null
		&& localStorage.getItem('permissions') !== null) {
			this.$router.push('/ocsreports/dashboard');
		}
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

			Axios.post(process.env.VUE_APP_API_ROUTE+"api-auth/token", loginOptions, { header })
				.then(response => {
					this.errorMessage = null
					localStorage.setItem('token_authentication', response.data.token)
					localStorage.setItem('authenticated', true)
					this.getPermissions()
				})
				.catch(e => {
					this.errorMessage = e
				})
		},
		getPermissions() {
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}

			Axios.get(process.env.VUE_APP_API_ROUTE+"myaccount/", { headers: header })
				.then(response => {
					var tmpUser = []
					response.data.forEach(element => {
						element.user_permissions.forEach(userPerm => {
							tmpUser[userPerm] = userPerm
						});
						if(element.groups.length != 0) {
							element.groups.forEach(groups => {
								Axios.get(process.env.VUE_APP_API_ROUTE+"groups/"+groups, { headers: header })
									.then(groupResponse => {
										groupResponse.data.permissions.forEach(element => {
											tmpUser[element] = element
										});
										this.errorMessage = null
										localStorage.setItem('permissions', tmpUser)
										this.$router.push('/ocsreports/dashboard')
									})
									.catch(e => {
										this.errorMessage = e
									})
							});
						} else {
							if(tmpUser.length != 0) {
								localStorage.setItem('permissions', tmpUser)
								this.$router.push('/ocsreports/dashboard')
							}
							this.errorMessage = i18n.t("error_no_permissions")
						}
					});
				})
				.catch(e => {
					this.errorMessage = e
				})
		},
	},
};
</script>