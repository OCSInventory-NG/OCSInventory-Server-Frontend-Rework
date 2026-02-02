<template>
	<div
		id="inventory-log"
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="inventory_logs"
			/>
			<!-- Display Collapse -->
			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Error box message -->
						<section v-if="errored">
							<Alert 
								:message="errormsg"
								:cols="true"
								variant="danger"
							/>
						</section>
						<div 
							v-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>
						<div v-else>
							<Datatable
								id="logs-datatable"
								:canaccessdetails="true"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:usecheckbox="false"
								sortby="timestamp"
								sortdesc="desc"
								title="inventory_logs"
								translationkey="inventory."
								:server-side="true"
								:server-total-rows="total"
								:isbusy="isbusy"
								@change-query="handleQueryChange"
								@export="handleExport"
								@export-all="exportAllInventorylogs"
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
	name: "InventoryLog",
	data() {
		return {
			errormsg: null,
			rowdata: [],
			rowheader: [],
			loading: true,
			errored: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			total: 0,
			query: {
				limit: (localStorage.getItem("perPage")) ? localStorage.getItem("perPage") : 5,
				offset: 0,
				ordering: '-timestamp',
				search: null,
			},
			isbusy: true,
		}
	},
	async mounted() {
		await this.getHeader()
	},
	methods: {
		async getHeader() {
			await axios.options(this.$config.BACKEND_API_ROUTE+"asset/logs/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						this.rowheader.push(field)
					})
					this.errormsg = null
					this.errored = false
					this.getLogs()
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		// Retrieve logs
		async getLogs(query = null) {
			try {
				const q = query || this.query;

				const params = {
					expand: 'asset',
				}

				if (q.limit != null) params.limit = q.limit
				if (q.offset != null) params.offset = q.offset
				if (q.ordering) params.ordering = q.ordering
				if (q.search) params.search = q.search

				if(this.$route.params.id) params.asset = this.$route.params.id

				const response = await axios.get(
					this.$config.BACKEND_API_ROUTE+"asset/logs/",
					{ headers: this.header, params }
				)

				const data = response.data
				const results = data.results || data

				if (typeof data.count === 'number') {
					this.total = data.count
				} else {
					this.total = results.length
				}

				this.rowdata = results
				this.errormsg = null
				this.errored = false
			} catch(e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.loading = false
				this.isbusy = false
			}
		},
		async reloadDatatable() {
			this.isbusy = true
			await this.getLogs(this.query)
		},
		async handleQueryChange(newQuery) {
			if (!this.isbusy) {
				this.isbusy = true
				this.query = {
					...this.query,
					...newQuery,
				}
				await this.getLogs(this.query)
			}
		},
		handleExport({ scope, rows }) {
			const csv = this.buildCsvFromRows(rows)
			const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.setAttribute('download', `inventory_logs_${scope}.csv`)
			document.body.appendChild(link)
			link.click()
			link.remove()
			URL.revokeObjectURL(url)
		},
		buildCsvFromRows(rows) {
			if (!rows || !rows.length) return ''
			const headers = Object.keys(rows[0])
			const csvRows = []
			csvRows.push(headers.join(';'))

			rows.forEach(row => {
				const values = headers.map(h => {
					const v = row[h] != null ? String(row[h]) : ''
					return `"${v.replace(/"/g, '""')}"`
				})
				csvRows.push(values.join(';'))
			})

			return csvRows.join('\n')
		},
		async exportAllInventorylogs({ filter, ordering }) {
			const allRows = []
			const params = {}

			if (filter) params.search = filter
			if (ordering) params.ordering = ordering

			if(this.$route.params.id) params.asset = this.$route.params.id

			const { data } = await axios.get(
				this.$config.BACKEND_API_ROUTE+"asset/logs/",
				{ headers: this.header, params }
			)

			const results = data.results || data
			allRows.push(...results)

			this.handleExport({ scope: 'all', rows: allRows })
		}
	}
}
</script>