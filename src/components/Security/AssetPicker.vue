<template>
	<v-select
		:model-value="selected"
		:options="options"
		:filterable="false"
		:placeholder="placeholder || $t('security.pick_machine')"
		label="label"
		@search="search"
		@update:model-value="onSelected"
	>
		<template #search="{ attributes, events }">
			<input
				class="vs__search"
				:required="required && !modelValue"
				v-bind="attributes"
				v-on="events"
			>
		</template>
		<template #no-options>
			{{ $t('security.type_to_search') }}
		</template>
	</v-select>
</template>

<script>
import { asList } from "@/utils/security"

// Machine chosen by name, the machine list being too long for a plain select
export default {
	name: "AssetPicker",
	props: {
		modelValue: { type: Number, default: null },
		// name of the machine already chosen, shown before any search
		name: { type: String, default: "" },
		placeholder: { type: String, default: "" },
		required: { type: Boolean, default: false },
	},
	emits: ["update:modelValue", "update:name"],
	data() {
		return {
			options: [],
			searchTimer: null,
		}
	},
	computed: {
		selected() {
			if (!this.modelValue) {
				return null
			}
			const option = this.options.find((item) => item.value === this.modelValue)
			return option || { value: this.modelValue, label: this.name || `#${this.modelValue}` }
		},
	},
	beforeUnmount() {
		clearTimeout(this.searchTimer)
	},
	methods: {
		search(text, toggleLoading) {
			clearTimeout(this.searchTimer)
			if (!text) {
				return
			}
			this.searchTimer = setTimeout(async () => {
				toggleLoading(true)
				try {
					const data = await this.$api.generic.get("asset/bases/", { search: text, limit: 20 })
					this.options = asList(data).map((asset) => ({ value: asset.id, label: asset.name }))
				} catch {
					this.options = []
				} finally {
					toggleLoading(false)
				}
			}, 300)
		},
		onSelected(option) {
			this.$emit("update:modelValue", option ? option.value : null)
			this.$emit("update:name", option ? option.label : "")
		},
	},
}
</script>
