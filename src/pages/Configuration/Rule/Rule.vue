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
								v-if="canadd"
								@reload-datatable="reloadDatatable"
							/>

							<b-tabs 
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

			triggers: [],
			rowdata: [],
			rowheader: [],
			draggableKey: 0,

			excludefields: ["logic", "actions"],

			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (permissions.includes("rule_view_rule")) {
			this.canview = true
			if (permissions.includes("rule_add_rule")) {
				this.canadd = true
			}
			if (permissions.includes("rule_change_rule")) {
				this.canedit = true
			}
			if (permissions.includes("rule_delete_rule")) {
				this.candelete = true
			}
			if (permissions.includes("rule_view_action")) {
				this.canviewaction = true
			}
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
			this.isbusy = false
			return
		}

		// Data init
		await this.loadInitial()
	},
	methods: {
		async loadInitial() {
			this.loading = true
			this.isbusy = true
			try {
				// Get header
				const header = await this.$api.generic.options("automation/rule/")
				this.rowheader = Object.keys(header.actions.POST).filter(
					(f) => !this.excludefields.includes(f)
				)
				//Get triggers
				await this.getTriggers()
				// Get rules
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
		}
	}
}
</script>