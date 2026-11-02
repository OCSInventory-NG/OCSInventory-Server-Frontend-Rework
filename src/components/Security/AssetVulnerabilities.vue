<template>
	<div id="asset-vulnerabilities">
		<Alert
			v-if="errored"
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
			<SourceFreshness />

			<!-- Coverage of this machine -->
			<div class="card mb-3">
				<div class="card-body d-flex flex-wrap gap-4">
					<div>
						<div class="subheader">
							{{ $t('security.running_kernel') }}
						</div>
						<span :class="kernelOk ? 'text-success' : 'text-warning'">
							<font-awesome-icon
								:icon="['fas', kernelOk ? 'circle-check' : 'triangle-exclamation']"
								class="me-1"
							/>
							{{ kernelLabel }}
						</span>
					</div>
					<div>
						<div class="subheader">
							{{ $t('security.not_checked') }}
						</div>
						<a
							v-if="coverage.unchecked"
							href="#"
							class="text-warning"
							@click.prevent="showUnchecked"
						>
							<font-awesome-icon
								:icon="['fas', 'triangle-exclamation']"
								class="me-1"
							/>
							{{ $t('security.unchecked_software', { count: coverage.unchecked }, coverage.unchecked) }}
						</a>
						<span
							v-else
							class="text-success"
						>{{ $t('security.all_checked') }}</span>
					</div>
					<div v-if="coverage.excluded">
						<div class="subheader">
							{{ $t('security.state_excluded') }}
						</div>
						<span class="text-muted">
							{{ $t('security.excluded_installations', { count: coverage.excluded }, coverage.excluded) }}
						</span>
					</div>
					<div>
						<div class="subheader">
							{{ $t('security.open_exposures') }}
						</div>
						{{ visibleOpen.length }}
					</div>
				</div>
			</div>

			<b-tabs
				v-model="activeTab"
				pills
				small
				nav-class="mb-3"
			>
				<b-tab :title="$t('security.tab_open', { count: visibleOpen.length })">
					<!-- Noise hidden by default, always counted -->
					<div
						v-if="noiseCount"
						class="alert alert-info"
					>
						<font-awesome-icon
							:icon="['fas', 'eye-slash']"
							class="me-2"
						/>
						<template v-if="!showNoise">
							{{ $t('security.asset_noise_hidden', { count: noiseCount, kinds: noiseSummary }, noiseCount) }}
						</template>
						<template v-else>
							{{ $t('security.asset_noise_shown', { count: noiseCount, kinds: noiseSummary }, noiseCount) }}
						</template>
						<b-button
							size="sm"
							variant="link"
							@click="showNoise = !showNoise"
						>
							{{ showNoise ? $t('security.hide_noise') : $t('security.show_hidden') }}
						</b-button>
					</div>

					<!-- Never a bare "no vulnerability" -->
					<div
						v-if="!visibleOpen.length"
						class="alert"
						:class="emptyWarns ? 'alert-warning' : 'alert-success'"
					>
						<div>
							<div>{{ $t('security.asset_no_exposure') }}</div>
							<div v-if="coverage.unchecked">
							{{ $t('security.asset_unchecked_warning', { count: coverage.unchecked }, coverage.unchecked) }}
							<a
								href="#"
								@click.prevent="showUnchecked"
							>{{ $t('security.see_list') }}</a>
							</div>
							<div v-if="!kernelOk && coverage.kernel !== 'not_applicable'">
								{{ $t('security.asset_kernel_warning', { state: kernelLabel }) }}
							</div>
						</div>
					</div>
					<ExposureTable
						v-else
						:rows="visibleOpen"
						assetview
						:canexclude="canexclude"
						@exclude="openExclusion"
					/>

					<template v-if="excludedOpen.length">
						<h4 class="text-muted mt-3">
							{{ $t('security.excluded_exposures') }} ({{ excludedOpen.length }})
						</h4>
						<ExposureTable
							:rows="excludedOpen"
							assetview
							excluded
						/>
					</template>
				</b-tab>

				<b-tab
					:title="$t('security.tab_closed')"
					lazy
				>
					<Alert
						v-if="closedError"
						:message="closedError"
						variant="danger"
					/>
					<p
						v-else-if="closed && !closed.length"
						class="text-muted"
					>
						{{ $t('security.closed_none') }}
					</p>
					<ExposureTable
						v-else-if="closed"
						:rows="closed"
						assetview
						closed
					/>
					<div
						v-else
						class="ocs-loader"
					>
						<Loader />
					</div>
				</b-tab>

				<b-tab :title="$t('security.tab_software', { count: software.length })">
					<b-row class="mb-3 g-2">
						<b-col md="4">
							<b-form-select
								v-model="softwareState"
								:options="softwareStateOptions"
							/>
						</b-col>
						<b-col md="4">
							<b-form-input
								v-model="softwareSearch"
								type="search"
								:placeholder="$t('generic.search')"
							/>
						</b-col>
					</b-row>
					<p
						v-if="!filteredSoftware.length"
						class="text-muted"
					>
						{{ $t('generic.no_data') }}
					</p>
					<template v-else>
						<table class="table table-sm table-striped table-vcenter">
							<thead>
								<tr>
									<th>{{ $t('security.software') }}</th>
									<th>{{ $t('security.version') }}</th>
									<th>{{ $t('software_identity.family') }}</th>
									<th>{{ $t('software_identity.product') }}</th>
									<th>{{ $t('security.state') }}</th>
								</tr>
							</thead>
							<tbody>
								<tr
									v-for="row in pagedSoftware"
									:key="row.entry"
								>
									<td>{{ row.name }}</td>
									<td>{{ row.version }}</td>
									<td>{{ row.family ? $t('software_identity.family_' + row.family) : '' }}</td>
									<td>{{ row.product || '—' }}</td>
									<td>
										<InstallationState :state="row.state" />
									</td>
								</tr>
							</tbody>
						</table>
						<b-pagination
							v-if="filteredSoftware.length > perPage"
							v-model="softwarePage"
							:total-rows="filteredSoftware.length"
							:per-page="perPage"
							align="right"
							size="sm"
						/>
					</template>
				</b-tab>
			</b-tabs>

			<ExclusionModal
				v-model="exclusionShown"
				:preset="exclusionPreset"
				@saved="reloadOpen"
			/>
		</template>
	</div>
