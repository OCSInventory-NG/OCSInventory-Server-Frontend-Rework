<template>
	<div id="inventory">
		<div align="center">
			<h2>{{ section.name }}</h2>
		</div>

		<section v-if="errored">
			<Alert 
				:message="errormsg" 
				variant="danger"
			/>
		</section>

		<div
			v-if="loading"
			class="ocs-loader"
		>
			<Loader />
		</div>

		<Datatable
			v-else
			:id="section.name"
			:rowdata="rowdata"
			:usecheckbox="false"
			:rowheader="rowheader"
			:title="section.name"
			:templateid="section.template"
			:isbusy="isbusy"
			@reload-datatable="reloadDatatable"
		/>
	</div>
</template>

<script>
export default {
	name: "Inventory",
	props: {
		section: { type: Object, default: () => {} },
		base: { type: Number, default: 0 }
	},
	data() {
		return {
			errored: false,
			errormsg: null,

			rowheader: [],
			rowdata: [],
			fields: [],
			
			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		await this.getHeader()
		await this.getInventorySection()
	},
	methods: {
		async getHeader() {
			this.loading = true
			this.rowheader = []
			this.fields = this.fields || {}

			try {
				for (const field of (this.section?.fields || [])) {
					this.rowheader.push(field.name)
					this.fields[field.id] = field.name
				}
			} finally {
				this.loading = false
			}
		},

		async getInventorySection() {
			this.isbusy = true
			this.rowdata = []

			try {
				const data = await this.$api.generic.get(
					"asset/sections/",
					{},
					{
						base: this.base,
						template_section: this.section.id,
						expand: "fields",
					}
				)

				const rows = Array.isArray(data) ? data : (data?.results || [])

				this.rowdata = rows.map((inventory) => {
					const entry = {}
					for (const row of (inventory?.fields || [])) {
						const colName = this.fields?.[row.template_field] || row.template_field
						entry[colName] = row.value
					}
					return entry
				})

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.isbusy = false
			}
		},

		async reloadDatatable() {
			await this.getInventorySection()
		},
	}
}
</script>