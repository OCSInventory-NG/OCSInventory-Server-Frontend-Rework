<template>
	<div
		id="authentication" 
		class="container-xl"
	>
		<PageHeader page-title="authentication" />

		<div class="page-body">
			<div class="card">
				<div class="card-body">
					<section v-if="successed">
						<Alert 
							:message="$t('message.success_saved')"
							:cols="true"
							variant="success"
						/>
					</section>

					<section v-if="errored && errorcode == null">
						<Alert 
							:message="errormsg.message"
							:cols="true"
							variant="danger"
						/>
					</section>

					<section v-else>
						<div v-if="loading">
							<Loader />
						</div>

						<div v-else>
							<div v-if="errored && errorcode != null">
								<Alert 
									:message="errormsg"
									:cols="true"
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
															:disabled="!canedit || isSSOActive(authmethod)"
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
										<Ldap :viewOnly="viewOnly" />
									</div>
									<!-- OIDC -->
									<div v-if="authmenu.value == 'OIDC'">
										<Oidc />
									</div>
									<!-- CAS -->
									<div v-if="authmenu.value == 'CAS'">
										<Cas />
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
export default {
	name: 'Authentication',
	data() {
		return {
			errored: false,
			errormsg: null,
			errorcode: null,

			successed: false,
			successmsg: null,

			canview: false,
			canedit: false,

			authmethods: [],
			authmenus: [
				{ value: "global", text: this.$t("authentication.global"), enabled: true },
				{ value: "LDAP", text: this.$t("authentication.LDAP"), enabled: false },
				{ value: "OIDC", text: this.$t("authentication.OIDC"), enabled: false },
				{ value: "CAS", text: this.$t("authentication.CAS"), enabled: false },
			],

			loading: true,
		}
	},
	computed: {
	viewOnly() {
		const perms = localStorage.getItem("permissions")?.split(",") || []
		return !perms.includes("auth_method_change_authmethod")
		}
	},
	watch: {
		successed: function() {
			setTimeout(
				() => this.successed = false, 5000
			)
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (permissions.includes("auth_method_view_authmethod")) {
			this.canview = true
			if (permissions.includes("auth_method_change_authmethod")) {
				this.canedit = true
			}
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
			return
		}

		// Data init
		await this.getAuthMethod()
	},
	methods: {
		async getAuthMethod() {
			try {
				const data = await this.$api.generic.get("auth_method/")

				this.authmethods = Array.isArray(data) ? data : (data?.results || [])

				const enabledByName = new Map(
					this.authmethods.map((m) => [m?.name, !!m?.enabled])
				)

				this.authmenus = this.authmenus.map((menu) => ({
					...menu,
					enabled: enabledByName.has(menu.value)
						? enabledByName.get(menu.value)
						: menu.enabled,
				}))

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async enableAuthentication(authid, authname, state) {
			const prevMenus = this.authmenus.map(m => ({ ...m }))
			const prevMethods = (this.authmethods || []).map(m => ({ ...m }))

			this.authmenus = this.authmenus.map((m) =>
				m.value === authname ? { ...m, enabled: state } : m
			)

			try {
				await this.$api.generic.patch(`auth_method/${authid}/`, { enabled: state })

				this.authmethods = (this.authmethods || []).map((m) =>
					m.id === authid ? { ...m, enabled: state } : m
				)

				this.successmsg = "success"
				this.successed = true
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errorcode = e?.response?.status
				const apiMsg =
					e?.response?.data?.error ??
					(Array.isArray(e?.response?.data) ? e.response.data[0] : null) ??
					e?.message ??
					String(e)

				this.errormsg = apiMsg

				this.authmenus = prevMenus
				this.authmethods = prevMethods

				this.errored = true
				this.successmsg = null
				this.successed = false
			}
		},
		isSSOActive(authmethod) {
			const ssoMethods = ["OIDC", "CAS"]

			if (!ssoMethods.includes(authmethod.name)) {
				return false
			}

			return this.authmethods.some(
				m => m.name !== authmethod.name &&
				ssoMethods.includes(m.name) &&
				m.enabled
			)
		}
	}
}
</script>