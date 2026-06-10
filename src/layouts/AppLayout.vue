<template>
	<div class="app-layout">
		<Header />
		<router-view />
		<footer class="app-layout-footer text-center text-muted small">
			Frontend {{ frontendVersion }} - Backend {{ backendVersion }}
		</footer>
		<BackToTop
			:title="$t('generic.backtotop')"
		/>
	</div>
</template>

<script>
export default {
	name: "AppLayout",
	data() {
		return {
			frontendVersion: __APP_VERSION__,
			backendVersion: null,
		}
	},
	async mounted() {
		const data = await this.$api.generic.get("server-info/").catch(() => null)
		this.backendVersion = data?.backend_version ?? null
	},
}
</script>