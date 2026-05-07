<template>
	<div
		id="snmp"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="snmp" />

			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<section v-if="errored">
							<Alert 
								:message="errormsg" 
								:cols="true"
								variant="danger"
							/>
						</section>

						<section v-if="successed">
							<Alert 
								:message="$t('message.success_saved')"
								:cols="true"
								variant="success"
							/>
						</section>

						<div 
							v-if="loading.global"
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
										v-if="loading.community"
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
													@reload-datatable="reloadDatatableComm"
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
												:isbusy="isbusy.community"
												is-sticky
												editcomponent="SnmpModal"
												title="snmp/config"
												translationkey="network."
												@reload-datatable="reloadDatatableComm"
											/>
										</div>
									</div>

									<hr v-if="can.template.view">

									<div 
										v-if="loading.template"
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
													@reload-datatable="reloadDatatableTemp"
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
												:isbusy="isbusy.template"
												is-sticky
												title="templates"
												translationkey="template."
												@reload-datatable="reloadDatatableTemp"
											/>
										</div>
									</div>
								</b-tab>

								<b-tab 
									v-if="can.scanner.view"
									:title="$t('network.snmpscanner')"
								>
									<div 
										v-if="loading.scanner"
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
													@reload-datatable="reloadDatatableScan"
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
												:candeletemultiple="false"
												:usecheckbox="false"
												:hiddenfields="hiddenscannerfields"
												:isbusy="isbusy.scanner"
												is-sticky
												editcomponent="SnmpScannerModal"
												title="snmp/scanner"
												translationkey="network."
												@reload-datatable="reloadDatatableScan"
												@assets-search="assetsSearch"
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
export default {
	name: "Snmp",
	data() {
		return {
			errormsg: null,
			errored: false,

			successmsg: null,
			successed: false,

			can: {
				config: { add: false, view: false, edit: false, delete: false },
				community: { add: false, view: false, edit: false, delete: false },
				template: { add: false, view: false, edit: false, delete: false },
				scanner: { add: false, view: false, edit: false, delete: false },
			},

			configs: [],
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

			loading: {
				global: true,
				community: true,
				template: true,
				scanner: true
			},
			isbusy: {
				community: true,
				template: true,
				scanner: true
			}
		}
	},
	watch: {
		successed() {
			setTimeout(() => {
				this.successed = false
				this.successmsg = null
			}, 4000)
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (permissions.includes("config_view_config")) {
			this.allconfigview = true
			this.can.config.view = true
			this.can.config.add = permissions.includes("config_add_config")
			this.can.config.edit = permissions.includes("config_change_config")
			this.can.config.delete = permissions.includes("config_delete_config")
		}

		if (permissions.includes("snmp_config_view_snmpconfig")) {
			this.allconfigview = true
			this.can.community.view = true
			this.can.community.add = permissions.includes("snmp_config_add_snmpconfig")
			this.can.community.edit = permissions.includes("snmp_config_change_snmpconfig")
			this.can.community.delete = permissions.includes("snmp_config_delete_snmpconfig")
		}

		if (permissions.includes("template_view_template")) {
			this.allconfigview = true
			this.can.template.view = true
			this.can.template.add = permissions.includes("template_add_template")
			this.can.template.edit = permissions.includes("template_change_template")
			this.can.template.delete = permissions.includes("template_delete_template")
		}

		if (permissions.includes("scanner_view_snmpscanner")) {
			this.allconfigview = true
			this.can.scanner.view = true
			this.can.scanner.add = permissions.includes("scanner_add_snmpscanner")
			this.can.scanner.edit = permissions.includes("scanner_change_snmpscanner")
			this.can.scanner.delete = permissions.includes("scanner_delete_snmpscanner")
		}

		if (this.can.config.view) await this.getSnmpConfig()
		if (this.can.community.view) await this.getSnmpCommunities()
		if (this.can.template.view) await this.getSnmpTemplateHeader()
		if (this.can.scanner.view) await this.getSnmpScannerHeader()

		if (!this.allconfigview) {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading.global = false
		}
	},

	methods: {
		setError(e) {
			this.errormsg = (e?.response?.data?.error) ? e.response.data.error : (e?.message || String(e))
			this.errored = true
		},

		clearError() {
			this.errormsg = null
			this.errored = false
		},

		async getSnmpConfig() {
			this.loading.global = true
			this.configs = []
			try {
				const data = await this.$api.generic.get("config/snmp/")
				this.configs = data
				this.clearError()
			} catch (e) {
				this.setError(e)
			} finally {
				this.loading.global = false
			}
		},

		async getSnmpCommunities() {
			this.isbusy.community = true
			this.rowsnmpcomm = []

			try {
				const data = await this.$api.generic.get("snmp/config/")
				const rows = Array.isArray(data) ? data : (data?.results || [])

				this.rowsnmpcomm = rows.map((community) => ({
					...community,
					subnets: Array.isArray(community?.subnets) ? community.subnets.join("\n") : "",
				}))

				this.clearError()
			} catch (e) {
				this.setError(e)
			} finally {
				this.isbusy.community = false
				this.loading.community = false
			}
		},

		async getSnmpTemplateHeader() {
			this.loading.template = true
			this.rowtemplateheader = []

			try {
				const data = await this.$api.generic.options("templates/")

				Object.keys(data?.actions?.POST || {}).forEach((field) => {
					if (!["sections", "is_protected"].includes(field)) this.rowtemplateheader.push(field)
				})

				this.clearError()
				await this.getSnmpTemplates()
			} catch (e) {
				this.setError(e)
			} finally {
				this.loading.template = false
			}
		},

		async getSnmpTemplates() {
			this.isbusy.template = true
			this.rowtemplatedata = []
			try {
				const data = await this.$api.generic.get(
					"templates/",
					{},
					{ os: "SNMP" }
				)

				this.rowtemplatedata = Array.isArray(data) ? data : (data?.results || [])
				this.clearError()
			} catch (e) {
				this.setError(e)
			} finally {
				this.isbusy.template = false
			}
		},

		async getSnmpScannerHeader() {
			this.loading.scanner = true
			this.rowscannerheader = []

			try {
				const data = await this.$api.generic.options("snmp/scanner/")

				Object.keys(data?.actions?.POST || {}).forEach((field) => {
					this.rowscannerheader.push(field === "configs" ? "snmpcommunity" : field)
				})

				this.clearError()
				await this.getSnmpScanners()
			} catch (e) {
				this.setError(e)
			} finally {
				this.loading.scanner = false
			}
		},

		async getSnmpScanners() {
			this.isbusy.scanner = true
			this.rowscannerdata = []

			try {
				const data = await this.$api.generic.get(
					"snmp/scanner/",
					{},
					{ expand: "configs" }
				)

				const rows = Array.isArray(data) ? data : (data?.results || [])

				this.rowscannerdata = rows.map((scan) => {
					const configs = Array.isArray(scan?.configs) ? scan.configs : []
					const communities = configs.map((c) => c?.name).filter(Boolean)

					return {
						...scan,
						subnets: Array.isArray(scan?.subnets) ? scan.subnets.join("\n") : "",
						snmpcommunity: communities.join("\n"),
						assets: Array.isArray(scan?.assets) ? scan.assets.length : scan.assets,
						configs: undefined,
					}
				})

				this.clearError()
			} catch (e) {
				this.setError(e)
			} finally {
				this.isbusy.scanner = false
			}
		},

		async enableSnmp() {
			try {
				await this.$api.generic.patch("config/snmp/", this.configs)

				this.successmsg = this.$t("message.success_saved")
				this.successed = true
				this.clearError()
			} catch (e) {
				this.setError(e)
				this.successmsg = null
				this.successed = false
			}
		},

		async reloadDatatableComm() {
			await this.getSnmpCommunities()
		},

		async reloadDatatableTemp() {
			await this.getSnmpTemplates()
		},

		async reloadDatatableScan() {
			await this.getSnmpScanners()
		},

		assetsSearch(params) {
			const search = [[
				{
					object: "snmpscanner",
					route: "snmp/scanner",
					field: "name",
					fieldtype: "string",
					operator: "iexact",
					value: params[0],
					link: ""
				}
			]]

			localStorage.setItem('multisearch', JSON.stringify(search))
			localStorage.setItem('useSavedSearch', true)

			this.$router.push({ name: 'Multisearch' })
		}
	}
}
</script>