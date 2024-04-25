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
			user: null,
			groups: [],
			canedit: false,
			candelete: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	mounted() {
		if(localStorage.getItem('permissions').split(",").includes("view_assetgroup")) {
			if(localStorage.getItem('permissions').split(",").includes("change_assetgroup")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_assetgroup")) {
				this.candelete = true
			}
			this.getHeader()
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	},
	methods: {
		getHeader() {
			axios.options(import.meta.env.VITE_APP_API_ROUTE+"asset/groups/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if(field != "search" && field != "assets") {
							this.rowheader.push(field)
						}
					})
					this.errormsg = null
					this.errored = false
					this.getAssetGroups()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		getAssetGroups() {
			axios.get(import.meta.env.VITE_APP_API_ROUTE+"asset/groups/", { headers: this.header })
				.then(response => {
					for (const group of response.data) {
						group.visibility = this.$t("assetgroup."+group.visibility)
						group.is_dynamic = this.$t("generic."+group.is_dynamic)
						group.allow_group_modification = this.$t("generic."+group.allow_group_modification)
					}
					this.rowdata = response.data
					this.errormsg = null
					this.errored = false
					this.getUserName()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		getUserName() {
			for (const group of this.rowdata) {
				axios.get(import.meta.env.VITE_APP_API_ROUTE+"users/"+group.user, { headers: this.header })
					.then(response => {
						if(response.data.first_name != "") {
							group.user = response.data.last_name.concat(" ", response.data.first_name)
						} else {
							group.user = response.data.username
						}
					})
					.catch(e => {
						this.errormsg = e.message
						this.errored = true
					})
			}
			this.getGroups()
		},
		getGroups() {
			for (const [key, row] of Object.entries(this.rowdata)) {
				this.groups[key] = []
				if(row.groups) {
					for (const group of row.groups) {
						this.loading = true
						axios.get(import.meta.env.VITE_APP_API_ROUTE+"groups/"+group, { headers: this.header })
							.then(response => {
								this.loading = true
								this.groups[key].push(response.data.name)
								this.rowdata[key].groups = this.groups[key].join(", ")
							})
							.catch(e => {
								this.errormsg = e.message
								this.errored = true
							})
							.finally(() => { this.loading = false })
					}
				}
			}

			this.loading = false
		},
		reloadDatatable() {
			this.getAssetGroups()
		}
	}
}
</script>