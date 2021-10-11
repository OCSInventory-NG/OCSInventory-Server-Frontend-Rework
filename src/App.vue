<template>
	<router-view />
</template>

<script>
export default {
	name: "Ocsreports",
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
};
</script>

<style src="./styles/theme.scss" lang="scss" />
