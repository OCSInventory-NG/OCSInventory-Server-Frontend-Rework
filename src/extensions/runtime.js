let _loaded = false
let _loadingPromise = null

export async function ensureExtensionsLoaded(loadFn) {
	if (_loaded) return
	if (_loadingPromise) return _loadingPromise

	_loadingPromise = (async () => {
		await loadFn()
		_loaded = true
	})()

	return _loadingPromise
}