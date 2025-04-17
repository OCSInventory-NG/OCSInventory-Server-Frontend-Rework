<template>
	<div 
		id="automatique-action"
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="automaticactions"
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
							<AutomaticActionModal
								v-if="canadd"
								@reloadDatatable="reloadDatatable"
							/>
							<Datatable
								id="scheduler-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:candelete="candelete"
								:canedit="canedit"
								editcomponent="AutomaticActionModal"
								title="automation/scheduler"
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
	name: "AutomaticAction",
	data() {
		return {
			canadd: false,
			canedit: false,
			candelete: false,
			canview: false,
			rowdata: [],
			rowheader: [],
			config: [],
			errored: false,
			errormsg: null,
			loading: true,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async mounted() {
		if(localStorage.getItem('permissions').split(",").includes("scheduler_view_scheduler")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("scheduler_change_scheduler")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("scheduler_delete_scheduler")) {
				this.candelete = true
			}
			await this.getHeader()
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
		}
	},
	methods: {
		async getHeader() {
			await axios.options(this.$config.BACKEND_API_ROUTE+"automation/scheduler/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						this.rowheader.push(field)
					})
					this.errormsg = null
					this.errored = false
					this.getSchedulers()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		async getSchedulers() {
			this.rowdata = []
			await axios.get(this.$config.BACKEND_API_ROUTE+"automation/scheduler/", { headers: this.header })
				.then(response => {
					for (const scheduler of response.data) {
						scheduler.active = this.$t("generic."+scheduler.active)
						scheduler.recurrence = this.$t("scheduler."+scheduler.recurrence)
						this.rowdata.push(scheduler)
					}
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		async reloadDatatable() {
			this.loading = true
			await this.getSchedulers()
		},
	}
}
</script>