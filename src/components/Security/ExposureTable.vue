<template>
	<div class="table-responsive">
		<table
			class="table table-sm table-striped table-vcenter"
			:class="{ 'exposure-excluded': excluded }"
		>
			<thead>
				<tr>
					<th v-if="!assetview">
						{{ $t('security.machine') }}
					</th>
					<template v-else>
						<th>{{ $t('security.vulnerability') }}</th>
						<th>{{ $t('security.column_score') }}</th>
						<th>{{ $t('security.column_kev') }}</th>
						<th>{{ $t('security.column_epss') }}</th>
					</template>
					<th>{{ $t('security.software') }}</th>
					<th>{{ $t('security.version') }}</th>
					<th v-if="!closed">
						{{ $t('security.fix') }}
					</th>
					<th>{{ $t('security.method') }}</th>
					<th v-if="!assetview">
						{{ $t('security.distro_rating_label') }}
					</th>
					<th>{{ $t('security.first_seen') }}</th>
					<template v-if="closed">
						<th>{{ $t('security.closed_at') }}</th>
						<th>{{ $t('security.resolution') }}</th>
					</template>
					<th v-else-if="!assetview">
						{{ $t('security.last_seen') }}
					</th>
					<th v-if="canexclude" />
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="row in rows"
					:key="(row.vuln_id || '') + row.asset + row.product + row.version + (row.closed_at || '')"
				>
					<td v-if="!assetview">
						<router-link :to="`/inventory/asset/${row.asset}`">
							{{ row.asset_name || '#' + row.asset }}
						</router-link>
						<span
							v-if="excluded"
							class="badge bg-secondary-lt ms-1"
						>{{ $t('security.excluded') }}</span>
					</td>
					<template v-else>
						<td class="text-nowrap">
							<router-link :to="`/security/vulnerabilities/${encodeURIComponent(row.vuln_id)}`">
								{{ row.vuln_id }}
							</router-link>
							<span
								v-if="excluded"
								class="badge bg-secondary-lt ms-1"
							>{{ $t('security.excluded') }}</span>
							<span
								v-if="row.noise"
								class="badge bg-azure-lt ms-1"
							>{{ $t('security.noise_' + row.noise) }}</span>
							<div
								v-if="row.summary"
								class="text-muted small vuln-summary"
							>
								{{ shorten(row.summary) }}
							</div>
						</td>
						<td>
							<VulnerabilityLevel
								:level="row.level"
								:score="row.cvss_score"
							/>
						</td>
						<td>
							<KevBadge :kev="row.kev" />
						</td>
						<td class="text-nowrap">
							<template v-if="row.epss !== null && row.epss !== undefined">
								{{ formatPercent(row.epss) }}
							</template>
							<span
								v-else
								class="text-muted"
							>—</span>
						</td>
					</template>
					<td>
						<span :title="row.product">{{ row.software_name || row.product }}</span>
						<span
							v-if="row.kernel"
							class="badge bg-orange-lt ms-1"
						>{{ $t('security.kernel') }}</span>
						<div
							v-if="row.software_name && row.product"
							class="text-muted small"
						>
							{{ row.product }}
						</div>
					</td>
					<td class="text-nowrap">
						{{ row.version }}
					</td>
					<td v-if="!closed">
						<VulnerabilityFix
							:versions="row.fixed_version ? [row.fixed_version] : []"
							:channels="row.fixed_version && row.fix_channel ? [row.fix_channel] : []"
						/>
					</td>
					<td>
						{{ methodLabel(row.method) }}
						<span
							v-if="row.uncertain"
							class="badge bg-secondary ms-1"
							:title="$t('security.uncertain_help')"
						>{{ $t('security.uncertain') }}</span>
						<div v-if="row.advisory_id">
							<a
								v-if="row.advisory_url"
								:href="row.advisory_url"
								target="_blank"
								rel="noopener"
								class="small"
							>{{ row.advisory_id }}</a>
							<span
								v-else
								class="small"
							>{{ row.advisory_id }}</span>
						</div>
					</td>
					<td v-if="!assetview">
						{{ row.rating || '—' }}
					</td>
					<td class="text-nowrap">
						{{ formatDay(row.first_seen) }}
					</td>
					<template v-if="closed">
						<td class="text-nowrap">
							{{ formatDay(row.closed_at) }}
						</td>
						<td>{{ resolutionLabel(row.resolution) }}</td>
					</template>
					<td
						v-else-if="!assetview"
						class="text-nowrap"
					>
						{{ formatDay(row.last_seen) }}
					</td>
					<td v-if="canexclude">
						<button
							class="btn btn-ghost-secondary btn-sm"
							:title="$t('security.exclude')"
							@click="$emit('exclude', row)"
						>
							<font-awesome-icon :icon="['fas', 'eye-slash']" />
						</button>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
import { formatDay, formatPercent } from "@/utils/security"

const SUMMARY_LENGTH = 100

// Exposures of a vulnerability (one row per machine) or of a machine (assetview)
export default {
	name: "ExposureTable",
	props: {
		rows: { type: Array, required: true },
		assetview: { type: Boolean, default: false },
		closed: { type: Boolean, default: false },
		excluded: { type: Boolean, default: false },
		canexclude: { type: Boolean, default: false },
	},
	emits: ["exclude"],
	methods: {
		formatDay,
		formatPercent,
		methodLabel(method) {
			return this.$te("security.method_" + method) ? this.$t("security.method_" + method) : method
		},
		resolutionLabel(resolution) {
			if (!resolution) return "—"
			return this.$te("security.resolution_" + resolution) ? this.$t("security.resolution_" + resolution) : resolution
		},
		shorten(text) {
			if (!text || text.length <= SUMMARY_LENGTH) {
				return text
			}
			return text.slice(0, SUMMARY_LENGTH).trimEnd() + "…"
		},
	},
}
</script>

<style scoped>
.exposure-excluded {
	opacity: 0.6;
}
</style>
