<template>
	<div 
		id="history" 
		class="container-xl"
	>
		<div>
			<PageHeader page-title="history" />

			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<section v-if="errored">
							<Alert 
								:message="errormsg"
								:cols="true"
								variant="danger"
							/>
						</section>

						<div 
							v-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>

						<div v-else>
							<Datatable
								id="deployment-history-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canviewhistory="canviewhistory"
								:isbusy="isbusy"
								title="history"
								translationkey="deployment."
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
	name: 'History',
	data() {
		return {
			errored: false,
			errormsg: null,

			rowdata: [],
			rowheader: [],

			canviewhistory: false,

			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (permissions.includes("history_view_history")) {
			if (permissions.includes("result_view_result")) {
				this.canviewhistory = true
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
				const header = await this.$api.generic.options("deployment/packages/")
				this.rowheader = Object.keys(header.actions.POST).filter(
					(f) => !["result"].includes(f)
				)
				this.rowheader.push("waiting")
				this.rowheader.push("notified")
				this.rowheader.push("success")
				this.rowheader.push("error")

				// Get packages
				await this.getPackages()

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

		async getPackages() {
			try {
				this.isbusy = true

				const data = await this.$api.generic.get(
					"deployment/packages/",
					{},
					{ expand: "result" }
				)

				const packages = Array.isArray(data) ? data : (data?.results || [])

				this.rowdata = packages.map((pkg) => {
					const results = Array.isArray(pkg?.result) ? pkg.result : []

					const stats = results.reduce(
						(acc, r) => {
							if (r?.status === 3) acc.error += 1
							else if (r?.status === 0) acc.success += 1
							else if (r?.status === 2) acc.notified += 1
							else acc.waiting += 1
							return acc
						},
						{ waiting: 0, notified: 0, success: 0, error: 0 }
					)

					return {
						...pkg,
						actions_list: Array.isArray(pkg?.actions_list) ? pkg.actions_list.length : pkg.actions_list,
						...stats,
						result: undefined,
					}
				})

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
			await this.getPackages()
		}
	}
}
</script>