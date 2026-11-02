<template>
	<div
		id="vulnerability-coverage"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="vulnerability_coverage" />

			<div class="page-body">
				<div v-if="denied">
					<Alert
						:message="$t('message.dont_have_right_to_see')"
						:cols="true"
						variant="danger"
					/>
				</div>
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
					<SourceFreshness
						:sources="coverage.sources || []"
						:showlink="false"
					/>

					<!-- Scans -->
					<div class="card mb-3">
						<div class="card-body d-flex flex-wrap gap-4">
							<div
								v-for="scan in scans"
								:key="scan"
							>
								<div class="subheader">
									{{ $t('security.' + scan) }}
								</div>
								<span v-if="coverage[scan]">{{ formatDateTime(coverage[scan]) }}</span>
								<span
									v-else
									class="text-warning"
								>
									<font-awesome-icon
										:icon="['fas', 'triangle-exclamation']"
										class="me-1"
									/>
									{{ $t('security.never') }}
								</span>
							</div>
						</div>
					</div>

					<!-- Funnel: each test, in its order, sets aside the installations it cannot check -->
					<div class="card mb-3">
						<div class="card-header">
							<h3 class="card-title">
								{{ $t('security.funnel') }}
							</h3>
						</div>
						<div class="card-body">
							<p class="text-muted">
								{{ $t('security.funnel_help') }}
							</p>
							<div
								v-for="family in families"
								:key="family.family"
								class="mb-2"
							>
								<div class="d-flex justify-content-between">
									<strong>{{ $t('software_identity.family_' + family.family) }}</strong>
									<span :class="familyChecked(family) < familyTotal(family) ? 'text-warning' : 'text-success'">
										{{ $t('security.checked_share', { checked: familyChecked(family), total: familyTotal(family) }) }}
									</span>
								</div>
								<div class="progress progress-sm">
									<div
										v-for="state in states"
										v-show="family.installations[state]"
										:key="state"
										class="progress-bar"
										:class="stateBarClass(state)"
										:style="{ width: share(family.installations[state], familyTotal(family)) + '%' }"
										:title="`${stateLabel(state)} : ${family.installations[state] || 0}`"
									/>
								</div>
							</div>

							<div class="table-responsive mt-3">
								<table class="table table-sm table-vcenter">
									<thead>
										<tr>
											<th>#</th>
											<th>{{ $t('security.state') }}</th>
											<th
												v-for="family in families"
												:key="family.family"
												class="text-end"
											>
												{{ $t('software_identity.family_' + family.family) }}
											</th>
											<th class="text-end">
												{{ $t('security.total') }}
											</th>
										</tr>
									</thead>
									<tbody>
										<tr
											v-for="(state, index) in states"
											:key="state"
											:class="{ 'table-success': state === 'checked' }"
										>
											<td class="text-muted">
												{{ index + 1 }}
											</td>
											<td>
												<InstallationState :state="state" />
											</td>
											<td
												v-for="family in families"
												:key="family.family"
												class="text-end"
												:class="{ 'text-muted': !family.installations[state] }"
											>
												{{ family.installations[state] || 0 }}
											</td>
											<td class="text-end">
												<strong>{{ stateTotal(state) }}</strong>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
							<p class="text-muted mb-0">
								{{ $t('security.installations_note') }}
							</p>
						</div>
					</div>

					<!-- Running kernels -->
					<div class="card mb-3">
						<div class="card-header">
							<h3 class="card-title">
								{{ $t('security.running_kernels') }}
							</h3>
						</div>
						<div class="card-body d-flex flex-wrap gap-4">
							<p
								v-if="!kernelStates.length"
								class="text-muted mb-0"
							>
								{{ $t('generic.no_data') }}
							</p>
							<div
								v-for="state in kernelStates"
								:key="state"
							>
								<div class="subheader">
									{{ kernelLabel(state) }}
								</div>
								<span
									class="h3"
									:class="state === 'checked' ? 'text-success' : 'text-warning'"
								>{{ coverage.kernels[state] }}</span>
							</div>
						</div>
					</div>

					<!-- Sources -->
					<div class="card">
						<div class="card-header">
							<h3 class="card-title">
								{{ $t('security.sources') }}
							</h3>
						</div>
						<div class="card-body">
							<div class="table-responsive">
								<table class="table table-sm table-striped table-vcenter">
									<thead>
										<tr>
											<th>{{ $t('security.source') }}</th>
											<th>{{ $t('security.state') }}</th>
											<th>{{ $t('security.last_success') }}</th>
											<th>{{ $t('security.last_attempt') }}</th>
											<th>{{ $t('security.record_count') }}</th>
											<th>{{ $t('security.source_scope') }}</th>
											<th>{{ $t('security.source_error') }}</th>
										</tr>
									</thead>
									<tbody>
										<tr
											v-for="source in coverage.sources"
											:key="source.source"
										>
											<td>{{ sourceLabel(source.source) }}</td>
											<td>
												<span
													class="badge"
													:class="sourceStateClass(source.state)"
												>{{ $t('security.source_state_' + source.state) }}</span>
											</td>
											<td class="text-nowrap">
												{{ formatDateTime(source.last_success) || $t('security.never') }}
											</td>
											<td class="text-nowrap">
												{{ formatDateTime(source.last_attempt) || $t('security.never') }}
											</td>
											<td class="text-end">
												{{ (source.record_count || 0).toLocaleString() }}
											</td>
											<td>{{ sourceScope(source) }}</td>
											<td class="text-danger">
												{{ source.error }}
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</template>
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
	return ranges.map(([start, end]) => (start === end ? `${start}` : `${start}–${end}`)).join(", ")
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
		}
	},
	computed: {
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
		families() {
			return (this.coverage.families || []).map((family) => ({ ...family, installations: family.installations || {} }))
		},
		kernelStates() {
			return Object.keys(this.coverage.kernels || {})
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

		familyTotal(family) {
			return Object.values(family.installations).reduce((sum, count) => sum + count, 0)
		},
		familyChecked(family) {
			return family.installations.checked || 0
		},
		stateTotal(state) {
			return this.families.reduce((sum, family) => sum + (family.installations[state] || 0), 0)
		},
		share(count, total) {
			return total ? ((count || 0) * 100) / total : 0
		},
		stateLabel(state) {
			return this.$te("security.state_" + state) ? this.$t("security.state_" + state) : state
		},
		stateBarClass(state) {
			if (state === "checked") return "bg-success"
			if (state === "kernel_not_running" || state === "excluded") return "bg-secondary"
			if (state === "pending" || state === "stale" || state === "source_never_loaded") return "bg-orange"
			return "bg-yellow"
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
