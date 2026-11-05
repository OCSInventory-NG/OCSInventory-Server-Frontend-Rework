// Shared helpers of the security screens (vulnerabilities, coverage, exclusions)

// Criteria the vulnerabilities can be ordered on, see the security settings
export const PRIORITY_CRITERIA = ["kev", "score", "epss", "machines"]

// Noise hidden by default from the vulnerability lists
export const NOISE_KINDS = ["minor_distro", "kernel_unfixed"]

export const LEVELS = ["critical", "high", "medium", "low", "unknown"]

export const FAMILIES = ["deb", "rpm", "windows", "macos"]

// Same palette as the compliance severities. Unknown stays dark: an unrated
// vulnerability is not a mild one
export const LEVEL_COLORS = {
	critical: "#d63939",
	high: "#f76707",
	medium: "#f59f00",
	low: "#206bc4",
	unknown: "#495057",
}

// Message of a failed call. A 400 answers {parameter: "message"} or {field: ["message"]}
export function apiErrorMessage(e) {
	const data = e?.response?.data
	if (typeof data === "string" && data && !data.startsWith("<")) {
		return data
	}
	if (data && typeof data === "object") {
		if (data.error) return data.error
		if (data.detail) return data.detail
		if (Array.isArray(data)) return data.join(" ")
		const parts = Object.entries(data).map(([field, messages]) => {
			const text = Array.isArray(messages) ? messages.join(" ") : String(messages)
			return field === "non_field_errors" ? text : `${field} : ${text}`
		})
		if (parts.length) return parts.join(" · ")
	}
	return e?.message || String(e)
}

export function formatDateTime(value) {
	return value ? new Date(value).toLocaleString() : ""
}

export function formatDay(value) {
	return value ? new Date(value).toLocaleDateString() : ""
}

// 0.91 -> "91 %"
export function formatPercent(value, digits = 1) {
	if (value === null || value === undefined) return ""
	const percent = value * 100
	// a small share is not nothing
	if (percent > 0 && percent < 0.1) return "< 0.1 %"
	return `${percent.toFixed(percent >= 10 || percent === 0 ? 0 : digits)} %`
}

// Severity given by a distribution (closed list of the back); an unknown one is shown as is
export function ratingLabel(vm, rating) {
	const key = "security.rating_" + String(rating).toLowerCase().replace(/[\s-]+/g, "_")
	return vm.$te(key) ? vm.$t(key) : rating
}

// A CPE key as people read it: the dictionary escapes some characters
// ("notepad\\+\\+:notepad\\+\\+" is notepad++:notepad++); the key itself is sent unchanged
export function cpeLabel(key) {
	return key ? String(key).replace(/\\(.)/g, "$1") : ""
}

// A summary cut for a table cell; the full text goes in the title
const SUMMARY_LENGTH = 140
export function shortSummary(text) {
	if (!text || text.length <= SUMMARY_LENGTH) {
		return text
	}
	return text.slice(0, SUMMARY_LENGTH).trimEnd() + "…"
}

// List answers come paginated only when a limit is given
export function asList(data) {
	return Array.isArray(data) ? data : (data?.results || [])
}
