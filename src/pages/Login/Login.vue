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
						<BCol cols="3">
							<BButton
								type="submit"
								class="auth-btn mb-3"
								variant="inverse"
								:disabled="loading"
							>
								<b-spinner
									v-if="loading"
									small
									class="me-2"
								/>
								{{ $t('generic.login') }}
							</BButton>
						</BCol>
						<BCol align="right">
							<BButton
								v-if="sso"
								:href="redirect_url"
								class="auth-btn mb-3"
								variant="inverse"
							>
								{{ $t('authentication.connect_with_sso') }}
							</BButton>
						</BCol>
					</BRow>
				</BForm>
			</div>
		</div>
	</div>
</template>

<script>
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
			langs: [
				{ value: 'fr', text: 'Français' },
				{ value: 'en', text: 'English' },
			],

			loading: false,
		}
	},

	async beforeCreate() {
		try {
			const data = await this.$api.generic.get("login/")

			this.errored = false
			this.errormsg = null
			this.sso = !!data?.SSO
			this.redirect_url = data?.redirect_url ?? null

			const token = localStorage.getItem('token_authentication')
			if (token) {
				await this.getPermissions()
			}
		} catch (e) {
			this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
		}
	},

	methods: {
		async onSubmit(event) {
			event.preventDefault()
			this.loading = true

			try {
				const loginOptions = {
					username: this.username,
					password: this.password,
				}

				const data = await this.$api.generic.post("api-auth/token", loginOptions)

				this.errored = false
				this.errormsg = null

				localStorage.setItem('token_authentication', data.token)
				localStorage.setItem('authenticated', true)
				localStorage.setItem('locale', this.$root.$i18n.locale)

				await this.getPermissions()
			} catch (e) {
				this.errored = true

				if (e?.response?.data?.non_field_errors?.length) {
					this.errormsg = e.response.data.non_field_errors[0]
				} else {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				}
			} finally {
				this.loading = false
			}
		},

		async getPermissions() {
			try {
				const account = await this.$api.generic.get("myaccount/")

				const perms = account?.full_permissions || []
				if (perms.length) {
					this.errored = false
					this.errormsg = null
					localStorage.setItem('permissions', perms)
					this.$router.push('/dashboard')
				} else {
					this.errored = true
					this.errormsg = this.$t("message.error_no_permissions")
				}
			} catch (e) {
				this.errored = true
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
			}
		},
	},
}
</script>