</template>

<script>
import { hasPermission } from "@/utils/permissions"
import { NOISE_KINDS, apiErrorMessage, asList } from "@/utils/security"

const SOFTWARE_TAB = 2
// States that are no missing check, as the coverage counts them
const FINE_STATES = ["checked", "excluded", "kernel_not_running"]

export default {
	name: "AssetVulnerabilities",
	props: {
		assetId: { type: Number, required: true },
		assetName: { type: String, default: "" },
	},
	data() {
		return {
			errored: false,
			errormsg: null,
			loading: true,

			coverage: { kernel: "not_applicable", unchecked: 0, excluded: 0 },
			open: [],
			closed: null,
			closedError: null,
			software: [],
			showNoise: false,
			activeTab: 0,

			softwareState: null,
			softwareSearch: "",
			softwarePage: 1,
			perPage: 25,

			canexclude: hasPermission("security_add_exclusion"),
			exclusionShown: false,
			exclusionPreset: {},
		}
	},
	computed: {
		kernelOk() {
			return ["checked", "not_applicable"].includes(this.coverage.kernel)
		},
		kernelLabel() {
			const state = this.coverage.kernel
			if (state === "host_kernel_unverified" || state === "not_applicable") {
				return this.$t("security.kernel_" + state)
			}
			return this.stateLabel(state)
		},
		excludedOpen() {
			return this.open.filter((row) => row.excluded)
		},
		noiseRows() {
			return this.open.filter((row) => !row.excluded && row.noise)
		},
		noiseCount() {
			return this.noiseRows.length
		},
		noiseSummary() {
			return NOISE_KINDS
				.map((kind) => [kind, this.noiseRows.filter((row) => row.noise === kind).length])
				.filter(([, count]) => count)
				.map(([kind, count]) => `${this.$t("security.noise_" + kind)} : ${count}`)
				.join(", ")
		},
		visibleOpen() {
			return this.open.filter((row) => !row.excluded && (this.showNoise || !row.noise))
		},
		emptyWarns() {
			return this.coverage.unchecked > 0 || !this.kernelOk
		},
		softwareStateOptions() {
			const states = [...new Set(this.software.map((row) => row.state))]
			return [
				{ value: null, text: this.$t("security.all_states") },
				{ value: "__unchecked", text: this.$t("security.unchecked_only") },
				...states.map((state) => ({ value: state, text: this.stateLabel(state) })),
			]
		},
		filteredSoftware() {
			const search = this.softwareSearch.toLowerCase()
			return this.software.filter((row) => {
				if (this.softwareState === "__unchecked" && FINE_STATES.includes(row.state)) return false
				if (this.softwareState && this.softwareState !== "__unchecked" && row.state !== this.softwareState) return false
				return !search || `${row.name} ${row.version} ${row.product || ""}`.toLowerCase().includes(search)
			})
		},
		pagedSoftware() {
			const start = (this.softwarePage - 1) * this.perPage
			return this.filteredSoftware.slice(start, start + this.perPage)
		},
	},
	watch: {
		softwareState() {
			this.softwarePage = 1
		},
		softwareSearch() {
			this.softwarePage = 1
		},
		async activeTab(index) {
			if (index === 1 && this.closed === null) {
				await this.loadClosed()
			}
		},
	},
	async mounted() {
		try {
			const [coverage, open, software] = await Promise.all([
				this.$api.generic.get("vulnerabilities/coverage/", { asset: this.assetId }),
				this.$api.generic.get("vulnerability_exposures/", { asset: this.assetId, status: "open" }),
				this.$api.generic.get("vulnerability_exposures/software/", { asset: this.assetId }),
			])
			this.coverage = coverage
			this.open = asList(open)
			this.software = asList(software)
		} catch (e) {
			this.errormsg = apiErrorMessage(e)
			this.errored = true
		} finally {
			this.loading = false
		}
	},
	methods: {
		stateLabel(state) {
			return this.$te("security.state_" + state) ? this.$t("security.state_" + state) : state
		},

		async loadClosed() {
			try {
				this.closed = asList(await this.$api.generic.get("vulnerability_exposures/", { asset: this.assetId, status: "closed" }))
			} catch (e) {
				this.closedError = apiErrorMessage(e)
			}
		},

		async reloadOpen() {
			try {
				this.open = asList(await this.$api.generic.get("vulnerability_exposures/", { asset: this.assetId, status: "open" }))
			} catch (e) {
				this.errormsg = apiErrorMessage(e)
				this.errored = true
			}
		},

		showUnchecked() {
			this.softwareState = "__unchecked"
			this.activeTab = SOFTWARE_TAB
		},

		openExclusion(row) {
			this.exclusionPreset = {
				vuln_id: row.vuln_id,
				asset: this.assetId,
				asset_name: row.asset_name || this.assetName,
			}
			this.exclusionShown = true
		},
	},
}
</script>
