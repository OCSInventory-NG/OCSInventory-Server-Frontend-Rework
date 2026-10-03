import { isDebugActive, recordCall } from "./debugStore"
import { RESOLVE_ROUTE, scheduleResolve } from "./debugResolver"

// both run inside the axios interceptors: a debug error must never fail a request
export function startTrace(config) {
	try {
		if (isDebugActive()) config.debugStart = Date.now()
	} catch (e) {
		console.error("Debug mode:", e)
	}
}

export function traceCall(http, config, status) {
	try {
		recordTrace(http, config, status)
	} catch (e) {
		console.error("Debug mode:", e)
	}
}

function recordTrace(http, config, status) {
	if (!config?.debugStart || !isDebugActive()) return

	const base = config.baseURL || ""
	let path = http.getUri(config)
	if (path.startsWith(base)) path = path.slice(base.length)
	path = path.replace(/^\//, "")

	const route = path.split("?")[0]
	if (route === RESOLVE_ROUTE) return

	const method = (config.method || "get").toUpperCase()
	recordCall({
		method,
		path,
		route,
		key: `${method} ${route}`,
		status,
		duration: Date.now() - config.debugStart,
	})
	scheduleResolve()
}
