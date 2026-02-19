<template>
	<div 
		id="extensions" 
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="extensions"
			/>
			<!-- Display Datatable -->
			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Error box message -->
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
	name: 'Extensions',
	data() {
		return {
			errormsg: null,
			rowdata: [],
			rowheader: [],
			loading: true,
			errored: false,
			hiddenfields: [],
			canedit: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			total: 0,
			query: {
				limit: (localStorage.getItem("perPage")) ? localStorage.getItem("perPage") : 5,
				offset: 0,
				ordering: '-name',
				search: null,
			},
			isbusy: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []
		if(permissions.includes("extension_view_extension")) {
			if(permissions.includes("extension_change_extension")) {
				this.canedit = true
			}
			await this.getHeader()
			await this.getExtensions(this.query)
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	},
	methods: {
		async getHeader() {
			await axios.options(this.$config.BACKEND_API_ROUTE+"extensions/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if(!["django_app"].includes(field)) {
							this.rowheader.push(field)
						}
					})
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		async getExtensions(query = null) {
			try {
				const q = query || this.query

				const params = {}

				if (q.limit != null) params.limit = q.limit
				if (q.offset != null) params.offset = q.offset
				if (q.ordering) params.ordering = q.ordering
				if (q.search) params.search = q.search

				const response = await axios.get(
					this.$config.BACKEND_API_ROUTE+"extensions/",
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
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.loading = false
				this.isbusy = false
			}
		},
		async reloadDatatable() {
			this.isbusy = true
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

			const params = {}
			if (filter) params.search = filter
			if (ordering) params.ordering = ordering

			const { data } = await axios.get(
				this.$config.BACKEND_API_ROUTE + "extensions/",
				{ headers: this.header, params }
			)

			const results = data.results || data
			allRows.push(...results)

			this.handleExport({ scope: 'all', rows: allRows })
		}
	}
}
</script>