import axios from "axios"
import router from "@/route"

let redirecting = false

export function createApiClient(baseURLOrConfig) {
	const baseURL =
		typeof baseURLOrConfig === "string"
			? baseURLOrConfig
			: baseURLOrConfig?.baseURL

	if (!baseURL) {
		console.warn("[API] baseURL is missing. Check config.BACKEND_API_ROUTE")
	}

	const api = axios.create({ baseURL })

	// Attach token
	api.interceptors.request.use((config) => {
		const token = localStorage.getItem("token_authentication")
		if (token) config.headers.Authorization = `Token ${token}`
		else delete config.headers.Authorization
		config.headers["Content-Type"] = "application/json;charset=utf-8"
		return config
	})

	// Handle 401 globally
	api.interceptors.response.use(
		(res) => res,
		async (err) => {
			const status = err?.response?.status

			if (status === 401) {
				// purge auth
				localStorage.removeItem("token_authentication")
				localStorage.removeItem("permissions")
				localStorage.removeItem("user")

				const current = router.currentRoute.value
				const onLogin = current?.name === "Login" || current?.path === "/login"

				if (!onLogin && !redirecting) {
					redirecting = true
					try {
						await router.push({
							name: "Login",
							query: { redirect: current?.fullPath || "/" },
						})
					} finally {
						setTimeout(() => (redirecting = false), 200)
					}
				}
			}

			return Promise.reject(err)
		}
	)

	return api
}
