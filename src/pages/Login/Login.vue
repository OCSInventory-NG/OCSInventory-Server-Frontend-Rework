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
						src="../../assets/img/illu_communaute.png" 
						class="ocs-logo"
					>
				</div>
			</div>

			<div class="col-4 form-login">
				<section v-if="errored">
					<Alert 
						:message="errormsg"
						variant="danger"
					/>
				</section>
				<BForm 
					class="mt" 
					@submit="onSubmit"
				>
					<!-- Language selection -->
					<div class="form-group locale-changer login-form-group">
						<BFormSelect
							v-model="$root.$i18n.locale" 
							:options="langs" 
						/>
					</div>
					<!-- Username -->
					<div class="form-group login-form-group">
						<BFormInput
							v-model="username"
							:placeholder="$t('user.username')"
							class="form-control no-border"
							type="text"
							required 
						/>
					</div>
					<!-- Password -->
					<div class="form-group login-form-group">
						<BFormInput
							v-model="password"
							:placeholder="$t('user.password')"
							class="form-control no-border"
							type="password"
							required 
						/>
					</div>
					<!-- Submit button -->
					<BRow>
						<BCol>
							<BButton
								type="submit"
								class="auth-btn mb-3"
								variant="inverse"
								:disabled="loadingLogin"
							>
								<b-spinner
									v-if="loadingLogin"
									small
									class="me-2"
								/>
								{{ $t('generic.login') }}
							</BButton>
						</BCol>
					</BRow>
				</BForm>
			</div>
		</div>
	</div>
</template>

<script>
import axios from 'axios'

export default {
	name: "Login",
	data() {
		return {
			errormsg: null,
			errored: false,
			sso: false,
			redirect_url: null,
			username: null,
			password: null,
			loadingLogin: false,
			langs: [
				{value: 'fr', text: 'Français'},
				{value: 'en', text: 'English'},
			]
		};
	},
	beforeCreate() {
		const header = {
			"Content-Type": "application/json;charset=utf-8"
		}
		axios.get(this.$config.BACKEND_API_ROUTE+"login/", { headers: header })
			.then(response => {
				if(response.data) {
					this.errored = false
					this.errormsg = null
					this.sso = response.data.SSO
					this.redirect_url = response.data.redirect_url+window.location.origin
				}
			})
			.catch(e => {
				this.errored = true
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
			})
	},
	methods: {
		onSubmit(event) {
			event.preventDefault()
			this.loadingLogin = true
			const loginOptions = { 
				"username": this.username,
				"password": this.password
			}

			const header = {
				"Access-Control-Allow-Origin" : "*",
				"Access-Control-Allow-Methods" : "GET,PUT,POST,DELETE,PATCH,OPTIONS",
				"Content-Type": "application/json;charset=utf-8"
			}

			axios.post(this.$config.BACKEND_API_ROUTE+"api-auth/token", loginOptions, { header })
				.then(response => {
					this.errored = false
					this.errormsg = null
					localStorage.setItem('token_authentication', response.data.token)
					localStorage.setItem('authenticated', true)
					localStorage.setItem('locale', this.$root.$i18n.locale)
					this.getPermissions()
				})
				.catch(e => {
					this.errored = true
					if(e.response.data.non_field_errors) {
						this.errormsg = e.response.data.non_field_errors[0]
					} else {
						this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					}
				})
				.finally(() => {
					this.loadingLogin = false
				})
		},
		getPermissions() {
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}

			axios.get(this.$config.BACKEND_API_ROUTE+"myaccount/", { headers: header })
				.then(responseAccount => {
					var tmpUser = responseAccount.data.full_permissions
					if(tmpUser.length != 0) {
						this.errored = false
						this.errormsg = null
						localStorage.setItem('permissions', tmpUser)
						this.$router.push('/dashboard')
					} else {
						this.errored = true
						this.errormsg = this.$t("message.error_no_permissions")
					}
				})
				.catch(e => {
					this.errored = true
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				})
		}
	}
}
</script>