<template>
	<span
		class="badge"
		:class="badgeClass"
	>{{ label }}</span>
</template>

<script>
export default {
	name: "InstallationState",
	props: {
		state: { type: String, required: true },
	},
	computed: {
		label() {
			return this.$te("security.state_" + this.state) ? this.$t("security.state_" + this.state) : this.state
		},
		// Only a checked installation looks fine; a kernel that does not run needs no check
		badgeClass() {
			if (this.state === "checked") return "bg-green-lt"
			if (this.state === "kernel_not_running" || this.state === "excluded") return "bg-secondary-lt"
			return "bg-yellow-lt"
		},
	},
}
</script>
