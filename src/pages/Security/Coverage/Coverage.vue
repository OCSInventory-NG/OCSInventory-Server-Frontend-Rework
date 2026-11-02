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
						<b-tabs
							v-else
							v-model="activeTab"
							content-class="col-10 sticky-tabs"
							pills
							card
							vertical
						>
							<!-- What is not checked, and where to act on it -->
							<b-tab
								:title="$t('security.coverage_summary')"
								title-item-class="ocs-menu-tab"
							>
								<StatTiles :tiles="tiles" />
								<p class="coverage-scans mb-3">
									<span
										v-for="scan in scans"
										:key="scan"
									>
										{{ $t('security.' + scan) }} :
										<strong :class="{ 'text-warning': !coverage[scan] }">
											{{ coverage[scan] ? formatDateTime(coverage[scan]) : $t('security.never') }}
										</strong>
									</span>
								</p>

								<div class="hr-text">
									{{ $t('security.unchecked_reasons') }}
								</div>
								<Datatable
									id="coverage-reasons-datatable"
									:rowdata="reasonRows"
									:rowheader="['reason', 'installations', 'share', 'action']"
									:nonsortablefields="['action']"
									:usecheckbox="false"
									:candeletemultiple="false"
									:cansearch="false"
									:emptytext="$t('security.all_checked')"
									title="coverage_reasons"
									translationkey="security.column_"
									compactheader
								>
									<template #cell(reason)="{ row }">
										<InstallationState :state="row.item.state" />
									</template>
									<template #cell(installations)="{ row }">
										{{ row.item.installations.toLocaleString() }}
									</template>
									<template #cell(share)="{ row }">
										<div class="d-flex align-items-center gap-2 coverage-share">
											<div class="progress progress-sm flex-fill">
												<div
													class="progress-bar bg-warning"
													:style="{ width: row.item.share * 100 + '%' }"
												/>
											</div>
											<span class="text-muted small text-nowrap">{{ formatPercent(row.item.share) }}</span>
										</div>
									</template>
									<template #cell(action)="{ row }">
										<router-link
											v-if="row.item.link"
											:to="row.item.link"
											class="ocs-link text-nowrap"
										>
											{{ $t('security.reason_action_' + row.item.actionKey) }}
										</router-link>
										<a
											v-else-if="row.item.actionKey === 'sources'"
											href="#"
											class="ocs-link text-nowrap"
											@click.prevent="activeTab = SOURCES_TAB"
										>
											{{ $t('security.reason_action_sources') }}
										</a>
										<span
											v-else-if="row.item.actionKey"
											class="text-muted text-nowrap"
										>
											{{ $t('security.reason_action_' + row.item.actionKey) }}
										</span>
									</template>
								</Datatable>

								<div class="hr-text">
									{{ $t('security.by_platform') }}
								</div>
								<Datatable
									id="coverage-platforms-datatable"
									:rowdata="platformRows"
									:rowheader="['platform', 'checked', 'unchecked', 'excluded', 'coverage']"
									:usecheckbox="false"
									:candeletemultiple="false"
									:cansearch="false"
									title="coverage_platforms"
									translationkey="security.column_"
									compactheader
								>
									<template #cell(unchecked)="{ row }">
										<span :class="{ 'text-warning': row.item.unchecked }">
											{{ row.item.unchecked.toLocaleString() }}
										</span>
									</template>
									<template #cell(coverage)="{ row }">
										<div class="d-flex align-items-center gap-2 coverage-share">
											<div class="progress progress-sm flex-fill">
												<div
													class="progress-bar bg-success"
													:style="{ width: row.item.coverage * 100 + '%' }"
												/>
											</div>
											<span class="small text-nowrap">{{ formatPercent(row.item.coverage) }}</span>
										</div>
									</template>
								</Datatable>
							</b-tab>

							<!-- The tests of the scan, in their order -->
							<b-tab
								:title="$t('security.coverage_by_state')"
								title-item-class="ocs-menu-tab"
							>
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
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { hasPermission } from "@/utils/permissions"
import { apiErrorMessage, formatDateTime, formatPercent } from "@/utils/security"

// tab of the sources, opened by the "see the sources" action
const SOURCES_TAB = 3
// States that are no missing check, as the coverage counts them
const NOT_UNCHECKED = ["checked", "excluded", "kernel_not_running"]
// Where each reason is acted on: a route, the sources tab, or the next scan
const REASON_ACTIONS = {
	no_identity: { key: "identify", link: { path: "/security/software_identity", query: { tab: "review" } } },
	third_party: { key: "origins", link: { path: "/security/software_identity", query: { tab: "origins" } } },
	no_origin: { key: "origins", link: { path: "/security/software_identity", query: { tab: "origins" } } },
	release_not_tracked: { key: "releases", link: { path: "/security/software_identity", query: { tab: "releases" } } },
	source_never_loaded: { key: "sources" },
	stale: { key: "sources" },
	pending: { key: "next_scan" },
}

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
			activeTab: 0,
			SOURCES_TAB,
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
		// one colour per tile: the coverage blue, what is not checked orange,
		// the exclusions grey, the unchecked kernels red; green once at 0
		tiles() {
			const share = this.totals.all ? this.totals.checked / this.totals.all : 0
			return [
				{
					key: "coverage",
					label: this.$t("security.tile_coverage"),
					value: `${this.totals.checked.toLocaleString()} / ${this.totals.all.toLocaleString()}`,
					detail: formatPercent(share),
					color: "#206bc4",
				},
				{
					key: "unchecked",
					label: this.$t("security.not_checked"),
					value: this.totals.unchecked.toLocaleString(),
					color: this.totals.unchecked ? "#f76707" : "#2fb344",
				},
				{
					key: "excluded",
					label: this.$t("security.state_excluded"),
					value: this.totals.excluded.toLocaleString(),
					color: "#adb5bd",
				},
				{
					key: "kernels",
					label: this.$t("security.kernels_unchecked"),
					value: this.totals.kernels.toLocaleString(),
					color: this.totals.kernels ? "#d63939" : "#2fb344",
				},
			]
		},
		// Why installations are not checked: the biggest reason first
		reasonRows() {
			return this.states
				.filter((state) => !NOT_UNCHECKED.includes(state))
				.map((state) => {
					const installations = this.families.reduce((sum, family) => sum + (family.installations[state] || 0), 0)
					const action = REASON_ACTIONS[state] || {}
					return {
						id: state,
						state,
						reason: this.stateLabel(state),
						installations,
						share: this.totals.all ? installations / this.totals.all : 0,
						actionKey: action.key || "",
						link: action.link || null,
					}
				})
				.filter((row) => row.installations)
				.sort((a, b) => b.installations - a.installations)
		},
		platformRows() {
			return this.families.map((family) => {
				const excluded = family.installations.excluded || 0
				const unchecked = Object.entries(family.installations)
					.filter(([state]) => !NOT_UNCHECKED.includes(state))
					.reduce((sum, [, count]) => sum + count, 0)
				return {
					id: family.family,
					platform: this.$t("software_identity.family_" + family.family),
					checked: family.checked,
					unchecked,
					excluded,
					coverage: family.total ? family.checked / family.total : 0,
				}
			})
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
		formatPercent,

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
