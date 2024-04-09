<template>
	<div id="add-automaticaction-modal">
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
						<!-- Button to add scheduler -->
						<b-button
							v-if="canadd"
							:title="$t('scheduler.addscheduler')"
							variant="primary"
							class="d-none d-sm-inline-block"
							@click="addscheduler = !addscheduler"
						>
							<font-awesome-icon 
								:icon="['fas', 'plus']"
							/>
							{{ $t('scheduler.addscheduler') }}
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
								:message="errorMsg" 
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
								id="scheduler-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:candelete="candelete"
								:canedit="canedit"
								editcomponent="EditAutomaticActionModal"
								title="automaticactions"
								translationkey="scheduler."
								@reloadDatatable="reloadDatatable"
							/>
							<!-- Modal to add scheduler -->
							<b-modal 
								v-if="canadd"
								id="add-scheduler"
								v-model="addscheduler"
								:title="$t('scheduler.addscheduler')"
								hide-footer
								modal-class="custom-modal modal-blur"
							>
								<template #header="{ close }">
									<h5 class="modal-title">
										{{ $t('scheduler.addscheduler') }}
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
											<b-form-group
												:label="$t('scheduler.name')" 
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
												:label="$t('scheduler.description')" 
												label-for="description"
											>
												<b-form-input
													id="description"
													v-model="row.description"
													required
												/>
											</b-form-group>
										</b-col>
									</b-row>
									<b-row>
										<b-col>
											<b-form-group
												:label="$t('scheduler.active')" 
												label-for="active"
											>
												<b-form-select
													id="active"
													v-model="row.active" 
													:options="active" 
													class="mb-3 form-select"
												/>
											</b-form-group>
										</b-col>
									</b-row>
									<b-row>
										<b-col>
											<b-form-group
												:label="$t('scheduler.recurence')" 
												label-for="recurence"
											>
												<b-form-select
													id="recurence"
													v-model="row.recurence" 
													:options="recurences" 
													class="mb-3 form-select"
												/>
											</b-form-group>
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
import Axios from 'axios'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb.vue'

export default {
	name: 'AddAutomaticActionModal',
	components: { Breadcrumb },
	props: {
		canadd: { type: Boolean, default: false },
		canedit: { type: Boolean, default: false },
		candelete: { type: Boolean, default: false },
		canview: { type: Boolean, default: false },
		exporttemplate: { type: Boolean, default: true },
		pageTitle: { type: String, default: "" }
	},
	data() {
		return {
			row: {
				name: null,
				description: null,
				active: false,
				recurence: "hourly"
			},
			rowdata: [],
			rowheader: [],
			loading: true,
			errorMsg: null,
			errored: false,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			addscheduler: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			active: [
				{ value: true, text: this.$t('generic.yes') },
				{ value: false, text: this.$t('generic.no') }
			],
			recurences: [
				{ value: 'hourly', text: this.$t('scheduler.hourly') },
				{ value: 'daily', text: this.$t('scheduler.daily') },
				{ value: 'weekly', text: this.$t('scheduler.weekly') },
				{ value: 'monthly', text: this.$t('scheduler.monthly') }
			]
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.addscheduler = false
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
				Axios.options(import.meta.env.VITE_APP_API_ROUTE+"automation/scheduler/", { headers: this.header })
					.then(response => {
						Object.keys(response.data.actions.POST).forEach(field => {
							this.rowheader.push(field)
						})
						this.errorMsg = null
						this.errored = false
						this.getSchedulers()
					})
					.catch(e => {
						this.errorMsg = e.message
						this.errored = true
					})
			} else {
				this.errorMsg = this.$t("message.dont_have_right_to_see")
				this.errored = true
			}
		},
		getSchedulers() {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"automation/scheduler/", { headers: this.header })
				.then(response => {
					this.rowdata = response.data
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		reloadDatatable() {
			this.getSchedulers()
		},
		// Submit template creation and call getSchedulers to reload datatable datas
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true
			
			Axios.post(import.meta.env.VITE_APP_API_ROUTE+"automation/scheduler/", this.row, { headers: this.header })
				.then(() => {
					this.createwithsuccess = true
					this.createerror = false
					this.createerrormsg = null
					this.loadingcreate = false
				})
				.catch(e => {
					this.createwithsuccess = false
					this.createerror = true
					this.createerrormsg = e.message
					this.loadingcreate = false
				})
				.finally(() => this.getSchedulers())
		}
	}
}
</script>