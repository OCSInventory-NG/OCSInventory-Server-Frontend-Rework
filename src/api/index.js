// src/api/index.js
import { createApiClient } from "./client"
import { createGenericService } from "./services/generic.service"

export function createApi(config) {
	const http = createApiClient(config.BACKEND_API_ROUTE)

	return {
		http,
		// Generic service
		generic: createGenericService(http),
		// Create some other specific object services if necessary
	}
}