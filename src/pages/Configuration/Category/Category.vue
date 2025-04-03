<template>
	<div
		id="category" 
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="category"
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
							<CategoryModal
								v-if="canadd"
								@reloadDatatable="reloadDatatable"
							/>
							<Datatable
								id="categories-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
                                editcomponent="CategoryModal"
								title="categories"
								translationkey="template."
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
	name: 'Template',
	data() {
		return {
			errormsg: null,
			loading: true,
			errored: false,
			canadd: false,
			canedit: false,
			candelete: false,
			canview: false,
			rowdata: [],
			rowheader: [],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async mounted() {
		if(localStorage.getItem('permissions').split(",").includes("category_view_category")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("category_add_category")) {
				this.canadd = true
				this.importtemplate = true
			}
			if(localStorage.getItem('permissions').split(",").includes("category_change_category")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("category_delete_category")) {
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
			await axios.options(this.$config.BACKEND_API_ROUTE+"categories/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						this.rowheader.push(field)
					})
					this.errormsg = null
					this.errored = false
					this.getCategories()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		async getCategories() {
            this.rowdata = []
			await axios.get(this.$config.BACKEND_API_ROUTE+"categories/", { headers: this.header })
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
			await this.getCategories()
		}
	}
}
</script>