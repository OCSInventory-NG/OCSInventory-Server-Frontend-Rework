<template>
	<div 
		id="multisearch" 
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="multisearch"
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

						<div>
							<Search
								@reloadDatatable="reloadDatatable"
							/>
						</div>

						<hr>

						<div 
							v-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>

						<div v-else>
							<Alert 
								v-if="noresult != null"
								:message="noresult" 
								variant="info"
							/>

							<Datatable
								id="search-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canaccessdetails="true"
								:candeploy="true"
								:multisearch="true"
								title="asset"
								translationkey="inventory."
							/>
							<AssetGroupModal 
								:assetrow="assetids"
								:search="rowsearch"
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
	name: "Multisearch",
	data() {
		return {
			errormsg: null,
			rowdata: [],
			rowheader: [],
			rowsearch: [],
			assetids: [],
			loading: true,
			errored: false,
			noresult: null,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async mounted() {
		if(localStorage.getItem('permissions').split(",").includes("inventory_base_view_inventorybase")) {
			await this.getHeader()
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	},
	methods: {
		async getHeader() {
			await axios.options(this.$config.BACKEND_API_ROUTE+"asset/bases/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if(field != "inventory_sections") {
							this.rowheader.push(field)
						}
					})

					this.errormsg = null
					this.errored = false

					this.loading = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		async reloadDatatable(search) {
			this.rowsearch = search
			
			await axios.post(this.$config.BACKEND_API_ROUTE+"search/", this.rowsearch, { headers: this.header })
				.then(response => {
					this.rowdata = []
					this.assetids = []
					this.noresult = null

					response.data.forEach(element => {
						delete element.fields.inventory_sections
						element.fields["id"] = element.pk
						this.rowdata.push(element.fields)
						this.assetids.push(element.pk)
					})

					if(this.rowdata.length == 0) {
						this.noresult = this.$t("search.no_result")
					}

					this.successmsg = "success"
					this.successed = true
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.response.data.error
					this.errored = true
					this.successmsg = null
					this.successed = false
				})
		}
	}
}
</script>