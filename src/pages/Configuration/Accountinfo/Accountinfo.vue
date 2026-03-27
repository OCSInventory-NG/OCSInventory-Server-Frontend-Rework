<template>
	<div 
		id="accountinfo"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="accountinfo" />

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
							<AccountinfoModal
								v-if="canadd"
								@reloadDatatable="reloadDatatable"
							/>

							<Datatable
								id="accountinfodatatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
								:canaddvalue="canaddvalue"
								:isbusy="isbusy"
								is-sticky
								editcomponent="AccountinfoModal"
								title="accountinfo/config"
								titlevalue="accountinfo_param"
								adddvalueroute="accountinfo/value"
								reconciliationname="accountinfo_config"
								translationkey="accountinfo."
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
export default {
	name: "Accountinfo",
	data() {
		return {
			errored: false,
			errormsg: null,

			rowdata: [],
			rowheader: [],
			config: [],

			canadd: false,
			canedit: false,
			candelete: false,
			canaddvalue: false,
			canview: false,

			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (permissions.includes("accountinfo_view_accountinfoconfig")) {
			this.canview = true
			if (permissions.includes("accountinfo_add_accountinfoconfig")) {
				this.canadd = true
			}
			if (permissions.includes("accountinfo_change_accountinfoconfig")) {
				this.canedit = true
			}
			if (permissions.includes("accountinfo_delete_accountinfoconfig")) {
				this.candelete = true
			}
			if (permissions.includes("accountinfo_add_accountinfovalue")) {
				this.canaddvalue = true
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
				const header = await this.$api.generic.options("accountinfo/config/")
				this.rowheader = Object.keys(header.actions.POST)

				// Get accountinfo config
				await this.getAccountinfoConfig()

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

		async getAccountinfoConfig() {
			this.isbusy = true
			try {
				const params = {
					expand: "accountinfo_values"
				}

				const data = await this.$api.generic.get("accountinfo/config/", {}, params)
				this.config = data.results || data

				this.accountinfovaluesTreatment()
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
			}
		},

		accountinfovaluesTreatment() {
			for (const key of Object.keys(this.config || {})) {
				const values = Array.isArray(this.config[key]?.accountinfo_values)
					? this.config[key].accountinfo_values
					: []

				this.config[key].accountinfo_values = values
					.map(v => v?.value)
					.filter(v => v !== null && v !== undefined && v !== "")
					.join("\n")
			}

			this.rowdata = this.config
			this.isbusy = false
		},

		async reloadDatatable() {
			await this.getAccountinfoConfig()
		}
	}
}
</script>