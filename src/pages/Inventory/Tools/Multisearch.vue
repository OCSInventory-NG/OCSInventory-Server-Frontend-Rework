<template>
	<div 
		id="multisearch" 
		class="container-xl"
	>
		<div>
			<PageHeader page-title="multisearch" />

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

						<div>
							<Search
								@reload-datatable="reloadDatatable"
							/>
						</div>

						<hr>

						<div 
							v-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>

						<div v-else>
							<Alert 
								v-if="noresult != null"
								:message="noresult"
								:cols="true"
								variant="info"
							/>

							<Datatable
								id="search-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canaccessdetails="true"
								:candeploy="true"
								:multisearch="true"
								:candelete="candelete"
								:usecheckbox="candelete"
								:isbusy="isbusy"
								title="asset/bases"
								translationkey="inventory."
								@reload-datatable="reloadDatatable"
							/>

							<AssetGroupModal 
								:assetrow="assetids"
								:search="rowsearch"
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
	name: "Multisearch",
	data() {
		return {
			errored: false,
			errormsg: null,

			candelete: false,

			rowdata: [],
			rowheader: [],
			rowsearch: [],
			assetids: [],
			noresult: null,
			translation_col_keys: {
				"results": "deployment",
				"logs": "inventory",
				"snmpscanner": "snmp",
				"inventory_sections": "inventory",
				"software_dictionary_entries": "software"
			},
			translation_title_keys: {
				"results": "deployment",
				"logs": "inventory_logs",
				"snmpscanner": "snmpscanner",
				"inventory_sections": "inventory",
				"software_dictionary_entries": "software_dictionary"
			},

			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
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

		if(localStorage.getItem("useSavedSearch")) {
			this.reloadDatatable()
			localStorage.removeItem("useSavedSearch")
		}
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

		async reloadDatatable(search) {
			this.isbusy = true
			this.loading = true
			this.rowsearch = search ?? JSON.parse(localStorage.getItem("multisearch"))

			try {
				const data = await this.$api.generic.post(
					"search/",
					this.rowsearch,
					{ accountinfo: true } // customParams -> query params
				)

				this.rowdata = []
				this.assetids = []
				this.noresult = null

				for (const element of data || []) {
					const row = { ...element }

					const flatMatches = this.flattenMatches(element.matched)

					for (const [key, value] of Object.entries(flatMatches)) {
						this.ensureHeaderKey(key)
						row[key] = value
					}

					delete row.matched

					if (row.accountinfo && typeof row.accountinfo === "object") {
						for (const [accountinfo, value] of Object.entries(row.accountinfo)) {
							const col = "Account info : " + accountinfo
							if (!this.rowheader.includes(col)) this.rowheader.push(col)
							row[col] = value
						}
					}

					this.rowdata.push(row)
					this.assetids.push(element.id)
				}

				if (this.rowdata.length === 0) {
					this.noresult = this.$t("search.no_result")
				}

				this.successmsg = "success"
				this.successed = true
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = e.response?.data?.error ?? e.message
				this.errored = true
				this.successmsg = null
				this.successed = false
			} finally {
				this.isbusy = false
				this.loading = false
			}
		},

		flattenMatches(matched) {
			const flat = {}

			for (const [type, matches] of Object.entries(matched || {})) {
				for (const match of matches || []) {
					for (const [key, value] of Object.entries(match || {})) {
						let col = null

						const title = this.$t("title." + this.translation_title_keys[type])

						if (this.$te(this.translation_col_keys[type] + "." + key)) {
							const label = this.$t(this.translation_col_keys[type] + "." + key)
							col = `${title}: ${label}`
						} else if (type === "inventory_sections") {
							col = `${title}: ${key}`
						}

						if (!col) continue

						col = this.normalizeHeaderKey(col)

						if (!flat[col]) flat[col] = []
						if (value !== null && value !== undefined) flat[col].push(String(value))
					}
				}
			}

			for (const k in flat) {
				flat[k] = flat[k].join(", ")
			}

			return flat
		},

		ensureHeaderKey(key) {
			const k = this.normalizeHeaderKey(key)
			if (!this.rowheader.includes(k)) {
				this.rowheader.push(k)
			}
		},

		normalizeHeaderKey(key) {
			return String(key)
				.replace(/\s+/g, " ")
				.trim()
		},
	}
}
</script>