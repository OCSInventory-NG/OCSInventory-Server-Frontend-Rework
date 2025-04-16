<template>
	<div 
		id="netdevice" 
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="netdevice"
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
								id="netdevice-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
								:canaccessdetails="true"
								editcomponent="NetdeviceModal"
								title="netdevice"
								translationkey="network."
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
import axios from 'axios'

export default {
	name: "Netdevice",
	data() {
		return {
			errormsg: null,
			rowdata: [],
			rowheader: [],
			loading: true,
			errored: false,
			canedit: false,
			candelete: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async mounted() {
		if(localStorage.getItem('permissions').split(",").includes("netdevice_view_netdevice")) {
			if(localStorage.getItem('permissions').split(",").includes("netdevice_change_netdevice")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("netdevice_delete_netdevice")) {
				this.candelete = true
			}
			await this.getHeader()
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
		}
	},
	methods: {
		async getHeader() {
			await axios.options(this.$config.BACKEND_API_ROUTE+"netdevices", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						this.rowheader.push(field)
					})
					this.errormsg = null
					this.errored = false
					this.getNetdevice()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		// Retrieve netdevice
		async getNetdevice() {
			var extendedRoute = "/"
			if(this.$route.params.id) extendedRoute = "?network="+this.$route.params.id

			await axios.get(this.$config.BACKEND_API_ROUTE+"netdevices"+extendedRoute, { headers: this.header })
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
		},
		async reloadDatatable() {
			this.loading = true
			await this.getNetdevice()
		}
	}
}
</script>