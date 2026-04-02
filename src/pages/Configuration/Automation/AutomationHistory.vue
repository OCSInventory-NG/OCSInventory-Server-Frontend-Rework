<template>
	<div 
		id="automation-history"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="history" />

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
							<Datatable
								id="scheduler-history-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:usecheckbox="false"
								:isbusy="isbusy"
								sortby="date"
								sortdesc="desc"
								title="automation/history"
								translationkey="scheduler."
								@reload-datatable="reloadDatatable"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "AutomationHistory",
	data() {
		return {
			errored: false,
			errormsg: null,

			rowheader: [],
			rowdata: [],

			canview: false,

			status: {
				0: this.$t("scheduler.in_progress"),
				1: this.$t("scheduler.success"),
				2: this.$t("scheduler.in_error")
			},

			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (!permissions.includes("history_view_history")) {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
			this.isbusy = false
			return
		}

		// Data init
		await this.loadInitial()

		await this.getHeader()
		await this.getAutomationHistory()
	},
	methods: {
		async loadInitial() {
			this.loading = true
			this.isbusy = true
			try {
				// Get header
				const header = await this.$api.generic.options("automation/history/")
				this.rowheader = Object.keys(header.actions.POST)

				// Get scheduler history
				await this.getAutomationHistory()

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

		async getAutomationHistory() {
			this.isbusy = true
			this.rowdata = []

			try {
				const id = this.$route?.params?.id || ""

				const data = await this.$api.generic.get(
					"automation/history/",
					{},
					{
						scheduler: id || null,
						expand: "scheduler",
					}
				)

				const histories = Array.isArray(data) ? data : (data?.results || [])

				this.rowdata = histories.map((h) => ({
					...h,
					scheduler: h?.scheduler?.name ?? h.scheduler,
					status: this.status?.[h.status] ?? h.status,
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

		async reloadDatatable() {
			await this.getAutomationHistory()
		},
	}
}
</script>