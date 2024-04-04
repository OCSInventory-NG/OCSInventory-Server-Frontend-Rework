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
			:title="$t('group.editgroup')"
			hide-footer
			modal-class="custom-modal modal-blur"
			size="xl"
		>
			<template #modal-header="{ close }">
				<h5 class="modal-title">
					{{ $t('group.editgroup') }}
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
		</b-modal>
	</div>
</template>

<script>
import Axios from 'axios'
import i18n from '../../../i18n'
import Matrix from '@/components/Matrix/Matrix'

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
			succesMsg: null,
			errored: false,
			successed: false,
			idModal: 'edit-group'+this.id,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	methods: {
		loadData(id) {
			this.getPermissions(id)
		},
		// Get all permissions
		getPermissions(id) {
			Axios.get(process.env.VUE_APP_API_ROUTE+"permissions", { headers: this.header })
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
			Axios.get(process.env.VUE_APP_API_ROUTE+"groups/"+id+"/", { headers: this.header })
				.then(response => {
					this.row = response.data
					this.errorMsg = null
					this.errored = false
					this.$bvModal.show('edit-group'+id)
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
		},
		// Submit group creation and call getGroups to reload datatable datas
		onSubmit(event) {
			event.preventDefault()
			Axios.patch(process.env.VUE_APP_API_ROUTE+"groups/"+this.row.id+"/", this.row, { headers: this.header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('edit-group'+this.row.id)
					this.$emit('reloadDatatable')
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('edit-group'+this.row.id)
				})
		}
	}
}
</script>