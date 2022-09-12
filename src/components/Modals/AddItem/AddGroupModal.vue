<template>
	<div id="add-group-modal">
		<!-- Display success box message -->
		<section v-if="successed">
			<Alert 
				:message="$t('success_saved')" 
				variant="success"
			/>
		</section>

		<!-- Display error box message -->
		<section v-if="errored">
			<Alert 
				:message="errorMsg" 
				variant="danger"
			/>
		</section>

		<!-- Display info if no error -->
		<section v-else>
			<div v-if="loading">
				<Loader />
			</div>

			<!-- Header page -->
			<div v-else>
				<div class="page-header d-print-none text-white">
					<div class="row align-items-center">
						<div class="col">
							<div class="page-pretitle">
								<Breadcrumb />
							</div>
							<h2 class="page-title">
								{{ $t(pageTitle) }}
							</h2>
						</div>
						<div class="col-auto ms-auto">
							<!-- Button to add group -->
							<b-button
								v-if="canadd"
								v-b-modal.add-group
								:title="$t('addgroup')"
								variant="primary"
								class="d-none d-sm-inline-block"
							>
								<font-awesome-icon 
									:icon="['fas', 'plus']"
								/>
								{{ $t('addgroup') }}
							</b-button>

							<!-- Modal to add group -->
							<b-modal 
								id="add-group" 
								:title="$t('addgroup')"
								size="xl"
								hide-footer
								modal-class="custom-modal modal-blur"
							>
								<template #modal-header="{ close }">
									<h5 class="modal-title">
										{{ $t('addgroup') }}
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
												/>
											</b-form-group>
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
										<b-col align-self="start" />
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
										<b-col align-self="end" />
									</b-row>
								</b-form>
							</b-modal>
						</div>
					</div>
				</div>
				<!-- Display datatable -->
				<div class="page-body">
					<div class="card">
						<div class="card-body">
							<Datatable
								id="groups-datatable"
								:rowdata="rowdata"
								:canedit="canedit"
								:candelete="candelete"
								editcomponent="EditGroupModal"
								title="groups"
								@reloadDatatable="reloadDatatable"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
import i18n from '../../../i18n'
import Loader from '@/components/Loader/Loader'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Alert from '@/components/Alert/Alert'
import Datatable from '@/components/Datatable/Datatable'

export default {
	name: 'AddGroupModal',
	components: { Loader, Breadcrumb, Alert, Datatable },
	props: {
		canadd: { type: Boolean, default: false },
		canedit: { type: Boolean, default: false },
		candelete: { type: Boolean, default: false },
		pageTitle: { type: String, default: "" }
	},
	data() {
		return {
			row: {
				name: null,
				permissions: []
			},
			rowdata: [],
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
		// Get all permissions
		getPermissions() {
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
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
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
			Axios.get(process.env.VUE_APP_API_ROUTE+"groups/", { headers: header })
				.then(response => {
					this.rowdata = response.data
					this.permissionsTreatment()
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		permissionsTreatment() {
			this.rowdata.forEach(rowDetails => {
				var tmpPermissions = []
				rowDetails.permissions.forEach(permissionsDetails => {
					tmpPermissions.push(this.permissionsLabel[permissionsDetails])
				})
				rowDetails.permissions = tmpPermissions.join('\n')
			})
		},
		// Submit group creation and call getGroups to reload datatable datas
		onSubmit(event) {
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
			event.preventDefault()
			
			Axios.post(process.env.VUE_APP_API_ROUTE+"groups/", this.row, { headers: header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('add-group')
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('add-group')
				})
				.finally(() => this.getGroups())
		},
		reloadDatatable() {
			this.getGroups()
		}
	}
}
</script>