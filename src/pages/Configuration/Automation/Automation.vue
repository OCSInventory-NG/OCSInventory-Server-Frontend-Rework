<template>
	<div 
		id="automatique-action"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="automations" />

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
							<AutomationModal
								v-if="canadd"
								@reloadDatatable="reloadDatatable"
							/>

							<Datatable
								id="scheduler-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:candelete="candelete"
								:canedit="canedit"
								:viewautomationhistory="true"
								:isbusy="isbusy"
								editcomponent="AutomationModal"
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
export default {
	name: "Automation",
	data() {
		return {
			errored: false,
			errormsg: null,

			rowdata: [],
			rowheader: [],
			config: [],

			canadd: false,
			canedit: false,
			candelete: false,
			canview: false,

			days: [
				this.$t('scheduler.monday'),
				this.$t('scheduler.tuesday'),
				this.$t('scheduler.wednesday'),
				this.$t('scheduler.thursday'),
				this.$t('scheduler.friday'),
				this.$t('scheduler.saturday'),
				this.$t('scheduler.sunday')
			],

			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (permissions.includes("scheduler_view_scheduler")) {
			this.canview = true
			if (permissions.includes("scheduler_add_scheduler")) {
				this.canadd = true
			}
			if (permissions.includes("scheduler_change_scheduler")) {
				this.canedit = true
			}
			if (permissions.includes("scheduler_delete_scheduler")) {
				this.candelete = true
			}
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
			this.isbusy = false
			return
		}

		// Data init
		this.loadInitial()
	},
	methods: {
		async loadInitial() {
			this.loading = true
			this.isbusy = true
			try {
				// Get header
				const header = await this.$api.generic.options("automation/scheduler/")
				this.rowheader = Object.keys(header.actions.POST).filter((f) => f !== "is_protected")

				// Get schedulers
				await this.getSchedulers()

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

		async getSchedulers() {
			this.isbusy = true
			this.rowdata = []

			try {
				const data = await this.$api.generic.get("automation/scheduler/")
				const schedulers = Array.isArray(data) ? data : (data?.results || [])

				this.rowdata = schedulers.map((s) => ({
					...s,
					active: this.$t("generic." + s.active),
					recurrence: this.$t("scheduler." + s.recurrence),
					day_of_week: this.days?.[s.day_of_week] ?? s.day_of_week,
				}))

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.isbusy = false
			}
		},

		async reloadDatatable() {
			await this.getSchedulers()
		},
	}
}
</script>