<template lang="">
	<div
		id="edit-rule"
		class="container-xl"
	>
		<!-- Page header -->
		<PageHeader 
			page-title="rules"
		/>
		<!-- Display Datatable -->
		<div class="page-body">
			<div class="card">
				<div class="card-body">
					<!-- Display success box message -->
					<section v-if="successed">
						<Alert 
							:message="$t('message.success_saved')"
							:cols="true" 
							variant="success"
						/>
					</section>

					<!-- Display error box message -->
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
							<!-- Display error box message -->
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
										@reloadRule="reloadRule"
									/>
									<RuleAction
										v-if="rulemenu.value == 'actions'"
										:id="id"
										:trigger="trigger"
										:actions="actions"
										:triggers="triggers"
										:view-only="viewOnly"
										@reloadRule="reloadRule"
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
import axios from 'axios'

export default {
	name: "EditRule",
	props: {
		id: { type: String, required: true },
	},
	data() {
		return {
			errormsg: null,
			errorCode: null,
			loading: true,
			errored: false,
			successed: false,
			successmsg: null,
			trigger: null,
			triggers: {},
			logic: {},
			actions: [],
			rule: [],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			rulemenus: [
				{ value: "logic", text: this.$t("rule.logic"), enabled: true },
				{ value: "actions", text: this.$t("rule.actions"), enabled: true },
			]
		}
	},
	computed: {
		viewOnly() {
			return !localStorage.getItem('permissions') ?.split(',').includes('rule_change_rule')
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 5000)
		}
	},
	async mounted() {
		await this.getTriggerModels()
	},
	methods: {
		async getTriggerModels() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"automation/triggers/", { headers: this.header })
				.then(response => {
					this.triggers = response.data
					this.getRuleInfo()
				})
				.catch(e => {
					this.errormsg = e
					this.errored = true
				})
		},
		async getRuleInfo() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"automation/rule/"+this.id+"/?expand=actions",
				{ headers: this.header })
				.then(response => {
					this.rule = response.data
					this.trigger = response.data.trigger
					this.logic = response.data.logic
					this.actions = response.data.actions
					this.errormsg = null
					this.errored = false
					this.loading = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		async reloadRule() {
			await this.getRuleInfo()
		}
	}
}
</script>