<template>
	<div id="edit-ldap-modal">
		<button 
			v-b-modal="idmodal"
			:title="$t('authentication.editldap')"
			class="btn btn-ghost-dark"
			@click="loadData(id)"
		>
			<font-awesome-icon 
				:icon="['fas', 'pencil']"
			/>
		</button>

		<b-modal 
			:id="idmodal"
			:title="$t('authentication.editldap')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #modal-header="{ close }">
				<h5 class="modal-title">
					{{ $t('authentication.editldap') }}
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
			<b-form
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
							<b-form-select
								id="PROTOCOL_VERSION"
								v-model="row.config.PROTOCOL_VERSION" 
								:options="options" 
								class="mb-3 form-select"
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
							{{ $t('generic.save') }}
						</b-button>
					</b-col>
					<b-col align-self="end" />
				</b-row>
			</b-form>
		</b-modal>
	</div>
</template>

<script>
import Axios from 'axios'
//import i18n from '@/i18n'

export default {
	name: 'EditLdapModal',
	props: {
		id: { type: Number, default: null }
	},
	data() {
		return {
			row: {
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
			loading: true,
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			idmodal: 'edit-ldap.'+this.id,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			options: [
				{ value: 2, text: "v2" },
				{ value: 3, text: "v3" }
			]
		}
	},
	methods: {
		loadData(id) {
			this.getLdapConfig(id)
		},
		getLdapConfig(id) {
			Axios.get(process.env.VUE_APP_API_ROUTE+"auth_config/"+id, { headers: this.header })
				.then(response => {
					this.row = response.data
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		// Submit edit ldap config and call refresh datatable to reload
		onSubmit(event) {
			event.preventDefault()

			delete this.row.mappings
			
			Axios.patch(process.env.VUE_APP_API_ROUTE+"auth_config/"+this.row.id+"/", this.row, { headers: this.header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('edit-ldap.'+this.row.id)
					this.$emit('reloadDatatable')
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('edit-ldap.'+this.row.id)
				})
		},
	}
}
</script>
