<template>
	<component
		:is="e.component"
		v-for="(e, idx) in entries"
		:key="idx"
		v-bind="context"
	/>
</template>

<script setup>
import { computed, shallowRef, watchEffect, markRaw } from "vue"
import { getSlotEntries } from "./slotRegistry"

const props = defineProps({
	name: { type: String, required: true },
	context: { type: Object, default: () => ({}) },
})

const rawEntries = computed(() => getSlotEntries(props.name, props.context))
const entries = shallowRef([])

watchEffect(async () => {
	const out = []
	for (const e of rawEntries.value) {
		const comp = typeof e.component === "function" ? await e.component() : e.component
		out.push({
			...e,
			component: markRaw(comp),
		})
	}
	entries.value = out
})
</script>
  