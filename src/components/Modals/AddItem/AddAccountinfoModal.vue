<template>
	<div id="add-accountinfo-modal">
		<div>
			<!-- Header page -->
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
						<!-- Button to add accountinfo -->
						<b-button
							v-if="canadd"
							v-b-modal.add-accountinfo
							:title="$t('accountinfo.addaccountinfo')"
							variant="primary"
							class="d-none d-sm-inline-block"
						>
							<font-awesome-icon 
								:icon="['fas', 'plus']"
							/>
							{{ $t('accountinfo.addaccountinfo') }}
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
								id="accountinfodatatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
								:canaddvalue="canaddvalue"
								editcomponent="EditAccountinfoModal"
								title="accountinfo/config"
								titlevalue="accountinfo_param"
								adddvalueroute="accountinfo/value"
								reconciliationname="accountinfo_config"
								translationkey="accountinfo."
								@reloadDatatable="reloadDatatable"
							/>

							<!-- Modal to add accountinfo -->
							<b-modal 
								v-if="canadd"
								id="add-accountinfo" 
								:title="$t('accountinfo.addaccountinfo')"
								hide-footer
								modal-class="custom-modal modal-blur"
							>
								<template #modal-header="{ close }">
									<h5 class="modal-title">
										{{ $t('accountinfo.addaccountinfo') }}
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
												:label="$t('user.name')" 
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
												:label="$t('generic.description')" 
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
												:label="$t('accountinfo.datatype')" 
												label-for="datatype"
											>
												<b-form-select
													id="datatype"
													v-model="row.datatype" 
													:options="datatypeoptions" 
													class="mb-3 form-select"
												/>
											</b-form-group>
										</b-col>
									</b-row>
									<b-row>
										<b-col>
											<b-form-group
												:label="$t('accountinfo.datatarget')" 
												label-for="datatarget"
											>
												<b-form-select
													id="datatarget"
													v-model="row.datatarget" 
													:options="datatargetoptions" 
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
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb.vue'
import Alert from '@/components/Alert/Alert.vue'

export default {
	name: "AddAccountinfoModal",
	components: {
		Datatable,
		Loader,
		Alert,
		Breadcrumb
	},
	props: {
		canadd: { type: Boolean, default: false },
		canedit: { type: Boolean, default: false },
		candelete: { type: Boolean, default: false },
		canaddvalue: { type: Boolean, default: false },
		canview: { type: Boolean, default: false },
		pageTitle: { type: String, default: "" }
	},
	data() {
		return {
			row: {
				name: null,
				description: null,
				datatype: 'TEXT',
				datatarget: 'ASSET'
			},
			rowdata: [],
			config: [],
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
			datatargetoptions: [
				{ value: 'ASSET', text: this.$t("title.assets") },
				{ value: 'IPDISCOVER', text: this.$t("title.ipdiscover") },
				{ value: 'SNMP', text: this.$t("title.snmp") }
			],
			datatypeoptions: [
				{ value: 'TEXT', text: 'TEXT' },
				{ value: 'TEXTAREA', text: 'TEXTAREA' },
				{ value: 'SELECT', text: 'SELECT' },
				{ value: 'CHECKBOX', text: 'CHECKBOX' },
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
				Axios.options(import.meta.env.VITE_APP_API_ROUTE+"accountinfo/config", { headers: this.header })
					.then(response => {
						Object.keys(response.data.actions.POST).forEach(field => {
							this.rowheader.push(field)
						})
						this.errorMsg = null
						this.errored = false
						this.getAccountinfoConfig()
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
		getAccountinfoConfig() {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"accountinfo/config/", { headers: this.header })
				.then(response => {
					this.config = response.data
					this.accountinfovaluesTreatment()
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		accountinfovaluesTreatment() {
			Object.keys(this.config).forEach(key => {
				var tmpValues = []
				for (const accountvalue of this.config[key].accountinfo_values) {
					tmpValues.push(accountvalue.value)
				}
				this.config[key].accountinfo_values = tmpValues.join('\n')
			})

			this.rowdata = this.config
			this.loading = false
		},
		reloadDatatable() {
			this.loading = true
			this.getAccountinfoConfig()
		},
		// Submit template creation and call getAccountinfoConfig to reload datatable datas
		onSubmit(event) {
			event.preventDefault()
			
			Axios.post(import.meta.env.VITE_APP_API_ROUTE+"accountinfo/config/", this.row, { headers: this.header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('add-accountinfo')
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('add-accountinfo')
				})
				.finally(() => this.getAccountinfoConfig())
		}
	}
}
</script>