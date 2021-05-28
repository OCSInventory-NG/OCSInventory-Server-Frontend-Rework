<template>
	<router-view />
</template>

<script>
export default {
	name: "ocsreports",
	created() {
		const currentPath = this.$router.history.current.path;

		if (window.localStorage.getItem("authenticated") === "false" && localStorage.getItem('token_authentication') === null) {
			this.$router.push("/login");
		}

		if (currentPath === "/" || currentPath === "/ocsreports") {
			this.$router.push("/ocsreports/dashboard");
		}
	},
};
</script>

<style src="./styles/theme.scss" lang="scss" />
