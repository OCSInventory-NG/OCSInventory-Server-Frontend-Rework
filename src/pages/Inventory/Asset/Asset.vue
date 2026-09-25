<template>
	<div
		id="assets"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="assets" />

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
								id="assets-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:hiddenfields="hiddenfields"
								virtualcoltarget="asset"
								:fieldlabels="virtualcollabels"
								:canaccessdetails="true"
								:candelete="candelete"
								:candeploy="true"
								:canmassprocessing="candelete"
								title="asset/bases"
								translationkey="inventory."
								sortby="last_update"
								sortdesc="desc"
								:server-side="true"
								:server-total-rows="total"
								:isbusy="isbusy"
								is-sticky
								@change-query="handleQueryChange"
								@export="handleExport"
								@export-all="exportAllAssets"
								@reload-datatable="reloadDatatable"
							/>
						</div>

						<!-- To integrate a specific slot for plugin -->
						<!--
						<ExtensionSlot
							name="inventory.assets.afterDatatable"
							:context="{ total, query }"
						/>
						-->
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "Assets",

	data() {
		return {
			errored: false,
			errormsg: null,

			rowdata: [],
			rowheader: [],
			baserowheader: [],
			total: 0,

			// virtual columns defined by an administrator for this table
			virtualcols: [],

			candelete: false,
			hiddenfields: ["id", "uuid", "template", "agent", "is_template_forced"],

			query: {
				limit: localStorage.getItem("perPage") ? Number(localStorage.getItem("perPage")) : 5,
				offset: 0,
				ordering: "-last_update",
				search: null,
			},

			loading: true,
			isbusy: true,
		}
	},

	computed: {
		// keyed by id, a name may be shared or match a native column
		virtualcolkeys() {
			return this.virtualcols.map((col) => `vc_${col.id}`)
		},
		virtualcollabels() {
			return Object.fromEntries(this.virtualcols.map((col) => [`vc_${col.id}`, col.name]))
		},
	},

	async mounted() {
		// Rights
		const rawPermissions = localStorage.getItem("permissions")
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (!permissions.includes("inventory_base_view_inventorybase")) {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
			this.isbusy = false
			return
		}
		this.candelete = permissions.includes("inventory_base_delete_inventorybase")

		// Data init
		await this.loadInitial()
	},

	methods: {
		async loadInitial() {
			this.loading = true
			this.isbusy = true
			try {
				// Get header
				const header = await this.$api.generic.options("asset/bases/")
				this.rowheader = Object.keys(header.actions.POST).filter((f) => f !== "matched")

				// Get accountinfo config to complete header
				const accountCfg = await this.$api.generic.get("accountinfo/config/", {}, { datatarget: "ASSET" })
				for (let i = accountCfg.length - 1; i >= 0; i--) {
					const a = accountCfg[i]
					const label = "Account info : " + a.name
					if (!this.rowheader.includes(label)) {
						this.rowheader.unshift(label)
					}
				}

				// Add compliance and EOL columns at the end
				this.rowheader.push('compliance')
				this.rowheader.push('eol')

				// Get virtual columns
				this.baserowheader = [...this.rowheader]
				await this.loadVirtualCols()

				// Get assets
				await this.getAssets(this.query)

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

		async loadVirtualCols() {
			try {
				this.virtualcols = await this.$api.generic.get(
					"virtual_cols/", {}, { target: "asset" }
				)
			} catch (e) {
				this.virtualcols = []
			}

			// header comes from the definition, a column with no value stays
			this.rowheader = [...this.virtualcolkeys, ...this.baserowheader]
		},

		virtualColParams() {
			const params = { accountinfo: true }
			if (this.virtualcols.length) {
				params.virtual_cols = this.virtualcols.map((col) => col.id).join(",")
			}
			return params
		},

		flattenVirtualCols(results) {
			results.forEach((item) => {
				if (!item.virtual_cols) return
				Object.keys(item.virtual_cols).forEach((key) => {
					item[key] = item.virtual_cols[key]
				})
				delete item.virtual_cols
			})
		},

		async getAssets(query) {
			this.isbusy = true
			try {
				const [assetsData, templates] = await Promise.all([
					this.$api.generic.get("asset/bases/", query, this.virtualColParams()),
					this.$api.generic.get("templates/"),
				])

				const results = assetsData.results || assetsData
				this.total = typeof assetsData.count === "number" ? assetsData.count : results.length

				const templatesMap = {}
				templates.forEach((t) => (templatesMap[t.id] = t.name))

				// template id => template name
				results.forEach((asset) => {
					if (asset.template && templatesMap[asset.template]) {
						asset.template = templatesMap[asset.template]
					}
				})

				// Flatten accountinfo
				results.forEach((item) => {
					if (!item.accountinfo) return
					Object.keys(item.accountinfo).forEach((k) => {
						const label = "Account info : " + k
						item[label] = item.accountinfo[k]
					})
				})

				// Flatten virtual columns
				this.flattenVirtualCols(results)

				// Add compliance and EOL status
				const assetIds = results.map(a => a.id).join(',')

				try {
					const summaries = await this.$api.generic.get(
						'compliance/results/asset-summary/',
						{},
						{ asset__in: assetIds }
					)
					const statusMap = {}
					summaries.forEach(s => { statusMap[s.asset] = s.global_status })
					results.forEach(asset => {
						const s = statusMap[asset.id]
						const labels = {
							non_compliant: this.$t('compliance.non_compliant'),
							compliant: this.$t('compliance.compliant'),
						}
						asset.compliance = labels[s] || this.$t('compliance.not_applicable')
					})
				} catch {
					results.forEach(asset => {
						asset.compliance = this.$t('compliance.not_applicable')
					})
				}

				try {
					const eolSummaries = await this.$api.generic.get(
						'compliance/eol-status/eol-summary/',
						{},
						{ asset__in: assetIds }
					)
					const eolMap = {}
					eolSummaries.forEach(e => { eolMap[e.asset] = e })
					results.forEach(asset => {
						const e = eolMap[asset.id]
						if (!e || !e.product) {
							asset.eol = this.$t('compliance.eol_unknown')
						} else {
							asset.eol = e.is_eol
								? this.$t('compliance.eol_expired')
								: this.$t('compliance.eol_active')
						}
					})
				} catch {
					results.forEach(asset => {
						asset.eol = this.$t('compliance.eol_unknown')
					})
				}

				this.rowdata = results
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
			} finally {
				this.isbusy = false
			}
		},

		async reloadDatatable() {
			// a column may have just been created or removed
			await this.loadVirtualCols()
			await this.getAssets(this.query)
		},

		async handleQueryChange(newQuery) {
			if (this.isbusy) return
			this.query = { ...this.query, ...newQuery }
			await this.getAssets(this.query)
		},

		// Export functions
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
			csvRows.push(headers.map(h => this.virtualcollabels[h] ?? h).join(';'))

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
				ordering: ordering,
				search: filter,
			}

			const data = await this.$api.generic.get("asset/bases/", params, this.virtualColParams())

			const results = data.results || data
			this.flattenVirtualCols(results)
			allRows.push(...results)

			this.handleExport({ scope: 'all', rows: allRows })
		}
	}
}
</script>