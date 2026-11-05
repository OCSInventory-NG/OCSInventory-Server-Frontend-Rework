<template>
	<ol class="priority-order">
		<li
			v-for="(criterion, index) in modelValue"
			:key="criterion"
			class="priority-order-item"
		>
			<span class="badge bg-blue-lt me-1">{{ index + 1 }}</span>
			<span>{{ $t('security.priority_' + criterion) }}</span>
			<span
				v-if="index < modelValue.length - 1"
				class="text-muted mx-1"
			>›</span>
		</li>
	</ol>
</template>

<script>
// Active order of the vulnerability list, on one line. It is changed in the
// general configuration, or for the session from the list headers
export default {
	name: "PriorityOrder",
	props: {
		modelValue: { type: Array, required: true },
	},
}
</script>

<style scoped>
.priority-order {
	align-items: center;
	display: inline-flex;
	flex-wrap: wrap;
	list-style: none;
	margin: 0;
	padding: 0;
}

.priority-order-item {
	align-items: center;
	display: flex;
	padding: 0.15rem 0;
}
</style>
