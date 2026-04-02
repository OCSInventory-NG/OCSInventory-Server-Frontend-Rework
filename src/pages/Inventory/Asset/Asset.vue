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
			total: 0,

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

		async getAssets(query) {
			this.isbusy = true
			try {
				const [assetsData, templates] = await Promise.all([
					this.$api.generic.get("asset/bases/", query, { accountinfo: true }),
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

				this.rowdata = results
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
			} finally {
				this.isbusy = false
			}
		},

		async reloadDatatable() {
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
				ordering: ordering,
				search: filter,
			}

			const data = await this.$api.generic.get("asset/bases/", params, { accountinfo: true })

			const results = data.results || data
			allRows.push(...results)

			this.handleExport({ scope: 'all', rows: allRows })
		}
	}
}
</script>