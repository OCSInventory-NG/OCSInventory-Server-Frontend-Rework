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
import i18n from '@/i18n'
import Loader from '@/components/Loader/Loader'
import Alert from '@/components/Alert/Alert'
import Datatable from '@/components/Datatable/Datatable'
import PageHeader from '@/components/Header/PageHeader'

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
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	mounted() {
		if(localStorage.getItem('permissions').split(",").includes("view_history")) {
			this.getHeader()
		} else {
			this.errorMsg = i18n.t("message.dont_have_right_to_see")
			this.errored = true
		}
	},
	methods: {
		getHeader() {
			Axios.options(process.env.VUE_APP_API_ROUTE+"deployment/packages/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						this.rowheader.push(field)
					})
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
			Axios.get(process.env.VUE_APP_API_ROUTE+"deployment/packages/", { headers: this.header })
				.then(response => {
					response.data.forEach(packages => {
						packages.actions_list = packages.actions_list.length
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