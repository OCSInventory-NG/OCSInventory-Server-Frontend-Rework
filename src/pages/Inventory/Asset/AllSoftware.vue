<template>
	<div 
		id="all-software" 
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="software_dictionary"
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
								:redirectToSearch="true"
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
import axios from 'axios'

export default {
	name: 'AllSoftware',
	data() {
		return {
			errormsg: null,
			rowdata: [],
			rowheader: [],
			loading: true,
			errored: false,
			candelete: false,
			hiddenfields: ["id", "updated_at"],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			total: 0,
			query: {
				limit: (localStorage.getItem("perPage")) ? localStorage.getItem("perPage") : 5,
				offset: 0,
				ordering: 'name',
				search: null,
			},
			isbusy: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []
		if(permissions.includes("software_view_softwaredictionary")) {
			await this.getHeader()
			await this.getSoftwares(this.query)
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
		}
	},
	methods: {
		async getHeader() {
			await axios.options(this.$config.BACKEND_API_ROUTE+"software_dictionary/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if (!["assets"].includes(field)) {
							this.rowheader.push(field)
						}
					})
					this.rowheader.push("installation_number")
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		async getSoftwares(query = null) {
			try {
				const q = query || this.query

				const params = {}

				if (q.limit != null) params.limit = q.limit
				if (q.offset != null) params.offset = q.offset
				if (q.ordering) params.ordering = q.ordering
				if (q.search) params.search = q.search

				const response = await axios.get(
					this.$config.BACKEND_API_ROUTE+"software_dictionary/",
					{ headers: this.header, params }
				)

				const data = response.data
				const results = data.results || data

				if (typeof data.count === 'number') {
					this.total = data.count
				} else {
					this.total = results.length
				}

				results.forEach(data => {
					data.installation_number = data.assets.length 
				})

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
			const params = {}

			if (filter) params.search = filter
			if (ordering) params.ordering = ordering

			const { data } = await axios.get(
				this.$config.BACKEND_API_ROUTE + "software_dictionary/",
				{ headers: this.header, params }
			)

			const results = data.results || data
			allRows.push(...results)

			this.handleExport({ scope: 'all', rows: allRows })
		},
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