import { reactive } from "vue"

const MAX_TRACE = 200
const PANEL_HEIGHT_KEY = "debug_panel_height"

export const debugStore = reactive({
	enabled: localStorage.getItem("debug_mode") === "true",
	collapsed: false,
	height: initialPanelHeight(),
	trace: [],
	checked: [],
	calls: {},
	error: null,
})

export function canUseDebugMode() {
	const permissions = localStorage.getItem("permissions") || ""
	return permissions.split(",").includes("debug_view_debugmode")
}

// debug_mode may be left by another account on the same browser
export function isDebugActive() {
	return debugStore.enabled && canUseDebugMode()
}

export function setDebugMode(enabled) {
	debugStore.enabled = enabled
	localStorage.setItem("debug_mode", enabled)
	if (!enabled) {
		clearPageData()
		debugStore.error = null
	}
}

// what was recorded for the current page: API calls and permission checks
export function clearPageData() {
	debugStore.trace = []
	debugStore.checked = []
}

export function recordCall(entry) {
	debugStore.trace.push(entry)
	if (debugStore.trace.length > MAX_TRACE) debugStore.trace.shift()
}

export function recordPermissionCheck(codename) {
	if (isDebugActive() && !debugStore.checked.includes(codename)) {
		debugStore.checked.push(codename)
	}
}

// panel body height in px, between 15% and 80% of the window
export function minPanelHeight() {
	return window.innerHeight * 0.15
}

export function maxPanelHeight() {
	return window.innerHeight * 0.8
}

export function clampPanelHeight(height) {
	return Math.round(Math.min(Math.max(height, minPanelHeight()), maxPanelHeight()))
}

function initialPanelHeight() {
	const saved = parseInt(localStorage.getItem(PANEL_HEIGHT_KEY), 10)
	return clampPanelHeight(Number.isNaN(saved) ? window.innerHeight * 0.32 : saved)
}

export function savePanelHeight() {
	localStorage.setItem(PANEL_HEIGHT_KEY, debugStore.height)
}
