<template>
	<div id="ldap-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('authentication.addldap')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="loadData()"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('authentication.addldap') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('authentication.editldap')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="ldapmodal" 
			v-model="ldapmodal"
			:title="(!update) ? $t('authentication.addldap') : $t('authentication.editldap')"
			hide-footer
			modal-class="custom-modal"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('authentication.addldap') : $t('authentication.editldap') }}
					<b-spinner 
						v-if="loadingcreate"
						variant="success"
					/>
					<font-awesome-icon 
						v-if="createwithsuccess"
						:icon="['fas', 'check']"
						color="green"
					/>
					<font-awesome-icon 
						v-if="createerror"
						:icon="['fas', 'xmark']"
						color="red"
					/>
				</h5>
				<b-button 
					size="sm" 
					variant="outline-danger" 
					@click="close()"
				>
					<font-awesome-icon 
						:icon="['fas', 'xmark']"
						size="1x"
					/>
				</b-button>
			</template>
			<Alert 
				v-if="createerror || errored"
				:message="(createerror) ? createerrormsg : errormsg" 
				variant="danger"
			/>
			<b-form
				v-if="!loading"
				@submit="onSubmit"
			>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('generic.name')"
							label-for="name"
						>
							<b-form-input
								id="name"
								v-model="row.name"
								required
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('generic.description')"
							label-for="description"
						>
							<b-form-input
								id="description"
								v-model="row.description"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							label="SERVER_URI" 
							label-for="SERVER_URI"
						>
							<b-form-input
								id="SERVER_URI"
								v-model="row.config.SERVER_URI"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							label="BIND_DN" 
							label-for="BIND_DN"
						>
							<b-form-input
								id="BIND_DN"
								v-model="row.config.BIND_DN"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							label="BIND_PASSWORD" 
							label-for="BIND_PASSWORD"
						>
							<b-form-input
								id="BIND_PASSWORD"
								v-model="row.config.BIND_PASSWORD"
								type="password"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							label="BASE_DN" 
							label-for="BASE_DN"
						>
							<b-form-input
								id="BASE_DN"
								v-model="row.config.BASE_DN"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							label="USER_LOGIN_FIELD" 
							label-for="USER_LOGIN_FIELD"
						>
							<b-form-input
								id="USER_LOGIN_FIELD"
								v-model="row.config.USER_LOGIN_FIELD"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							label="PROTOCOL_VERSION" 
							label-for="PROTOCOL_VERSION"
						>
							<v-select
								id="PROTOCOL_VERSION"
								v-model="row.config.PROTOCOL_VERSION" 
								:options="options" 
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-checkbox
							id="enabled"
							v-model="row.enabled"
							name="enabled"
							:value="true"
							unchecked
							inline
						>
							{{ $t('authentication.enabled') }}
						</b-form-checkbox>
					</b-col>
				</b-row>
				<b-row>
					<b-col align-self="start" />
					<b-col 
						align-self="center"
						align="center"
					>
						<b-button 
							type="submit"
							variant="success"
						>
							{{ (!update) ? $t('generic.add') : $t('generic.save') }}
						</b-button>
					</b-col>
					<b-col align-self="end" />
				</b-row>
			</b-form>
			<div 
				v-if="loading"
				class="ocs-loader"
			>
				<Loader />
			</div>
		</b-modal>
	</div>
</template>

<script>
export default {
	name: "LdapModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: Number, default: null },
		authid: { type: Number, default: 2 }
	},
	data() {
		return {
			errormsg: null,
			errored: false,
			createerror: false,
			createerrormsg: null,

			createwithsuccess: false,

			row: {
				auth_method: this.authid,
				name: null,
				description: null,
				enabled: true,
				priority: 1,
				mappings: [],
				config: {
					SERVER_URI: null,
					BIND_DN: null,
					BIND_PASSWORD: null,
					BASE_DN: null,
					USER_LOGIN_FIELD: null,
					MIRROR_GROUPS: false,
					PROTOCOL_VERSION: 3
				}
			},
			ldapmodal: false,
			options: [
				{ value: 2, text: "v2" },
				{ value: 3, text: "v3" }
			],
			
			loading: true,
			loadingcreate: false,
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.ldapmodal = false
				this.createwithsuccess = false
				this.row = {
					auth_method: this.authid,
					name: null,
					description: null,
					enabled: true,
					priority: 1,
					mappings: [],
					config: {
						SERVER_URI: null,
						BIND_DN: null,
						BIND_PASSWORD: null,
						BASE_DN: null,
						USER_LOGIN_FIELD: null,
						MIRROR_GROUPS: false,
						PROTOCOL_VERSION: 3
					}
				}
				this.$emit("reloadDatatable")
			}, 500)
		}
	},
	mounted() {
		if(!this.update) {
			this.loading = false
		}
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		loadData(id) {
			this.ldapmodal = true
			this.row = {
				auth_method: this.authid,
				name: null,
				description: null,
				enabled: true,
				priority: 1,
				mappings: [],
				config: {
					SERVER_URI: null,
					BIND_DN: null,
					BIND_PASSWORD: null,
					BASE_DN: null,
					USER_LOGIN_FIELD: null,
					MIRROR_GROUPS: false,
					PROTOCOL_VERSION: 3,
				},
			}

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			if (id) {
				this.loading = true
				this.getLdapConfig(id)
			}
		},

		async getLdapConfig(id) {
			try {
				const data = await this.$api.generic.get(`auth_config/${id}/`)
				this.row = data
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true
			this.createwithsuccess = false
			this.createerror = false
			this.createerrormsg = null

			try {
				if (!this.update) {
					await this.$api.generic.post("auth_config/", this.row)
				} else {
					const { mappings: _mappings, ...payload } = this.row
					await this.$api.generic.patch(`auth_config/${this.row.id}/`, payload)
				}

				this.createwithsuccess = true
			} catch (e) {
				this.createwithsuccess = false
				this.createerror = true
				this.createerrormsg = this._apiError(e)
			} finally {
				this.loadingcreate = false
			}
		},
	}
}
</script>