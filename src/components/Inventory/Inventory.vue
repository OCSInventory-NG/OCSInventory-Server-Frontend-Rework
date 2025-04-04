<template>
	<div id="inventory">
		<!-- Error box message -->
		<section v-if="errored">
			<Alert 
				:message="errormsg" 
				variant="danger"
			/>
		</section>

		<!-- Display inventory section datatable -->
		<section v-else>
			<div 
				v-if="loading"
				class="ocs-loader"
			>
				<Loader />
			</div>
			<div v-else>
				<div align="center">
					<h2>{{ section.name }}</h2>
				</div>
				<Datatable
					:id="section.name"
					:rowdata="rowdata"
					:usecheckbox="false"
					:rowheader="rowheader"
					:title="section.name"
				/>
			</div>
		</section>
	</div>
</template>

<script>
export default {
	name: "Inventory",
	props: {
		section: { type: Object, default: () => {} },
		inventory: { type: Array, default: () => [] }
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
		await this.processInventory()
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
		async processInventory() {
			this.rowdata = []
			for (const rows of this.inventory) {
				var entry = {}
				for (const row of rows) {
					Object.assign(entry, {
						[this.fields[row.template_field]]: row.value
					})
				}
				this.rowdata.push(entry)
			}
			this.loading = false
		}
	}
}
</script>