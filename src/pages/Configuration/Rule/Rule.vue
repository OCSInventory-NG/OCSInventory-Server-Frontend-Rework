<template lang="">
	<div
		id="rules"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="rules" />

			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<div v-if="errored">
							<Alert
								:message="errormsg"
								:cols="true"
								variant="danger"
							/>
						</div>

						<div
							v-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>

						<div v-else>
							<RuleModal
								v-if="canadd && activeTab < triggers.length"
								@reload-datatable="reloadDatatable"
							/>
							<ComplianceRuleModal
								v-if="canaddcompliance && activeTab >= triggers.length"
								@reload-datatable="reloadComplianceDatatable"
							/>

							<b-tabs
								v-model="activeTab"
								content-class="mt-3"
								fill
							>
								<b-tab
									v-for="trigger in triggers"
									:key="trigger.trigger"
									:title="$t('rule.' + trigger.trigger)"
								>
									<Draggable
										id="rules-datatable"
										:key="`${trigger.trigger}-${draggableKey}`"
										:rowdata="getRuleRows(trigger.trigger)"
										:rowheader="rowheader"
										:candelete="candelete"
										:canedit="canedit"
										:canviewruleaction="canviewaction"
										:isbusy="isbusy"
										:apiroute="`automation/rule`"
										is-sticky
										editcomponent="RuleModal"
										title="automation/rule"
										translationkey="rule."
										@reload-datatable="reloadDatatable"
									/>
								</b-tab>
								<b-tab
									v-if="canviewcompliance"
									:title="$t('compliance.title')"
								>
									<Draggable
										id="compliance-rules-datatable"
										:key="`compliance-${complianceDraggableKey}`"
										:rowdata="complianceRowdata"
										:rowheader="complianceRowheader"
										:candelete="candeletecompliance"
										:canedit="caneditcompliance"
										:canviewruleaction="canviewcomplianceaction"
										ruleactionroute="/configurations/compliance/rules"
										:apiroute="'compliance/rules'"
										is-sticky
										editcomponent="ComplianceRuleModal"
										title="compliance/rules"
										translationkey="compliance."
										@reload-datatable="reloadComplianceDatatable"
									/>
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
	name: "Rule",
	data() {
		return {
			errormsg: null,
			errored: false,

			canadd: false,
			canedit: false,
			candelete: false,
			canview: false,
			canviewaction: false,

			canviewcompliance: false,
			canaddcompliance: false,
			caneditcompliance: false,
			candeletecompliance: false,
			canviewcomplianceaction: false,

			triggers: [],
			rowdata: [],
			rowheader: [],
			draggableKey: 0,

			complianceRowdata: [],
			complianceRowheader: [],
			complianceDraggableKey: 0,
			activeTab: 0,

			excludefields: ["logic", "actions"],

			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		this.canview = permissions.includes("rule_view_rule")

		if (this.canview) {
			this.canadd = permissions.includes("rule_add_rule")
			this.canedit = permissions.includes("rule_change_rule")
			this.candelete = permissions.includes("rule_delete_rule")
			this.canviewaction = permissions.includes("rule_view_action")
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
			this.isbusy = false
			return
		}

		if (permissions.includes("compliance_view_compliancerule")) {
			this.canviewcompliance = true
			this.canaddcompliance = permissions.includes("compliance_add_compliancerule")
			this.caneditcompliance = permissions.includes("compliance_change_compliancerule")
			this.candeletecompliance = permissions.includes("compliance_delete_compliancerule")
			this.canviewcomplianceaction = permissions.includes("compliance_change_compliancerule")
		}

		await this.loadInitial()
		if (this.canviewcompliance) {
			this.loadComplianceInitial()
		}
	},
	methods: {
		async loadInitial() {
			this.loading = true
			this.isbusy = true
			try {
				const header = await this.$api.generic.options("automation/rule/")
				this.rowheader = Object.keys(header.actions.POST).filter(
					(f) => !this.excludefields.includes(f)
				)
				await this.getTriggers()
				await this.getRules()

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

		async getTriggers() {
			try {
				const data = await this.$api.generic.get("automation/triggers/")
				this.triggers = Array.isArray(data) ? data : (data?.results || [])
			} catch (e) {
				this.triggers = []
			}
		},

		async getRules() {
			try {
				this.isbusy = true

				const data = await this.$api.generic.get("automation/rule/")
				const rules = Array.isArray(data) ? data : (data?.results || [])

				this.rowdata = rules.map((rule) => ({
					...rule,
					trigger: this.$t("rule." + rule.trigger),
					trigger_raw: rule.trigger,
				}))

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error)
					? e.response.data.error
					: e.message
				this.errored = true
			} finally {
				this.isbusy = false
			}
		},

		getRuleRows(triggerName) {
			return this.rowdata
				.filter((row) => row.trigger_raw === triggerName)
				.sort((a, b) => (a?.priority ?? 0) - (b?.priority ?? 0))
		},

		async reloadDatatable() {
			await this.getRules()
			this.draggableKey += 1
		},

		async loadComplianceInitial() {
			try {
				const header = await this.$api.generic.options("compliance/rules/")
				this.complianceRowheader = Object.keys(header.actions.POST).filter(
					(f) => !["logic", "created_at", "updated_at"].includes(f)
				)
				await this.getComplianceRules()
				this.complianceDraggableKey += 1
			} catch (e) {
				// non-fatal, compliance tab will be empty
			}
		},

		async getComplianceRules() {
			try {
				const data = await this.$api.generic.get("compliance/rules/")
				const rules = Array.isArray(data) ? data : (data?.results || [])
				this.complianceRowdata = rules.map(rule => ({ ...rule }))
			} catch (e) {
				this.complianceRowdata = []
			}
		},

		async reloadComplianceDatatable() {
			await this.getComplianceRules()
			this.complianceDraggableKey += 1
		},
	}
}
</script>
