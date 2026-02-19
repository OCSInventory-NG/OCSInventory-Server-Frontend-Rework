<template>
	<div 
		id="ipdiscover" 
		class="container-xl"
	>
		<div>
			<PageHeader page-title="ipdiscover" />

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
							<b-tabs
								content-class="col-10"
								pills
								card
								vertical
							>
								<b-tab
									v-for="netgroup in netgroups"
									:key="netgroup.id"
									:title="netgroup.name"
									title-item-class="ocs-menu-tab"
									lazy
								>
									<Datatable
										id="networks-datatable"
										:rowdata="netgroup.networks"
										:rowheader="rowheader"
										title="networks"
										:candelete="candelete"
										:canedit="canedit"
										:canaccesschild="true"
										:hiddenfields="hiddenfields"
										:isbusy="isbusy"
										editcomponent="NetworkModal"
										translationkey="network."
										@reloadDatatable="reloadDatatable"
									/>
								</b-tab>
							</b-tabs>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "Ipdiscover",
	data() {
		return {
			errormsg: null,
			errored: false,

			rowdata: [],
			rowheader: [],
			netgroups: [],
			hiddenfields: ["id"],

			canedit: false,
			candelete: false,
			canviewnetdevice: false,
			
			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (permissions.includes("network_view_network")) {
			if (permissions.includes("netdevice_view_netdevice")) {
				this.canviewnetdevice = true
			}
			if (permissions.includes("network_change_network")) {
				this.canedit = true
			}
			if (permissions.includes("network_delete_network")) {
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
				const header = await this.$api.generic.options("networks/")
				this.rowheader = Object.keys(header.actions.POST).filter(
					(f) => !["group"].includes(f)
				)

				// Get netgroups
				await this.getNetgroups()
				// Get networks
				await this.getNetworks()

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

		async getNetgroups() {
			this.loading = true
			this.netgroups = []

			try {
				const data = await this.$api.generic.get("netgroups/")
				const netgroups = Array.isArray(data) ? data : (data?.results || [])

				this.netgroups = [
					{
						id: 0,
						name: this.$t("network.unknown_network"),
						description: "",
						networks: [],
					},
					...netgroups.map((g) => ({
						id: g.id,
						name: g.name,
						description: g.description,
						networks: [],
					})),
				]

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async getNetworks() {
			this.isbusy = true

			try {
				const data = await this.$api.generic.get("networks/")
				const networks = Array.isArray(data) ? data : (data?.results || [])

				for (const g of this.netgroups) {
					g.networks = []
				}

				const byId = new Map(this.netgroups.map((g) => [g.id, g]))

				for (const n of networks) {
					const group = byId.get(n.group) || byId.get(0)

					group.networks.push({
						...n,
						netdevices: Array.isArray(n?.netdevices) ? n.netdevices.length : n.netdevices,
					})
				}

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
			await this.getNetworks()
		},
	}
}
</script>