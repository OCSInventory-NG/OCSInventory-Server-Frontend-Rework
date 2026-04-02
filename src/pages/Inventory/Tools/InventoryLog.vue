<template>
	<div
		id="inventory-log"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="inventory_logs" />

			<div class="page-body">
				<div class="card">
					<div class="card-body">
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
	name: "InventoryLog",
	data() {
		return {
			errored: false,
			errormsg: null,
			
			rowdata: [],
			rowheader: [],
			total: 0,
			query: {
				limit: localStorage.getItem("perPage") ? Number(localStorage.getItem("perPage")) : 5,
				offset: 0,
				ordering: '-timestamp',
				search: null,
			},

			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem("permissions")
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (!permissions.includes("log_view_log")) {
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
				const header = await this.$api.generic.options("asset/logs/")
				this.rowheader = Object.keys(header.actions.POST)

				// Get asset logs
				await this.getLogs(this.query)

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

		async getLogs(query = null) {
			this.isbusy = true

			try {
				const q = query || this.query

				const customParams = {
					expand: "asset",
					asset: this.$route.params.id || null,
				}

				const data = await this.$api.generic.get(
					"asset/logs/",
					{
						limit: q.limit,
						offset: q.offset,
						ordering: q.ordering,
						search: q.search,
					},
					customParams
				)

				const results = data?.results || data || []

				this.total = (typeof data?.count === "number")
					? data.count
					: (Array.isArray(results) ? results.length : 0)

				this.rowdata = results
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
			const csvRows = [headers.join(';')]

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
			try {
				const data = await this.$api.generic.get(
					"asset/logs/",
					{},
					{
						expand: "asset",
						asset: this.$route.params.id || null,
						search: filter || null,
						ordering: ordering || null,
					}
				)

				const results = data?.results || data || []
				this.handleExport({ scope: 'all', rows: results })
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			}
		},
	}
}
</script>