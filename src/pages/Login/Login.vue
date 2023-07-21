<template>
	<div class="auth-page container">
		<div class="row">
			<div class="col-2" />
			<div class="col-4">
				<div 
					class="logo" 
					align="center"
				>
					<img 
						src="../../assets/illu_communaute.png" 
						class="ocs-logo"
					>
				</div>
			</div>

			<div class="col-4 form-login">
				<form 
					class="mt" 
					@submit.prevent="login"
				>
					<!-- Alert component -->
					<Alert 
						:message="errorMessage"
						variant="danger"
					/>

					<!-- Language selection -->
					<div class="form-group locale-changer login-form-group">
						<b-form-select 
							v-model="$root.$i18n.locale"
							class="form-select"
						>
							<b-form-select-option 
								v-for="(lang, i) in langs" 
								:key="`Lang${i}`" 
								:value="i"
							>
								{{ lang }}
							</b-form-select-option>
						</b-form-select>
					</div>

					<!-- Username -->
					<div class="form-group login-form-group">
						<input 
							ref="email" 
							:placeholder="$t('user.username')" 
							class="form-control no-border" 
							required 
							type="text" 
							name="email"
						>
					</div>

					<!-- Password -->
					<div class="form-group login-form-group">
						<input 
							ref="password" 
							:placeholder="$t('user.password')" 
							class="form-control no-border" 
							required 
							type="password" 
							name="password"
						>
					</div>
					
					<!-- Submit button -->
					<b-button 
						type="submit"
						class="auth-btn mb-3" 
						variant="inverse"
					>
						{{ $t('generic.login') }}
					</b-button>
				</form>
			</div>
		</div>
	</div>
</template>

<script>
import Axios from 'axios';
import i18n from '../../i18n';
import Alert from '@/components/Alert/Alert.vue'

export default {
	name: 'LoginPage',
	components: { Alert },
	data() {
		return {
			errorMessage: null,
			langs: {
				'fr': 'Français',
				'en': 'English'
			}
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
				"Content-Type": "application/json;charset=utf-8"
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
				.then(responseAccount => {
					var tmpUser = responseAccount.data.full_permissions
					if(tmpUser.length != 0) {
						localStorage.setItem('permissions', tmpUser)
						this.$router.push('/dashboard')
					}
					this.errorMessage = i18n.t("message.error_no_permissions")
				})
				.catch(e => {
					this.errorMessage = e
				})
		}
	},
}
</script>