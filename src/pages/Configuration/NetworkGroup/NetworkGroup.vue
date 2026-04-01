<template>
	<div 
		id="network-group" 
		class="container-xl"
	>
		<div>
			<PageHeader page-title="netgroup" />

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
							<NetworkGroupModal
								v-if="canadd"
								@reload-datatable="reloadDatatable"
							/>

							<Datatable
								id="netgroup-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
								:isbusy="isbusy"
								editcomponent="NetworkGroupModal"
								title="netgroups"
								translationkey="network."
								@reload-datatable="reloadDatatable"
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
	name: "NetworkGroup",
	data() {
		return {
			errored: false,
			errormsg: null,

			canadd: false,
			canedit: false,
			candelete: false,
			canview: false,

			rowdata: [],
			rowheader: [],

			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (permissions.includes("netgroup_view_netgroup")) {
			this.canview = true
			if (permissions.includes("netgroup_add_netgroup")) {
				this.canadd = true
			}
			if (permissions.includes("netgroup_change_netgroup")) {
				this.canedit = true
			}
			if (permissions.includes("netgroup_delete_netgroup")) {
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
				const header = await this.$api.generic.options("netgroups/")
				this.rowheader = Object.keys(header.actions.POST)
				this.rowheader.push("networks")

				// Get netgroups
				await this.getNetgroup()

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

		async getNetgroup() {
			this.isbusy = true
			this.rowdata = []

			try {
				const data = await this.$api.generic.get(
					"netgroups/",
					{},
					{ expand: "networks" }
				)

				const netgroups = Array.isArray(data) ? data : (data?.results || [])

				this.rowdata = netgroups.map((netgroup) => ({
					...netgroup,
					networks: Array.isArray(netgroup?.networks)
						? netgroup.networks.map((n) => n?.netid).filter(Boolean).join(", ")
						: "",
				}))

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
			await this.getNetgroup()
		}
	}
}
</script>