let _loaded = false
let _loadingPromise = null

export async function ensureExtensionsLoaded(loadFn) {
	if (_loaded) return
	if (_loadingPromise) return _loadingPromise

	_loadingPromise = (async () => {
		try {
			await loadFn()
		} catch (e) {
			console.error("Error, extensions not loaded:", e)
			_loaded = false
			_loadingPromise = null
		}

		_loaded = true
	})()

	return _loadingPromise
}