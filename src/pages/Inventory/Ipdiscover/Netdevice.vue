<template>
	<div 
		id="netdevice" 
		class="container-xl"
	>
		<div>
			<PageHeader page-title="netdevice" />

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
								id="netdevice-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
								:canaccessdetails="true"
								:canmassprocessing="candelete"
								:canaccesschild="true"
								editcomponent="NetdeviceModal"
								title="netdevice"
								translationkey="network."
								:server-side="true"
								:server-total-rows="total"
								:isbusy="isbusy"
								@change-query="handleQueryChange"
								@export="handleExport"
								@export-all="exportAllNetdevices"
								@reload-datatable="reloadDatatable"
								@filter-by-network="onFilterByNetwork"
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
	name: "Netdevice",
	data() {
		return {
			errormsg: null,
			errored: false,

			canedit: false,
			candelete: false,

			rowdata: [],
			rowheader: [],
			accountinfoName: "",
			total: 0,
			query: {
				limit: localStorage.getItem("perPage") ? Number(localStorage.getItem("perPage")) : 5,
				offset: 0,
				ordering: '-last_seen',
				search: null,
			},

			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (permissions.includes("netdevice_view_netdevice")) {
			if (permissions.includes("netdevice_change_netdevice")) {
				this.canedit = true
			}
			if (permissions.includes("netdevice_delete_netdevice")) {
				this.candelete = true
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
				const header = await this.$api.generic.options("netdevices/")
				this.rowheader = Object.keys(header.actions.POST)

				// Get accountinfo config to complete header
				const accountCfg = await this.$api.generic.get("accountinfo/config/", {}, { datatarget: "IPDISCOVER" })
				for (let i = accountCfg.length - 1; i >= 0; i--) {
					const a = accountCfg[i]
					const label = "Account info : " + a.name
					if (!this.rowheader.includes(label)) {
						this.rowheader.unshift(label)
					}
				}

				// Get netdevices
				await this.getNetdevice(this.query)

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

		async getNetdevice(query = null) {
			this.isbusy = true
			this.rowdata = []

			const q = query || this.query

			try {
				const customParams = {
					expand: "network",
					accountinfo: true,
					network: q.network || null,
				}

				if (this.$route.params.id) customParams.network = this.$route.params.id

				const data = await this.$api.generic.get(
					"netdevices/",
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

				const transformed = (results || []).map((row) => {
					const out = { ...row }

					if (out.network && typeof out.network === "object") {
						out.network_name = out.network.name
						out.network_id = out.network.id
						out.network = out.network.name
					}

					if (out.accountinfo && typeof out.accountinfo === "object") {
						for (const [k, v] of Object.entries(out.accountinfo)) {
							const col = "Account info : " + k
							out[col] = v
						}
					}

					return out
				})

				this.rowdata = transformed
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

		// Export functions
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

		async exportAllNetdevices({ filter, ordering }) {
			try {
				const customParams = {
					expand: "network",
					accountinfo: true,
					network: this.$route.params.id || null,
				}

				const data = await this.$api.generic.get(
					"netdevices/",
					{},
					{
						...customParams,
						search: filter || null,
						ordering: ordering || null,
					}
				)

				const results = data?.results || data || []

				const rows = (results || []).map((row) => {
					const out = { ...row }
					if (out.network && typeof out.network === "object") out.network = out.network.name
					return out
				})

				this.handleExport({ scope: 'all', rows })
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			}
		},

		async onFilterByNetwork(networkId) {
			this.query.network = networkId
			this.query.offset = 0
			await this.getNetdevice(this.query)
		},
	}
}
</script>