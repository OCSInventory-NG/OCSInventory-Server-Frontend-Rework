<template>
	<div 
		id="assets" 
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="assets"
			/>
			<!-- Display Datatable -->
			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Error box message -->
						<div v-if="errored">
							<Alert 
								:message="errorMsg" 
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
								id="assets-datatable"
								:rowdata="rowdata"
								:canaccessdetails="true"
								:candelete="candelete"
								:rowheader="rowheader"
								:candeploy="true"
								title="asset/bases"
								translationkey="inventory."
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

export default {
	name: 'Assets',
	components: { PageHeader },
	data() {
		return {
			errorMsg: null,
			rowdata: [],
			rowheader: [],
			loading: true,
			errored: false,
			candelete: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	mounted() {
		if(localStorage.getItem('permissions').split(",").includes("view_inventorybase")) {
			if(localStorage.getItem('permissions').split(",").includes("delete_inventorybase")) {
				this.candelete = true
			}
			this.getHeader()
		} else {
			this.errorMsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	},
	methods: {
		getHeader() {
			Axios.options(import.meta.env.VITE_APP_API_ROUTE+"asset/bases/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if(field != "inventory_sections") {
							this.rowheader.push(field)
						}
					})
					this.errorMsg = null
					this.errored = false
					this.getAssets()
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		getAssets() {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"asset/bases/", { headers: this.header })
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
			this.getAssets()
		},
	}
}
</script>