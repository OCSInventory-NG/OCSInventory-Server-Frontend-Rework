<template>
	<div 
		id="packages" 
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="deployment"
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
							<PackageModal
								v-if="canadd"
								@reloadDatatable="reloadDatatable"
							/>
							<Datatable
								id="packages-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:candelete="candelete"
								:canedit="canedit"
								:canviewaction="canviewaction"
								editcomponent="PackageModal"
								title="deployment/packages"
								translationkey="deployment."
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
	name: 'Packages',
	data() {
		return {
			canadd: false,
			canedit: false,
			candelete: false,
			canview: false,
			canviewaction: false,
			rowdata: [],
			rowheader: [],
			loading: true,
			errormsg: null,
			errored: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	created() {
		if(localStorage.getItem('permissions').split(",").includes("package_view_package")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("package_add_package")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("package_change_package")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("package_delete_package")) {
				this.candelete = true
			}
			if(localStorage.getItem('permissions').split(",").includes("action_view_deploymentaction")) {
				this.canviewaction = true
			}
			this.getHeader()
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
		}
	},
	methods: {
		getHeader() {
			axios.options(import.meta.env.VITE_APP_API_ROUTE+"deployment/packages/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if(field != "result") this.rowheader.push(field)
					})
					this.errormsg = null
					this.errored = false
					this.getPackages()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		getPackages() {
			axios.get(import.meta.env.VITE_APP_API_ROUTE+"deployment/packages/", { headers: this.header })
				.then(response => {
					response.data.forEach(packages => {
						packages.actions_list = packages.actions_list.length
					})
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
		reloadDatatable() {
			this.getPackages()
		}
	}
}
</script>