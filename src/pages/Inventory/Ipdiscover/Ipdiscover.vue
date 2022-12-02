<template>
	<div 
		id="ipdiscover" 
		class="container-xl"
	>
		<!-- Error box message -->
		<section v-if="errored">
			<Alert 
				:message="errorMsg" 
				variant="danger"
			/>
		</section>

		<section v-else>
			<div v-if="loading">
				<Loader />
			</div>

			<div v-else>
				<!-- Page header -->
				<PageHeader 
					page-title="ipdiscover"
				/>
				<!-- Display Collapse -->
				<div class="page-body">
					<div class="card">
						<div class="card-body">
							<IpdiscoverCollapse 
								v-for="(value, key) in rowdata"
								:key="key"
								:rowdata="value.networks"
								:groupname="value.name"
								:groupdescription="value.description"
								:groupid="value.id"
								:candelete="candelete"
								:canedit="canedit"
								@reloadDatatable="reloadDatatable"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
import i18n from '../../../i18n'
import Loader from '@/components/Loader/Loader'
import Alert from '@/components/Alert/Alert'
import PageHeader from '@/components/Header/PageHeader'
import IpdiscoverCollapse from '@/components/Collapse/Ipdiscover/IpdiscoverCollapse'

export default {
	name: "Ipdiscover",
	components: { Loader, IpdiscoverCollapse, Alert, PageHeader },
	data() {
		return {
			errorMsg: null,
			rowdata: [],
			networkdata: [],
			netgroupdata: [],
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
		if(localStorage.getItem('permissions').split(",").includes("view_network")) {
			if(localStorage.getItem('permissions').split(",").includes("change_network")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_network")) {
				this.candelete = true
			}
			this.getNetworks()
		} else {
			this.errorMsg = i18n.t("dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	},
	methods: {
		// Retrieve networks group
		getNetGroup() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"netgroups/", { headers: this.header })
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
			Axios.get(process.env.VUE_APP_API_ROUTE+"networks/", { headers: this.header })
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
				name: i18n.t("unknown_network"),
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

			this.loading = false
		},
		reloadDatatable() {
			this.getNetworks()
		}
	}
}
</script>