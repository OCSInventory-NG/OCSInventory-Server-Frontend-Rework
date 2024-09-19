<template>
	<div 
		id="network-group" 
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="netgroup"
			/>
			<!-- Display Datatable -->
			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Error box message -->
						<div v-if="errored">
							<Alert 
								:message="errormsg" 
								variant="danger"
							/>
						</div>

						<div 
							v-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>

						<div v-else>
							<NetworkGroupModal
								v-if="canadd"
								@reloadDatatable="reloadDatatable"
							/>
							<Datatable
								id="netgroup-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
								editcomponent="NetworkGroupModal"
								title="netgroups"
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
	name: "NetworkGroup",
	data() {
		return {
			canadd: false,
			canedit: false,
			candelete: false,
			canview: false,
			rowdata: [],
			rowheader: [],
			errored: false,
			errormsg: null,
			loading: true,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async mounted() {
		if(localStorage.getItem('permissions').split(",").includes("netgroup_view_netgroup")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("netgroup_add_netgroup")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("netgroup_change_netgroup")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("netgroup_delete_netgroup")) {
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
			await axios.options(this.$config.BACKEND_API_ROUTE+"netgroups/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						this.rowheader.push(field)
					})
					this.errormsg = null
					this.errored = false
					this.getNetgroup()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		async getNetgroup() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"netgroups/", { headers: this.header })
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
			await this.getNetgroup()
		}
	}
}
</script>