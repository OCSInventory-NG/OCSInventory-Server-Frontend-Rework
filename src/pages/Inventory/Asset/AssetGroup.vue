<template>
	<div 
		id="asset-group" 
		class="container-xl"
	>
		<div>
			<PageHeader page-title="assetgroups" />

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
								id="assetgroup-datatable"
								:rowdata="rowdata"
								:canaccessdetails="true"
								:canedit="canedit"
								:candelete="candelete"
								:rowheader="rowheader"
								:hiddenfields="hiddenfields"
								:isbusy="isbusy"
								is-sticky
								title="assetgroups"
								translationkey="assetgroup."
								editcomponent="AssetGroupModal"
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
	name: 'AssetGroup',
	data() {
		return {
			errored: false,
			errormsg: null,

			rowdata: [],
			rowheader: [],
			hiddenfields: ["id", "allow_group_modification", "groups"],
			
			canedit: false,
			candelete: false,
			
			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (permissions.includes("asset_group_view_assetgroup")) {
			if (permissions.includes("asset_group_change_assetgroup")) {
				this.canedit = true
			}
			if (permissions.includes("asset_group_delete_assetgroup")) {
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
				const header = await this.$api.generic.options("asset/groups/")
				this.rowheader = Object.keys(header.actions.POST).filter(
					(f) => !["search", "assets"].includes(f)
				)
				this.rowheader.push("count")

				// Get asset groups
				await this.getAssetGroups()

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

		async getAssetGroups() {
			try {
				this.isbusy = true

				const data = await this.$api.generic.get(
					"asset/groups/",
					{},
					{ expand: "user,groups" }
				)

				const groups = Array.isArray(data) ? data : (data?.results || [])

				this.rowdata = groups.map((g) => {
					const user = g?.user || {}
					const fullName = (user.first_name && user.first_name !== "")
						? `${user.last_name} ${user.first_name}`
						: user.username

					const groupsText = Array.isArray(g?.groups)
						? g.groups.map((x) => x?.name).filter(Boolean).join("\n")
						: ""

					return {
						...g,
						visibility: this.$t("assetgroup." + g.visibility),
						is_dynamic: this.$t("generic." + g.is_dynamic),
						allow_group_modification: this.$t("generic." + g.allow_group_modification),
						count: Array.isArray(g?.assets) ? g.assets.length : 0,
						user: fullName,
						groups: groupsText,
					}
				})

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
			await this.getAssetGroups()
		}
	}
}
</script>