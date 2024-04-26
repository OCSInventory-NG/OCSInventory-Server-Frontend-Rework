<template>
	<div id="ldap">
		<!-- Display success box message -->
		<div v-if="successed">
			<Alert 
				:message="$t('message.success_saved')" 
				variant="success"
			/>
		</div>

		<!-- Display error box message -->
		<div v-if="errored">
			<Alert 
				:message="errormsg.message" 
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
						@reloadDatatable="reloadDatatable"
					/>
				</div>
			</div>
			<div>
				<Draggable 
					v-if="!loading"
					:rowdata="rowdata"
					:rowheader="rowheader"
					:canedit="canedit"
					:candelete="candelete"
					:canaddmapping="canaddmapping"
					editcomponent="LdapModal"
					translationkey=""
					apiroute="auth_config"
					@reloadDatatable="reloadDatatable"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import axios from 'axios'

export default {
	name: "Ldap",
	data() {
		return {
			errormsg: null,
			loading: true,
			errored: false,
			canview: false,
			canedit: false,
			canadd: false,
			candelete: false,
			canaddmapping: false,
			successed: false,
			succesMsg: null,
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
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	mounted() {
		if(localStorage.getItem('permissions').split(",").includes("view_authconfig")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("change_authconfig")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("add_authconfig")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_authconfig")) {
				this.candelete = true
			}
			if(localStorage.getItem('permissions').split(",").includes("add_authmapping")) {
				this.canaddmapping = true
			}
			this.getLdapConfiguration()
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
		}
	},
	methods: {
		getLdapConfiguration() {
			axios.get(import.meta.env.VITE_APP_API_ROUTE+"auth_method?name=LDAP", { headers: this.header })
				.then(response => {
					this.ldapdata = response.data
					this.errormsg = null
					this.errored = false
					if(this.ldapdata[0].priority == 1) {
						this.priority = true
					}
					this.authid = this.ldapdata[0].id
					this.getLdapConfig()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		setPriority(authid, state) {
			if(state == true) {
				state = 1
			} else {
				state = 2
			}

			var rowupdate = {
				priority: state
			}

			axios.patch(import.meta.env.VITE_APP_API_ROUTE+"auth_method/"+authid+"/", rowupdate, { headers: this.header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e
					this.errored = true
					this.succesMsg = null
					this.successed = false
				})
		},
		reloadDatatable() {
			this.loading = true
			this.rowdata = []
			this.getLdapConfig()
		},
		getLdapConfig() {
			axios.get(import.meta.env.VITE_APP_API_ROUTE+"auth_config?auth_method="+this.authid, { headers: this.header })
				.then(response => {
					var tmpLdap = response.data

					tmpLdap.forEach(element => {
						this.rowdata.push({
							id: element.id,
							priority: element.priority,
							enabled: element.enabled,
							SERVER_URI: element.config.SERVER_URI,
							BIND_DN: element.config.BIND_DN,
							BIND_PASSWORD: element.config.BIND_PASSWORD,
							BASE_DN: element.config.BASE_DN,
							USER_LOGIN_FIELD: element.config.USER_LOGIN_FIELD,
							MIRROR_GROUPS: element.config.MIRROR_GROUPS,
							PROTOCOL_VERSION: element.config.PROTOCOL_VERSION
						})
					});
					
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		}
	}
}
</script>