<template>
	<div 
		id="software-mapping" 
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="software_mapping"
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
							<SoftwareMappingModal
								v-if="canadd"
								@reloadDatatable="reloadDatatable"
							/>
							<Datatable
								id="software-mapping-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
								editcomponent="SoftwareMappingModal"
								title="software_mapping"
								translationkey="software."
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
	name: "SoftwareMapping",
	data() {
		return {
			canadd: false,
			canedit: false,
			candelete: false,
			canview: false,
			rowdata: [],
			rowheader: [],
			softwaremappingdata: [],
			errored: false,
			errormsg: null,
			loading: true,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async mounted() {
		if(localStorage.getItem('permissions').split(",").includes("software_view_softwaremapping")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("software_add_softwaremapping")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("software_change_softwaremapping")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("software_delete_softwaremapping")) {
				this.candelete = true
			}
			await this.getHeader()
			await this.getSoftwareMapping()
			await this.getRowdata()
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
		}
	},
	methods: {
		async getHeader() {
			await axios.options(this.$config.BACKEND_API_ROUTE+"software_mapping/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						this.rowheader.push(field)
					})
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		async getSoftwareMapping() {
			this.softwaremappingdata = []
			await axios.get(this.$config.BACKEND_API_ROUTE+"software_mapping/", { headers: this.header })
				.then(response => {
					this.softwaremappingdata = response.data
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
					this.loading = false
				})
		},
		async getRowdata() {
			this.rowdata = []
			for (const softwareMapping of this.softwaremappingdata) {
				this.rowdata.push({
					id: softwareMapping.id,
					template: await this.getTemplate(softwareMapping.template),
					section: await this.getSection(softwareMapping.section),
					name: await this.getFields(softwareMapping.name),
					publisher: await this.getFields(softwareMapping.publisher),
					version: await this.getFields(softwareMapping.version),
					major_version: await this.getFields(softwareMapping.major_version),
					minor_version: await this.getFields(softwareMapping.minor_version),
					patch_version: await this.getFields(softwareMapping.patch_version)
				})
			}
			this.loading = false
		},
		async getTemplate(templateId) {
			const response = await axios.get(this.$config.BACKEND_API_ROUTE+"templates/"+templateId+"/",
				{ headers: this.header })
			return response.data.name
		},
		async getSection(sectionId) {
			const response = await axios.get(this.$config.BACKEND_API_ROUTE+"sections/"+sectionId+"/",
				{ headers: this.header })
			return response.data.name
		},
		async getFields(fieldsId) {
			if (fieldsId) {
				const response = await axios.get(this.$config.BACKEND_API_ROUTE+"fields/"+fieldsId+"/",
					{ headers: this.header })
				return response.data.name
			}
			return null
		},
		async reloadDatatable() {
			this.loading = true
			await this.getSoftwareMapping()
			await this.getRowdata()
		}
	}
}
</script>