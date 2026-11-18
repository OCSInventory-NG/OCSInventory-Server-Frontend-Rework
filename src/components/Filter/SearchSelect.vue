<template>
	<v-select
		:model-value="modelValue"
		:options="options"
		:reduce="option => option.value"
		:clearable="false"
		:loading="loading"
		:disabled="disabled"
		:placeholder="label"
		label="text"
		class="search-select"
		@update:model-value="$emit('update:modelValue', $event)"
	>
		<!-- the browser refuses the form while a required choice is empty -->
		<template #search="{ attributes, events }">
			<input
				class="vs__search"
				:required="required && isEmpty"
				:aria-label="label"
				v-bind="attributes"
				v-on="events"
			>
		</template>
	</v-select>
</template>

<script>
// A select of the multi-criteria search: options are { value, text }
export default {
	name: "SearchSelect",
	props: {
		modelValue: { type: [String, Number, Boolean], default: null },
		options: { type: Array, default: () => [] },
		required: { type: Boolean, default: false },
		loading: { type: Boolean, default: false },
		disabled: { type: Boolean, default: false },
		// what the select chooses: placeholder and name read by screen readers
		label: { type: String, default: null },
	},
	emits: ["update:modelValue"],
	computed: {
		isEmpty() {
			return this.modelValue === null || this.modelValue === undefined || this.modelValue === ""
		},
	},
}
</script>
