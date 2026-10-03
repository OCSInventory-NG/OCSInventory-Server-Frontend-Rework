<template>
	<div
		class="app-layout"
		:class="{ 'debug-open': debugActive && !debug.collapsed, 'debug-collapsed': debugActive && debug.collapsed }"
		:style="debugActive ? { '--debug-panel-height': debug.height + 'px' } : null"
	>
		<Header />
		<router-view />
		<footer
			class="app-layout-footer"
			aria-hidden="true"
		/>
		<BackToTop
			:title="$t('generic.backtotop')"
		/>
		<DebugPanel />
	</div>
</template>

<script>
import { debugStore, isDebugActive } from "@/debug/debugStore"

export default {
	name: "AppLayout",
	data() {
		return {
			debug: debugStore,
		}
	},
	computed: {
		debugActive() {
			return isDebugActive()
		},
	},
}
</script>