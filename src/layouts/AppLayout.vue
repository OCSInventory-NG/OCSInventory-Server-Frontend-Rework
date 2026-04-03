<template>
	<div class="app-layout">
		<Header />
		<router-view />
		<footer
			class="app-layout-footer"
			aria-hidden="true"
		/>
		<BackToTop
			:title="$t('generic.backtotop')"
		/>
	</div>
</template>

<script>
export default {
	name: "AppLayout",
}
</script>