// Single source of truth for the deployment base path.
//
// Vite injects `import.meta.env.BASE_URL` from the `base` build option. It
// defaults to "/" and always ends with a trailing slash, so by default the app
// behaves exactly as before. Building with `VITE_BASE_PATH=/front/` (or any
// prefix) transparently rebases routing, the runtime config fetch and the
// dynamically-loaded extensions — making the app reverse-proxy friendly.

export const BASE_URL = import.meta.env.BASE_URL

// Join the base path with a relative resource path (leading slashes trimmed).
export const withBase = (path) => `${BASE_URL}${String(path).replace(/^\/+/, "")}`
