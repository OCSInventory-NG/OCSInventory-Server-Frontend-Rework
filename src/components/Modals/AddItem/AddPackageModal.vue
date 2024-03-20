<template>
	<div id="add-package-modal">
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
						<!-- Button to add package -->
						<b-button
							v-if="canadd"
							v-b-modal.add-package
							:title="$t('deployment.addpackage')"
							variant="primary"
							class="d-none d-sm-inline-block"
						>
							<font-awesome-icon 
								:icon="['fas', 'plus']"
							/>
							{{ $t('deployment.addpackage') }}
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
								id="packages-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:candelete="candelete"
								:canedit="canedit"
								:canviewaction="canviewaction"
								editcomponent="EditPackageModal"
								title="deployment/packages"
								translationkey="deployment."
								@reloadDatatable="reloadDatatable"
							/>

							<!-- Modal to add package -->
							<b-modal 
								v-if="canadd"
								id="add-package" 
								:title="$t('deployment.addpackage')"
								hide-footer
								modal-class="custom-modal modal-blur"
							>
								<template #modal-header="{ close }">
									<h5 class="modal-title">
										{{ $t('deployment.addpackage') }}
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
												:label="$t('deployment.name')" 
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
												:label="$t('deployment.description')" 
												label-for="name"
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
												:label="$t('deployment.target_os')" 
												label-for="target_os"
											>
												<b-form-select
													id="target_os"
													v-model="row.target_os" 
													:options="options" 
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
import Loader from '@/components/Loader/Loader.vue'
import Datatable from '@/components/Datatable/Datatable.vue'
import Alert from '@/components/Alert/Alert.vue'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb.vue'

export default {
	name: 'AddPackageModal',
	components: { Datatable, Loader, Alert, Breadcrumb },
	props: {
		canadd: { type: Boolean, default: false },
		canedit: { type: Boolean, default: false },
		candelete: { type: Boolean, default: false },
		canview: { type: Boolean, default: false },
		canviewaction: { type: Boolean, default: false },
		pageTitle: { type: String, default: "" }
	},
	data() {
		return {
			row: {
				name: null,
				description: null,
				target_os: 'WIN'
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
			options: [
				{ value: 'WIN', text: this.$t('template.WIN') },
				{ value: 'LIN', text: this.$t('template.LIN') },
				{ value: 'MAC', text: this.$t('template.MAC') }
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
				Axios.options(import.meta.env.VITE_APP_API_ROUTE+"deployment/packages/", { headers: this.header })
					.then(response => {
						Object.keys(response.data.actions.POST).forEach(field => {
							if(field != "result") this.rowheader.push(field)
						})
						this.errorMsg = null
						this.errored = false
						this.getPackages()
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
		getPackages() {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"deployment/packages/", { headers: this.header })
				.then(response => {
					response.data.forEach(packages => {
						packages.actions_list = packages.actions_list.length
					})
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
			this.getPackages()
		},
		// Submit template creation and call getPackages to reload datatable datas
		onSubmit(event) {
			event.preventDefault()
			
			Axios.post(import.meta.env.VITE_APP_API_ROUTE+"deployment/packages/", this.row, { headers: this.header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('add-package')
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('add-package')
				})
				.finally(() => this.getPackages())
		}
	}
}
</script>