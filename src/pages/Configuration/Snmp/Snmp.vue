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
							<div>
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
													v-model="configs.value[1][0].value"
													class="form-check-input"
													type="checkbox"
													:disabled="!canedit"
													@change="enableSnmp()"
												>
											</label>
										</div>
									</b-list-group-item>
								</b-list-group>
							</div>
							<hr>
							<div class="page-header d-print-none">
								<div class="row">
									<div class="col-auto">
										<h2>{{ $t("network.snmpcommunity") }}</h2>
									</div>
									<SnmpModal
										@reloadDatatable="reloadDatatable"
									/>
								</div>
							</div>
							<div>
								<Datatable
									id="snmpconfig-datatable"
									:rowdata="rowsnmpcomm"
									:rowheader="rowsnmpcommheader"
									:canedit="canedit"
									:candelete="candelete"
									editcomponent="SnmpModal"
									title="snmp/config"
									translationkey="network."
									@reloadDatatable="reloadDatatable"
								/>
							</div>
							<hr>
							<div class="page-header d-print-none">
								<div class="row">
									<div class="col-auto">
										<h2>{{ $t("network.snmptemplates") }}</h2>
									</div>
									<SnmpTemplateModal
										@reloadDatatable="reloadDatatable"
									/>
								</div>
							</div>
							<div>
								<Datatable
									id="templatesnmp-datatable"
									:rowdata="rowtemplatedata"
									:rowheader="rowtemplateheader"
									:caneditsnmptemplate="canedit"
									:candelete="candelete"
									:canexport="false"
									:importtemplate="true"
									title="templates"
									translationkey="template."
									@reloadDatatable="reloadDatatable"
								/>
							</div>
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
			canadd: false,
			canedit: false,
			candelete: false,
			canview: false,
			configs: [],
			errormsg: null,
			errored: false,
			successmsg: null,
			successed: false,
			loading: true,
			rowsnmpcommheader: [
				"name", "version", "user", "level", "password", "auth_protocol",
				"priv_protocol", "priv_password", "retries", "timeout", "subnets"
			],
			rowsnmpcomm: [],
			rowtemplateheader: [],
			rowtemplatedata: [],
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
	created() {
		if(localStorage.getItem('permissions').split(",").includes("config_view_config")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("config_add_config")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("config_change_config")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("config_delete_config")) {
				this.candelete = true
			}
			this.getSnmpConfig()
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
		}
	},
	methods: {
		getSnmpConfig() {
			this.configs = []
			this.loading = true
			
			axios.get(import.meta.env.VITE_APP_API_ROUTE+"config/networkscan", { headers: this.header })
				.then(response => {
					this.configs = response.data
					this.getSnmpCommunities()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		getSnmpCommunities() {
			this.rowsnmpcomm = []
			axios.get(import.meta.env.VITE_APP_API_ROUTE+"snmp/config", { headers: this.header })
				.then(response => {
					this.rowsnmpcomm = response.data
					for (const community of this.rowsnmpcomm) {
						community.subnets = community.subnets.join('\n')
					}
					this.getSnmpTemplateHeader()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		getSnmpTemplateHeader() {
			axios.options(import.meta.env.VITE_APP_API_ROUTE+"templates/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						this.rowtemplateheader.push(field)
					})
					this.errormsg = null
					this.errored = false
					this.getSnmpTemplates()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		getSnmpTemplates() {
			axios.get(import.meta.env.VITE_APP_API_ROUTE+"templates?os=SNMP", { headers: this.header })
				.then(response => {
					this.rowtemplatedata = response.data
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		enableSnmp() {
			axios.patch(import.meta.env.VITE_APP_API_ROUTE+"config/networkscan/", this.configs,
				{ headers: this.header })
				.then(() => {
					this.successmsg = this.$t("message.success_saved")
					this.successed = true
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
					this.successmsg = null
					this.successed = false
				})
		},
		reloadDatatable() {
			this.loading = true
			this.getSnmpCommunities()
			this.getSnmpTemplates()
		}
	}
}
</script>