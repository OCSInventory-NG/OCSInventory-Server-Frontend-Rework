const slots = new Map()

export function registerSlot(slotName, entry) {
	if (!slots.has(slotName)) slots.set(slotName, [])
	slots.get(slotName).push({ order: 100, when: () => true, ...entry })
	slots.get(slotName).sort((a, b) => a.order - b.order)
}

export function getSlotEntries(slotName, ctx) {
  	return (slots.get(slotName) || []).filter(e => (e.when ? e.when(ctx) : true))
}