<template>
	<div 
		id="extensions" 
		class="container-xl"
	>
		<div>
			<PageHeader page-title="extensions" />

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
							<Datatable
								id="extensions-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:hiddenfields="hiddenfields"
								:canedit="canedit"
								title="extensions"
								translationkey="extensions."
								:server-side="true"
								:server-total-rows="total"
								:isbusy="isbusy"
								editcomponent="ExtensionModal"
								@change-query="handleQueryChange"
								@export="handleExport"
								@export-all="exportAllExtensions"
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
	name: 'Extensions',
	data() {
		return {
			errored: false,
			errormsg: null,

			rowdata: [],
			rowheader: [],
			total: 0,

			canedit: false,

			hiddenfields: [],
			query: {
				limit: localStorage.getItem("perPage") ? Number(localStorage.getItem("perPage")) : 5,
				offset: 0,
				ordering: '-name',
				search: null,
			},

			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if(permissions.includes("extension_view_extension")) {
			if(permissions.includes("extension_change_extension")) {
				this.canedit = true
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
				const header = await this.$api.generic.options("extensions/")
				this.rowheader = Object.keys(header.actions.POST).filter(
					(f) => !["django_app"].includes(f)
				)

				// Get extensions
				await this.getExtensions()

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

		async getExtensions(query = null) {
			this.isbusy = true
			try {
				const data = await this.$api.generic.get("extensions/", query)

				const results = data.results || data
				this.total = typeof data.count === "number" ? data.count : results.length

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
			await this.getExtensions(this.query)
		},

		async handleQueryChange(newQuery) {
			if (!this.isbusy) {
				this.isbusy = true
				this.query = {
					...this.query,
					...newQuery,
				}

				await this.getExtensions(this.query)
			}
		},

		// Export functions
		handleExport({ scope, rows }) {
			const csv = this.buildCsvFromRows(rows)
			const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.setAttribute('download', `extensions_${scope}.csv`)
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

		async exportAllExtensions({ filter, ordering }) {
			const allRows = []
			const params = {
				ordering: ordering,
				search: filter,
			}

			const data = await this.$api.generic.get("extensions/", params)

			const results = data.results || data
			allRows.push(...results)

			this.handleExport({ scope: 'all', rows: allRows })
		}
	}
}
</script>