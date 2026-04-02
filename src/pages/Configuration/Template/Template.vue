<template>
	<div
		id="template" 
		class="container-xl"
	>
		<div>
			<PageHeader page-title="templates" />

			<div class="page-body">
				<div class="card">
					<div class="card-body">
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
								@reload-datatable="reloadDatatable"
							/>

							<Datatable
								id="templates-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedittemplate="canopenedit"
								:candelete="candelete"
								:canexport="false"
								:importtemplate="importtemplate"
								:exporttemplate="exporttemplate"
								:duplicateitem="duplicateitem"
								:isbusy="isbusy"
								title="templates"
								titlevalue="template"
								translationkey="template."
								@reload-datatable="reloadDatatable"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Template',
	data() {
		return {
			errored: false,
			errormsg: null,

			canadd: false,
			canedit: false,
			canopenedit: false,
			candelete: false,
			canview: false,
			exporttemplate: false,
			importtemplate: false,
			duplicateitem: false,

			rowdata: [],
			rowheader: [],

			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (permissions.includes("template_view_template")) {
			this.canview = true
			this.exporttemplate = true
			this.canopenedit = true
			if (permissions.includes("template_add_template")) {
				this.canadd = true
				this.importtemplate = true
				this.duplicateitem = true
			}
			if (permissions.includes("template_change_template")) {
				this.canedit = true
			}
			if (permissions.includes("template_delete_template")) {
				this.candelete = true
			}
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
			this.isbusy = false
			return
		}

		// Data init
		await this.loadInitial()
	},
	methods: {
		async loadInitial() {
			this.loading = true
			this.isbusy = true
			try {
				// Get header
				const header = await this.$api.generic.options("templates/")
				this.rowheader = Object.keys(header.actions.POST).filter(
					(f) => !["sections", "is_protected"].includes(f)
				)

				// Get templates
				await this.getTemplates()

				this.errored = false
				this.errormsg = null
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
			} finally {
				this.loading = false
				this.isbusy = false
			}
		},

		async getTemplates() {
			this.rowdata = []

			try {
				this.isbusy = true

				const data = await this.$api.generic.get("templates/")
				const templates = Array.isArray(data) ? data : (data?.results || [])

				this.rowdata = templates.filter((t) => t?.os !== "SNMP")

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error)
					? e.response.data.error
					: e.message
				this.errored = true
			} finally {
				this.isbusy = false
			}
		},

		async reloadDatatable() {
			await this.getTemplates()
		}
	}
}
</script>