let _loaded = false
let _loadingPromise = null

export async function ensureExtensionsLoaded(loadFn) {
	if (_loaded) return false
	if (_loadingPromise) return _loadingPromise

	_loadingPromise = (async () => {
		try {
			await loadFn()
			_loaded = true
			return true
		} catch (e) {
			console.error("Error, extensions not loaded:", e)
			_loaded = false
			_loadingPromise = null
			return false
		}
	})()

	return _loadingPromise
}
