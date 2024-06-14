<template>
	<div 
		id="result"
		class="container-xl"
	>
		<!-- Header page -->
		<div>
			<PageHeader 
				page-title="result"
			/>
			<!-- Display datatable -->
			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Error box message -->
						<section v-if="errored">
							<Alert 
								:message="errormsg" 
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
									classstyle="col-sm-6 col-lg-4"
								/>
								<Counter 
									firsttitle="deployment.success"
									:firstcount="count.success"
									classstyle="col-sm-6 col-lg-4"
								/>
								<Counter 
									firsttitle="deployment.error"
									:firstcount="count.error"
									classstyle="col-sm-6 col-lg-4"
								/>
							</div>
							<div class="row">
								<div class="col-lg-6">
									<DonutChart 
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
											title="history-waiting"
											translationkey="deployment."
										/>
									</b-tab>
									<b-tab :title="$t('deployment.success')">
										<Datatable
											id="deployment-success-datatable"
											:rowdata="rowdatasuccess"
											:rowheader="rowheader"
											:usecheckbox="false"
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
import axios from 'axios'
import Counter from '@/components/Dashboard/Counter/Counter.vue'
import DonutChart from '@/components/Dashboard/Chart/Donut.vue'
import BarChart from '@/components/Dashboard/Chart/Bar.vue'

export default {
	name: "Result",
	components: { Counter, DonutChart, BarChart },
	props: {
		id: { type: String, required: true }
	},
	data() {
		return {
			rowdata: [],
			rowheader: [],
			rowdatawaiting: [],
			rowdatasuccess: [],
			rowdataerror: [],
			count: [],
			errormsg: null,
			errored: false,
			loading: true,
			resultcount: {
				options: {
					labels: []
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
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	created() {
		this.getHeader()
	},
	methods: {
		getHeader() {
			axios.options(this.$config.VITE_APP_API_ROUTE+"deployment/results/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						this.rowheader.push(field)
					})

					this.errormsg = null
					this.errored = false
					this.getPackageResult()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		getPackageResult() {
			axios.get(this.$config.VITE_APP_API_ROUTE+"deployment/results/?package="+this.id, { headers: this.header })
				.then(response => {
					this.rowdata = response.data

					this.count.error = 0
					this.count.waiting = 0
					this.count.success = 0

					var tmpError = []

					response.data.forEach(result => {
						if(result.status == 2) {
							this.count.error += 1
							this.rowdataerror.push(result)

							if(tmpError[result.comment]) {
								tmpError[result.comment] += 1
							} else {
								tmpError[result.comment] = 1
							}
						} else if(result.status == 1) {
							this.count.success += 1
							this.rowdatasuccess.push(result)
						} else {
							this.count.waiting += 1
							this.rowdatawaiting.push(result)
						}
					})

					var errorArray = []

					Object.keys(tmpError).forEach(error => {
						errorArray.push({
							error: error,
							value: tmpError[error]
						})
					})

					errorArray.sort(function(a, b) {
						return b.value - a.value;
					});

					var index = 0

					errorArray.forEach(error => {
						if(index <= 5) {
							this.toperroropt.options.xaxis.categories.push(error.error)
							this.toperroropt.series[0].data.push(error.value)
						}
						index += 1
					})

					this.resultcount.options.labels.push(this.$t("deployment.waiting"))
					this.resultcount.options.labels.push(this.$t("deployment.success"))
					this.resultcount.options.labels.push(this.$t("deployment.error"))

					this.resultcount.series.push(this.count.waiting)
					this.resultcount.series.push(this.count.success)
					this.resultcount.series.push(this.count.error)

					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		}
	}
}
</script>