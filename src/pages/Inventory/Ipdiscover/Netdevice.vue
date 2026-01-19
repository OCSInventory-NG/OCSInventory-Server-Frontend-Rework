<template>
	<div 
		id="netdevice" 
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="netdevice"
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
								id="netdevice-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
								:canaccessdetails="true"
								:canmassprocessing="true"
								editcomponent="NetdeviceModal"
								title="netdevice"
								translationkey="network."
								:server-side="true"
								:server-total-rows="total"
								:isbusy="isbusy"
								@change-query="handleQueryChange"
								@export="handleExport"
								@export-all="exportAllNetdevices"
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
	name: "Netdevice",
	data() {
		return {
			errormsg: null,
			rowdata: [],
			rowheader: [],
			loading: true,
			errored: false,
			canedit: false,
			candelete: false,
			accountinfoName: "",
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			total: 0,
			query: {
				limit: (localStorage.getItem("perPage")) ? localStorage.getItem("perPage") : 5,
				offset: 0,
				ordering: '-last_seen',
				search: null,
			},
			isbusy: true,
		}
	},
	async mounted() {
		if(localStorage.getItem('permissions').split(",").includes("netdevice_view_netdevice")) {
			if(localStorage.getItem('permissions').split(",").includes("netdevice_change_netdevice")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("netdevice_delete_netdevice")) {
				this.candelete = true
			}
			await this.getAccountinfoCfg()
			await this.getHeader()
			await this.getNetdevice(this.query)
			this.loading = false
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
		}
	},
	methods: {
		async getHeader() {
			await axios.options(this.$config.BACKEND_API_ROUTE+"netdevices/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						this.rowheader.push(field)
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
					this.$config.BACKEND_API_ROUTE+"accountinfo/config/?datatarget=IPDISCOVER",
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
		// Retrieve netdevice
		async getNetdevice(query = null) {
			this.rowdata = []

			const q = query || this.query

			const params = {
				expand: 'network',
				accountinfo: true,
			}

			if (q.limit != null) params.limit = q.limit
			if (q.offset != null) params.offset = q.offset
			if (q.ordering) params.ordering = q.ordering
			if (q.search) params.search = q.search

			if(this.$route.params.id) params.network = this.$route.params.id

			await axios.get(this.$config.BACKEND_API_ROUTE+"netdevices/",
				{ headers: this.header, params })
				.then(response => {
					const data = response.data
					const results = data.results || data

					if (typeof data.count === 'number') {
						this.total = data.count
					} else {
						this.total = results.length
					}
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

					for (const netdevice of results) {
						netdevice.network = netdevice.network.name
					}

					this.rowdata = results

					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
				.finally(() => {
					this.isbusy = false
				})
		},
		async reloadDatatable() {
			this.isbusy = true
			await this.getNetdevice(this.query)
		},
		async handleQueryChange(newQuery) {
			if (!this.isbusy) {
				this.isbusy = true
				this.query = {
					...this.query,
					...newQuery,
				}
				await this.getNetdevice(this.query)
			}
		},
		handleExport({ scope, rows }) {
			const csv = this.buildCsvFromRows(rows)
			const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.setAttribute('download', `netdevices_${scope}.csv`)
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
		async exportAllNetdevices({ filter, ordering }) {
			const allRows = []
			const params = {}

			if (filter) params.search = filter
			if (ordering) params.ordering = ordering

			if(this.$route.params.id) params.network = this.$route.params.id

			const { data } = await axios.get(
				this.$config.BACKEND_API_ROUTE + "netdevices/",
				{ headers: this.header, params }
			)

			const results = data.results || data
			allRows.push(...results)

			this.handleExport({ scope: 'all', rows: allRows })
		}
	}
}
</script>