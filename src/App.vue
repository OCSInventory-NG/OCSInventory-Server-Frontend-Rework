<template>
	<div id="ocsreports">
		<vue-extend-layouts loading="loading" />
	</div>
</template>

<script>
import VueExtendLayouts from 'vue-extend-layout'

export default {
	name: "Ocsreports",
	components: { VueExtendLayouts },
	created() {
		const currentPath = this.$router.history.current.path;

		if (currentPath === "/" || currentPath === "/ocsreports") {
			this.$router.push("/ocsreports/dashboard");
		}

		if (localStorage.getItem("authenticated") === null
		|| localStorage.getItem("authenticated") === "false"
		|| localStorage.getItem('token_authentication') === null 
		|| localStorage.getItem('permissions') === null) {
			this.$router.push("/login");
		}
	},
}
</script>

<style src="./styles/ocsreports.scss" lang="scss" />