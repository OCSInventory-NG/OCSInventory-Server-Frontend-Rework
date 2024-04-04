<template>
	<div id="edit-group-modal">
		<button 
			:title="$t('group.editgroup')"
			class="btn btn-ghost-dark"
			@click="loadData(id)"
		>
			<font-awesome-icon 
				:icon="['fas', 'pencil']"
			/>
		</button>

		<b-modal 
			:id="idModal" 
			v-model="editgroup"
			:title="$t('group.editgroup')"
			hide-footer
			modal-class="custom-modal modal-blur"
			size="xl"
			scrollable
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('group.editgroup') }}
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
			<b-form
				v-if="!loading"
				@submit="onSubmit"
			>
				<Alert 
					v-if="createerror"
					:message="createerrormsg" 
					variant="danger"
				/>
				<b-row>
					<b-col>
						<h4>{{ $t('group.group_informations') }}</h4>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('user.name')" 
							label-for="name"
						>
							<b-form-input
								id="name"
								v-model="row.name"
								required
							>
								{{ row.name }}
							</b-form-input>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<h4>{{ $t('group.permissions') }}</h4>
					</b-col>
				</b-row>
				<b-row>
					<Matrix 
						v-model="row.permissions"
						:rowtab="permissions"
						:rowlabel="permissionslabel"
						:rowpermissions="row.permissions"
						@permissions="row.permissions = $event"
					/>
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
import Axios from 'axios'
import Matrix from '@/components/Matrix/Matrix.vue'

export default {
	name: 'EditGroupModal',
	components: { Matrix },
	props: {
		id: { type: Number, default: null }
	},
	data() {
		return {
			row: {
				name: null,
				permissions: []
			},
			permissions: [],
			permissionslabel: [],
			errorMsg: null,
			errored: false,
			idModal: 'edit-group'+this.id,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			editgroup: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.editgroup = false
				this.createwithsuccess = false
				this.$emit('reloadDatatable')
			}, 500)
		}
	},
	methods: {
		loadData(id) {
			this.loading = true
			this.editgroup = true
			this.getPermissions(id)
		},
		// Get all permissions
		getPermissions(id) {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"permissions", { headers: this.header })
				.then(response => {
					var array = ["add_", "change_", "delete_", "view_"]
					var labeltmp = new Set()

					this.permissionslabel = []
					this.permissions = []

					response.data.forEach(permissionDetails => {
						array.forEach(type => {
							if(~permissionDetails.codename.indexOf(type)) {
								var permissionKey = permissionDetails.codename.replace(type, "")

								if(i18n.te("permission." + permissionKey)) {
									var key = permissionKey + "_" + permissionDetails.content_type

									if(typeof this.permissions[key] === 'undefined') {
										this.permissions[key] = [{
											id: permissionDetails.id,
											code: "permission_" + permissionDetails.id,
											name: permissionDetails.codename,
											key: permissionKey,
											type: type.replace("_", "")
										}]
									} else {
										this.permissions[key].push({
											id: permissionDetails.id,
											code: "permission_" + permissionDetails.id,
											name: permissionDetails.codename,
											key: permissionKey,
											type: type.replace("_", "")
										})
									}


									labeltmp.add(key)
								}
							}
						})
					})
					labeltmp.forEach(label => {
						this.permissionslabel.push({
							id: label,
							trad: i18n.t('permission.'+label.split("_")[0])
						})
					})

					this.permissionslabel.sort((a,b) => (a.trad > b.trad) ? 1 : ((b.trad > a.trad) ? -1 : 0))

					this.getGroup(id)
				})
		},
		// Get groups
		getGroup(id) {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"groups/"+id+"/", { headers: this.header })
				.then(response => {
					this.row = response.data
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		// Submit group creation and call getGroups to reload datatable datas
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			Axios.patch(import.meta.env.VITE_APP_API_ROUTE+"groups/"+this.row.id+"/", this.row, { headers: this.header })
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
</script>