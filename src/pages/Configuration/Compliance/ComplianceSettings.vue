<template lang="">
	<div
		id="compliance-settings"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="compliance_settings" />

			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<b-tabs
							v-model="activeTab"
							content-class="col-10 sticky-tabs"
							pills
							card
							vertical
						>
							<b-tab
								:title="$t('compliance.tab_rules')"
								title-item-class="ocs-menu-tab"
							>
								<div v-if="errored">
									<Alert
										:message="errormsg"
										:cols="true"
										variant="danger"
									/>
								</div>

								<div
									v-else-if="loading"
									class="ocs-loader"
								>
									<Loader />
								</div>

								<div v-else>
									<ComplianceRuleModal
										v-if="canaddcompliance"
										@reload-datatable="reloadComplianceDatatable"
									/>
									<Datatable
										id="compliance-rules-datatable"
										:key="`compliance-${complianceTableKey}`"
										:rowdata="complianceRowdata"
										:rowheader="complianceRowheader"
										:candelete="candeletecompliance"
										:canedit="caneditcompliance"
										:canviewruleaction="canviewcomplianceaction"
										ruleactionroute="/configurations/compliance_settings"
										:isbusy="isbusy"
										is-sticky
										editcomponent="ComplianceRuleModal"
										title="compliance/rules"
										translationkey="compliance."
										@reload-datatable="reloadComplianceDatatable"
									/>
								</div>
							</b-tab>

							<b-tab
								:title="$t('compliance.tab_windows_build')"
								title-item-class="ocs-menu-tab"
							>
								<WindowsBuildMapping section="wbm" />
							</b-tab>

							<b-tab
								:title="$t('compliance.tab_eol_mapping')"
								title-item-class="ocs-menu-tab"
							>
								<WindowsBuildMapping section="eol" />
							</b-tab>

							<b-tab
								:title="$t('compliance.tab_types')"
								title-item-class="ocs-menu-tab"
							>
								<div v-if="types.errored">
									<Alert
										:message="types.errormsg"
										:cols="true"
										variant="danger"
									/>
								</div>

								<div
									v-else-if="types.loading"
									class="ocs-loader"
								>
									<Loader />
								</div>

								<div v-else>
									<ComplianceTypeModal
										v-if="types.canadd"
										@reload-datatable="reloadTypes"
									/>
									<Datatable
										id="compliance-types-datatable"
										:rowdata="types.rowdata"
										:rowheader="types.rowheader"
										:canedit="types.canedit"
										:candelete="types.candelete"
										:isbusy="types.isbusy"
										is-sticky
										editcomponent="ComplianceTypeModal"
										title="compliance/types"
										translationkey="compliance."
										@reload-datatable="reloadTypes"
									/>
								</div>
							</b-tab>
						</b-tabs>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import WindowsBuildMapping from "@/pages/Configuration/Compliance/WindowsBuildMapping.vue"

export default {
	name: "ComplianceSettings",
	components: { WindowsBuildMapping },
	data() {
		return {
			errormsg: null,
			errored: false,

			canaddcompliance: false,
			caneditcompliance: false,
			candeletecompliance: false,
			canviewcomplianceaction: false,

			complianceRowdata: [],
			complianceRowheader: [],
			complianceTableKey: 0,
			activeTab: 0,

			isbusy: true,
			loading: true,

			types: {
				errored: false,
				errormsg: null,
				canadd: false,
				canedit: false,
				candelete: false,
				rowdata: [],
				rowheader: [],
				isbusy: true,
				loading: true,
			},
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		await this.loadTypes(permissions)

		if (!permissions.includes("compliance_view_compliancerule")) {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
			this.isbusy = false
			return
		}

		this.canaddcompliance = permissions.includes("compliance_add_compliancerule")
		this.caneditcompliance = permissions.includes("compliance_change_compliancerule")
		this.candeletecompliance = permissions.includes("compliance_delete_compliancerule")
		this.canviewcomplianceaction = permissions.includes("compliance_change_compliancerule")

		await this.loadComplianceInitial()
	},
	methods: {
		async loadComplianceInitial() {
			this.loading = true
			this.isbusy = true
			try {
				const header = await this.$api.generic.options("compliance/rules/")
				this.complianceRowheader = Object.keys(header.actions.POST).filter(
					(f) => !["logic", "created_at", "updated_at"].includes(f)
				)
				await this.getComplianceRules()
				this.complianceTableKey += 1
				this.errored = false
				this.errormsg = null
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
			} finally {
				this.loading = false
				this.isbusy = false
			}
		},

		async getComplianceRules() {
			try {
				const data = await this.$api.generic.get("compliance/rules/")
				const rules = Array.isArray(data) ? data : (data?.results || [])
				// Drop fields excluded from display so they don't leak into the CSV export
				this.complianceRowdata = rules.map(rule => {
					const row = { ...rule }
					delete row.logic
					delete row.created_at
					delete row.updated_at
					return row
				})
			} catch (e) {
				this.complianceRowdata = []
			}
		},

		async reloadComplianceDatatable() {
			await this.getComplianceRules()
			this.complianceTableKey += 1
		},

		async loadTypes(permissions) {
			if (!permissions.includes("compliance_view_compliancetype")) {
				this.types.errormsg = this.$t("message.dont_have_right_to_see")
				this.types.errored = true
				this.types.loading = false
				this.types.isbusy = false
				return
			}
			this.types.canadd = permissions.includes("compliance_add_compliancetype")
			this.types.canedit = permissions.includes("compliance_change_compliancetype")
			this.types.candelete = permissions.includes("compliance_delete_compliancetype")

			this.types.loading = true
			this.types.isbusy = true
			try {
				const header = await this.$api.generic.options("compliance/types/")
				this.types.rowheader = Object.keys(header.actions.POST)
				await this.reloadTypes()
				this.types.errored = false
				this.types.errormsg = null
			} catch (e) {
				this.types.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.types.errored = true
			} finally {
				this.types.loading = false
				this.types.isbusy = false
			}
		},

		async reloadTypes() {
			this.types.isbusy = true
			this.types.rowdata = []
			try {
				const data = await this.$api.generic.get("compliance/types/")
				this.types.rowdata = Array.isArray(data) ? data : (data?.results || [])
				this.types.errored = false
				this.types.errormsg = null
			} catch (e) {
				this.types.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.types.errored = true
			} finally {
				this.types.isbusy = false
			}
		},
	}
}
</script>
