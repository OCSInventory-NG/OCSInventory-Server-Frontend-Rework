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
								:cols="true"
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
								:exporttemplate="exporttemplate"
								:duplicateitem="duplicateitem"
								title="templates"
								titlevalue="template"
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
			exporttemplate: false,
			importtemplate: false,
			duplicateitem: false,
			rowdata: [],
			rowheader: [],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async mounted() {
		if(localStorage.getItem('permissions').split(",").includes("template_view_template")) {
			this.canview = true
			this.exporttemplate = true
			if(localStorage.getItem('permissions').split(",").includes("template_add_template")) {
				this.canadd = true
				this.importtemplate = true
				this.duplicateitem = true
			}
			if(localStorage.getItem('permissions').split(",").includes("template_change_template")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("template_delete_template")) {
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
			await axios.options(this.$config.BACKEND_API_ROUTE+"templates/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if (!["sections", "is_protected"].includes(field) ) {
							this.rowheader.push(field)
						}
					})
					this.errormsg = null
					this.errored = false
					this.getTemplates()
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		async getTemplates() {
			this.rowdata = []
			await axios.get(this.$config.BACKEND_API_ROUTE+"templates/", { headers: this.header })
				.then(response => {
					for (const temp of response.data) {
						if(temp.os != "SNMP") {
							this.rowdata.push(temp)
						}
					}
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		async reloadDatatable() {
			this.loading = true
			await this.getTemplates()
		}
	}
}
</script>