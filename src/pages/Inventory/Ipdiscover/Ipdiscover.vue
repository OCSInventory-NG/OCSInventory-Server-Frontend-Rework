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
							<IpdiscoverCollapse 
								v-for="(value, key) in rowdata"
								:key="key"
								:rowdata="value.networks"
								:rowheader="rowheader"
								:groupname="value.name"
								:groupdescription="value.description"
								:groupid="value.id"
								:candelete="candelete"
								:canedit="canedit"
								:canaccesschild="canviewnetdevice"
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
import PageHeader from '@/components/Header/PageHeader.vue'
import IpdiscoverCollapse from '@/components/Collapse/Ipdiscover/IpdiscoverCollapse.vue'

export default {
	name: "Ipdiscover",
	components: { IpdiscoverCollapse, PageHeader },
	data() {
		return {
			errorMsg: null,
			rowdata: [],
			rowheader: {
				id: "id",
				name: "name",
				description: "description",
				netid: "netid",
				nettag: "nettag",
				mask: "mask",
				netdevices: "netdevices",
			},
			networkdata: [],
			netgroupdata: [],
			loading: true,
			errored: false,
			canedit: false,
			candelete: false,
			canviewnetdevice: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	mounted() {
		if(localStorage.getItem('permissions').split(",").includes("view_network")) {
			if(localStorage.getItem('permissions').split(",").includes("change_network")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_network")) {
				this.candelete = true
			}
			if(localStorage.getItem('permissions').split(",").includes("view_netdevice")) {
				this.canviewnetdevice = true
			}
			this.getNetworks()
		} else {
			this.errorMsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
		}
	},
	methods: {
		// Retrieve networks group
		getNetGroup() {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"netgroups/", { headers: this.header })
				.then(response => {
					this.netgroupdata = response.data
					this.errorMsg = null
					this.errored = false
					this.dataFormatting()
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		// Retrieve networks
		getNetworks() {
			this.networkdata = []
			this.netgroupdata = []
			this.rowdata = []
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"networks/", { headers: this.header })
				.then(response => {
					this.networkdata = response.data
					this.errorMsg = null
					this.errored = false
					this.getNetGroup()
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		// End, formatting datas to be displayed
		dataFormatting() {
			// Create UNKNOWN group
			this.rowdata.push({
				id: null,
				name: this.$t("network.unknown_network"),
				description: "",
				networks: []
			})
			// Insert existing group
			this.netgroupdata.forEach(netgroup => {
				this.rowdata.push({
					id: netgroup.id,
					name: netgroup.name,
					description: netgroup.description,
					networks: []
				})
			});
			// Push networks in groups
			this.rowdata.forEach(row => {
				this.networkdata.forEach(network => {
					if(network.group == row.id) {
						row.networks.push({
							id: network.id,
							name: network.name,
							description: network.description,
							netid: network.netid,
							nettag: network.nettag,
							mask: network.mask,
							netdevices: network.netdevices.length,
						})
					}
				})
			})

			this.rowheader = Object.values(this.rowheader)

			this.loading = false
		},
		reloadDatatable() {
			this.getNetworks()
		}
	}
}
</script>