<template>
	<div 
		id="packages" 
		class="container-xl"
	>
		<div>
			<PageHeader page-title="deployment" />

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
							<PackageModal
								v-if="canadd"
								@reload-datatable="reloadDatatable"
							/>

							<Datatable
								id="packages-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:candelete="candelete"
								:canedit="canedit"
								:canviewaction="canviewaction"
								:isbusy="isbusy"
								is-sticky
								editcomponent="PackageModal"
								title="deployment/packages"
								translationkey="deployment."
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
	name: 'Packages',
	data() {
		return {
			errormsg: null,
			errored: false,

			canadd: false,
			canedit: false,
			candelete: false,
			canview: false,
			canviewaction: false,

			rowdata: [],
			rowheader: [],
			
			isbusy:true,
			loading: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (permissions.includes("package_view_package")) {
			this.canview = true
			if (permissions.includes("package_add_package")) {
				this.canadd = true
			}
			if (permissions.includes("package_change_package")) {
				this.canedit = true
			}
			if (permissions.includes("package_delete_package")) {
				this.candelete = true
			}
			if (permissions.includes("action_view_deploymentaction")) {
				this.canviewaction = true
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
				const header = await this.$api.generic.options("deployment/packages/")
				this.rowheader = Object.keys(header.actions.POST).filter(
					(f) => !["result"].includes(f)
				)

				// Get packages
				await this.getPackages()

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

		async getPackages() {
			try {
				this.isbusy = true

				const data = await this.$api.generic.get("deployment/packages/")
				const packages = Array.isArray(data) ? data : (data?.results || [])

				this.rowdata = packages.map((pkg) => ({
					...pkg,
					actions_list: Array.isArray(pkg?.actions_list)
						? pkg.actions_list.length
						: pkg.actions_list,
				}))

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error)
					? e.response.data.error
					: e.message
				this.errored = true
			} finally {
				this.isbusy = false
			}
		},

		async reloadDatatable() {
			await this.getPackages()
		}
	}
}
</script>