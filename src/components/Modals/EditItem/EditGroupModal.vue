<template>
	<div id="EditGroupModal">
		<b-button 
			v-b-modal="idModal"
			:title="$t('editgroup')"
			variant="primary"
		>
			<b-icon 
				icon="pencil-square" 
				aria-hidden="true"
			/>
		</b-button >

		<b-modal 
			:id="idModal" 
			:title="$t('editgroup')"
			hide-footer
			modal-class="custom-modal"
		>
			<b-form
				@submit="onSubmit"
			>
				<b-row>
					<b-col>
						<h4>{{ $t('group_informations') }}</h4>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('name')" 
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
						<h4>{{ $t('permissions') }}</h4>
					</b-col>
				</b-row>
				<b-row>
					<b-col
						v-for="permission in permissions"
						:key="permission.id"
						cols="4"
					>
						<b-form-checkbox
							:id="permission.code"
							v-model="row.permissions"
							:name="permission.code"
							:value="permission.id"
							unchecked
						>
							{{ permission.name }}
						</b-form-checkbox>
					</b-col>
				</b-row>
				<b-row>
					<b-col align-self="start"/>
					<b-col 
						align-self="center"
						align="center"
					>
						<b-button 
							type="submit"
							variant="success"
						>
							{{ $t('save') }}
						</b-button>
					</b-col>
					<b-col align-self="end"/>
				</b-row>
			</b-form>
		</b-modal>
	</div>
</template>

<script>
import Axios from 'axios'
import i18n from '../../../i18n'

const header = {
	"Content-Type": "application/json;charset=utf-8",
	"Authorization": 'Token ' + localStorage.getItem('token_authentication')
}

export default {
	name: 'EditGroupModal',
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
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			idModal: 'edit-group'+this.id
		}
	},
	mounted() {
		this.getPermissions()
		this.getGroup()		
	},
	methods: {
		// Get all permissions
		getPermissions() {
			Axios.get("http://172.18.26.12:8000/permissions", { headers: header })
				.then(response => {
					response.data.forEach(permissionDetails => {
						this.permissions.push({
							id: permissionDetails.id,
							code: "permission_"+this.id+"_"+permissionDetails.id,
							name: i18n.t(permissionDetails.codename)
						})
					})
				})
		},
		// Get groups
		getGroup() {
			Axios.get("http://172.18.26.12:8000/groups/"+this.id+"/", { headers: header })
				.then(response => {
					this.row = response.data
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
		},
		// Submit group creation and call getGroups to reload datatable datas
		onSubmit(event) {
			event.preventDefault()
			Axios.put("http://172.18.26.12:8000/groups/"+this.row.id+"/", this.row, { headers: header })
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
