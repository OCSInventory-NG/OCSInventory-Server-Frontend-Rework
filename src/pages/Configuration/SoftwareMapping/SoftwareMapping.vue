<template>
	<div 
		id="software-mapping" 
		class="container-xl"
	>
		<div>
			<PageHeader page-title="software_mapping" />

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
								:isbusy="isbusy"
								is-sticky
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
export default {
	name: "SoftwareMapping",
	data() {
		return {
			errored: false,
			errormsg: null,

			canadd: false,
			canedit: false,
			candelete: false,
			canview: false,

			rowdata: [],
			rowheader: [],
			softwaremappingdata: [],

			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (permissions.includes("software_view_softwaremapping")) {
			this.canview = true
			if (permissions.includes("software_add_softwaremapping")) {
				this.canadd = true
			}
			if (permissions.includes("software_change_softwaremapping")) {
				this.canedit = true
			}
			if (permissions.includes("software_delete_softwaremapping")) {
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
			try {
				// Get header
				const header = await this.$api.generic.options("software_mapping/")
				this.rowheader = Object.keys(header.actions.POST)

				// Get software mappings
				await this.getSoftwareMapping()

				this.errored = false
				this.errormsg = null
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async getSoftwareMapping() {
			this.isbusy = true
			this.softwaremappingdata = []

			try {
				const data = await this.$api.generic.get("software_mapping/")
				this.softwaremappingdata = Array.isArray(data) ? data : (data?.results || [])

				// Get row data
				await this.getRowdata()

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			}
		},

		async getRowdata() {
			this.rowdata = []

			this._tplCache = this._tplCache || new Map()
			this._sectionCache = this._sectionCache || new Map()
			this._fieldCache = this._fieldCache || new Map()

			try {
				const rows = await Promise.all(
					(this.softwaremappingdata || []).map(async (sm) => ({
						id: sm.id,
						template: await this.getTemplateName(sm.template),
						section: await this.getSectionName(sm.section),
						name: await this.getFieldName(sm.name),
						publisher: await this.getFieldName(sm.publisher),
						version: await this.getFieldName(sm.version),
						major_version: await this.getFieldName(sm.major_version),
						minor_version: await this.getFieldName(sm.minor_version),
						patch_version: await this.getFieldName(sm.patch_version),
					}))
				)

				this.rowdata = rows
			} finally {
				this.isbusy = false
			}
		},

		async getTemplateName(templateId) {
			if (!templateId) return null
			if (this._tplCache?.has(templateId)) return this._tplCache.get(templateId)

			const data = await this.$api.generic.get(`templates/${templateId}/`)
			const name = data?.name ?? null

			this._tplCache.set(templateId, name)
			return name
		},

		async getSectionName(sectionId) {
			if (!sectionId) return null
			if (this._sectionCache?.has(sectionId)) return this._sectionCache.get(sectionId)

			const data = await this.$api.generic.get(`sections/${sectionId}/`)
			const name = data?.name ?? null

			this._sectionCache.set(sectionId, name)
			return name
		},

		async getFieldName(fieldId) {
			if (!fieldId) return null
			if (this._fieldCache?.has(fieldId)) return this._fieldCache.get(fieldId)

			const data = await this.$api.generic.get(`fields/${fieldId}/`)
			const name = data?.name ?? null

			this._fieldCache.set(fieldId, name)
			return name
		},

		async reloadDatatable() {
			await this.getSoftwareMapping()
		}
	}
}
</script>