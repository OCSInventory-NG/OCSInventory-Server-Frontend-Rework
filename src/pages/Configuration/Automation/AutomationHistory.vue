<template>
	<div 
		id="automation-history"
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="history"
			/>
			<!-- Display Datatable -->
			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Error box message -->
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
							<Datatable
								id="scheduler-history-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:usecheckbox="false"
								title="automation/history"
								translationkey="scheduler."
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
	name: "AutomationHistory",
	data() {
		return {
			errored: false,
			errormsg: null,
			loading: true,
			rowheader: [],
			rowdata: [],
			status: {
				0: this.$t("scheduler.in_progress"),
				1: this.$t("scheduler.success"),
				2: this.$t("scheduler.in_error")
			},
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async mounted() {
		await this.getHeader()
		await this.getAutomationHistory()
	},
	methods: {
		async getHeader() {
			await axios.options(this.$config.BACKEND_API_ROUTE+"automation/history/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						this.rowheader.push(field)
					})
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		async getAutomationHistory() {
			this.rowdata = []
			var id = ""
			if(this.$route.params.id) id = this.$route.params.id
			await axios.get(this.$config.BACKEND_API_ROUTE+"automation/history?scheduler="+id+"&expand=scheduler",
				{ headers: this.header })
				.then(response => {
					this.rowdata = response.data
					for (const history of response.data) {
						history.scheduler = history.scheduler.name
						history.status = this.status[history.status]
					}
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		async reloadDatatable() {
			this.loading = true
			await this.getAutomationHistory()
		},
	}
}
</script>