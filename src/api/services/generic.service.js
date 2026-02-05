// src/api/services/generic.service.js
export function createGenericService(http) {
	return {
		// Retrieve item header
		// Params :
		// route : item API route
		getHeader(route) {
			return http.options(route).then((r) => r.data)
		},

		// Retrieve items
		// Params :
		// route : item API route
		// Optional : query : { limit, offset, ordering, search }
		// Optional : customParams : dynamic parameters (ex: { expand: network })
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
		}
	}
}