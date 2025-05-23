<template>
	<div 
		id="asset-group" 
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="assetgroups"
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
							<Datatable
								id="assetgroup-datatable"
								:rowdata="rowdata"
								:canaccessdetails="true"
								:canedit="canedit"
								:candelete="candelete"
								:rowheader="rowheader"
								:hiddenfields="hiddenfields"
								title="assetgroups"
								translationkey="assetgroup."
								editcomponent="AssetGroupModal"
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
	name: 'AssetGroup',
	data() {
		return {
			errormsg: null,
			rowdata: [],
			rowheader: [],
			loading: true,
			errored: false,
			canedit: false,
			candelete: false,
			hiddenfields: ["id", "allow_group_modification", "groups"],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async mounted() {
		if(localStorage.getItem('permissions').split(",").includes("asset_group_view_assetgroup")) {
			if(localStorage.getItem('permissions').split(",").includes("asset_group_change_assetgroup")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("asset_group_delete_assetgroup")) {
				this.candelete = true
			}
			await this.getHeader()
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	},
	methods: {
		async getHeader() {
			await axios.options(this.$config.BACKEND_API_ROUTE+"asset/groups/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if(field != "search" && field != "assets") {
							this.rowheader.push(field)
						}
					})
					this.rowheader.push("count")
					this.errormsg = null
					this.errored = false
					this.getAssetGroups()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		async getAssetGroups() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"asset/groups/?expand=user,groups",
				{ headers: this.header })
				.then(response => {
					for (const group of response.data) {
						group.visibility = this.$t("assetgroup."+group.visibility)
						group.is_dynamic = this.$t("generic."+group.is_dynamic)
						group.allow_group_modification = this.$t("generic."+group.allow_group_modification)
						group.count = group.assets.length
						group.user = (group.user.first_name != "") ? 
							group.user.last_name.concat(" ", group.user.first_name) : group.user.username
						// Group concat
						var tmpGroup = ""
						if (group.groups) {
							for (const expand of group.groups) {
								tmpGroup += expand.name + "\n"
							}
						}
						group.groups = tmpGroup
					}
					this.rowdata = response.data
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => { this.loading = false })
		},
		async reloadDatatable() {
			this.loading = true
			await this.getAssetGroups()
		}
	}
}
</script>