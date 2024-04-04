<template>
	<Header />
	<router-view />
</template>

<script>
import Header from '@/components/Header/Header.vue'

export default {
	name: "AppLayout",
	components: { Header }
}
</script>