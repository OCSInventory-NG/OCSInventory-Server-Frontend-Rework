<template>
	<!-- One discreet line: what the page may miss, the details on hover -->
	<div
		v-if="outdated.length || extra.length"
		class="source-notice"
		role="status"
	>
		<font-awesome-icon
			:icon="['fas', 'triangle-exclamation']"
			class="text-warning"
		/>
		<span class="source-notice-title">{{ extra.length ? $t('security.notice_list_incomplete') : $t('security.notice_sources') }}</span>
		<span
			v-for="(source, index) in outdated"
			:key="source.source"
			:title="sourceDetail(source)"
		>{{ sourceLabel(source.source) }} ({{ $t('security.source_state_' + source.state).toLowerCase() }})<template v-if="index < outdated.length - 1 || extra.length">,</template></span>
		<span
			v-for="(line, index) in extra"
			:key="line"
		>{{ line }}<template v-if="index < extra.length - 1">,</template></span>
		<router-link
			v-if="showlink"
			to="/security/coverage"
			class="ocs-link ms-1"
		>
			{{ $t('security.see_coverage') }}
		</router-link>
	</div>
</template>

<script>
import { asList, formatDateTime } from "@/utils/security"

export default {
	name: "SourceFreshness",
	props: {
		// Given by a parent that already holds them (coverage); loaded otherwise
		sources: { type: Array, default: null },
		showlink: { type: Boolean, default: true },
		// other reasons the page may miss vulnerabilities, one line each
		extra: { type: Array, default: () => [] },
	},
	emits: ["loaded"],
	data() {
		return {
			loaded: [],
		}
	},
	computed: {
		outdated() {
			return (this.sources || this.loaded).filter((source) => source.state !== "fresh")
		},
	},
	async mounted() {
		if (this.sources) {
			return
		}
		try {
			this.loaded = asList(await this.$api.generic.get("vulnerabilities/sources/"))
			this.$emit("loaded", this.loaded)
		} catch {
			// The page shows its own error; a missing banner must not hide it
			this.loaded = []
		}
	},
	methods: {
		formatDateTime,
		// last success and error, in the tooltip
		sourceDetail(source) {
			const parts = [this.$t("security.last_success") + " : " + (formatDateTime(source.last_success) || this.$t("security.never"))]
			if (source.error) parts.push(source.error)
			return parts.join("\n")
		},
		sourceLabel(source) {
			return this.$te("security.source_" + source) ? this.$t("security.source_" + source) : source
		},
	},
}
</script>
