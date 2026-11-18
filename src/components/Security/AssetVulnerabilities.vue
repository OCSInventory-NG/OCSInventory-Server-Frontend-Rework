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
			<!-- A machine the scan cannot check would show 0 vulnerability, as a safe one -->
			<div
				v-if="notCovered"
				class="alert alert-warning"
			>
				<div class="d-flex gap-2">
					<font-awesome-icon
						:icon="['fas', 'triangle-exclamation']"
						class="mt-1"
					/>
					<div>
						<strong>{{ $t('security.machine_not_covered_title') }}</strong>
						<div>{{ machineBanner }}</div>
						<div class="small">
							{{ $t('security.machine_zero_hint') }}
						</div>
					</div>
				</div>
			</div>
			<div
				v-else-if="supportEndsSoon"
				class="alert alert-info"
			>
				<font-awesome-icon
					:icon="['fas', 'circle-info']"
					class="me-2"
				/>
				{{ $t('security.support_until', { date: formatDay(machine.support_end) }) }}
			</div>

			<!-- Coverage of this machine -->
			<StatTiles :tiles="tiles" />

			<!-- the horizontal tabs of the general configuration -->
			<b-tabs
				v-model="activeTab"
				content-class="mt-3"
				fill
			>
				<b-tab :title="$t('security.tab_open_label')">
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
						@reload="reloadOpen"
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
						@reload="loadClosed"
					/>
					<div
						v-else
						class="ocs-loader"
					>
						<Loader />
					</div>
				</b-tab>

				<!-- Only what the scan could not check: the full list is the inventory one -->
				<b-tab :title="$t('security.tab_unchecked_label')">
					<Datatable
						id="asset-unchecked-software-datatable"
						:rowdata="filteredSoftware"
						:rowheader="softwareColumns"
						:usecheckbox="false"
						:candeletemultiple="false"
						:emptytext="$t('security.all_checked')"
						title="asset_unchecked_software"
						translationkey="security.column_"
						compactheader
						@reload-datatable="reloadSoftware"
					>
						<template #toolbar>
							<v-select
								v-model="softwareState"
								:options="softwareStateOptions"
								:reduce="option => option.value"
								:placeholder="$t('security.all_reasons')"
								:searchable="false"
								label="text"
								class="datatable-btn vuln-filter"
							/>
						</template>
						<template #cell(family)="{ row }">
							{{ row.item.family ? $t('software_identity.family_' + row.item.family) : '' }}
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
						@reload="reloadOpen"
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
import { apiErrorMessage, asList, formatDay } from "@/utils/security"

const UNCHECKED_TAB = 2
// the end of security support is announced this many months ahead
const SUPPORT_NOTICE_MONTHS = 6
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
			activeTab: 0,

			softwareState: null,
			softwareColumns: ["software_name", "version", "family", "product", "reason"],

			canexclude: hasPermission("security_add_exclusion"),
			exclusionShown: false,
			exclusionPreset: {},
		}
	},
	computed: {
		// coverage status of the whole machine, see /vulnerabilities/machines/
		machine() {
			return this.coverage.machine || null
		},
		notCovered() {
			return this.machine?.status === "not_covered"
		},
		machineBanner() {
			const reason = this.machine?.reason
			if (reason === "end_of_support") {
				return this.machine.support_end
					? this.$t("security.machine_banner_end_of_support", { date: formatDay(this.machine.support_end) })
					: this.$t("security.machine_banner_end_of_support_nodate")
			}
			const key = "security.machine_banner_" + reason
			return this.$te(key) ? this.$t(key) : reason
		},
		supportEndsSoon() {
			if (this.machine?.status !== "covered" || !this.machine.support_end) return false
			const end = new Date(this.machine.support_end)
			const limit = new Date()
			limit.setMonth(limit.getMonth() + SUPPORT_NOTICE_MONTHS)
			return end >= new Date() && end <= limit
		},
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
			// distinct CVEs: one vulnerability can hit several packages of the machine
			const withFix = new Set(this.visibleOpen.filter((row) => row.fixed_version).map((row) => row.vuln_id)).size
			const tiles = []
			// no Linux kernel to check (Windows, macOS): no tile rather than a green one
			if (this.coverage.kernel !== "not_applicable") {
				tiles.push({
					key: "kernel",
					label: this.$t("security.running_kernel"),
					value: this.kernelLabel,
					color: this.coverage.kernel === "checked" ? "#2fb344" : "#f76707",
					small: true,
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
				},
				{
					key: "open",
					label: this.$t("security.open_exposures"),
					value: open,
					// 0 is only good news on a machine the scan can check
					color: open ? "#d63939" : (this.notCovered ? "#adb5bd" : "#2fb344"),
				},
				{
					key: "fix",
					label: this.$t("security.tile_fix"),
					value: withFix,
					color: "#2fb344",
				},
			]
		},
		excludedOpen() {
			return this.open.filter((row) => row.excluded)
		},
		visibleOpen() {
			return this.open.filter((row) => !row.excluded)
		},
		emptyWarns() {
			return this.notCovered || this.coverage.unchecked > 0 || !this.kernelOk
		},
		// installations the scan could not check, with their reason in words
		uncheckedSoftware() {
			return this.software
				.filter((row) => !FINE_STATES.includes(row.state))
				.map((row) => ({ ...row, id: row.entry, software_name: row.name, reason: this.stateLabel(row.state) }))
		},
		softwareStateOptions() {
			const states = [...new Set(this.uncheckedSoftware.map((row) => row.state))]
			return states.map((state) => ({ value: state, text: this.stateLabel(state) }))
		},
		// the datatable searches; the reason is picked in its toolbar
		filteredSoftware() {
			return this.uncheckedSoftware.filter((row) => !this.softwareState || row.state === this.softwareState)
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
		formatDay,

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

		// the unchecked count comes with the coverage
		async reloadSoftware() {
			try {
				const [coverage, software] = await Promise.all([
					this.$api.generic.get("vulnerabilities/coverage/", { asset: this.assetId }),
					this.$api.generic.get("vulnerability_exposures/software/", { asset: this.assetId }),
				])
				this.coverage = coverage
				this.software = asList(software)
			} catch (e) {
				this.errormsg = apiErrorMessage(e)
				this.errored = true
			}
		},

		showUnchecked() {
			this.softwareState = null
			this.activeTab = UNCHECKED_TAB
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
