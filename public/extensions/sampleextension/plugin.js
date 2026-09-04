// Entry point. The frontend loader fetches this file and calls register()
// once the extension is enabled (see src/extensions/loader.js).
window.OCS_EXTENSIONS = window.OCS_EXTENSIONS || {}

window.OCS_EXTENSIONS["sampleextension"] = {
	async register(api) {
		// Example: translations, merged into the app's existing locales.
		const fr = await fetch("/extensions/sampleextension/locales/fr.json").then((r) => r.json())
		api.mergeI18n("fr", fr)
		const en = await fetch("/extensions/sampleextension/locales/en.json").then((r) => r.json())
		api.mergeI18n("en", en)

		// Example: a page + a menu tab (see SampleCommentsPage.js).
		const PageMod = await api.importModule("/extensions/sampleextension/components/SampleCommentsPage.js")
		const AppLayout = api.getComponent("AppLayout")

		api.addRoute({
			path: "/inventory/sampleextension/comments",
			name: "SampleExtensionComments",
			component: PageMod.createComponent(api),
			meta: { layout: AppLayout, requireAuth: true },
		})

		// Example: a new top-level menu entry (not nested in an existing group).
		// NavLink.vue only renders children by looping over columnDividers
		// first - a menu with children but no columnDividers shows an empty
		// dropdown, so both are required even for a single column.
		api.addMenuItem({
			index: "sampleextension",
			headerKey: "sampleextension.title",
			link: "/inventory/sampleextension/comments",
			icon: "tag",
			columnDividers: [{ headerKey: "sampleextension.title", identifier: "general" }],
			children: [
				{ headerKey: "sampleextension.comments_title", link: "/inventory/sampleextension/comments", route: "SampleExtensionComments", column: "general" },
			],
		})

		// Example: injecting into an existing core page (see SampleCommentSlot.js).
		api.registerSlot("inventory.asset.detail.afterAccountInfo", {
			component: async () => {
				const mod = await api.importModule("/extensions/sampleextension/components/SampleCommentSlot.js")
				return mod.createComponent(api)
			},
		})
	},
}
