<template>
	<div
		id="inventory-log"
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="inventory_logs"
			/>
			<!-- Display Collapse -->
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
								id="logs-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:usecheckbox="false"
								title="inventory_logs"
								translationkey="inventory."
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
	name: "InventoryLog",
	data() {
		return {
			errormsg: null,
			rowdata: [],
			rowheader: [],
			loading: true,
			errored: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	mounted() {
		this.getHeader()
	},
	methods: {
		getHeader() {
			axios.options(import.meta.env.VITE_APP_API_ROUTE+"asset/logs", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						this.rowheader.push(field)
					})
					this.errormsg = null
					this.errored = false
					this.getLogs()
				})
				.catch(e => {
					console.log(e)
					this.errormsg = e.message
					this.errored = true
				})
		},
		// Retrieve logs
		getLogs() {
			var extendedRoute = "/"
			if(this.$route.params.id) extendedRoute = "?asset="+this.$route.params.id

			axios.get(import.meta.env.VITE_APP_API_ROUTE+"asset/logs"+extendedRoute, { headers: this.header })
				.then(response => {
					this.rowdata = response.data
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