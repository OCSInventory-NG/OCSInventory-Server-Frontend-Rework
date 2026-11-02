<template>
	<div
		id="vulnerability-coverage"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="vulnerability_coverage" />

			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<Alert
							v-if="denied"
							:message="$t('message.dont_have_right_to_see')"
							:cols="true"
							variant="danger"
						/>
						<Alert
							v-else-if="errored"
							:message="errormsg"
							:cols="true"
							variant="danger"
						/>
						<div
							v-else-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>
						<template v-else>
							<b-tabs
								content-class="col-10 sticky-tabs"
								pills
								card
								vertical
							>
								<!-- Each test, in its order, sets aside the installations it cannot check -->
								<b-tab
									:title="$t('security.funnel')"
									title-item-class="ocs-menu-tab"
								>
									<StatTiles :tiles="tiles" />
									<div
										v-for="family in families"
										:key="family.family"
										class="mb-3"
									>
										<div class="d-flex justify-content-between mb-1">
											<strong>{{ $t('software_identity.family_' + family.family) }}</strong>
											<span :class="family.checked < family.total ? 'text-warning' : 'text-success'">
												{{ $t('security.checked_share', { checked: family.checked, total: family.total }) }}
											</span>
										</div>
										<div class="progress progress-sm">
											<div
												class="progress-bar bg-success"
												:style="{ width: share(family.checked, family.total) + '%' }"
											/>
										</div>
									</div>
									<Datatable
										id="coverage-states-datatable"
										:rowdata="stateRows"
										:rowheader="stateColumns"
										:fieldlabels="familyLabels"
										:usecheckbox="false"
										:candeletemultiple="false"
										:cansearch="false"
										title="coverage_states"
										translationkey="security.column_"
										compactheader
									>
										<template #cell(state)="{ row }">
											<InstallationState :state="row.item.state" />
										</template>
									</Datatable>
								</b-tab>

								<b-tab
									:title="$t('security.running_kernels')"
									title-item-class="ocs-menu-tab"
								>
									<Datatable
										id="coverage-kernels-datatable"
										:rowdata="kernelRows"
										:rowheader="['state', 'count']"
										:usecheckbox="false"
										:candeletemultiple="false"
										:cansearch="false"
										title="coverage_kernels"
										translationkey="security.column_"
										compactheader
									>
										<template #cell(state)="{ row }">
											<span
												class="badge"
												:class="row.item.state === 'checked' ? 'bg-green-lt' : 'bg-yellow-lt'"
											>{{ kernelLabel(row.item.state) }}</span>
										</template>
									</Datatable>
								</b-tab>

								<b-tab
									:title="$t('security.sources')"
									title-item-class="ocs-menu-tab"
								>
									<Datatable
										id="coverage-sources-datatable"
										:rowdata="sourceRows"
										:rowheader="sourceColumns"
										:usecheckbox="false"
										:candeletemultiple="false"
										title="coverage_sources"
										translationkey="security.column_"
										compactheader
									>
										<template #cell(source_state)="{ row }">
											<span
												class="badge"
												:class="sourceStateClass(row.item.source_state)"
											>{{ $t('security.source_state_' + row.item.source_state) }}</span>
										</template>
										<template #cell(last_success)="{ row }">
											<span :class="{ 'text-warning': !row.item.last_success }">
												{{ row.item.last_success ? formatDateTime(row.item.last_success) : $t('security.never') }}
											</span>
										</template>
										<template #cell(last_attempt)="{ row }">
											{{ row.item.last_attempt ? formatDateTime(row.item.last_attempt) : $t('security.never') }}
										</template>
										<template #cell(record_count)="{ row }">
											{{ (row.item.record_count || 0).toLocaleString() }}
										</template>
										<template #cell(source_error)="{ row }">
											<span class="text-danger">{{ row.item.source_error }}</span>
										</template>
									</Datatable>
								</b-tab>
							</b-tabs>
						</template>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { hasPermission } from "@/utils/permissions"
import { apiErrorMessage, formatDateTime } from "@/utils/security"

// "2002-2026" for consecutive years
function yearRanges(years) {
	const sorted = [...new Set(years.map(Number))].filter((year) => !Number.isNaN(year)).sort((a, b) => a - b)
	const ranges = []
	for (const year of sorted) {
		const last = ranges[ranges.length - 1]
		if (last && year === last[1] + 1) {
			last[1] = year
		} else {
			ranges.push([year, year])
		}
	}
	return ranges.map(([start, end]) => (start === end ? `${start}` : `${start}-${end}`)).join(", ")
}

