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
						<b-tabs>
							<b-tab :title="$t('compliance.tab_windows_build')">
								<div
									v-if="wbm.errored"
									class="mt-3"
								>
									<Alert
										:message="wbm.errormsg"
										:cols="true"
										variant="danger"
									/>
								</div>

								<div
									v-if="wbm.loading"
									class="ocs-loader mt-3"
								>
									<Loader />
								</div>

								<div v-else>
									<WindowsBuildMappingModal
										v-if="wbm.canadd"
										@reload-datatable="reloadWbm"
									/>

									<Datatable
										id="windows-build-mapping-datatable"
										:rowdata="wbm.rowdata"
										:rowheader="wbm.rowheader"
										:canedit="wbm.canedit"
										:candelete="wbm.candelete"
										:isbusy="wbm.isbusy"
										is-sticky
										editcomponent="WindowsBuildMappingModal"
										title="compliance/windows-build-mapping"
										translationkey="compliance."
										@reload-datatable="reloadWbm"
									/>
								</div>
							</b-tab>

							<b-tab :title="$t('compliance.tab_eol_mapping')">
								<div
									v-if="eol.errored"
									class="mt-3"
								>
									<Alert
										:message="eol.errormsg"
										:cols="true"
										variant="danger"
									/>
								</div>

								<div
									v-if="eol.loading"
									class="ocs-loader mt-3"
								>
									<Loader />
								</div>

								<div v-else>
									<EOLMappingModal
										v-if="eol.canadd"
										@reload-datatable="reloadEol"
									/>

									<Datatable
										id="eol-mapping-datatable"
										:rowdata="eol.rowdata"
										:rowheader="eol.rowheader"
										:canedit="eol.canedit"
										:candelete="eol.candelete"
										:isbusy="eol.isbusy"
										is-sticky
										editcomponent="EOLMappingModal"
										title="compliance/eol-extended-support"
										translationkey="compliance."
										@reload-datatable="reloadEol"
									/>
								</div>
							</b-tab>
						</b-tabs>
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
			wbm: {
				errored: false,
				errormsg: null,
				canadd: false,
				canedit: false,
				candelete: false,
				rowdata: [],
				rowheader: [],
				isbusy: true,
				loading: true,
			},
			eol: {
				errored: false,
				errormsg: null,
				canadd: false,
				canedit: false,
				candelete: false,
				rowdata: [],
				rowheader: [],
				isbusy: true,
				loading: true,
			},
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		await Promise.all([
			this.loadWbm(permissions),
			this.loadEol(permissions),
		])
	},
	methods: {
		async loadWbm(permissions) {
			if (!permissions.includes("compliance_view_windowsbuildmapping")) {
				this.wbm.errormsg = this.$t("message.dont_have_right_to_see")
				this.wbm.errored = true
				this.wbm.loading = false
				this.wbm.isbusy = false
				return
			}
			this.wbm.canadd = permissions.includes("compliance_add_windowsbuildmapping")
			this.wbm.canedit = permissions.includes("compliance_change_windowsbuildmapping")
			this.wbm.candelete = permissions.includes("compliance_delete_windowsbuildmapping")

			this.wbm.loading = true
			this.wbm.isbusy = true
			try {
				const header = await this.$api.generic.options("compliance/windows-build-mapping/")
				this.wbm.rowheader = Object.keys(header.actions.POST)
				await this.reloadWbm()
				this.wbm.errored = false
				this.wbm.errormsg = null
			} catch (e) {
				this.wbm.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.wbm.errored = true
			} finally {
				this.wbm.loading = false
				this.wbm.isbusy = false
			}
		},

		async reloadWbm() {
			this.wbm.isbusy = true
			this.wbm.rowdata = []
			try {
				const data = await this.$api.generic.get("compliance/windows-build-mapping/")
				this.wbm.rowdata = Array.isArray(data) ? data : (data?.results || [])
				this.wbm.errored = false
				this.wbm.errormsg = null
			} catch (e) {
				this.wbm.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.wbm.errored = true
			} finally {
				this.wbm.isbusy = false
			}
		},

		async loadEol(permissions) {
			if (!permissions.includes("compliance_view_customeolextendedsupport")) {
				this.eol.errormsg = this.$t("message.dont_have_right_to_see")
				this.eol.errored = true
				this.eol.loading = false
				this.eol.isbusy = false
				return
			}
			this.eol.canadd = permissions.includes("compliance_add_customeolextendedsupport")
			this.eol.canedit = permissions.includes("compliance_change_customeolextendedsupport")
			this.eol.candelete = permissions.includes("compliance_delete_customeolextendedsupport")

			this.eol.loading = true
			this.eol.isbusy = true
			try {
				const header = await this.$api.generic.options("compliance/eol-extended-support/")
				this.eol.rowheader = Object.keys(header.actions.POST)
				await this.reloadEol()
				this.eol.errored = false
				this.eol.errormsg = null
			} catch (e) {
				this.eol.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.eol.errored = true
			} finally {
				this.eol.loading = false
				this.eol.isbusy = false
			}
		},

		async reloadEol() {
			this.eol.isbusy = true
			this.eol.rowdata = []
			try {
				const data = await this.$api.generic.get("compliance/eol-extended-support/")
				this.eol.rowdata = Array.isArray(data) ? data : (data?.results || [])
				this.eol.errored = false
				this.eol.errormsg = null
			} catch (e) {
				this.eol.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.eol.errored = true
			} finally {
				this.eol.isbusy = false
			}
		},
	},
}
</script>
