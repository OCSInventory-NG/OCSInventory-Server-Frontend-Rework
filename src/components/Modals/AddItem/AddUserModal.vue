<template>
	<div id="AddUserModal">
		<section v-if="successed">
			<b-alert 
				:show="!!succesMsg" 
				class="alert-sm" 
				variant="success"
			>
				{{ $t('success_saved') }}
			</b-alert>
		</section>

		<section v-if="errored">
			<b-alert 
				:show="!!errorMsg" 
				class="alert-sm" 
				variant="danger"
			>
				{{ errorMsg }}
			</b-alert>
		</section>

		<section v-else>
			<div v-if="loading">
				<Loader/>
			</div>

			<div
				v-else
			>
				<div
					v-if="canadd"
				>
					<b-button 
						v-b-modal.add-user
						:title="$t('adduser')"
						variant="success"
						class="add-button"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"/>
					</b-button>

					<b-modal 
						id="add-user" 
						:title="$t('adduser')"
						hide-footer
						modal-class="custom-modal"
					>
						<b-form
							@submit="onSubmit"
						>
							<b-row>
								<b-col>
									<h4>{{ $t('user_informations') }}</h4>
								</b-col>
							</b-row>
							<b-row>
								<b-col>
									<b-form-group
										:label="$t('username')" 
										label-for="username"
									>
										<b-form-input
											id="username"
											v-model="row.username"
											required
										/>
									</b-form-group>
								</b-col>
								<b-col>
									<b-form-group
										:label="$t('password')" 
										label-for="password"
									>
										<b-form-input
											id="password"
											v-model="row.password"
											type="password"
											required
										/>
									</b-form-group>
								</b-col>
							</b-row>
							<b-row>
								<b-col>
									<b-form-group
										:label="$t('email')" 
										label-for="email"
									>
										<b-form-input
											id="email"
											v-model="row.email"
											required
										/>
									</b-form-group>
								</b-col>
							</b-row>
							<b-row>
								<b-col>
									<b-form-group 
										:label="$t('first_name')" 
										label-for="first_name"
									>
										<b-form-input
											id="first_name"
											v-model="row.first_name"
											required
										/>
									</b-form-group>
								</b-col>
								<b-col>
									<b-form-group
										:label="$t('last_name')" 
										label-for="last_name"
									>
										<b-form-input
											id="last_name"
											v-model="row.last_name"
											required
										/>
									</b-form-group>
								</b-col>
							</b-row>
							<b-row>
								<b-col>
									<b-form-checkbox
										id="is_staff"
										v-model="row.is_staff"
										name="is_staff"
										value="true"
										unchecked-value="false"
									>
										{{ $t('is_staff') }}
									</b-form-checkbox>
								</b-col>
							</b-row>
							<b-row>
								<b-col>
									<h4>{{ $t('groups') }}</h4>
								</b-col>
							</b-row>
							<b-row>
								<b-col
									v-for="group in groups"
									:key="group.id"
									cols="4"
								>
									<b-form-checkbox
										:id="group.code"
										v-model="row.groups"
										:name="group.code"
										:value="group.id"
										unchecked
									>
										{{ group.name }}
									</b-form-checkbox>
								</b-col>
							</b-row>
							<b-row>
								<b-col>
									<h4>{{ $t('user_permissions') }}</h4>
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
										v-model="row.user_permissions"
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
										{{ $t('add') }}
									</b-button>
								</b-col>
								<b-col align-self="end"/>
							</b-row>
						</b-form>
					</b-modal>
				</div>
				
				<Datatable
					id="usersdatatable"
					:rowdata="rowdata"
					:canedit="canedit"
					:candelete="candelete"
					editcomponent="EditUserModal"
					title="users"
					@reloadDatatable="reloadDatatable"
				/>
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
import i18n from '../../../i18n'
import Loader from '@/components/Loader/Loader'
import Datatable from '@/components/Datatable/Datatable'

const header = {
	"Content-Type": "application/json;charset=utf-8",
	"Authorization": 'Token ' + localStorage.getItem('token_authentication')
}

export default {
	name: 'AddUserModal',
	components: {
		Datatable,
		Loader
	},
	props: {
		canadd: { type: Boolean, default: false },
		canedit: { type: Boolean, default: false },
		candelete: { type: Boolean, default: false }
	},
	data() {
		return {
			row: {
				username: null,
				password: null,
				email: null,
				first_name: null,
				last_name: null,
				is_staff: false,
				groups: [],
				user_permissions: []
			},
			rowdata: [],
			groups: [],
			groupsLabel: [],
			permissions: [],
			permissionsLabel: [],
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			loading: true,
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 10000)
		}
	},
	mounted() {
		this.getPermissions()
	},
	methods: {
		// Get all users
		getUsers() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"users/", { headers: header })
				.then(response => {
					this.rowdata = response.data
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
				.finally(() => {
					this.permissionsGroupsTreatment()
					this.loading = false
				})
		},
		permissionsGroupsTreatment() {
			this.rowdata.forEach(rowDetails => {
				var tmpPermissions = []
				var tmpGroups = []
				rowDetails.user_permissions.forEach(permissionsDetails => {
					tmpPermissions.push(this.permissionsLabel[permissionsDetails])
				})
				rowDetails.user_permissions = tmpPermissions.join('\n')
				rowDetails.groups.forEach(groupsDetails => {
					tmpGroups.push(this.groupsLabel[groupsDetails])
				})
				rowDetails.groups = tmpGroups.join('\n')
			})
		},
		// Get all permissions
		getPermissions() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"permissions", { headers: header })
				.then(response => {
					response.data.forEach(permissionDetails => {
						this.permissions.push({
							id: permissionDetails.id,
							code: "permission_"+permissionDetails.id,
							name: i18n.t(permissionDetails.codename)
						})
						this.permissionsLabel[permissionDetails.id] = i18n.t(permissionDetails.codename)
					})
				})
				.finally(() => this.getGroups())
		},
		// Get groups
		getGroups() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"groups/", { headers: header })
				.then(response => {
					response.data.forEach(groupDetails => {
						this.groups.push({
							id: groupDetails.id,
							code: "group_"+groupDetails.id,
							name: groupDetails.name
						})
						this.groupsLabel[groupDetails.id] = groupDetails.name
					})
				})
				.finally(() => this.getUsers())
		},
		onSubmit(event) {
			event.preventDefault()
			Axios.post(process.env.VUE_APP_API_ROUTE+"users/", this.row, { headers: header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
					this.succesMsg = null
					this.successed = false
				})
				.finally(() => this.getUsers())
		},
		reloadDatatable() {
			this.getUsers()
		}
	}
}
</script>
