<template>
	<div 
		id="result"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="result" />

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
							<div class="row row-deck row-cards">
								<Counter 
									firsttitle="deployment.waiting"
									:firstcount="count.waiting"
									classstyle="col-sm-6 col-lg-3"
								/>
								<Counter 
									firsttitle="deployment.notified"
									:firstcount="count.notified"
									classstyle="col-sm-6 col-lg-3"
								/>
								<Counter 
									firsttitle="deployment.success"
									:firstcount="count.success"
									classstyle="col-sm-6 col-lg-3"
								/>
								<Counter 
									firsttitle="deployment.error"
									:firstcount="count.error"
									classstyle="col-sm-6 col-lg-3"
								/>
							</div>

							<div class="row">
								<div class="col-lg-6">
									<PieChart 
										title="deployment.statistics"
										:options="resultcount.options"
										:series="resultcount.series"
									/>
								</div>
								<div class="col-lg-6">
									<BarChart 
										title="deployment.toperror"
										:options="toperroropt.options"
										:series="toperroropt.series"
									/>
								</div>
							</div>

							<br><br>

							<div>
								<b-tabs
									content-class="mt-4"
									fill
								>
									<b-tab :title="$t('deployment.all')">
										<Datatable
											id="deployment-all-datatable"
											:rowdata="rowdata"
											:rowheader="rowheader"
											:usecheckbox="false"
											:canaccesspackagedetails="true"
											:isbusy="isbusy"
											:canrefresh="false"
											is-sticky
											title="history-all"
											translationkey="deployment."
										/>
									</b-tab>
									<b-tab :title="$t('deployment.waiting')">
										<Datatable
											id="deployment-waiting-datatable"
											:rowdata="rowdatawaiting"
											:rowheader="rowheader"
											:usecheckbox="false"
											:canaccesspackagedetails="true"
											:isbusy="isbusy"
											:canrefresh="false"
											is-sticky
											title="history-waiting"
											translationkey="deployment."
										/>
									</b-tab>
									<b-tab :title="$t('deployment.notified')">
										<Datatable
											id="deployment-notified-datatable"
											:rowdata="rowdatanotified"
											:rowheader="rowheader"
											:usecheckbox="false"
											:canaccesspackagedetails="true"
											:isbusy="isbusy"
											:canrefresh="false"
											is-sticky
											title="history-notified"
											translationkey="deployment."
										/>
									</b-tab>
									<b-tab :title="$t('deployment.success')">
										<Datatable
											id="deployment-success-datatable"
											:rowdata="rowdatasuccess"
											:rowheader="rowheader"
											:usecheckbox="false"
											:canaccesspackagedetails="true"
											:isbusy="isbusy"
											:canrefresh="false"
											is-sticky
											title="history-success"
											translationkey="deployment."
										/>
									</b-tab>
									<b-tab :title="$t('deployment.error')">
										<Datatable
											id="deployment-error-datatable"
											:rowdata="rowdataerror"
											:rowheader="rowheader"
											:usecheckbox="false"
											:canaccesspackagedetails="true"
											:isbusy="isbusy"
											:canrefresh="false"
											is-sticky
											title="history-error"
											translationkey="deployment."
										/>
									</b-tab>
								</b-tabs>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "Result",
	props: {
		id: { type: String, required: true }
	},
	data() {
		return {
			errormsg: null,
			errored: false,

			rowdata: [],
			rowheader: [],
			rowdatawaiting: [],
			rowdatasuccess: [],
			rowdatanotified: [],
			rowdataerror: [],
			count: [],
			resultcount: {
				options: {
					labels: [],
					colors: []
				},
				series: []
			},
			toperroropt: {
				options: {
					chart: {
						id: "error-chart"
					},
					plotOptions: {
						bar: {
							borderRadius: 4,
							horizontal: true,
						}
					},
					xaxis: {
						categories: []
					}
				},
				series: [{
					name: this.$t('deployment.nb'),
					data: []
				}]
			},

			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		// Data init
		await this.loadInitial()
	},
	methods: {
		async loadInitial() {
			this.loading = true
			this.isbusy = true
			try {
				// Get header
				const header = await this.$api.generic.options("deployment/results/")
				this.rowheader = Object.keys(header.actions.POST)

				// Get package results
				await this.getPackageResult()

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

		async getPackageResult() {
			try {
				this.loading = true

				this.resetPackageResultState()
				this.resetPackageResultCharts()

				const results = await this.fetchPackageResults()
				this.rowdata = results

				const stats = this.computePackageStats(results)
				this.applyPackageStats(stats)

				this.updateTopErrorChart(stats.topErrors)
				this.updateResultCountChart(stats.count)
				
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		resetPackageResultState() {
			this.rowdata = []
			this.rowdataerror = []
			this.rowdatasuccess = []
			this.rowdatanotified = []
			this.rowdatawaiting = []
			this.count = { error: 0, waiting: 0, notified: 0, success: 0 }
		},

		resetPackageResultCharts() {
			this.toperroropt.options.xaxis.categories = []
			this.toperroropt.series[0].data = []

			this.resultcount.options.labels = []
			this.resultcount.options.colors = []
			this.resultcount.series = []
		},

		async fetchPackageResults() {
			const data = await this.$api.generic.get(
				"deployment/results/",
				{},
				{ package: this.id, expand: "asset,group" }
			)

			return Array.isArray(data) ? data : (data?.results || [])
		},

		computePackageStats(results) {
			const count = { error: 0, waiting: 0, notified: 0, success: 0 }
			const buckets = {
				error: [],
				waiting: [],
				notified: [],
				success: [],
			}

			const errorCounts = new Map()

			for (const r of results) {
				if (r?.status === 3) {
					count.error += 1
					buckets.error.push(r)

					const key = r?.comment || this.$t("generic.unknown")
					errorCounts.set(key, (errorCounts.get(key) || 0) + 1)
				} else if (r?.status === 0) {
					count.success += 1
					buckets.success.push(r)
				} else if (r?.status === 2) {
					count.notified += 1
					buckets.notified.push(r)
				} else {
					count.waiting += 1
					buckets.waiting.push(r)
				}
			}

			const topErrors = Array.from(errorCounts.entries())
				.map(([error, value]) => ({ error, value }))
				.sort((a, b) => b.value - a.value)
				.slice(0, 6)

			return { count, buckets, topErrors }
		},

		applyPackageStats({ count, buckets }) {
			this.count = count
			this.rowdataerror = buckets.error
			this.rowdatasuccess = buckets.success
			this.rowdatanotified = buckets.notified
			this.rowdatawaiting = buckets.waiting
		},

		updateTopErrorChart(topErrors) {
			topErrors.forEach((e) => {
				this.toperroropt.options.xaxis.categories.push(e.error)
				this.toperroropt.series[0].data.push(e.value)
			})
		},

		updateResultCountChart(count) {
			this.resultcount.options.labels.push(
				this.$t("deployment.waiting"),
				this.$t("deployment.notified"),
				this.$t("deployment.success"),
				this.$t("deployment.error")
			)

			this.resultcount.options.colors.push("#3B82F6", "#F97316", "#22C55E", "#EF4444")

			this.resultcount.series.push(
				count.waiting,
				count.notified,
				count.success,
				count.error
			)
		},
	}
}
</script>