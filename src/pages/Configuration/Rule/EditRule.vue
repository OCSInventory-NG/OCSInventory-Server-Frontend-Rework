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
						<div v-if="loading">
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
										:trigger="trigger"
										:logic="logic"
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
import i18n from '../../../i18n'
import Loader from '@/components/Loader/Loader'
import Alert from '@/components/Alert/Alert'
import PageHeader from '@/components/Header/PageHeader'
import RuleCriteria from '@/components/Rule/RuleCriteria'

export default {
	name: "EditRule",
	components: { Loader, Alert, PageHeader, RuleCriteria },
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
			logic: {},
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			rulemenus: [
				{ value: "logic", text: i18n.t("rule.logic"), enabled: true },
				{ value: "actions", text: i18n.t("rule.actions"), enabled: true },
			]
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 5000)
		}
	},
	mounted() {
		this.getRuleInfo()
	},
	methods: {
		getRuleInfo() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"automation/rule/"+this.id, { headers: this.header })
				.then(response => {
					this.trigger = response.data.trigger
					this.logic = response.data.logic
					this.errorMsg = null
					this.errored = false
					this.loading = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
	}
}
</script>