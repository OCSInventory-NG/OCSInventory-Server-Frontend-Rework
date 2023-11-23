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
								:message="errorMsg" 
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
							<div class="col-lg-6">
								<DonutChart 
									:options="resultcount.options"
									:series="resultcount.series"
								/>
							</div>
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
import Axios from 'axios'
import i18n from '@/i18n'
import Loader from '@/components/Loader/Loader'
import Alert from '@/components/Alert/Alert'
import PageHeader from '@/components/Header/PageHeader'
import Counter from '@/components/Dashboard/Counter/Counter'
import DonutChart from '@/components/Dashboard/Chart/Donut'
import Datatable from '@/components/Datatable/Datatable'

export default {
	name: "Result",
	components: { Loader, Alert, PageHeader, Counter, DonutChart, Datatable },
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
			errorMsg: null,
			errored: false,
			loading: true,
			resultcount: {
				options: {
					labels: []
				},
				series: []
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
			Axios.options(process.env.VUE_APP_API_ROUTE+"deployment/results/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						this.rowheader.push(field)
					})

					this.errorMsg = null
					this.errored = false
					this.getPackageResult()
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		getPackageResult() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"deployment/results/?package="+this.id, { headers: this.header })
				.then(response => {
					this.rowdata = response.data

					this.count.error = 0
					this.count.waiting = 0
					this.count.success = 0

					response.data.forEach(result => {
						if(result.status == 2) {
							this.count.error += 1
							this.rowdataerror.push(result)
						} else if(result.status == 1) {
							this.count.success += 1
							this.rowdatasuccess.push(result)
						} else {
							this.count.waiting += 1
							this.rowdatawaiting.push(result)
						}
					})

					this.resultcount.options.labels.push(i18n.t("deployment.waiting"))
					this.resultcount.options.labels.push(i18n.t("deployment.success"))
					this.resultcount.options.labels.push(i18n.t("deployment.error"))

					this.resultcount.series.push(this.count.waiting)
					this.resultcount.series.push(this.count.success)
					this.resultcount.series.push(this.count.error)

					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		}
	}
}
</script>