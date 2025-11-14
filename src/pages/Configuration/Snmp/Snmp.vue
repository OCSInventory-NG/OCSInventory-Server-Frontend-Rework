<template>
	<div
		id="snmp"
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="snmp"
			/>
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
						<section v-if="successed">
							<Alert 
								:message="successmsg"
								:cols="true"
								variant="success"
							/>
						</section>
						<div 
							v-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>
						<div v-else>
							<b-tabs 
								v-if="allconfigview"
								v-model="activetab"
								content-class="mt-3"
								fill
							>
								<b-tab 
									:title="$t('network.snmpconfiggeneral')"
								>
									<div 
										v-if="loadingconfig"
										class="ocs-loader"
									>
										<Loader />
									</div>
									<div v-else>
										<b-list-group flush>
											<b-list-group-item 
												class="d-flex justify-content-between align-items-center"
											>
												<div>
													<h4 class="mb-1">
														{{ $t("title.snmp") }}
													</h4>
													<p class="mb-1">
														{{ $t("network.enablesnmp") }}
													</p>
												</div>
												<div>
													<label class="form-check form-switch">
														<input 
															v-model="configs.value[0].value"
															class="form-check-input"
															type="checkbox"
															:disabled="!can.config.edit"
															@change="enableSnmp()"
														>
													</label>
												</div>
											</b-list-group-item>
										</b-list-group>
									</div>
									<hr v-if="can.community.view">
									<div 
										v-if="loadingcommunity"
										class="ocs-loader"
									>
										<Loader />
									</div>
									<div v-else>
										<div class="page-header d-print-none">
											<div class="row">
												<div class="col-auto">
													<h2>{{ $t("network.snmpcommunity") }}</h2>
												</div>
												<SnmpModal
													v-if="can.community.add"
													@reloadDatatable="reloadDatatable"
												/>
											</div>
										</div>
										<div>
											<Datatable
												id="snmpconfig-datatable"
												:rowdata="rowsnmpcomm"
												:rowheader="rowsnmpcommheader"
												:canedit="can.community.edit"
												:candelete="can.community.delete"
												:hiddenfields="hiddenfields"
												editcomponent="SnmpModal"
												title="snmp/config"
												translationkey="network."
												@reloadDatatable="reloadDatatable"
											/>
										</div>
									</div>
									<hr v-if="can.template.view">
									<div 
										v-if="loadingtemplate"
										class="ocs-loader"
									>
										<Loader />
									</div>
									<div v-else>
										<div class="page-header d-print-none">
											<div class="row">
												<div class="col-auto">
													<h2>{{ $t("network.snmptemplates") }}</h2>
												</div>
												<SnmpTemplateModal
													v-if="can.template.add"
													@reloadDatatable="reloadDatatable"
												/>
											</div>
										</div>
										<div>
											<Datatable
												id="templatesnmp-datatable"
												:rowdata="rowtemplatedata"
												:rowheader="rowtemplateheader"
												:caneditsnmptemplate="can.template.edit"
												:candelete="can.template.delete"
												:canexport="false"
												:importtemplate="true"
												title="templates"
												translationkey="template."
												@reloadDatatable="reloadDatatable"
											/>
										</div>
									</div>
								</b-tab>
								<b-tab 
									v-if="can.scanner.view"
									:title="$t('network.snmpscanner')"
								>
									<div 
										v-if="loadingscanner"
										class="ocs-loader"
									>
										<Loader />
									</div>
									<div v-else>
										<div class="page-header d-print-none">
											<div class="row">
												<div class="col-auto">
													<h2>{{ $t("network.snmpscanner") }}</h2>
												</div>
												<SnmpScannerModal
													v-if="can.scanner.add"
													@reloadDatatable="reloadDatatable"
												/>
											</div>
										</div>
										<div>
											<Datatable
												id="scannersnmp-datatable"
												:rowdata="rowscannerdata"
												:rowheader="rowscannerheader"
												:canedit="can.scanner.edit"
												:candelete="can.scanner.delete"
												:hiddenfields="hiddenscannerfields"
												editcomponent="SnmpScannerModal"
												title="snmp/scanner"
												translationkey="network."
												@reloadDatatable="reloadDatatable"
												@assetsSearch="assetsSearch"
											/>
										</div>
									</div>
								</b-tab>
							</b-tabs>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import axios from 'axios'

