import { withBase } from "@/utils/basePath"

function loadScript(url) {
	return new Promise((resolve, reject) => {
		const s = document.createElement("script")
		s.src = url
		s.async = true
		s.onload = resolve
		s.onerror = reject
		document.head.appendChild(s)
	})
}
  
export async function loadFrontendExtensions({ apiClient, pluginApi, config }) {
	const { data } = await apiClient.get(`${config.BACKEND_API_ROUTE}extensions/enabled/`, {
		params: { enabled: true, limit: 500, offset: 0 },
	})

	const results = data?.results ?? data ?? []
	const enabledNames = results
		.map(item => (typeof item === 'string' ? item : item?.name))
		.filter(Boolean)
  
	window.OCS_EXTENSIONS = window.OCS_EXTENSIONS || {}
  
	for (const name of enabledNames) {
		const entry = withBase(`extensions/${name}/plugin.js`)
		await loadScript(entry)
	
		const plugin = window.OCS_EXTENSIONS[name]
		if (plugin?.register) {
			await plugin.register(pluginApi)
		}
	}
}