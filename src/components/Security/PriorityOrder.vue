<template>
	<ol
		class="priority-order"
		:class="{ 'priority-order-inline': inline }"
	>
		<li
			v-for="(criterion, index) in modelValue"
			:key="criterion"
			class="priority-order-item"
		>
			<span class="badge bg-blue-lt me-1">{{ index + 1 }}</span>
			<span class="priority-order-label">{{ $t('security.priority_' + criterion) }}</span>
			<template v-if="!disabled && !inline">
				<button
					type="button"
					class="btn btn-sm btn-ghost-secondary px-1"
					:disabled="index === 0"
					:title="$t('security.priority_up')"
					@click="move(index, -1)"
				>
					<font-awesome-icon :icon="['fas', 'angle-up']" />
				</button>
				<button
					type="button"
					class="btn btn-sm btn-ghost-secondary px-1"
					:disabled="index === modelValue.length - 1"
					:title="$t('security.priority_down')"
					@click="move(index, 1)"
				>
					<font-awesome-icon :icon="['fas', 'angle-down']" />
				</button>
			</template>
			<span
				v-if="inline && index < modelValue.length - 1"
				class="text-muted mx-1"
			>›</span>
		</li>
	</ol>
</template>

<script>
export default {
	name: "PriorityOrder",
	props: {
		modelValue: { type: Array, required: true },
		// one read-only line in the vulnerability list, one criterion per line in the settings
		inline: { type: Boolean, default: false },
		disabled: { type: Boolean, default: false },
	},
	emits: ["update:modelValue"],
	methods: {
		move(index, offset) {
			const order = [...this.modelValue]
			const [criterion] = order.splice(index, 1)
			order.splice(index + offset, 0, criterion)
			this.$emit("update:modelValue", order)
		},
	},
}
</script>

<style scoped>
.priority-order {
	list-style: none;
	padding: 0;
	margin: 0;
}

.priority-order-item {
	display: flex;
	align-items: center;
	padding: 0.15rem 0;
}

.priority-order-inline {
	display: inline-flex;
	flex-wrap: wrap;
	align-items: center;
}

.priority-order:not(.priority-order-inline) .priority-order-label {
	min-width: 10rem;
}
</style>
