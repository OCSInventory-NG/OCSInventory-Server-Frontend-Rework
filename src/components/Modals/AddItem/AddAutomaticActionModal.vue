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
							v-b-modal.add-scheduler
							:title="$t('scheduler.addscheduler')"
							variant="primary"
							class="d-none d-sm-inline-block"
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
								:title="$t('scheduler.addscheduler')"
								hide-footer
								modal-class="custom-modal modal-blur"
							>
								<template #modal-header="{ close }">
									<h5 class="modal-title">
										{{ $t('scheduler.addscheduler') }}
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
import Loader from '@/components/Loader/Loader'
import Datatable from '@/components/Datatable/Datatable'
import Alert from '@/components/Alert/Alert'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'
import i18n from '@/i18n'

export default {
	name: 'AddAutomaticActionModal',
	components: { Datatable, Loader, Alert, Breadcrumb },
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
			succesMsg: null,
			errored: false,
			successed: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			active: [
				{ value: true, text: i18n.t('generic.yes') },
				{ value: false, text: i18n.t('generic.no') }
			],
			recurences: [
				{ value: 'hourly', text: i18n.t('scheduler.hourly') },
				{ value: 'daily', text: i18n.t('scheduler.daily') },
				{ value: 'weekly', text: i18n.t('scheduler.weekly') },
				{ value: 'monthly', text: i18n.t('scheduler.monthly') }
			]
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
			if(this.canview) {
				Axios.options(process.env.VUE_APP_API_ROUTE+"automation/scheduler/", { headers: this.header })
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
				this.errorMsg = i18n.t("message.dont_have_right_to_see")
				this.errored = true
			}
		},
		getSchedulers() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"automation/scheduler/", { headers: this.header })
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
			
			Axios.post(process.env.VUE_APP_API_ROUTE+"automation/scheduler/", this.row, { headers: this.header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('add-scheduler')
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('add-scheduler')
				})
				.finally(() => this.getSchedulers())
		}
	}
}
</script>