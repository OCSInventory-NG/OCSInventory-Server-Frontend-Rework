<template>
	<div
		id="windows-build-mapping"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="windows_build_mapping" />

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
							<WindowsBuildMappingModal
								v-if="canadd"
								@reload-datatable="reloadDatatable"
							/>

							<Datatable
								id="windows-build-mapping-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
								:isbusy="isbusy"
								is-sticky
								editcomponent="WindowsBuildMappingModal"
								title="windows-build-mapping"
								translationkey="compliance."
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
	name: "WindowsBuildMapping",
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

		if (permissions.includes("compliance_view_windowsbuildmapping")) {
			this.canview = true
			if (permissions.includes("compliance_add_windowsbuildmapping")) {
				this.canadd = true
			}
			if (permissions.includes("compliance_change_windowsbuildmapping")) {
				this.canedit = true
			}
			if (permissions.includes("compliance_delete_windowsbuildmapping")) {
				this.candelete = true
			}
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
			this.isbusy = false
			return
		}

		await this.loadInitial()
	},
	methods: {
		async loadInitial() {
			this.loading = true
			this.isbusy = true
			try {
				const header = await this.$api.generic.options("compliance/windows-build-mapping/")
				this.rowheader = Object.keys(header.actions.POST)

				await this.getMappings()

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

		async getMappings() {
			this.isbusy = true
			this.rowdata = []

			try {
				const data = await this.$api.generic.get("compliance/windows-build-mapping/")
				this.rowdata = Array.isArray(data) ? data : (data?.results || [])
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
			} finally {
				this.isbusy = false
			}
		},

		async reloadDatatable() {
			await this.getMappings()
		},
	},
}
</script>
