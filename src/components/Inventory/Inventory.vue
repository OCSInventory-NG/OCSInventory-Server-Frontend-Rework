<template>
	<div id="inventory">
		<!-- Display inventory section datatable -->
		<div align="center">
			<h2>{{ section.name }}</h2>
		</div>
		<!-- Error box message -->
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
			@reloadDatatable="reloadDatatable"
		/>
	</div>
</template>

<script>
import axios from 'axios'

export default {
	name: "Inventory",
	props: {
		section: { type: Object, default: () => {} },
		base: { type: Number, default: 0 }
	},
	data() {
		return {
			rowheader: [],
			rowdata: [],
			loading: true,
			errored: false,
			errormsg: null,
			fields: [],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async mounted() {
		await this.getHeader()
		await this.getInventorySection()
	},
	methods: {
		async getHeader() {
			this.rowheader = []
			for (const field of this.section.fields) {
				this.rowheader.push(field.name)
				if (!this.fields[field.id]) {
					this.fields[field.id] = []
				}
				this.fields[field.id] = field.name
			}
		},
		async getInventorySection() {
			this.rowdata = []
			try {
				var queryUrl = "asset/sections/?base="+this.base+"&template_section="+this.section.id+"&expand=fields"
				const response = await axios.get(
					this.$config.BACKEND_API_ROUTE+queryUrl,
					{ headers: this.header }
				)
				for (const inventory of response.data) {
					var entry = {}
					for (const row of inventory.fields) {
						Object.assign(entry, {
							[this.fields[row.template_field]]: row.value
						})
					}
					this.rowdata.push(entry)
				}
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.loading = false
			}
		},
		async reloadDatatable() {
			this.loading = true
			await this.getInventorySection()
		}
	}
}
</script>