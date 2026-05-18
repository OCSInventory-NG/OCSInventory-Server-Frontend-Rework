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
								:searchgroup="initialSearch.search_data"
								:initial-grouped="initialSearch.grouped"
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
								:hascustomactions="hasVisibleCustomActions"
								:multisearch="true"
								:candelete="canDeleteInCurrentMode"
								:usecheckbox="canDeleteInCurrentMode"
								:isbusy="isbusy"
								is-sticky
								title="asset/bases"
								translationkey="inventory."
								@reload-datatable="reloadDatatable"
							>
								<template #cell(firstActions)="{ row }">
									<div>
										<a
											v-if="row.item.__matchedResultsHref"
											:href="row.item.__matchedResultsHref"
											:title="$t('search.view_more_results')"
											class="btn btn-ghost-dark"
											target="_blank"
											rel="noopener noreferrer"
										>
											<font-awesome-icon
												:icon="['fas', 'magnifying-glass-plus']"
											/>
										</a>
									</div>
								</template>
							</Datatable>

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
			baseRowheader: [],
			rowsearch: null,
			assetids: [],
			noresult: null,
			matchLabelCache: {},
			matchTitleCache: {},
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
			initialSearch: this.buildInitialSearchFromRoute(),
		}
	},
	computed: {
		isCurrentSearchGrouped() {
			const currentSearch = this.rowsearch ?? this.initialSearch
			return this.normalizeGroupedState(currentSearch)
		},
		canDeleteInCurrentMode() {
			return this.candelete && this.isCurrentSearchGrouped
		},
		hasVisibleCustomActions() {
			return this.rowdata.some((row) => Boolean(row?.__matchedResultsHref))
		},
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

		if (this.$route?.query?.uuid) {
			this.reloadDatatable(this.initialSearch)
		} else if(localStorage.getItem("useSavedSearch")) {
			this.reloadDatatable()
			localStorage.removeItem("useSavedSearch")
		}
	},
	methods: {
		buildInitialSearchFromRoute() {
			const storedSearch = this.getStoredMultisearch()
			const uuid = this.$route?.query?.uuid
			const grouped = uuid ? false : this.normalizeGroupedState(storedSearch)
			const searchData = uuid
				? this.appendUuidToSearch(storedSearch, uuid)
				: storedSearch

			return {
				search_data: searchData,
				grouped,
				ungroup: !grouped,
			}
		},

		getStoredMultisearch() {
			try {
				const storedSearch = JSON.parse(localStorage.getItem("multisearch"))
				return Array.isArray(storedSearch) ? storedSearch : []
			} catch (e) {
				console.error("Invalid multisearch local storage payload:", e)
				return []
			}
		},

		buildUuidFilter(uuid, link = "AND") {
			return {
				object: "InventoryBase",
				route: "asset/bases",
				field: "uuid",
				fieldtype: "string",
				operator: "iexact",
				value: uuid,
				link,
			}
		},

		appendUuidToSearch(searchData, uuid) {
			const clonedSearchData = JSON.parse(JSON.stringify(searchData || []))

			if (!Array.isArray(clonedSearchData) || !clonedSearchData.length) {
				return [[this.buildUuidFilter(uuid, "")]]
			}

			const hasUuidFilter = clonedSearchData.some((group) => (
				Array.isArray(group) && group.some((filter) => (
					filter?.field === "uuid" &&
					filter?.value === uuid &&
					filter?.route === "asset/bases"
				))
			))

			if (hasUuidFilter) {
				return clonedSearchData
			}

			clonedSearchData.forEach((group) => {
				if (!Array.isArray(group)) {
					return
				}

				group.push(this.buildUuidFilter(uuid, group.length > 0 ? "AND" : ""))
			})

			return clonedSearchData
		},

		normalizeGroupedState(search = {}) {
			if (typeof search.grouped === "boolean") {
				return search.grouped
			}

			if (typeof search.ungroup === "boolean") {
				return !search.ungroup
			}

			return true
		},

		getDefaultSearch() {
			return this.initialSearch
		},

		buildRows(results, { collectHeaders = false, collectAssetIds = false } = {}) {
			const rowheader = collectHeaders ? [...this.baseRowheader] : [...this.rowheader]
			const assetids = []
			const rowdata = []

			for (const element of results || []) {
				const row = { ...element }

				const flatMatches = this.flattenMatches(element.matched)
				const matchedResultsHref = this.hasRemainingMatchedResults(element.matched) && element.uuid
					? this.buildMatchedResultsLink(element.uuid)
					: null

				for (const [key, value] of Object.entries(flatMatches)) {
					const normalizedKey = this.normalizeHeaderKey(key)
					if (collectHeaders && !rowheader.includes(normalizedKey)) {
						rowheader.push(normalizedKey)
					}
					row[normalizedKey] = value
				}

				if (matchedResultsHref) {
					row.__matchedResultsHref = matchedResultsHref
				}

				delete row.matched

				if (row.accountinfo && typeof row.accountinfo === "object") {
					for (const [accountinfo, value] of Object.entries(row.accountinfo)) {
						const col = "Account info : " + accountinfo
						if (collectHeaders && !rowheader.includes(col)) {
							rowheader.push(col)
						}
						row[col] = value
					}
				}

				rowdata.push(row)

				if (collectAssetIds) {
					assetids.push(element.id)
				}
			}

			return { rowdata, rowheader, assetids }
		},

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
				this.baseRowheader = [...this.rowheader]

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

		async getSearchResults() {
			const data = await this.$api.generic.post(
				"search/",
				this.rowsearch,
				{ accountinfo: true }
			)
			const results = Array.isArray(data) ? data : (data?.results || [])
			const { rowdata, rowheader, assetids } = this.buildRows(results, {
				collectHeaders: true,
				collectAssetIds: true,
			})

			this.rowdata = rowdata
			this.rowheader = rowheader
			this.assetids = assetids
			this.noresult = this.rowdata.length === 0 ? this.$t("search.no_result") : null
		},

		async reloadDatatable(search) {
			this.isbusy = true
			this.loading = true
			this.rowsearch = search ?? (this.rowsearch?.search_data ? this.rowsearch : this.getDefaultSearch())

			try {
				await this.getSearchResults()

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

		buildMatchedResultsLink(uuid) {
			if (!uuid) {
				return null
			}

			const route = this.$router.resolve({
				name: "Multisearch",
				query: {
					uuid,
				},
			})

			return route.href
		},

		hasRemainingMatchedResults(matched) {
			return Object.entries(matched || {}).some(([key, value]) => (
				key.endsWith("_remaining_count") &&
				Number(value) > 0
			))
		},

		flattenMatches(matched) {
			const flat = {}

			for (const [type, matches] of Object.entries(matched || {})) {
				if (type.endsWith("_remaining_count")) {
					continue
				}

				if (!Array.isArray(matches)) {
					continue
				}

				const title = this.getMatchTitle(type)

				for (const match of matches || []) {
					const sectionName = type === "inventory_sections" ? this.normalizeHeaderKey(match?.section) : null

					for (const [key, value] of Object.entries(match || {})) {
						let col = null

						if (this.$te(this.translation_col_keys[type] + "." + key) && key !== "installation_number") {
							const label = this.getMatchLabel(type, key)
							col = `${title}: ${label}`
						} else if (type === "inventory_sections") {
							if (key === "section" || !sectionName) continue
							col = `${sectionName}: ${key}`
						}

						if (!col) continue

						col = this.normalizeHeaderKey(col)
						if (value === null || value === undefined) continue

						if (!flat[col]) {
							flat[col] = String(value)
							continue
						}
					}
				}
			}

			return flat
		},

		getMatchTitle(type) {
			if (!this.matchTitleCache[type]) {
				this.matchTitleCache[type] = this.$t("title." + this.translation_title_keys[type])
			}

			return this.matchTitleCache[type]
		},

		getMatchLabel(type, key) {
			const cacheKey = `${type}:${key}`

			if (!this.matchLabelCache[cacheKey]) {
				this.matchLabelCache[cacheKey] = this.$t(this.translation_col_keys[type] + "." + key)
			}

			return this.matchLabelCache[cacheKey]
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
