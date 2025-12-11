<template>
	<div 
		id="assets" 
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="assets"
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
								id="assets-datatable"
								:rowdata="rowdata"
								:canaccessdetails="true"
								:candelete="candelete"
								:rowheader="rowheader"
								:candeploy="true"
								:canmassprocessing="true"
								:usecheckbox="true"
								:hiddenfields="hiddenfields"
								title="asset/bases"
								translationkey="inventory."
								sortby="last_update"
								sortdesc="desc"
								:server-side="true"
								:server-total-rows="total"
								:isbusy="isbusy"
								@change-query="handleQueryChange"
								@export="handleExport"
								@export-all="exportAllAssets"
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
	name: 'Assets',
	data() {
		return {
			errormsg: null,
			rowdata: [],
			rowheader: [],
			loading: true,
			errored: false,
			candelete: false,
			hiddenfields: ["id", "uuid", "template", "agent", "is_template_forced"],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			total: 0,
			query: {
				limit: (localStorage.getItem("perPage")) ? localStorage.getItem("perPage") : 5,
				offset: 0,
				ordering: '-last_update',
				search: null,
			},
			isbusy: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []
		if(permissions.includes("inventory_base_view_inventorybase")) {
			if(permissions.includes("inventory_base_delete_inventorybase")) {
				this.candelete = true
			}
			await this.getAccountinfoCfg()
			await this.getHeader()
			await this.getAssets(this.query)
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	},
	methods: {
		async getHeader() {
			await axios.options(this.$config.BACKEND_API_ROUTE+"asset/bases/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if(field != "inventory_sections") {
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
		async getAccountinfoCfg() {
			try {
				const response = await axios.get(
					this.$config.BACKEND_API_ROUTE+"accountinfo/config/?datatarget=ASSET",
					{ headers: this.header }
				)

				for (const accountinfo of response.data) {
					if(!this.rowheader.includes("Account info : " + accountinfo.name)) {
						this.rowheader.push("Account info : " + accountinfo.name)
					}
				}
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			}
		},
		async getAssets(query = null) {
			try {
				const q = query || this.query

				const params = {
					accountinfo: true,
				}

				if (q.limit != null) params.limit = q.limit
				if (q.offset != null) params.offset = q.offset
				if (q.ordering) params.ordering = q.ordering
				if (q.search) params.search = q.search

				const response = await axios.get(
					this.$config.BACKEND_API_ROUTE+"asset/bases/",
					{ headers: this.header, params }
				)

				const data = response.data
				const results = data.results || data

				if (typeof data.count === 'number') {
					this.total = data.count
				} else {
					this.total = results.length
				}

				const templateResponse = await axios.get(
					this.$config.BACKEND_API_ROUTE+"templates/",
					{ headers: this.header }
				)

				const templates = {}
				templateResponse.data.forEach(template => {
					templates[template.id] = template.name
				})

				results.forEach(asset => {
					if (asset.template && templates[asset.template]) {
						asset.template = templates[asset.template]
					}
				})

				results.forEach(data => {
					if(data.accountinfo) {
						Object.keys(data.accountinfo).forEach(accountinfo => {
							if(!this.rowheader.includes("Account info : " + accountinfo)) {
								this.rowheader.push("Account info : " + accountinfo)
							}
							data["Account info : " + accountinfo] = data.accountinfo[accountinfo]
						})
					}
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
			await this.getAssets(this.query)
		},
		async handleQueryChange(newQuery) {
			if (!this.isbusy) {
				this.isbusy = true
				this.query = {
					...this.query,
					...newQuery,
				}

				await this.getAssets(this.query)
			}
		},
		handleExport({ scope, rows }) {
			const csv = this.buildCsvFromRows(rows)
			const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.setAttribute('download', `assets_${scope}.csv`)
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
		async exportAllAssets({ filter, ordering }) {
			const allRows = []

			const params = {
				accountinfo: true
			}
			if (filter) params.search = filter
			if (ordering) params.ordering = ordering

			const { data } = await axios.get(
				this.$config.BACKEND_API_ROUTE + "asset/bases/",
				{ headers: this.header, params }
			)

			const results = data.results || data
			allRows.push(...results)

			this.handleExport({ scope: 'all', rows: allRows })
		}
	}
}
</script>