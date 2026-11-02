<template>
	<div
		v-if="outdated.length"
		class="alert alert-warning mb-3"
		role="alert"
	>
		<div class="d-flex align-items-start gap-2">
			<font-awesome-icon
				:icon="['fas', 'triangle-exclamation']"
				class="mt-1"
			/>
			<div>
				<strong>{{ $t('security.freshness_title') }}</strong>
				<ul class="mb-1 ps-3">
					<li
						v-for="source in outdated"
						:key="source.source"
					>
						{{ sourceLabel(source.source) }} :
						<template v-if="source.state === 'never_loaded'">
							{{ $t('security.source_state_never_loaded') }}
						</template>
						<template v-else>
							{{ $t('security.freshness_stale', { date: formatDateTime(source.last_success) || $t('security.never') }) }}
						</template>
						<span
							v-if="source.error"
							class="text-danger ms-1"
						>— {{ source.error }}</span>
					</li>
				</ul>
				<router-link
					v-if="showlink"
					to="/security/coverage"
				>
					{{ $t('security.see_coverage') }}
				</router-link>
			</div>
		</div>
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
	},
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
		} catch {
			// The page shows its own error; a missing banner must not hide it
			this.loaded = []
		}
	},
	methods: {
		formatDateTime,
		sourceLabel(source) {
			return this.$te("security.source_" + source) ? this.$t("security.source_" + source) : source
		},
	},
}
</script>
