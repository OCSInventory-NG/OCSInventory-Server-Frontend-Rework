<template>
	<div :class="{ 'exposure-excluded': excluded }">
		<Datatable
			:id="name + '-datatable'"
			:rowdata="rowdata"
			:rowheader="columns"
			:title="name"
			:usecheckbox="false"
			:candeletemultiple="false"
			:hascustomactions="canexclude"
			:emptytext="emptytext"
			:hiddenfields="hiddencolumns"
			translationkey="security.column_"
			compactheader
			@reload-datatable="$emit('reload')"
		>
			<template #cell(machine)="{ row }">
				<router-link
					:to="`/inventory/asset/${row.item.asset}`"
					class="ocs-link"
				>
					{{ row.item.machine || '#' + row.item.asset }}
				</router-link>
				<span
					v-if="excluded"
					class="badge bg-secondary-lt ms-1"
				>{{ $t('security.excluded') }}</span>
			</template>
			<template #cell(vuln_id)="{ row }">
				<!-- from a machine, the vulnerability opens beside it -->
				<router-link
					:to="`/security/vulnerabilities/${encodeURIComponent(row.item.vuln_id)}`"
					:target="assetview ? '_blank' : null"
					class="ocs-link text-nowrap"
				>
					{{ row.item.vuln_id }}
				</router-link>
				<span
					v-if="excluded"
					class="badge bg-secondary-lt ms-1"
				>{{ $t('security.excluded') }}</span>
				<span
					v-if="row.item.noise"
					class="badge bg-azure-lt ms-1"
				>{{ $t('security.noise_' + row.item.noise) }}</span>
			</template>
			<template #cell(summary)="{ row }">
				<span
					class="vuln-summary-cell"
					:title="row.item.summary"
				>{{ shortSummary(row.item.summary) }}</span>
			</template>
			<template #cell(score)="{ row }">
				<VulnerabilityLevel
					:level="row.item.level"
					:score="row.item.cvss_score"
				/>
			</template>
			<template #cell(kev)="{ row }">
				<KevBadge :kev="row.item.kev" />
			</template>
			<template #cell(epss)="{ row }">
				<span
					v-if="row.item.epss !== null && row.item.epss !== undefined"
					class="text-nowrap"
				>{{ formatPercent(row.item.epss) }}</span>
				<span
					v-else
					class="text-muted"
				>{{ $t('security.unknown') }}</span>
			</template>
			<template #cell(software)="{ row }">
				<div class="exposure-wrap">
					{{ row.item.software }}
					<span
						v-if="row.item.kernel"
						class="badge bg-orange-lt ms-1"
					>{{ $t('security.kernel') }}</span>
					<div
						v-if="row.item.product && row.item.product !== row.item.software"
						class="text-muted small"
					>
						{{ row.item.product }}
					</div>
				</div>
			</template>
			<template #cell(fix)="{ row }">
				<VulnerabilityFix
					:versions="row.item.fixed_version ? [row.item.fixed_version] : []"
					:channels="row.item.fixed_version && row.item.fix_channel ? [row.item.fix_channel] : []"
				/>
			</template>
			<template #cell(method)="{ row }">
				{{ methodLabel(row.item.method) }}
				<span
					v-if="row.item.uncertain"
					class="badge bg-secondary ms-1"
					:title="$t('security.uncertain_help')"
				>{{ $t('security.uncertain') }}</span>
				<div v-if="row.item.advisory_id">
					<a
						v-if="row.item.advisory_url"
						:href="row.item.advisory_url"
						target="_blank"
						rel="noopener"
						class="small"
					>{{ row.item.advisory_id }}</a>
					<span
						v-else
						class="small"
					>{{ row.item.advisory_id }}</span>
				</div>
			</template>
			<template #cell(rating)="{ row }">
				{{ row.item.rating ? ratingText(row.item.rating) : '' }}
			</template>
			<template #cell(first_seen)="{ row }">
				<span class="text-nowrap">{{ formatDay(row.item.first_seen) }}</span>
			</template>
			<template #cell(seen)="{ row }">
				<span class="text-nowrap">{{ formatDay(row.item.seen) }}</span>
			</template>
			<template #cell(closed_on)="{ row }">
				<span class="text-nowrap">{{ formatDay(row.item.closed_on) }}</span>
			</template>
			<template #cell(resolution)="{ row }">
				{{ resolutionLabel(row.item.resolution) }}
			</template>
			<template #cell(firstActions)="{ row }">
				<button
					class="btn btn-ghost-secondary"
					:title="$t('security.exclude')"
					@click="$emit('exclude', row.item.source)"
				>
					<font-awesome-icon :icon="['fas', 'eye-slash']" />
				</button>
			</template>
		</Datatable>
	</div>
</template>

<script>
import { formatDay, formatPercent, ratingLabel, shortSummary } from "@/utils/security"

// Exposures of a vulnerability (one row per machine) or of a machine (assetview),
// on the common datatable
export default {
	name: "ExposureTable",
	props: {
		rows: { type: Array, required: true },
		// datatable title: keeps the column choices of each table apart
		name: { type: String, required: true },
		assetview: { type: Boolean, default: false },
		closed: { type: Boolean, default: false },
		excluded: { type: Boolean, default: false },
		canexclude: { type: Boolean, default: false },
		emptytext: { type: String, default: "" },
	},
	emits: ["exclude", "reload"],
	computed: {
		columns() {
			const columns = this.assetview
				? ["vuln_id", "summary", "score", "kev", "epss", "software", "version"]
				: ["machine", "software", "version"]
			if (!this.closed) columns.push("fix")
			columns.push("method")
			if (!this.assetview) columns.push("rating")
			columns.push("first_seen")
			if (this.closed) {
				columns.push("closed_on", "resolution")
			} else if (!this.assetview) {
				columns.push("seen")
			}
			return columns
		},
		// on a machine the summary and EPSS make the table too wide: shown on demand
		hiddencolumns() {
			return this.assetview ? ["summary", "epss"] : []
		},
		// keys the datatable draws itself (last_seen, closed_at…) are renamed;
		// the plain values keep the client sort meaningful
		rowdata() {
			return this.rows.map((row) => ({
				...row,
				id: [row.vuln_id, row.asset, row.product, row.version, row.closed_at].join("|"),
				machine: row.asset_name,
				software: row.software_name || row.product,
				score: row.cvss_score,
				fix: row.fixed_version,
				seen: row.last_seen,
				closed_on: row.closed_at,
				source: row,
			}))
		},
	},
	methods: {
		formatDay,
		formatPercent,
		shortSummary,
		ratingText(rating) {
			return ratingLabel(this, rating)
		},
		methodLabel(method) {
			return this.$te("security.method_" + method) ? this.$t("security.method_" + method) : method
		},
		resolutionLabel(resolution) {
			if (!resolution) return ""
			return this.$te("security.resolution_" + resolution) ? this.$t("security.resolution_" + resolution) : resolution
		},
	},
}
</script>

<style scoped>
.exposure-excluded :deep(tbody) {
	opacity: 0.6;
}

/* long product names and summaries wrap inside their column */
.exposure-wrap {
	max-width: 22rem;
	overflow-wrap: anywhere;
	white-space: normal;
}
</style>
