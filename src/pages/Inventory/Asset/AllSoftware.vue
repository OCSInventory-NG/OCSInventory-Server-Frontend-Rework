<template>
	<div 
		id="all-software" 
		class="container-xl"
	>
		<div>
			<PageHeader page-title="software_dictionary" />

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
								id="all-software-datatable"
								:rowdata="rowdata"
								:candelete="candelete"
								:rowheader="rowheader"
								:hiddenfields="hiddenfields"
								:usecheckbox="false"
								title="software_dictionary"
								translationkey="software."
								sortby="name"
								:server-side="true"
								:server-total-rows="total"
								:isbusy="isbusy"
								:redirect-to-search="true"
								@change-query="handleQueryChange"
								@export="handleExport"
								@export-all="exportAllSoftwares"
								@reloadDatatable="reloadDatatable"
								@assetsSearch="assetsSearch"
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
	name: 'AllSoftware',
	data() {
		return {
			errored: false,
			errormsg: null,

			rowdata: [],
			rowheader: [],
			total: 0,

			candelete: false,
			hiddenfields: ["id", "updated_at"],

			query: {
				limit: localStorage.getItem("perPage") ? Number(localStorage.getItem("perPage")) : 5,
				offset: 0,
				ordering: 'name',
				search: null,
			},

			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (!permissions.includes("software_view_softwaredictionary")) {
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
				const header = await this.$api.generic.options("software_dictionary/")
				this.rowheader = Object.keys(header.actions.POST).filter((f) => f !== "assets")
				this.rowheader.push("installation_number")

				// Get softwares
				await this.getSoftwares(this.query)

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

		async getSoftwares(query = null) {
			this.isbusy = true
			try {
				const data = await this.$api.generic.get("software_dictionary/", query)

				const results = data.results || data
				this.total = typeof data.count === "number" ? data.count : results.length

				results.forEach(data => {
					data.installation_number = data.assets.length 
				})

				this.rowdata = results

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
			} finally {
				this.isbusy = false
			}
		},

		async reloadDatatable() {
			await this.getSoftwares(this.query)
		},

		async handleQueryChange(newQuery) {
			if (!this.isbusy) {
				this.isbusy = true
				this.query = {
					...this.query,
					...newQuery,
				}

				await this.getSoftwares(this.query)
			}
		},

		// Export functions
		handleExport({ scope, rows }) {
			const csv = this.buildCsvFromRows(rows)
			const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.setAttribute('download', `softwares_${scope}.csv`)
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

		async exportAllSoftwares({ filter, ordering }) {
			const allRows = []
			const params = {
				ordering: ordering,
				search: filter,
			}

			const data = await this.$api.generic.get("software_dictionary/", params)

			const results = data.results || data
			allRows.push(...results)

			this.handleExport({ scope: 'all', rows: allRows })
		},

		// Software search
		assetsSearch(params) {
			var search = [
				[
					{
						object: "software_dictionary_entries",
						route: "software_dictionary",
						field: "name",
						fieldtype: "string",
						operator: "iexact",
						value: params[0],
						link: "AND"
					},
					{
						object: "software_dictionary_entries",
						route: "software_dictionary",
						field: "publisher",
						fieldtype: "string",
						operator: "iexact",
						value: params[1],
						link: "AND"
					},
					{
						object: "software_dictionary_entries",
						route: "software_dictionary",
						field: "version",
						fieldtype: "string",
						operator: "iexact",
						value: params[2],
						link: "AND"
					},
				]
			]

			localStorage.setItem('multisearch', JSON.stringify(search))
			localStorage.setItem('useSavedSearch', true)

			this.$router.push({
				name: 'Multisearch',
			});
		}
	}
}
</script>