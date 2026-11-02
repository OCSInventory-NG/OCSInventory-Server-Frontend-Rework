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
			<!-- Coverage of this machine; the unchecked tile opens their list -->
			<StatTiles
				:tiles="tiles"
				clickable
				@select="showUnchecked"
			/>

			<!-- the horizontal tabs of the general configuration -->
			<b-tabs
				v-model="activeTab"
				content-class="mt-3"
				fill
			>
				<b-tab :title="$t('security.tab_open_label')">
					<!-- Noise hidden by default, always counted -->
					<div
						v-if="noiseCount"
						class="alert alert-info"
					>
						<div class="d-flex flex-wrap align-items-center gap-2">
							<font-awesome-icon :icon="['fas', 'eye-slash']" />
							<span v-if="!showNoise">
								{{ $t('security.asset_noise_hidden', { count: noiseCount, kinds: noiseSummary }, noiseCount) }}
							</span>
							<span v-else>
								{{ $t('security.asset_noise_shown', { count: noiseCount, kinds: noiseSummary }, noiseCount) }}
							</span>
							<b-button
								size="sm"
								variant="outline-primary"
								@click="showNoise = !showNoise"
							>
								{{ showNoise ? $t('security.hide_noise') : $t('security.show_hidden') }}
							</b-button>
						</div>
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
									class="ocs-link"
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
						name="asset_vulnerabilities_open"
						:rows="visibleOpen"
						assetview
						:canexclude="canexclude"
						@exclude="openExclusion"
					/>
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
					<ExposureTable
						v-else-if="closed"
						name="asset_vulnerabilities_closed"
						:rows="closed"
						assetview
						closed
						:emptytext="$t('security.closed_none')"
					/>
					<div
						v-else
						class="ocs-loader"
					>
						<Loader />
					</div>
				</b-tab>

				<b-tab :title="$t('security.tab_software_label')">
					<Datatable
						id="asset-software-states-datatable"
						:rowdata="filteredSoftware"
						:rowheader="softwareColumns"
						:usecheckbox="false"
						:candeletemultiple="false"
						title="asset_software_states"
						translationkey="security.column_"
						compactheader
					>
						<template #toolbar>
							<v-select
								v-model="softwareState"
								:options="softwareStateOptions"
								:reduce="option => option.value"
								:placeholder="$t('security.all_states')"
								:searchable="false"
								label="text"
								class="datatable-btn vuln-filter"
							/>
						</template>
						<template #cell(family)="{ row }">
							{{ row.item.family ? $t('software_identity.family_' + row.item.family) : '' }}
						</template>
						<template #cell(state)="{ row }">
							<InstallationState :state="row.item.state" />
						</template>
					</Datatable>
				</b-tab>

				<b-tab
					v-if="excludedOpen.length"
					:title="$t('security.tab_excluded_label')"
				>
					<ExposureTable
						name="asset_vulnerabilities_excluded"
						:rows="excludedOpen"
						assetview
						excluded
					/>
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
			softwareColumns: ["software_name", "version", "family", "product", "state"],

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
		tiles() {
			const unchecked = this.coverage.unchecked || 0
			const open = this.visibleOpen.length
			const tiles = []
			// no Linux kernel to check (Windows, macOS): no tile rather than a green one
			if (this.coverage.kernel !== "not_applicable") {
				tiles.push({
					key: "kernel",
					label: this.$t("security.running_kernel"),
					value: this.kernelLabel,
					color: this.coverage.kernel === "checked" ? "#2fb344" : "#f76707",
					small: true,
					static: true,
				})
			}
			return [
				...tiles,
				{
					key: "unchecked",
					label: this.$t("security.not_checked"),
					value: unchecked,
					detail: this.coverage.excluded
						? this.$t("security.tile_excluded_detail", { count: this.coverage.excluded }, this.coverage.excluded)
						: "",
					color: unchecked ? "#f76707" : "#2fb344",
					static: !unchecked,
				},
				{
					key: "open",
					label: this.$t("security.open_exposures"),
					value: open,
					color: open ? "#d63939" : "#2fb344",
					static: true,
				},
			]
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
				{ value: "__unchecked", text: this.$t("security.unchecked_only") },
				...states.map((state) => ({ value: state, text: this.stateLabel(state) })),
			]
		},
		// the datatable searches; the state is picked in its toolbar
		filteredSoftware() {
			return this.software
				.filter((row) => {
					if (this.softwareState === "__unchecked") return !FINE_STATES.includes(row.state)
					return !this.softwareState || row.state === this.softwareState
				})
				.map((row) => ({ ...row, id: row.entry, software_name: row.name }))
		},
	},
	watch: {
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
