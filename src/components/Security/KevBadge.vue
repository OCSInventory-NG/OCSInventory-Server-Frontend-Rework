<template>
	<span
		v-if="kev"
		class="badge bg-red text-white text-nowrap"
		:title="$t('security.kev_help')"
	>
		{{ $t('security.kev') }}
		<template v-if="date">· {{ formatDay(date) }}</template>
	</span>
	<span
		v-else
		class="text-muted"
	>{{ $t('security.kev_not_listed') }}</span>
</template>

<script>
import { formatDay } from "@/utils/security"

export default {
	name: "KevBadge",
	props: {
		kev: { type: Boolean, default: false },
		date: { type: String, default: null },
	},
	methods: {
		formatDay,
	},
}
</script>
