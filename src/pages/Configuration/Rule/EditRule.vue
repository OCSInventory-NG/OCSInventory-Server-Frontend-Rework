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
							variant="success"
						/>
					</section>

					<!-- Display error box message -->
					<section v-if="errored && errorCode == null">
						<Alert 
							:message="errorMsg.message" 
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
									:message="errorMsg" 
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
										@reloadRule="reloadRule"
									/>
									<RuleAction
										v-if="rulemenu.value == 'actions'"
										:id="id"
										:trigger="trigger"
										:actions="actions"
										:triggers="triggers"
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
import Axios from 'axios'
import PageHeader from '@/components/Header/PageHeader.vue'
import RuleCriteria from '@/components/Rule/RuleCriteria.vue'
import RuleAction from '@/components/Rule/RuleAction.vue'

export default {
	name: "EditRule",
	components: { PageHeader, RuleCriteria, RuleAction },
	props: {
		id: { type: String, required: true },
	},
	data() {
		return {
			errorMsg: null,
			errorCode: null,
			loading: true,
			errored: false,
			successed: false,
			succesMsg: null,
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
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 5000)
		}
	},
	mounted() {
		this.getTriggerModels()
	},
	methods: {
		getTriggerModels() {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"automation/triggers/", { headers: this.header })
				.then(response => {
					this.triggers = response.data
					this.getRuleInfo()
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
		},
		getRuleInfo() {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"automation/rule/"+this.id, { headers: this.header })
				.then(response => {
					this.rule = response.data
					this.trigger = response.data.trigger
					this.logic = response.data.logic
					this.actions = response.data.actions
					this.errorMsg = null
					this.errored = false
					this.loading = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		reloadRule() {
			this.getRuleInfo()
		}
	}
}
</script>