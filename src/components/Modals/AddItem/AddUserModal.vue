<template>
	<div id="add-user-modal">
		<!-- Header page -->
		<div>
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
							:title="$t('user.adduser')"
							variant="primary"
							class="d-none d-sm-inline-block"
							@click="adduser = !adduser"
						>
							<font-awesome-icon 
								:icon="['fas', 'plus']"
							/>
							{{ $t('user.adduser') }}
						</b-button>
					</div>
				</div>
			</div>
			<!-- Display datatable -->
			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Display error box message -->
						<section v-if="errored">
							<Alert 
								:message="errormsg" 
								variant="danger"
							/>
						</section>
						<div 
							v-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>

						<div v-else>
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

							<!-- Modal to add user -->
							<b-modal 
								v-if="canadd"
								id="add-user"
								v-model="adduser"
								:title="$t('user.adduser')"
								size="md"
								hide-footer
								modal-class="custom-modal modal-blur"
							>
								<template #header="{ close }">
									<h5 class="modal-title">
										{{ $t('user.adduser') }}
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
								<div 
									v-if="loading"
									class="ocs-loader"
								>
									<Loader />
								</div>
							</b-modal>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import axios from 'axios'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb.vue'

export default {
	name: 'AddUserModal',
	components: { Breadcrumb },
	props: {
		canadd: { type: Boolean, default: false },
		canedit: { type: Boolean, default: false },
		candelete: { type: Boolean, default: false },
		canview: { type: Boolean, default: false },
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
			errormsg: null,
			errored: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			adduser: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.adduser = false
				this.createwithsuccess = false
			}, 500)
		}
	},
	mounted() {
		this.getHeader()
	},
	methods: {
		getHeader() {
			if(this.canview) {
				axios.options(import.meta.env.VITE_APP_API_ROUTE+"users/", { headers: this.header })
					.then(response => {
						Object.keys(response.data.actions.POST).forEach(field => {
							this.rowheader.push(field)
						})
						this.errormsg = null
						this.errored = false
						this.getGroups()
					})
					.catch(e => {
						this.errormsg = e.message
						this.errored = true
					})
			} else {
				this.errormsg = this.$t("message.dont_have_right_to_see")
				this.errored = true
			}	
		},
		// Get all users
		getUsers() {
			axios.get(import.meta.env.VITE_APP_API_ROUTE+"users/", { headers: this.header })
				.then(response => {
					this.rowdata = response.data
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
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
			axios.get(import.meta.env.VITE_APP_API_ROUTE+"groups/", { headers: this.header })
				.then(response => {
					response.data.forEach(groupDetails => {
						this.groups.push({
							id: groupDetails.id,
							code: "group_"+groupDetails.id,
							name: groupDetails.name
						})
						this.groupsLabel[groupDetails.id] = groupDetails.name
					})
					this.getUsers()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			axios.post(import.meta.env.VITE_APP_API_ROUTE+"users/", this.row, { headers: this.header })
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
				.finally(() => {
					this.loadingcreate = false
					this.getUsers()
				})
		},
		reloadDatatable() {
			this.getUsers()
		}
	}
}
</script>