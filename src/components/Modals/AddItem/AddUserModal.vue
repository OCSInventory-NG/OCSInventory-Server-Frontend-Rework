<template>
	<div id="add-user-modal">
		<!-- Display success box message -->
		<section v-if="successed">
			<Alert 
				:message="$t('message.success_saved')" 
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
								{{ $t('title.'+pageTitle) }}
							</h2>
						</div>
						<div class="col-auto ms-auto">
							<!-- Button to add user -->
							<b-button
								v-if="canadd"
								v-b-modal.add-user
								:title="$t('adduser')"
								variant="primary"
								class="d-none d-sm-inline-block"
							>
								<font-awesome-icon 
									:icon="['fas', 'plus']"
								/>
								{{ $t('user.adduser') }}
							</b-button>

							<!-- Modal to add user -->
							<b-modal 
								id="add-user" 
								:title="$t('user.adduser')"
								size="xl"
								hide-footer
								modal-class="custom-modal modal-blur"
							>
								<template #modal-header="{ close }">
									<h5 class="modal-title">
										{{ $t('user.adduser') }}
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
											<h4>{{ $t('user.user_informations') }}</h4>
										</b-col>
									</b-row>
									<b-row>
										<b-col>
											<b-form-group
												:label="$t('user.username')" 
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
												:label="$t('user.password')" 
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
												:label="$t('user.email')" 
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
												:label="$t('user.first_name')" 
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
												:label="$t('user.last_name')" 
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
												{{ $t('user.is_staff') }}
											</b-form-checkbox>
										</b-col>
									</b-row>
									<b-row>
										<b-col>
											<h4>{{ $t('title.groups') }}</h4>
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
										<b-col align-self="start" />
										<b-col 
											align-self="center"
											align="center"
										>
											<b-button 
												type="submit"
												variant="success"
											>
												{{ $t('generic.add') }}
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
								id="users-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
								editcomponent="EditUserModal"
								title="users"
								translationkey="user."
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
import Loader from '@/components/Loader/Loader'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import Alert from '@/components/Alert/Alert'
import Datatable from '@/components/Datatable/Datatable'

export default {
	name: 'AddUserModal',
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
			rowheader: [],
			groups: [],
			groupsLabel: [],
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			loading: true,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 10000)
		}
	},
	mounted() {
		this.getHeader()
	},
	methods: {
		getHeader() {
			Axios.options(process.env.VUE_APP_API_ROUTE+"users/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						this.rowheader.push(field)
					})
					this.errorMsg = null
					this.errored = false
					this.getGroups()
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		// Get all users
		getUsers() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"users/", { headers: this.header })
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
				var tmpGroups = []
				rowDetails.groups.forEach(groupsDetails => {
					tmpGroups.push(this.groupsLabel[groupsDetails])
				})
				rowDetails.groups = tmpGroups.join('\n')
			})
		},
		// Get groups
		getGroups() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"groups/", { headers: this.header })
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
			Axios.post(process.env.VUE_APP_API_ROUTE+"users/", this.row, { headers: this.header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('add-user')
				})
				.catch(e => {
					this.errorMsg = e.message
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