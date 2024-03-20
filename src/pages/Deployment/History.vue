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
import Axios from 'axios'
import Loader from '@/components/Loader/Loader.vue'
import Alert from '@/components/Alert/Alert.vue'
import Datatable from '@/components/Datatable/Datatable.vue'
import PageHeader from '@/components/Header/PageHeader.vue'

export default {
	name: 'History',
	components: { Loader, Alert, Datatable, PageHeader },
	data() {
		return {
			rowdata: [],
			rowheader: [],
			errorMsg: null,
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
			this.errorMsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
		}
	},
	methods: {
		getHeader() {
			Axios.options(import.meta.env.VITE_APP_API_ROUTE+"deployment/packages/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if(field != "result") {
							this.rowheader.push(field)
						}
					})
					this.rowheader.push("waiting")
					this.rowheader.push("success")
					this.rowheader.push("error")

					this.errorMsg = null
					this.errored = false
					this.getPackages()
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		getPackages() {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"deployment/packages/", { headers: this.header })
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

					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
	}
}
</script>