export default {
	name: "Snmp",
	data() {
		return {
			can: {
				config: {
					add: false,
					view: false,
					edit: false,
					delete: false
				},
				community: {
					add: false,
					view: false,
					edit: false,
					delete: false
				},
				template: {
					add: false,
					view: false,
					edit: false,
					delete: false
				},
				scanner: {
					add: false,
					view: false,
					edit: false,
					delete: false
				}
			},
			configs: [],
			errormsg: null,
			errored: false,
			successmsg: null,
			successed: false,
			loading: true,
			loadingconfig: true,
			loadingcommunity: true,
			loadingtemplate: true,
			loadingscanner: true,
			activetab: 0,
			allconfigview: false,
			rowsnmpcommheader: [
				"name", "version", "user", "auth_level", "password", "auth_protocol",
				"priv_protocol", "priv_password", "retries", "timeout", "subnets"
			],
			rowsnmpcomm: [],
			rowtemplateheader: [],
			rowtemplatedata: [],
			rowscannerheader: [],
			rowscannerdata: [],
			hiddenfields: [
				"auth_level", "password", "auth_protocol",
				"priv_protocol", "priv_password"
			],
			hiddenscannerfields: ["last_updated"],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => {
				this.successed = false
				this.successmsg = null
			}, 4000)
		}
	},
	async mounted() {
		if(localStorage.getItem('permissions').split(",").includes("config_view_config")) {
			this.allconfigview = true
			this.can.config.view = true
			if(localStorage.getItem('permissions').split(",").includes("config_add_config")) {
				this.can.config.add = true
			}
			if(localStorage.getItem('permissions').split(",").includes("config_change_config")) {
				this.can.config.edit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("config_delete_config")) {
				this.can.config.delete = true
			}
			await this.getSnmpConfig()
		}

		if(localStorage.getItem('permissions').split(",").includes("snmp_config_view_snmpconfig")) {
			this.allconfigview = true
			this.can.community.view = true
			if(localStorage.getItem('permissions').split(",").includes("snmp_config_add_snmpconfig")) {
				this.can.community.add = true
			}
			if(localStorage.getItem('permissions').split(",").includes("snmp_config_change_snmpconfig")) {
				this.can.community.edit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("snmp_config_delete_snmpconfig")) {
				this.can.community.delete = true
			}
			await this.getSnmpCommunities()
		}

		if(localStorage.getItem('permissions').split(",").includes("template_view_template")) {
			this.allconfigview = true
			this.can.template.view = true
			if(localStorage.getItem('permissions').split(",").includes("template_add_template")) {
				this.can.template.add = true
			}
			if(localStorage.getItem('permissions').split(",").includes("template_change_template")) {
				this.can.template.edit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("template_delete_template")) {
				this.can.template.delete = true
			}
			await this.getSnmpTemplateHeader()
		}

		if(localStorage.getItem('permissions').split(",").includes("scanner_view_snmpscanner")) {
			this.allconfigview = true
			this.can.scanner.view = true
			if(localStorage.getItem('permissions').split(",").includes("scanner_add_snmpscanner")) {
				this.can.scanner.add = true
			}
			if(localStorage.getItem('permissions').split(",").includes("scanner_change_snmpscanner")) {
				this.can.scanner.edit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("scanner_delete_snmpscanner")) {
				this.can.scanner.delete = true
			}
			await this.getSnmpScannerHeader()
		}
		
		if(!this.allconfigview) {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
		}

		this.loading = false
	},
	methods: {
		async getSnmpConfig() {
			this.loadingconfig = true
			this.configs = []
			
			await axios.get(this.$config.BACKEND_API_ROUTE+"config/snmp", { headers: this.header })
				.then(response => {
					this.configs = response.data
				})
				.catch(e => {
					this.errormsg = (e.response.data.error) ? e.response.data.error : e.message
					this.errored = true
				})
				.finally(() => this.loadingconfig = false)
		},
		async getSnmpCommunities() {
			this.loadingcommunity = true
			this.rowsnmpcomm = []

			await axios.get(this.$config.BACKEND_API_ROUTE+"snmp/config", { headers: this.header })
				.then(response => {
					this.rowsnmpcomm = response.data
					for (const community of this.rowsnmpcomm) {
						community.subnets = community.subnets.join('\n')
					}
				})
				.catch(e => {
					this.errormsg = (e.response.data.error) ? e.response.data.error : e.message
					this.errored = true
				})
				.finally(() => this.loadingcommunity = false)
		},
		async getSnmpTemplateHeader() {
			this.loadingtemplate = true
			this.rowtemplateheader = []

			await axios.options(this.$config.BACKEND_API_ROUTE+"templates/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if(field != "sections") {
							this.rowtemplateheader.push(field)
						}
					})
					this.errormsg = null
					this.errored = false
					this.getSnmpTemplates()
				})
				.catch(e => {
					this.errormsg = (e.response.data.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		async getSnmpTemplates() {
			this.rowtemplatedata = []

			await axios.get(this.$config.BACKEND_API_ROUTE+"templates/?os=SNMP", { headers: this.header })
				.then(response => {
					this.rowtemplatedata = response.data
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response.data.error) ? e.response.data.error : e.message
					this.errored = true
				})
				.finally(() => this.loadingtemplate = false)
		},
		async getSnmpScannerHeader() {
			this.loadingscanner = true
			this.rowscannerheader = []

			await axios.options(this.$config.BACKEND_API_ROUTE+"snmp/scanner", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if(field == "configs") {
							this.rowscannerheader.push("snmpcommunity")
						} else {
							this.rowscannerheader.push(field)
						}
					})
					this.errormsg = null
					this.errored = false
					this.getSnmpScanners()
				})
				.catch(e => {
					this.errormsg = (e.response.data.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		async getSnmpScanners() {
			this.rowscannerdata = []

			await axios.get(this.$config.BACKEND_API_ROUTE+"snmp/scanner?expand=configs",
				{ headers: this.header })
				.then(response => {
					this.rowscannerdata = response.data
					for (const scan of this.rowscannerdata) {
						scan.subnets = scan.subnets.join('\n')

						var configs = scan.configs
						delete scan.configs

						var communities = []
						for (const community of configs) {
							communities.push(community.name)
						}

						scan.snmpcommunity = communities.join('\n')
						scan.assets = scan.assets.length
					}
				})
				.catch(e => {
					this.errormsg = (e.response.data.error) ? e.response.data.error : e.message
					this.errored = true
				})
				.finally(() => this.loadingscanner = false)
		},
		enableSnmp() {
			axios.patch(this.$config.BACKEND_API_ROUTE+"config/snmp/", this.configs,
				{ headers: this.header })
				.then(() => {
					this.successmsg = this.$t("message.success_saved")
					this.successed = true
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response.data.error) ? e.response.data.error : e.message
					this.errored = true
					this.successmsg = null
					this.successed = false
				})
		},
		reloadDatatable() {
			this.getSnmpCommunities()
			this.getSnmpTemplateHeader()
			this.getSnmpScannerHeader()
		},
		assetsSearch(identifier) {
			var search = [
				[
					{
						object: "snmpscanner",
						route: "snmp/scanner",
						field: "identifier",
						fieldtype: "string",
						operator: "iexact",
						value: identifier,
						link: ""
					}
				]
			]

			localStorage.setItem('multisearch', JSON.stringify(search))
			localStorage.setItem('useSavedSearch', true)

			this.$router.push({
				name: 'Multisearch',
			});
		}
	}
}
</script>