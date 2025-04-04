<template>
	<div id="inventory">
		<!-- Error box message -->
		<section v-if="errored">
			<Alert 
				:message="errormsg" 
				variant="danger"
			/>
		</section>

		<!-- Display inventory -->
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
					title="section"
				/>
			</div>
		</section>
	</div>
</template>

<script>
//import axios from 'axios'

export default {
	name: "Inventory",
	props: {
		section: { type: Object, default: {} }
	},
	data() {
		return {
			rowheader: [],
			rowdata: [],
			loading: true,
			errored: false,
			errormsg: null,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async mounted() {
		await this.getHeader()
	},
	methods: {
		async getHeader() {
			this.rowheader = []
			for (const field of this.section.fields) {
				this.rowheader.push(field.name)
			}

			this.loading = false
		}
	}
}
</script>