export default {
	name: "Coverage",
	data() {
		return {
			denied: false,
			errored: false,
			errormsg: null,
			loading: true,
			coverage: { states: [], families: [], sources: [], kernels: {} },
			scans: ["last_full_scan", "last_incremental_scan", "last_exposure"],
			sourceColumns: ["source_name", "source_state", "last_success", "last_attempt", "record_count", "scope", "source_error"],
		}
	},
	computed: {
		families() {
			return (this.coverage.families || []).map((family) => {
				const installations = family.installations || {}
				const total = Object.values(installations).reduce((sum, count) => sum + count, 0)
				return { family: family.family, installations, total, checked: installations.checked || 0 }
			})
		},
		// The server order is the order of the tests; states it did not list come last
		states() {
			const states = [...(this.coverage.states || [])]
			for (const family of this.families) {
				for (const state of Object.keys(family.installations)) {
					if (!states.includes(state)) states.push(state)
				}
			}
			return states
		},
		totals() {
			const all = this.families.reduce((sum, family) => sum + family.total, 0)
			const checked = this.families.reduce((sum, family) => sum + family.checked, 0)
			const kernels = Object.entries(this.coverage.kernels || {})
				.filter(([state]) => state !== "checked")
				.reduce((sum, [, count]) => sum + count, 0)
			return {
				all,
				checked,
				unchecked: this.coverage.unchecked || 0,
				excluded: this.coverage.excluded || 0,
				kernels,
			}
		},
		tiles() {
			const date = (scan) => (this.coverage[scan] ? formatDateTime(this.coverage[scan]) : this.$t("security.never"))
			return [
				{ label: this.$t("security.state_checked"), value: this.$t("security.checked_share", { checked: this.totals.checked, total: this.totals.all }), small: true },
				{ label: this.$t("security.not_checked"), value: this.totals.unchecked, warn: this.totals.unchecked > 0 },
				{ label: this.$t("security.state_excluded"), value: this.totals.excluded },
				{ label: this.$t("security.kernels_unchecked"), value: this.totals.kernels, warn: this.totals.kernels > 0 },
				...this.scans.map((scan) => ({ label: this.$t("security." + scan), value: date(scan), warn: !this.coverage[scan], small: true })),
			]
		},
		stateColumns() {
			return ["position", "state", ...this.families.map((family) => "family_" + family.family), "total"]
		},
		familyLabels() {
			return Object.fromEntries(this.families.map((family) =>
				["family_" + family.family, this.$t("software_identity.family_" + family.family)]))
		},
		// One row per state, in the order of the tests. A state no installation is in
		// is left out, the checked row always stays
		stateRows() {
			return this.states.map((state, index) => {
				const row = { id: state, position: index + 1, state, total: 0 }
				for (const family of this.families) {
					const count = family.installations[state] || 0
					row["family_" + family.family] = count
					row.total += count
				}
				return row
			}).filter((row) => row.total || row.state === "checked")
		},
		kernelRows() {
			return Object.entries(this.coverage.kernels || {}).map(([state, count]) => ({ id: state, state, count }))
		},
		// the datatable draws "error" itself: renamed
		sourceRows() {
			return (this.coverage.sources || []).map((source) => ({
				id: source.source,
				source_name: this.sourceLabel(source.source),
				source_state: source.state,
				last_success: source.last_success,
				last_attempt: source.last_attempt,
				record_count: source.record_count,
				scope: this.sourceScope(source),
				source_error: source.error,
			}))
		},
	},
	async mounted() {
		if (!hasPermission("security_view_vulnerability")) {
			this.denied = true
			return
		}
		try {
			this.coverage = await this.$api.generic.get("vulnerabilities/coverage/")
		} catch (e) {
			this.errormsg = apiErrorMessage(e)
			this.errored = true
		} finally {
			this.loading = false
		}
	},
	methods: {
		formatDateTime,

		share(count, total) {
			return total ? ((count || 0) * 100) / total : 0
		},
		stateLabel(state) {
			return this.$te("security.state_" + state) ? this.$t("security.state_" + state) : state
		},
		kernelLabel(state) {
			return state === "host_kernel_unverified" || state === "not_applicable"
				? this.$t("security.kernel_" + state)
				: this.stateLabel(state)
		},
		sourceLabel(source) {
			return this.$te("security.source_" + source) ? this.$t("security.source_" + source) : source
		},
		sourceStateClass(state) {
			if (state === "fresh") return "bg-green-lt"
			if (state === "stale") return "bg-orange-lt"
			return "bg-red-lt"
		},
		// Ecosystems of an OSV source, years of the NVD
		sourceScope(source) {
			const details = source.details || {}
			const parts = []
			if (Array.isArray(details.ecosystems) && details.ecosystems.length) {
				parts.push(details.ecosystems.join(", "))
			}
			// the NVD gives the loaded years, sorted
			if (Array.isArray(details.window) && details.window.length) {
				parts.push(this.$t("security.nvd_years_loaded", { years: yearRanges(details.window) }))
			}
			return parts.join(" · ")
		},
	},
}
</script>
