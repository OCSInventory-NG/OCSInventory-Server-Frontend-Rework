<template>
	<span
		v-if="known"
		class="epss-score"
		:title="$t('security.epss_help') + ' : ' + formatPercent(epss) + ', ' + rankText"
	>
		<span class="epss-line">
			<span
				class="epss-value"
				:style="{ color }"
			>{{ formatPercent(epss) }}</span>
			<!-- rank among all CVEs: the probability alone is near 0 for most of them -->
			<span
				v-if="hasPercentile"
				class="epss-bar"
			>
				<span :style="{ width: percentile * 100 + '%', backgroundColor: color }" />
			</span>
		</span>
		<span
			v-if="hasPercentile && !compact"
			class="epss-rank"
		>{{ rankText }}</span>
	</span>
	<span
		v-else
		class="text-muted"
	>{{ $t('security.unknown') }}</span>
</template>

<script>
import { epssColor, formatPercent } from "@/utils/security"

// EPSS of a vulnerability: probability of exploitation in the next 30 days,
// coloured by risk, with its rank among all CVEs
export default {
	name: "EpssScore",
	props: {
		// the lists keep "" for an unknown value (CSV export)
		epss: { type: [Number, String], default: null },
		percentile: { type: [Number, String], default: null },
		// value and bar only, the rank goes in the tooltip
		compact: { type: Boolean, default: false },
	},
	computed: {
		known() {
			return this.epss !== null && this.epss !== undefined && this.epss !== ""
		},
		hasPercentile() {
			return this.percentile !== null && this.percentile !== undefined && this.percentile !== ""
		},
		color() {
			return epssColor(this.epss)
		},
		rankText() {
			return this.hasPercentile ? this.$t("security.epss_rank", { value: formatPercent(this.percentile) }) : ""
		},
	},
	methods: {
		formatPercent,
	},
}
</script>
