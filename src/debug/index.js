import { registerSlot } from "@/extensions/slotRegistry"
import DebugPermissions from "@/components/Debug/DebugPermissions.vue"
import DebugTrace from "@/components/Debug/DebugTrace.vue"
import { clearPageData } from "./debugStore"
import { setResolverApi } from "./debugResolver"

export function installDebug({ router, api }) {
	setResolverApi(api)

	// query only changes (pagination, filters) keep the data of the page
	router.afterEach((to, from) => {
		if (to.path !== from.path) clearPageData()
	})

	registerSlot("debug.panel", { order: 10, title: "debug.trace", component: DebugTrace })
	registerSlot("debug.panel", { order: 20, title: "debug.permissions", component: DebugPermissions })
}
