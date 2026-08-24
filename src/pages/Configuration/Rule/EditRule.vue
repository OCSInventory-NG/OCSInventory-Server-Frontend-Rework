<template lang="">
	<div
		id="edit-rule"
		class="container-xl"
	>
		<PageHeader
			page-title="rules"
			:breadcrumb-label="rule.description"
		/>

		<div class="page-body">
			<div class="card">
				<div class="card-body">
					<section v-if="successed">
						<Alert 
							:message="$t('message.success_saved')"
							:cols="true" 
							variant="success"
						/>
					</section>

					<section v-if="errored && errorCode == null">
						<Alert 
							:message="errormsg.message"
							:cols="true"
							variant="danger"
						/>
					</section>

					<section v-else>
						<div 
							v-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>

						<div v-else>
							<div v-if="errored && errorCode != null">
								<Alert 
									:message="errormsg"
									:cols="true"
									variant="danger"
								/>
							</div>

							<b-row class="text-center">
								<h2>{{ rule.description }}</h2>
							</b-row>
							<b-row class="text-center">
								<b-col>
									<p>{{ $t('rule.trigger') }} : {{ $t("rule." + rule.trigger) }}</p>
									<p>{{ $t('rule.enabled') }} : {{ $t("generic." + rule.enabled) }}</p>
								</b-col>
							</b-row>

							<b-tabs 
								content-class="mt-3"
								fill
							>
								<b-tab
									v-for="rulemenu in rulemenus"
									:key="rulemenu.value"
									:title="rulemenu.text"
								>
									<RuleCriteria
										v-if="rulemenu.value == 'logic'"
										:id="id"
										:trigger="trigger"
										:logic="logic"
										:view-only="viewOnly"
										:supports-inventory-fields="trigger === 'inventory_received'"
										@reload-rule="reloadRule"
									/>

									<RuleAction
										v-if="rulemenu.value == 'actions'"
										:id="id"
										:trigger="trigger"
										:actions="actions"
										:triggers="triggers"
										:view-only="viewOnly"
										@reload-rule="reloadRule"
									/>
								</b-tab>
							</b-tabs>
						</div>
					</section>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "EditRule",
	props: {
		id: { type: String, required: true },
	},
	data() {
		return {
			errored: false,
			errormsg: null,
			errorCode: null,

			successed: false,
			successmsg: null,

			trigger: null,
			triggers: {},
			logic: {},
			actions: [],
			rule: [],

			rulemenus: [
				{ value: "logic", text: this.$t("rule.logic"), enabled: true },
				{ value: "actions", text: this.$t("rule.actions"), enabled: true },
			],

			loading: true,
		}
	},
	computed: {
		viewOnly() {
			return !localStorage.getItem('permissions') ?.split(',').includes('rule_change_rule')
		}
	},
	watch: {
		successed: function() {
			setTimeout(
				() => this.successed = false, 5000
			)
		}
	},
	async mounted() {
		await this.getTriggerModels()
	},
	methods: {
		async getTriggerModels() {
			try {
				const data = await this.$api.generic.get("automation/triggers/")
				this.triggers = Array.isArray(data) ? data : (data?.results || [])

				await this.getRuleInfo()
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : (e.message || String(e))
				this.errored = true
			}
		},

		async getRuleInfo() {
			try {
				const data = await this.$api.generic.get(
					`automation/rule/${this.id}/`,
					{},
					{ expand: "actions" }
				)

				this.rule = data
				this.trigger = data?.trigger
				this.logic = data?.logic
				this.actions = data?.actions

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : (e.message || String(e))
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async reloadRule() {
			await this.getRuleInfo()
		}
	}
}
</script>