<template lang="">
	<div 
		id="rules" 
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="rules"
			/>
			<!-- Display Datatable -->
			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Error box message -->
						<div v-if="errored">
							<Alert 
								:message="errormsg" 
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
								@reloadDatatable="reloadDatatable"
							/>
							<Datatable
								id="rules-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:candelete="candelete"
								:canedit="canedit"
								:canviewruleaction="canviewaction"
								editcomponent="RuleModal"
								title="automation/rule"
								translationkey="rule."
								@reloadDatatable="reloadDatatable"
							/>
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
	name: "Rule",
	data() {
		return {
			canadd: false,
			canedit: false,
			candelete: false,
			canview: false,
			canviewaction: false,
			rowdata: [],
			rowheader: [],
			loading: true,
			errormsg: null,
			errored: false,
			excludefields: ["logic", "actions"],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async mounted() {
		if(localStorage.getItem('permissions').split(",").includes("rule_view_rule")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("rule_add_rule")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("rule_change_rule")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("rule_delete_rule")) {
				this.candelete = true
			}
			if(localStorage.getItem('permissions').split(",").includes("rule_view_action")) {
				this.canviewaction = true
			}
			await this.getHeader()
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
		}
	},
	methods: {
		async getHeader() {
			await axios.options(this.$config.BACKEND_API_ROUTE+"automation/rule/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if(!this.excludefields.includes(field)) {
							this.rowheader.push(field)
						}
					})
					this.errormsg = null
					this.errored = false
					this.getRules()
				})
				.catch(e => {
					this.errormsg = (e.response.data.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		async getRules() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"automation/rule/", { headers: this.header })
				.then(response => {
					response.data.forEach(element => {
						element.trigger = this.$t("rule." + element.trigger)
					})
					this.rowdata = response.data
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response.data.error) ? e.response.data.error : e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		async reloadDatatable() {
			this.loading = true
			await this.getRules()
		}
	}
}
</script>