<template>
	<div 
		id="ipdiscover" 
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="ipdiscover"
			/>
			<!-- Display Collapse -->
			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Error box message -->
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
							<b-tabs
								content-class="col-10"
								pills
								card
								vertical
							>
								<b-tab
									v-for="netgroup in netgroups"
									:key="netgroup.id"
									:title="netgroup.name"
									title-item-class="ocs-menu-tab"
									lazy
								>
									<Datatable
										id="networks-datatable"
										:rowdata="netgroup.networks"
										:rowheader="rowheader"
										title="networks"
										:candelete="candelete"
										:canedit="canedit"
										:canaccesschild="true"
										:hiddenfields="hiddenfields"
										editcomponent="NetworkModal"
										translationkey="network."
										@reloadDatatable="reloadDatatable"
									/>
								</b-tab>
							</b-tabs>
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
	name: "Ipdiscover",
	data() {
		return {
			errormsg: null,
			rowdata: [],
			rowheader: [],
			netgroups: [],
			loading: true,
			errored: false,
			canedit: false,
			candelete: false,
			canviewnetdevice: false,
			hiddenfields: ["id"],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async mounted() {
		if(localStorage.getItem('permissions').split(",").includes("network_view_network")) {
			if(localStorage.getItem('permissions').split(",").includes("network_change_network")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("network_delete_network")) {
				this.candelete = true
			}
			if(localStorage.getItem('permissions').split(",").includes("netdevice_view_netdevice")) {
				this.canviewnetdevice = true
			}
			await this.getHeader()
			await this.getNetgroups()
			await this.getNetworks()
			this.loading = false
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
		}
	},
	methods: {
		async getHeader() {
			await axios.options(this.$config.BACKEND_API_ROUTE+"networks", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if(field != "group") {
							this.rowheader.push(field)
						}
					})

					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		async getNetgroups() {
			this.netgroups = []
			await axios.get(this.$config.BACKEND_API_ROUTE+"netgroups/", { headers: this.header })
				.then(response => {
					this.netgroups.push({
						id: 0,
						name: this.$t("network.unknown_network"),
						description: "",
						networks: []
					})

					for (const netgroup of response.data) {
						this.netgroups.push({
							id: netgroup.id,
							name: netgroup.name,
							description: netgroup.description,
							networks: []
						})
					}

					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		async getNetworks() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"networks/", { headers: this.header })
				.then(response => {
					for (const network of response.data) {
						const group = this.netgroups.find(g => g.id === network.group)
						network.netdevices = network.netdevices.length
						if (group) {
							group.networks.push(network)
						} else {
							this.netgroups[0].networks.push(network)
						}
					}

					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		async reloadDatatable() {
			this.loading = true
			await this.getNetgroups()
			await this.getNetworks()
			this.loading = false
		}
	}
}
</script>