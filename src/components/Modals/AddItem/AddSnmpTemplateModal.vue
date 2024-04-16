<template>
	<div id="add-snmp-template-modal">
		<!-- Display error box message -->
		<section v-if="errored">
			<Alert 
				:message="errorMsg" 
				variant="danger"
			/>
		</section>

		<!-- Display info if no error -->
		<section v-else>
			<div 
				v-if="loading"
				align="center"
			>
				<Loader />
			</div>

			<!-- Header page -->
			<div v-else>
				<div class="page-header d-print-none">
					<div class="row">
						<div class="col-auto">
							<h2>{{ $t("network.snmptemplates") }}</h2>
						</div>
						<div class="col-auto ms-auto">
							<!-- Button to add ldap -->
							<b-button
								v-if="canadd"
								:title="$t('network.addsnmptemplate')"
								variant="primary"
								class="d-none d-sm-inline-block"
								@click="addsnmptemplate = !addsnmptemplate"
							>
								<font-awesome-icon 
									:icon="['fas', 'plus']"
								/>
								{{ $t('network.addsnmptemplate') }}
							</b-button>

							<!-- Modal to add template -->
							<b-modal 
								id="addsnmptemplate"
								v-model="addsnmptemplate"
								:title="$t('network.addsnmptemplate')"
								hide-footer
								modal-class="custom-modal modal-blur"
							>
								<template #header="{ close }">
									<h5 class="modal-title">
										{{ $t('network.addsnmptemplate') }}
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
												:label="$t('network.name')" 
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
				<!-- Display datatable -->
				<div class="page-body">
					<Datatable
						id="templatesnmp-datatable"
						:rowdata="rowdata"
						:rowheader="rowheader"
						:caneditsnmptemplate="canedit"
						:candelete="candelete"
						:canexport="false"
						:exporttemplate="exporttemplate"
						title="templates"
						translationkey="template."
						@reloadDatatable="reloadDatatable"
					/>
				</div>
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'

export default {
	name: "AddSnmpTemplateModal",
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
				name: null,
				os: 'SNMP',
				sections: []
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
			addsnmptemplate: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.addsnmptemplate = false
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
				Axios.options(import.meta.env.VITE_APP_API_ROUTE+"templates/", { headers: this.header })
					.then(response => {
						Object.keys(response.data.actions.POST).forEach(field => {
							this.rowheader.push(field)
						})
						this.errorMsg = null
						this.errored = false
						this.getTemplates()
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
		getTemplates() {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"templates?os=SNMP", { headers: this.header })
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
			this.getTemplates()
		},
		// Submit template creation and call getTemplates to reload datatable datas
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true
			
			Axios.post(import.meta.env.VITE_APP_API_ROUTE+"templates/", this.row, { headers: this.header })
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
					this.getTemplates()
				})
		}
	}
}
</script>