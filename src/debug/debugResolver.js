import { debugStore } from "./debugStore"

export const RESOLVE_ROUTE = "debug/resolve/"

let api = null
let timer = null
const pending = new Set()

export function setResolverApi(value) {
	api = value
}

export function scheduleResolve() {
	clearTimeout(timer)
	timer = setTimeout(resolvePending, 300)
}

async function resolvePending() {
	const calls = []
	for (const entry of debugStore.trace) {
		if (!(entry.key in debugStore.calls) && !pending.has(entry.key)) {
			pending.add(entry.key)
			calls.push({ method: entry.method, path: entry.route })
		}
	}
	if (!calls.length || !api) return

	try {
		const data = await api.generic.post(RESOLVE_ROUTE, { calls })
		for (const call of data.calls) {
			debugStore.calls[`${call.method} ${call.path}`] = call
		}
		debugStore.error = null
	} catch (e) {
		// unresolved calls are sent again with the next recorded call
		debugStore.error = e.response?.data?.detail || e.message
	} finally {
		calls.forEach((call) => pending.delete(`${call.method} ${call.path}`))
	}
}
