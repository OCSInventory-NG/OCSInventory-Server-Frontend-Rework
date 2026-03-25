<template>
	<Header />
	<router-view />
	<BackToTop 
		:title="$t('generic.backtotop')"
	/>
</template>

<script>
export default {
	name: "AppLayout",
}
</script>