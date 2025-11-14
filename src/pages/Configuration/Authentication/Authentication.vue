<template>
	<div
		id="authentication" 
		class="container-xl"
	>
		<!-- Page header -->
		<PageHeader 
			page-title="authentication"
		/>
		<!-- Display Datatable -->
		<div class="page-body">
			<div class="card">
				<div class="card-body">
					<!-- Display success box message -->
					<section v-if="successed">
						<Alert 
							:message="$t('message.success_saved')" 
							variant="success"
						/>
					</section>

					<!-- Display error box message -->
					<section v-if="errored && errorCode == null">
						<Alert 
							:message="errormsg.message" 
							variant="danger"
						/>
					</section>

					<section v-else>
						<div v-if="loading">
							<Loader />
						</div>

						<div v-else>
							<!-- Display error box message -->
							<div v-if="errored && errorCode != null">
								<Alert 
									:message="errormsg" 
									variant="danger"
								/>
							</div>

							<b-tabs 
								content-class="mt-3"
								fill
							>
								<b-tab
									v-for="authmenu in authmenus"
									:key="authmenu.value"
									:title="authmenu.text"
									:disabled="!authmenu.enabled"
								>
									<div v-if="authmenu.value == 'global'">
										<b-list-group 
											v-for="authmethod in authmethods"
											:key="authmethod.name"
											flush
										>
											<b-list-group-item 
												class="d-flex justify-content-between align-items-center"
											>
												<div>
													<h4 class="mb-1">
														{{ $t("authentication."+authmethod.name) }}
													</h4>
													<p class="mb-1">
														{{ $t("authentication.enable_"+authmethod.name) }}
													</p>
												</div>
												<div>
													<label class="form-check form-switch">
														<input 
															v-model="authmethod.enabled"
															class="form-check-input"
															type="checkbox"
															:disabled="!canedit"
															@change="enableAuthentication(
																authmethod.id, authmethod.name, authmethod.enabled
															)"
														>
													</label>
												</div>
											</b-list-group-item>
										</b-list-group>
									</div>
									<!-- LDAP -->
									<div v-if="authmenu.value == 'LDAP'">
										<Ldap />
									</div>
									<!-- OIDC -->
									<div v-if="authmenu.value == 'OIDC'">
										<Cas />
									</div>
									<!-- CAS -->
									<div v-if="authmenu.value == 'CAS'">
										<Oidc />
									</div>
								</b-tab>
							</b-tabs>
						</div>
					</section>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import axios from 'axios'

export default {
	name: 'Authentication',
	data() {
		return {
			errormsg: null,
			errorCode: null,
			loading: true,
			errored: false,
			canview: false,
			canedit: false,
			successed: false,
			successmsg: null,
			authmethods: [],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			authmenus: [
				{ value: "global", text: this.$t("authentication.global"), enabled: true },
				{ value: "LDAP", text: this.$t("authentication.LDAP"), enabled: false },
				{ value: "OIDC", text: this.$t("authentication.OIDC"), enabled: false },
				{ value: "CAS", text: this.$t("authentication.CAS"), enabled: false },
			]
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 5000)
		}
	},
	async mounted() {
		if(localStorage.getItem('permissions').split(",").includes("auth_method_view_authmethod")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("auth_method_change_authmethod")) {
				this.canedit = true
			}
			await this.getAuthMethod()
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	},
	methods: {
		async getAuthMethod() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"auth_method/", { headers: this.header })
				.then(response => {
					this.authmethods = response.data
					this.authmethods.forEach(authmethod => {
						this.authmenus.forEach(authmenu => {
							if(authmethod.name == authmenu.value) {
								authmenu.enabled = authmethod.enabled
							}
						})
					})
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response.data.error) ? e.response.data.error : e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		enableAuthentication(authid, authname, state) {
			this.authmenus.forEach(authmenu => {
				if(authmenu.value == authname) {
					authmenu.enabled = state
				}
			})

			var rowupdate = {
				enabled: state
			}

			axios.patch(this.$config.BACKEND_API_ROUTE+"auth_method/"+authid+"/", rowupdate, { headers: this.header })
				.then(() => {
					this.successmsg = "success"
					this.successed = true
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					if(e.response.data) {
						this.errorCode = e.response.status
						this.errormsg = e.response.data[0]
					} else {
						this.errormsg = e
					}

					this.authmethods.forEach(authmethod => {
						this.authmenus.forEach(authmenu => {
							if(authmethod.name == authmenu.value && authmethod.id == authid) {
								authmenu.enabled = false
								authmethod.enabled = false
							}
						})
					})
					
					this.errored = true
					this.successmsg = null
					this.successed = false
				})
		}
	}
}
</script>