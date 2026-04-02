<template>
	<div id="ldap">
		<div v-if="successed">
			<Alert 
				:message="$t('message.success_saved')"
				:cols="true"
				variant="success"
			/>
		</div>

		<div v-if="errored">
			<Alert 
				:message="errormsg.message"
				:cols="true"
				variant="danger"
			/>
		</div>

		<div 
			v-if="loading"
			class="ocs-loader"
		>
			<Loader />
		</div>
		
		<div v-else>
			<div>
				<b-list-group flush>
					<b-list-group-item 
						class="d-flex justify-content-between align-items-center"
					>
						<div>
							<h4 class="mb-1">
								{{ $t("authentication.priority") }}
							</h4>
							<p class="mb-1">
								{{ $t("authentication.ldap_priority") }}
							</p>
						</div>
						<div>
							<label class="form-check form-switch">
								<input 
									v-model="priority"
									class="form-check-input"
									type="checkbox"
									:disabled="!canedit"
									@change="setPriority(
										authid, priority
									)"
								>
							</label>
						</div>
					</b-list-group-item>
				</b-list-group>
			</div>
			<hr>
			<div class="page-header d-print-none">
				<div class="row">
					<div class="col-auto">
						<h2>{{ $t("authentication.ldap_config") }}</h2>
					</div>
					<LdapModal 
						:authid="authid"
						:view-only="viewOnly"
						@reload-datatable="reloadDatatable"
					/>
				</div>
			</div>
			<div>
				<Draggable 
					v-if="!loading"
					:rowdata="rowdata"
					:rowheader="rowheader"
					:canedit="canedit && !viewOnly"
					:candelete="candelete"
					:canaddmapping="canaddmapping"
					is-sticky
					editcomponent="LdapModal"
					translationkey=""
					apiroute="auth_config"
					@reload-datatable="reloadDatatable"
				/>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "Ldap",

	props: {
		viewOnly: { type: Boolean, default: false }
	},

	data() {
		return {
			errored: false,
			errormsg: null,

			successed: false,
			successmsg: null,

			canedit: false,
			canadd: false,
			candelete: false,
			canaddmapping: false,

			priority: false,
			ldapdata: [],
			rowdata: [],
			authid: 2,
			rowheader: [
				"id",
				"priority",
				"enabled",
				"SERVER_URI",
				"BIND_DN",
				"BIND_PASSWORD",
				"BASE_DN",
				"USER_LOGIN_FIELD",
				"MIRROR_GROUPS",
				"PROTOCOL_VERSION"
			],
			
			loading: true,
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 5000)
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (permissions.includes("auth_config_view_authconfig")) {
			if (permissions.includes("auth_config_add_authconfig")) {
				this.canadd = true
			}
			if (permissions.includes("auth_mapping_add_authmapping")) {
				this.canaddmapping = true
			}
			if (permissions.includes("auth_config_change_authconfig")) {
				this.canedit = true
			}
			if (permissions.includes("auth_config_delete_authconfig")) {
				this.candelete = true
			}
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
			this.isbusy = false
			return
		}

		// Data init
		await this.getLdapConfiguration()
	},
	methods: {
		async getLdapConfiguration() {
			try {
				const data = await this.$api.generic.get("auth_method/", { name: "LDAP" })
				const ldapMethods = Array.isArray(data) ? data : (data?.results || [])

				this.ldapdata = ldapMethods
				this.errormsg = null
				this.errored = false

				if (ldapMethods?.[0]) {
					this.priority = ldapMethods[0].priority === 1
					this.authid = ldapMethods[0].id
					await this.getLdapConfig()
				}
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			}
		},

		async setPriority(authid, state) {
			try {
				const payload = { priority: state ? 1 : 2 }

				await this.$api.generic.patch(`auth_method/${authid}/`, payload)

				this.successmsg = "success"
				this.successed = true
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = e
				this.errored = true
				this.successmsg = null
				this.successed = false
			}
		},

		async reloadDatatable() {
			this.loading = true
			this.rowdata = []
			await this.getLdapConfig()
		},

		async getLdapConfig() {
			try {
				const data = await this.$api.generic.get(
					"auth_config/",
					{},
					{ auth_method: this.authid }
				)

				const rows = Array.isArray(data) ? data : (data?.results || [])

				this.rowdata = rows.map((element) => ({
					id: element.id,
					priority: element.priority,
					enabled: element.enabled,
					SERVER_URI: element?.config?.SERVER_URI,
					BIND_DN: element?.config?.BIND_DN,
					BIND_PASSWORD: element?.config?.BIND_PASSWORD,
					BASE_DN: element?.config?.BASE_DN,
					USER_LOGIN_FIELD: element?.config?.USER_LOGIN_FIELD,
					MIRROR_GROUPS: element?.config?.MIRROR_GROUPS,
					PROTOCOL_VERSION: element?.config?.PROTOCOL_VERSION,
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
	}
}
</script>