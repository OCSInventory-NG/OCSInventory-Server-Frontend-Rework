<template>
	<div id="section-collapse">
		<div
			v-if="loadingsection"
			class="ocs-loader"
		>
			<Loader />
		</div>
		<div v-else>
			<div class="table-responsive">
				<table class="table table-vcenter border">
					<thead>
						<tr>
							<th>{{ $t('user.name') }}</th>
							<th>{{ $t('template.category') }}</th>
							<th>{{ $t('template.retrieval_method') }}</th>
							<th v-if="routetype != 'snmp'">
								{{ $t('template.retrieval_output') }}
							</th>
							<th v-if="routetype != 'snmp'">
								{{ $t('template.target') }}
							</th>
							<th v-if="routetype != 'snmp'">
								{{ $t('template.retrieval_output_options') }}
							</th>
							<th class="section-table-title">
								{{ $t('generic.actions') }}
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>{{ rowsection.name }}</td>
							<td>{{ selectedcategory }}</td>
							<td>{{ $t("template."+rowsection.retrieval_method) }}</td>
							<td v-if="routetype != 'snmp'">
								{{ $t("template."+rowsection.retrieval_output) }}
							</td>
							<td v-if="routetype != 'snmp'">
								{{ rowsection.target }}
							</td>
							<td v-if="routetype != 'snmp'">
								<p
									v-for="(option,optionname) in rowsection.options"
									:key="optionname"
									class="section-table-options"
								>
									{{ $t('template.' + optionname) }} : {{ option }}
								</p>
							</td>
							<td class="section-table-btn">
								<b-button-toolbar>
									<b-button-group class="mr-1">
										<SectionModal
											:id="rowsection.id"
											:update="true"
											:rowsectiondata="rowsection"
											:template="rowsection.template"
											:view-only="viewOnly"
											@reloadTemplate="reloadTemplate"
											@reloadSection="reloadSection"
										/>
										<delete-item-modal 
											:id="rowsection.id"
											:name="rowsection.name"
											parameter="sections"
											@reloadTemplate="reloadTemplate"
										/>
									</b-button-group>
								</b-button-toolbar>
							</td>
						</tr>
					</tbody>
				</table>
			</div><br>
			<b-row class="text-center">
				<b-col cols="4" />
				<b-col cols="4">
					<h2>{{ $t("template.fieldslist") }}</h2>
				</b-col>
				<b-col cols="4">
					<FieldModal
						:section="section.id"
						:routetype="routetype"
						:view-only="viewOnly"
						@reloadDatatable="reloadDatatable"
					/>
				</b-col>
			</b-row>
			<div
				v-if="loading"
				class="ocs-loader"
			>
				<Loader />
			</div>
			<b-row  
				v-else
			>
				<b-col>
					<Draggable
						v-if="rowdata.length"
						id="fields-datatable"
						:canedit="true"
						:candelete="true"
						:rowdata="rowdata"
						:rowheader="rowheader"
						:view-only="viewOnly"
						field="order"
						apiroute="fields"
						translationkey="template."
						editcomponent="FieldModal"
						@reloadDatatable="reloadDatatable"
					/>
					<div v-else>
						<Alert
							:message="$t('message.no_field')"
							:cols="true"
							variant="info"
						/>
					</div>
				</b-col>
			</b-row>
		</div>
	</div>
</template>

<script>
export default {
	name: 'SectionCollapse',
	props: {
		section: { type: Object, default: () => {} },
		routetype: { type: String, default: "assets" },
		viewOnly: { type: Boolean, default: false }
	},
	data() {
		return {
			errored: false,
			errormsg: null,

			rowheader: [],
			rowdata: [],
			rowsection: [],
			selectedcategory: null,

			loading: true,
			loadingsection: true,
		}
	},
	async mounted() {
		this.rowsection = this.section
		await this.getHeader()
		await this.getFields()
		await this.getCategories()
		this.loadingsection = false
	},

	methods: {
		formatFieldOptions(field) {
			const f = { ...field }

			if (f.options && typeof f.options === "object" && !Array.isArray(f.options)) {
				f.options = Object.entries(f.options)
					.map(([k, v]) => `${k} : ${v}`)
					.join("\n")
					.trim()
			} else if (f.options != null) {
				f.options = String(f.options).trim()
			} else {
				f.options = ""
			}

			return f
		},

		async getHeader() {
			this.rowheader = []
			try {
				const data = await this.$api.generic.options("fields/")

				Object.keys(data?.actions?.POST || {}).forEach((field) => {
					if (field !== "section") this.rowheader.push(field)
				})

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			}
		},

		async getFields() {
			this.rowdata = []
			try {
				const data = await this.$api.generic.get(
					"fields/",
					{},
					{ section: this.rowsection.id }
				)

				const fields = Array.isArray(data) ? data : (data?.results || [])
				this.rowdata = fields.map((f) => this.formatFieldOptions(f))

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			}
		},

		async getCategories() {
			try {
				const data = await this.$api.generic.get("categories/")
				const categories = Array.isArray(data) ? data : (data?.results || [])

				for (const category of categories) {
					if ((category?.inventory_sections || []).includes(this.rowsection.id)) {
						this.selectedcategory = category.name
						break
					}
				}

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.loading = false
				this.loadingsection = false
			}
		},

		async reloadTemplate() {
			this.$emit("reloadTemplate")
		},

		async reloadSection() {
			this.loadingsection = true
			try {
				const data = await this.$api.generic.get(
					`sections/${this.rowsection.id}/`,
					{},
					{ expand: "fields" }
				)

				this.rowsection = data
				this.errormsg = null
				this.errored = false

				await this.getCategories()
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			}
		},

		async reloadDatatable() {
			this.loading = true
			try {
				const data = await this.$api.generic.get(
					"fields/",
					{},
					{ section: this.rowsection.id }
				)

				const fields = Array.isArray(data) ? data : (data?.results || [])
				this.rowdata = fields.map((f) => this.formatFieldOptions(f))

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.loading = false
			}
		},
	}
}
</script>
