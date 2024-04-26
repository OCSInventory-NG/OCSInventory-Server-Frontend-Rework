<template>
	<div
		id="template" 
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="templates"
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
							<TemplateModal
								v-if="canadd"
								@reloadDatatable="reloadDatatable"
							/>
							<Datatable
								id="templates-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedittemplate="canedit"
								:candelete="candelete"
								:canexport="false"
								:importtemplate="importtemplate"
								title="templates"
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
			exportemplate: false,
			rowdata: [],
			rowheader: [],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	created() {
		if(localStorage.getItem('permissions').split(",").includes("view_template")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("add_template")) {
				this.canadd = true
				this.importtemplate = true
			}
			if(localStorage.getItem('permissions').split(",").includes("change_template")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_template")) {
				this.candelete = true
			}
			this.getHeader()
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
		}
	},
	methods: {
		getHeader() {
			axios.options(import.meta.env.VITE_APP_API_ROUTE+"templates/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						this.rowheader.push(field)
					})
					this.errormsg = null
					this.errored = false
					this.getTemplates()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		getTemplates() {
			axios.get(import.meta.env.VITE_APP_API_ROUTE+"templates/", { headers: this.header })
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
		reloadDatatable() {
			this.getTemplates()
		}
	}
}
</script>