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
						@click="ldapmodal = !ldapmodal"
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
			modal-class="custom-modal modal-blur"
			scrollable
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
import axios from 'axios'

export default {
	name: "LdapModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: Number, default: null },
		authid: { type: Number, default: 2 }
	},
	data() {
		return {
			row: {
				auth_method: this.authid,
				enabled: true,
				priority: 1,
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
			errormsg: null,
			errored: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			ldapmodal: false,
			options: [
				{ value: 2, text: "v2" },
				{ value: 3, text: "v3" }
			],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.ldapmodal = false
				this.createwithsuccess = false
				this.row = {
					auth_method: this.authid,
					enabled: true,
					priority: 1,
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
		loadData(id) {
			this.loading = true
			this.ldapmodal = true
			this.getLdapConfig(id)
		},
		async getLdapConfig(id) {
			await axios.get(this.$config.BACKEND_API_ROUTE+"auth_config/"+id+"/", { headers: this.header })
				.then(response => {
					this.row = response.data
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true
			
			if(!this.update) {
				axios.post(this.$config.BACKEND_API_ROUTE+"auth_config/", this.row, { headers: this.header })
					.then(() => {
						this.createwithsuccess = true
						this.createerror = false
						this.createerrormsg = null
					})
					.catch(e => {
						this.createwithsuccess = false
						this.createerror = true
						this.createerrormsg = e.message
					})
					.finally(() => this.loadingcreate = false)
			} else {
				delete this.row.mappings
			
				axios.patch(this.$config.BACKEND_API_ROUTE+"auth_config/"+this.row.id+"/", this.row,
					{ headers: this.header })
					.then(() => {
						this.createwithsuccess = true
						this.createerrormsg = null
						this.createerror = false
					})
					.catch(e => {
						this.createerrormsg = e.message
						this.createerror = true
						this.createwithsuccess = false
					})
					.finally(() => this.loadingcreate = false)
			}			
		}
	}
}
</script>