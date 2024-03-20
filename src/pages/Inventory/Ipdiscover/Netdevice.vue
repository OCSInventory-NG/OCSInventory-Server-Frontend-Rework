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
								id="netdevice-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
								:canaccessdetails="true"
								editcomponent="EditNetdeviceModal"
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
import Axios from 'axios'
import Loader from '@/components/Loader/Loader.vue'
import Alert from '@/components/Alert/Alert.vue'
import PageHeader from '@/components/Header/PageHeader.vue'
import Datatable from '@/components/Datatable/Datatable.vue'

export default {
	name: "Netdevice",
	components: { Loader, Alert, PageHeader, Datatable },
	data() {
		return {
			errorMsg: null,
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
	mounted() {
		if(localStorage.getItem('permissions').split(",").includes("view_netdevice")) {
			if(localStorage.getItem('permissions').split(",").includes("change_netdevice")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_netdevice")) {
				this.candelete = true
			}
			this.getHeader()
		} else {
			this.errorMsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
		}
	},
	methods: {
		getHeader() {
			Axios.options(import.meta.env.VITE_APP_API_ROUTE+"netdevices", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						this.rowheader.push(field)
					})
					this.errorMsg = null
					this.errored = false
					this.getNetdevice()
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		// Retrieve netdevice
		getNetdevice() {
			var extendedRoute = "/"
			if(this.$route.params.id) extendedRoute = "?network="+this.$route.params.id

			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"netdevices"+extendedRoute, { headers: this.header })
				.then(response => {
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
		reloadDatatable() {
			this.getNetdevice()
		}
	}
}
</script>