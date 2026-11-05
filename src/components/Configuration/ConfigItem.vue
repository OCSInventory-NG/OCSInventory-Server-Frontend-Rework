<template>
	<b-list-group-item class="d-flex justify-content-between align-items-center gap-3">
		<div>
			<h4 class="mb-1">
				{{ translate(item.name) }}
			</h4>
			<p
				v-if="item.description"
				class="mb-1"
			>
				{{ translate(item.description) }}
			</p>
			<p
				v-if="help"
				class="mb-1 text-muted small"
			>
				{{ help }}
			</p>
			<p
				v-if="error"
				class="mb-1 text-danger"
			>
				{{ error }}
			</p>
		</div>
		<div v-if="item.type == 'switch'">
			<label class="form-check form-switch">
				<input
					:id="item.name"
					:checked="modelValue"
					class="form-check-input"
					type="checkbox"
					:disabled="disabled"
					@change="$emit('update:modelValue', $event.target.checked)"
				>
			</label>
		</div>
		<div
			v-if="item.type in inputtype"
			class="ocs-config-form"
		>
			<b-input-group>
				<template
					v-if="item.unit"
					#append
				>
					<b-input-group-text class="form-control">
						{{ translate(item.unit) }}
					</b-input-group-text>
				</template>
				<b-form-input
					:id="item.name"
					:model-value="modelValue"
					:type="inputtype[item.type]"
					:min="item.min"
					:max="item.max"
					:step="step"
					:state="error ? false : null"
					:disabled="disabled"
					@update:model-value="$emit('update:modelValue', $event)"
				/>
			</b-input-group>
		</div>
		<div
			v-if="item.type == 'select'"
			class="ocs-config-form"
		>
			<b-form-select
				:model-value="modelValue"
				class="form-select mb-3"
				:disabled="disabled"
				@update:model-value="$emit('update:modelValue', $event)"
			>
				<b-form-select-option
					v-for="option in item.options"
					:key="option"
					:value="option"
				>
					{{ translate(option) }}
				</b-form-select-option>
			</b-form-select>
		</div>
		<div
			v-if="item.type == 'multiselect'"
			class="ocs-config-form"
		>
			<v-select
				:model-value="modelValue"
				:options="item.options"
				:get-option-label="translate"
				multiple
				:disabled="disabled"
				@update:model-value="$emit('update:modelValue', $event)"
			/>
		</div>
		<div v-if="item.type == 'ordered list'">
			<ConfigOrderedList
				:model-value="modelValue"
				:name="item.name"
				:disabled="disabled"
				@update:model-value="$emit('update:modelValue', $event)"
			/>
		</div>
	</b-list-group-item>
</template>

<script>
// One item of the general configuration, drawn after its type
export default {
	name: "ConfigItem",
	props: {
		item: { type: Object, required: true },
		modelValue: { type: [String, Number, Boolean, Array], default: null },
		disabled: { type: Boolean, default: false },
		// message of the server for this item
		error: { type: String, default: "" },
	},
	emits: ["update:modelValue"],
	data() {
		return {
			inputtype: {
				"number input": "number",
				"text input": "text",
			},
		}
	},
	computed: {
		// help under the field: configuration.<name>_help when it exists
		help() {
			const key = `configuration.${this.item.name}_help`
			return this.$te(key) ? this.$t(key) : ""
		},
		// a range of at most 1 takes decimals, the other numbers stay whole
		step() {
			if (this.item.type !== "number input") return null
			const { min, max } = this.item
			if (typeof min === "number" && typeof max === "number" && max - min <= 1) return "any"
			return Number.isInteger(Number(this.modelValue)) ? null : "any"
		},
	},
	methods: {
		// names, descriptions and units are translation keys; a missing one is shown as is
		translate(text) {
			return this.$te("configuration." + text) ? this.$t("configuration." + text) : text
		},
	},
}
</script>
