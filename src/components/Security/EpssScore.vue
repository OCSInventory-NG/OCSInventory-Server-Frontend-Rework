<template>
	<span
		v-if="known"
		class="epss-value text-nowrap"
		:style="{ color }"
		:title="$t('security.epss_help') + ' : ' + formatPercent(epss) + ', ' + rankText"
	>{{ formatPercent(epss) }}</span>
	<span
		v-else
		class="text-muted"
	>{{ $t('security.unknown') }}</span>
</template>

<script>
import { epssColor, formatPercent } from "@/utils/security"

// EPSS of a vulnerability, coloured by risk; its rank among all CVEs in the tooltip
export default {
	name: "EpssScore",
	props: {
		// the lists keep "" for an unknown value (CSV export)
		epss: { type: [Number, String], default: null },
		percentile: { type: [Number, String], default: null },
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
