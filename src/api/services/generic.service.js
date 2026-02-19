// src/api/services/generic.service.js
export function createGenericService(http) {
	return {
		// Retrieve item header
		options(route) {
			return http.options(route).then((r) => r.data)
		},

		// Retrieve items
		get(route, query = {}, customParams = {}) {
			const params = {}

			// Query params
			for (const [key, value] of Object.entries(query)) {
				if (value !== null && value !== undefined && value !== "") {
					params[key] = value
				}
			}

			// Custom params
			for (const [key, value] of Object.entries(customParams)) {
				if (value !== null && value !== undefined && value !== "") {
					params[key] = value
				}
			}

			return http.get(route, { params }).then((r) => r.data)
		},

		// Create item
		// Params:
		// route : item API route
		// payload : object to send in body
		post(route, payload = {}, customParams = {}) {
			const params = {}

			for (const [key, value] of Object.entries(customParams)) {
				if (value !== null && value !== undefined && value !== "") {
					params[key] = value
				}
			}

			return http.post(route, payload, { params }).then((r) => r.data)
		},

		// Update item partially
		// Params:
		// route : item API route (ex: /assets/1/)
		// payload : fields to update
		patch(route, payload = {}, customParams = {}) {
			const params = {}

			for (const [key, value] of Object.entries(customParams)) {
				if (value !== null && value !== undefined && value !== "") {
					params[key] = value
				}
			}

			return http.patch(route, payload, { params }).then((r) => r.data)
		},

		// Delete item
		// Params:
		// route : item API route (ex: /assets/1/)
		delete(route, customParams = {}) {
			const params = {}

			for (const [key, value] of Object.entries(customParams)) {
				if (value !== null && value !== undefined && value !== "") {
					params[key] = value
				}
			}

			return http.delete(route, { params }).then((r) => r.data)
		},
	}
}