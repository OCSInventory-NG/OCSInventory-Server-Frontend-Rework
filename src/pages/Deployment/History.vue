<template>
	<div 
		id="history" 
		class="container-xl"
	>
		<!-- Header page -->
		<div>
			<PageHeader 
				page-title="history"
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
							<Datatable
								id="deployment-history-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canviewhistory="canviewhistory"
								title="history"
								translationkey="deployment."
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
	name: 'History',
	data() {
		return {
			rowdata: [],
			rowheader: [],
			errormsg: null,
			loading: true,
			errored: false,
			canviewhistory: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	created() {
		if(localStorage.getItem('permissions').split(",").includes("view_history")) {
			if(localStorage.getItem('permissions').split(",").includes("view_result")) {
				this.canviewhistory = true
			}
			this.getHeader()
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
		}
	},
	methods: {
		getHeader() {
			axios.options(import.meta.env.VITE_APP_API_ROUTE+"deployment/packages/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if(field != "result") {
							this.rowheader.push(field)
						}
					})
					this.rowheader.push("waiting")
					this.rowheader.push("success")
					this.rowheader.push("error")

					this.errormsg = null
					this.errored = false
					this.getPackages()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		getPackages() {
			axios.get(import.meta.env.VITE_APP_API_ROUTE+"deployment/packages/", { headers: this.header })
				.then(response => {
					response.data.forEach(packages => {
						packages.actions_list = packages.actions_list.length

						packages.waiting = 0
						packages.success = 0
						packages.error = 0

						if(packages.result) {
							packages.result.forEach(result => {
								if(result.status == 2) {
									packages.error += 1
								} else if(result.status == 1) {
									packages.success += 1
								} else {
									packages.waiting += 1
								}
							})
						}

						delete packages.result
					})
					this.rowdata = response.data

					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
	}
}
</script>