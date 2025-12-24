<template>
	<div 
		id="multisearch" 
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="multisearch"
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

						<div>
							<Search
								@reloadDatatable="reloadDatatable"
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
								title="asset/bases"
								translationkey="inventory."
								@reloadDatatable="reloadDatatable"
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
import axios from 'axios'

export default {
	name: "Multisearch",
	data() {
		return {
			errormsg: null,
			rowdata: [],
			rowheader: [],
			rowsearch: [],
			assetids: [],
			loading: true,
			errored: false,
			noresult: null,
			candelete: false,
			translation_col_keys: {
				"results": "deployment",
				"logs": "inventory",
				"snmpscanner": "snmp",
				"inventory_sections": "inventory"
			},
			translation_title_keys: {
				"results": "deployment",
				"logs": "inventory_logs",
				"snmpscanner": "snmpscanner",
				"inventory_sections": "inventory"
			},
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async mounted() {
		if(localStorage.getItem('permissions').split(",").includes("inventory_base_view_inventorybase")) {
			if(localStorage.getItem('permissions').split(",").includes("inventory_base_delete_inventorybase")) {
				this.candelete = true
			}
			await this.getAccountinfoCfg()
			await this.getHeader()
			if(localStorage.getItem("useSavedSearch")) {
				this.reloadDatatable()
				localStorage.removeItem("useSavedSearch")
			}
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
						if(!["matched"].includes(field)) {
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
				.finally(() => this.loading = false)
		},
		async getAccountinfoCfg() {
			this.rowheader = []
			try {
				var params = {
					datatarget: "ASSET"
				}
				const response = await axios.get(
					this.$config.BACKEND_API_ROUTE+"accountinfo/config/",
					{ headers: this.header, params }
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
		async reloadDatatable(search) {
			await this.getAccountinfoCfg()
			await this.getHeader()
			this.loading = true
			this.rowsearch = search ?? JSON.parse(localStorage.getItem("multisearch"))

			var params = {
				accountinfo: true
			}

			try {
				const response = await axios.post(
					this.$config.BACKEND_API_ROUTE + "search/",
					this.rowsearch,
					{ headers: this.header, params }
				)

				this.rowdata = []
				this.assetids = []
				this.noresult = null

				for (const element of response.data) {
					const row = { ...element }

					const flatMatches = this.flattenMatches(element.matched)

					for (const [key, value] of Object.entries(flatMatches)) {
						this.ensureHeaderKey(key)
						row[key] = value
					}

					delete row.matched

					if(row.accountinfo) {
						Object.keys(row.accountinfo).forEach(accountinfo => {
							if(!this.rowheader.includes("Account info : " + accountinfo)) {
								this.rowheader.push("Account info : " + accountinfo)
							}
							row["Account info : " + accountinfo] = row.accountinfo[accountinfo]
						})
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
				this.loading = false
			}
		},
		flattenMatches(matched) {
			const flat = {}

			for (const [type, matches] of Object.entries(matched || {})) {
				for (const match of matches || []) {
					for (const [key, value] of Object.entries(match || {})) {
						var col = null
						if (this.$te(this.translation_col_keys[type]+"."+key)) {
							col = `${this.$t("title."+this.translation_title_keys[type])}: ${this.$t(this.translation_col_keys[type]+"."+key)}`
						} else if(type == "inventory_sections") {
							col = `${this.$t("title."+this.translation_title_keys[type])}: ${key}`
						}

						if (col && !flat[col]) flat[col] = []

						if (col && value !== null && value !== undefined) {
							flat[col].push(String(value))
						}
					}
				}
			}

			for (const k in flat) {
				flat[k] = flat[k].join(", ")
			}

			return flat
		},
		ensureHeaderKey(key) {
			if (!this.rowheader.includes(key)) {
				this.rowheader.push(key)
			}
		}
	}
}
</script>