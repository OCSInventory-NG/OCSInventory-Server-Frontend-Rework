<template>
	<div id="add-template-modal">
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
						<!-- Button to add template -->
						<b-button
							v-if="canadd"
							:title="$t('template.addtemplate')"
							variant="primary"
							class="d-none d-sm-inline-block"
							@click="addtemplate = !addtemplate"
						>
							<font-awesome-icon 
								:icon="['fas', 'plus']"
							/>
							{{ $t('template.addtemplate') }}
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
								id="templates-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedittemplate="canedit"
								:candelete="candelete"
								:canexport="false"
								:exporttemplate="exporttemplate"
								title="templates"
								translationkey="template."
								@reloadDatatable="reloadDatatable"
							/>

							<!-- Modal to add template -->
							<b-modal 
								v-if="canadd"
								id="add-template"
								v-model="addtemplate"
								:title="$t('template.addtemplate')"
								hide-footer
								modal-class="custom-modal modal-blur"
							>
								<template #header="{ close }">
									<h5 class="modal-title">
										{{ $t('template.addtemplate') }}
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
												:label="$t('inventory.os')" 
												label-for="os"
											>
												<b-form-select
													id="os"
													v-model="row.os" 
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
	name: 'AddTemplateModal',
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
				os: 'WIN',
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
			addtemplate: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			options: [
				{ value: 'WIN', text: 'Windows' },
				{ value: 'LIN', text: 'Linux' },
				{ value: 'MAC', text: 'MacOS' }
			]
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.addtemplate = false
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
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"templates/", { headers: this.header })
				.then(response => {
					for (const temp of response.data) {
						if(temp.os != "SNMP") {
							this.rowdata.push(temp)
						}
					}
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