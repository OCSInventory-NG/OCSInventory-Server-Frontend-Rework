<template>
	<VueDraggable
		:model-value="modelValue"
		:item-key="(option) => option"
		tag="ol"
		handle=".config-order-handle"
		class="config-order"
		ghost-class="config-order-ghost"
		:disabled="disabled"
		:animation="150"
		@update:model-value="$emit('update:modelValue', $event)"
	>
		<template #item="{ element: option, index }">
			<li class="config-order-item">
				<span
					v-if="!disabled"
					class="config-order-handle"
					:title="$t('configuration.order_move')"
				>
					<font-awesome-icon :icon="['fas', 'grip-vertical']" />
				</span>
				<span class="badge bg-blue-lt me-2">{{ index + 1 }}</span>
				<span class="config-order-label">{{ label(option) }}</span>
				<template v-if="!disabled">
					<button
						type="button"
						class="btn btn-sm btn-ghost-secondary px-1"
						:disabled="index === 0"
						:title="$t('configuration.order_up')"
						:aria-label="$t('configuration.order_up') + ' : ' + label(option)"
						@click="move(index, -1)"
					>
						<font-awesome-icon :icon="['fas', 'angle-up']" />
					</button>
					<button
						type="button"
						class="btn btn-sm btn-ghost-secondary px-1"
						:disabled="index === modelValue.length - 1"
						:title="$t('configuration.order_down')"
						:aria-label="$t('configuration.order_down') + ' : ' + label(option)"
						@click="move(index, 1)"
					>
						<font-awesome-icon :icon="['fas', 'angle-down']" />
					</button>
				</template>
			</li>
		</template>
	</VueDraggable>
</template>

<script>
// "draggable" would resolve to the rules table of components/Draggable
import VueDraggable from "vuedraggable"

// "ordered list" item of the configuration: every option once, only reordered
export default {
	name: "ConfigOrderedList",
	components: { VueDraggable },
	props: {
		modelValue: { type: Array, required: true },
		// item name, for the option labels: configuration.<name>_<option>
		name: { type: String, required: true },
		disabled: { type: Boolean, default: false },
	},
	emits: ["update:modelValue"],
	methods: {
		label(option) {
			for (const key of [`configuration.${this.name}_${option}`, `configuration.${option}`]) {
				if (this.$te(key)) return this.$t(key)
			}
			return option
		},
		// the buttons reorder from the keyboard
		move(index, offset) {
			const order = [...this.modelValue]
			const [option] = order.splice(index, 1)
			order.splice(index + offset, 0, option)
			this.$emit("update:modelValue", order)
		},
	},
}
</script>

<style scoped>
.config-order {
	list-style: none;
	margin: 0;
	padding: 0;
	min-width: 18rem;
}

.config-order-item {
	align-items: center;
	background-color: var(--tblr-bg-surface);
	border: 1px solid var(--tblr-border-color);
	border-radius: var(--tblr-border-radius);
	display: flex;
	margin-bottom: 4px;
	padding: 4px 8px;
}

.config-order-label {
	flex: 1 1 auto;
}

.config-order-handle {
	color: var(--tblr-secondary);
	cursor: grab;
	margin-right: 8px;
}

.config-order-ghost {
	opacity: 0.4;
}
</style>
